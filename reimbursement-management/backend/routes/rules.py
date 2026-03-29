import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from config.database import get_db
from models.models import ApprovalRule, User
from schemas.schemas import ApprovalRuleCreate, ApprovalRuleOut
from utils.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/rules", tags=["rules"])


@router.get("/", response_model=List[ApprovalRuleOut])
async def list_rules(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(ApprovalRule).filter(
        ApprovalRule.company_id == current_user.company_id
    ).all()


@router.post("/", response_model=ApprovalRuleOut)
async def create_rule(
    payload: ApprovalRuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    steps_json = None
    if payload.steps_config:
        steps_json = json.dumps([s.dict() for s in payload.steps_config])

    rule = ApprovalRule(
        company_id=current_user.company_id,
        name=payload.name,
        rule_type=payload.rule_type,
        percentage_threshold=payload.percentage_threshold,
        specific_approver_id=payload.specific_approver_id,
        steps_config=steps_json,
        min_amount=payload.min_amount,
        max_amount=payload.max_amount,
        categories=payload.categories,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.put("/{rule_id}", response_model=ApprovalRuleOut)
async def update_rule(
    rule_id: int,
    payload: ApprovalRuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    rule = db.query(ApprovalRule).filter(
        ApprovalRule.id == rule_id,
        ApprovalRule.company_id == current_user.company_id
    ).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    rule.name = payload.name
    rule.rule_type = payload.rule_type
    rule.percentage_threshold = payload.percentage_threshold
    rule.specific_approver_id = payload.specific_approver_id
    rule.min_amount = payload.min_amount
    rule.max_amount = payload.max_amount
    rule.categories = payload.categories
    if payload.steps_config:
        rule.steps_config = json.dumps([s.dict() for s in payload.steps_config])

    db.commit()
    db.refresh(rule)
    return rule


@router.patch("/{rule_id}/toggle")
async def toggle_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    rule = db.query(ApprovalRule).filter(
        ApprovalRule.id == rule_id,
        ApprovalRule.company_id == current_user.company_id
    ).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    rule.is_active = not rule.is_active
    db.commit()
    return {"is_active": rule.is_active}


@router.delete("/{rule_id}")
async def delete_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    rule = db.query(ApprovalRule).filter(
        ApprovalRule.id == rule_id,
        ApprovalRule.company_id == current_user.company_id
    ).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    db.delete(rule)
    db.commit()
    return {"message": "Deleted"}
