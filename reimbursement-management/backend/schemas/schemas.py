from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum
from datetime import datetime


class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"


class ExpenseStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    IN_REVIEW = "in_review"


class RuleType(str, Enum):
    PERCENTAGE = "percentage"
    SPECIFIC_APPROVER = "specific_approver"
    HYBRID = "hybrid"
    SEQUENTIAL = "sequential"


# ─── Auth Schemas ────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company_name: str
    country: str
    currency_code: str
    currency_symbol: str
    firebase_uid: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class FirebaseLoginRequest(BaseModel):
    firebase_uid: str
    email: EmailStr
    full_name: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


# ─── User Schemas ─────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.EMPLOYEE
    manager_id: Optional[int] = None
    department: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    manager_id: Optional[int] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    company_id: int
    manager_id: Optional[int] = None
    department: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Company Schemas ──────────────────────────────────────────────────────────

class CompanyOut(BaseModel):
    id: int
    name: str
    country: Optional[str] = None
    currency_code: str
    currency_symbol: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Expense Schemas ──────────────────────────────────────────────────────────

class ExpenseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    amount: float
    currency_code: str
    category: str
    expense_date: datetime
    merchant_name: Optional[str] = None


class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ExpenseStatus] = None


class ApprovalStepOut(BaseModel):
    id: int
    step_order: int
    approver_id: Optional[int] = None
    approver_role: Optional[str] = None
    status: str
    comments: Optional[str] = None
    acted_at: Optional[datetime] = None
    approver: Optional[UserOut] = None

    class Config:
        from_attributes = True


class AuditLogOut(BaseModel):
    id: int
    action: str
    details: Optional[str] = None
    created_at: datetime
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True


class ExpenseOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    amount: float
    currency_code: str
    converted_amount: Optional[float] = None
    company_currency_code: Optional[str] = None
    category: str
    expense_date: datetime
    receipt_url: Optional[str] = None
    merchant_name: Optional[str] = None
    status: ExpenseStatus
    submitted_by_id: int
    company_id: int
    current_step: int
    created_at: datetime
    submitted_by: Optional[UserOut] = None
    approval_steps: List[ApprovalStepOut] = []
    audit_logs: List[AuditLogOut] = []

    class Config:
        from_attributes = True


# ─── Approval Schemas ─────────────────────────────────────────────────────────

class ApprovalAction(BaseModel):
    action: str  # "approve" or "reject"
    comments: Optional[str] = None


# ─── Rule Schemas ─────────────────────────────────────────────────────────────

class RuleStepConfig(BaseModel):
    step_order: int
    approver_role: Optional[str] = None
    approver_id: Optional[int] = None
    label: Optional[str] = None


class ApprovalRuleCreate(BaseModel):
    name: str
    rule_type: RuleType = RuleType.SEQUENTIAL
    percentage_threshold: Optional[float] = None
    specific_approver_id: Optional[int] = None
    steps_config: Optional[List[RuleStepConfig]] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    categories: Optional[str] = None


class ApprovalRuleOut(BaseModel):
    id: int
    name: str
    rule_type: RuleType
    percentage_threshold: Optional[float] = None
    specific_approver_id: Optional[int] = None
    is_active: bool
    steps_config: Optional[str] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    categories: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
