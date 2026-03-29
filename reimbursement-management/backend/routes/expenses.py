import json
import os
import shutil
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
import httpx

from config.database import get_db
from models.models import (
    Expense, User, Company, ApprovalStep, ApprovalRule,
    AuditLog, ExpenseStatus, ApprovalStepStatus, RuleType, UserRole
)
from schemas.schemas import ExpenseCreate, ExpenseOut, ApprovalAction
from utils.auth import get_current_user, require_manager_or_admin

router = APIRouter(prefix="/api/expenses", tags=["expenses"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def convert_currency(amount: float, from_currency: str, to_currency: str) -> float:
    if from_currency == to_currency:
        return amount
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"https://api.exchangerate-api.com/v4/latest/{from_currency}")
            if resp.status_code == 200:
                rates = resp.json().get("rates", {})
                rate = rates.get(to_currency, 1.0)
                return round(amount * rate, 2)
    except Exception:
        pass
    return amount


def build_approval_steps(expense: Expense, company_id: int, db: Session):
    """Apply active approval rules to create steps for an expense."""
    rule = db.query(ApprovalRule).filter(
        ApprovalRule.company_id == company_id,
        ApprovalRule.is_active == True
    ).first()

    if not rule:
        # Default: manager approval
        manager = db.query(User).filter(
            User.id == expense.submitted_by.manager_id
        ).first() if expense.submitted_by else None

        step = ApprovalStep(
            expense_id=expense.id,
            approver_id=manager.id if manager else None,
            approver_role="manager",
            step_order=1,
            status=ApprovalStepStatus.PENDING,
        )
        db.add(step)
        return

    if rule.steps_config:
        steps_data = json.loads(rule.steps_config)
        for s in steps_data:
            step = ApprovalStep(
                expense_id=expense.id,
                approver_id=s.get("approver_id"),
                approver_role=s.get("approver_role", "manager"),
                step_order=s["step_order"],
                status=ApprovalStepStatus.PENDING,
            )
            db.add(step)


@router.post("/", response_model=ExpenseOut)
async def create_expense(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    amount: float = Form(...),
    currency_code: str = Form(...),
    category: str = Form(...),
    expense_date: str = Form(...),
    merchant_name: Optional[str] = Form(None),
    receipt: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    receipt_url = None

    if receipt:
        ext = os.path.splitext(receipt.filename)[1]
        filename = f"{current_user.id}_{datetime.utcnow().timestamp()}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            shutil.copyfileobj(receipt.file, f)
        receipt_url = f"/uploads/{filename}"

    parsed_date = datetime.fromisoformat(expense_date)
    converted = await convert_currency(amount, currency_code, company.currency_code)

    expense = Expense(
        title=title,
        description=description,
        amount=amount,
        currency_code=currency_code,
        converted_amount=converted,
        company_currency_code=company.currency_code,
        category=category,
        expense_date=parsed_date,
        merchant_name=merchant_name,
        receipt_url=receipt_url,
        submitted_by_id=current_user.id,
        company_id=current_user.company_id,
        status=ExpenseStatus.PENDING,
    )
    db.add(expense)
    db.flush()

    # Load submitted_by for step building
    expense.submitted_by = current_user
    build_approval_steps(expense, current_user.company_id, db)

    log = AuditLog(
        expense_id=expense.id,
        user_id=current_user.id,
        action="submitted",
        details=f"Expense submitted: {title} - {amount} {currency_code}",
    )
    db.add(log)
    db.commit()
    db.refresh(expense)

    return db.query(Expense).options(
        joinedload(Expense.submitted_by),
        joinedload(Expense.approval_steps).joinedload(ApprovalStep.approver),
        joinedload(Expense.audit_logs).joinedload(AuditLog.user),
    ).filter(Expense.id == expense.id).first()


@router.get("/", response_model=List[ExpenseOut])
async def list_expenses(
    status: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Expense).options(
        joinedload(Expense.submitted_by),
        joinedload(Expense.approval_steps).joinedload(ApprovalStep.approver),
        joinedload(Expense.audit_logs).joinedload(AuditLog.user),
    )

    if current_user.role == UserRole.EMPLOYEE:
        query = query.filter(Expense.submitted_by_id == current_user.id)
    elif current_user.role in [UserRole.MANAGER, UserRole.DIRECTOR]:
        subordinate_ids = [u.id for u in current_user.subordinates]
        subordinate_ids.append(current_user.id)
        query = query.filter(Expense.submitted_by_id.in_(subordinate_ids))
    else:
        query = query.filter(Expense.company_id == current_user.company_id)

    if status:
        query = query.filter(Expense.status == status)
    if category:
        query = query.filter(Expense.category == category)

    return query.order_by(Expense.created_at.desc()).all()


@router.get("/{expense_id}", response_model=ExpenseOut)
async def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = db.query(Expense).options(
        joinedload(Expense.submitted_by),
        joinedload(Expense.approval_steps).joinedload(ApprovalStep.approver),
        joinedload(Expense.audit_logs).joinedload(AuditLog.user),
    ).filter(Expense.id == expense_id).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.post("/{expense_id}/action")
async def approval_action(
    expense_id: int,
    payload: ApprovalAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = db.query(Expense).options(
        joinedload(Expense.approval_steps)
    ).filter(Expense.id == expense_id).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    if expense.status in (ExpenseStatus.APPROVED, ExpenseStatus.REJECTED):
        raise HTTPException(status_code=400, detail="Expense already finalized")

    # Find current pending step
    pending_steps = [s for s in expense.approval_steps if s.status == ApprovalStepStatus.PENDING]
    if not pending_steps:
        raise HTTPException(status_code=400, detail="No pending approval steps")

    current_step = min(pending_steps, key=lambda s: s.step_order)

    # Verify approver
    if current_step.approver_id and current_step.approver_id != current_user.id:
        if current_user.role.value != "admin":
            raise HTTPException(status_code=403, detail="You are not the assigned approver for this step")

    now = datetime.utcnow()
    current_step.acted_at = now
    current_step.comments = payload.comments

    if payload.action == "approve":
        current_step.status = ApprovalStepStatus.APPROVED

        all_steps = expense.approval_steps
        approved_count = len([s for s in all_steps if s.status == ApprovalStepStatus.APPROVED])
        total_count = len(all_steps)

        company_rule = db.query(ApprovalRule).filter(
            ApprovalRule.company_id == current_user.company_id,
            ApprovalRule.is_active == True
        ).first()

        auto_approve = False
        if company_rule:
            is_specific_approver = company_rule.specific_approver_id == current_user.id
            percentage = (approved_count / total_count) * 100 if total_count > 0 else 0
            
            if company_rule.rule_type == RuleType.SPECIFIC_APPROVER and is_specific_approver:
                auto_approve = True
            elif company_rule.rule_type == RuleType.PERCENTAGE and company_rule.percentage_threshold:
                if percentage >= company_rule.percentage_threshold:
                    auto_approve = True
            elif company_rule.rule_type == RuleType.HYBRID:
                if is_specific_approver or (company_rule.percentage_threshold and percentage >= company_rule.percentage_threshold):
                    auto_approve = True

        remaining = [s for s in expense.approval_steps if s.status == ApprovalStepStatus.PENDING and s.id != current_step.id]
        
        if auto_approve:
            for s in remaining:
                s.status = ApprovalStepStatus.SKIPPED
            expense.status = ExpenseStatus.APPROVED
            log_action = "auto_approved_by_rule"
        elif not remaining:
            expense.status = ExpenseStatus.APPROVED
            log_action = "approved"
        else:
            expense.status = ExpenseStatus.IN_REVIEW
            log_action = f"step_{current_step.step_order}_approved"

    elif payload.action == "reject":
        current_step.status = ApprovalStepStatus.REJECTED
        # Skip remaining steps
        for s in pending_steps:
            if s.id != current_step.id:
                s.status = ApprovalStepStatus.SKIPPED
        expense.status = ExpenseStatus.REJECTED
        log_action = "rejected"
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    log = AuditLog(
        expense_id=expense.id,
        user_id=current_user.id,
        action=log_action,
        details=payload.comments or f"Action: {payload.action}",
    )
    db.add(log)
    db.commit()

    return {"message": f"Expense {payload.action}d successfully", "status": expense.status.value}


@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    if expense.submitted_by_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    if expense.status != ExpenseStatus.PENDING:
        raise HTTPException(status_code=400, detail="Cannot delete non-pending expense")
    db.delete(expense)
    db.commit()
    return {"message": "Deleted"}
