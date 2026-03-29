from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from config.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    DIRECTOR = "director"
    EMPLOYEE = "employee"


class ExpenseStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    IN_REVIEW = "in_review"


class ApprovalStepStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SKIPPED = "skipped"


class RuleType(str, enum.Enum):
    PERCENTAGE = "percentage"
    SPECIFIC_APPROVER = "specific_approver"
    HYBRID = "hybrid"
    SEQUENTIAL = "sequential"


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    country = Column(String)
    currency_code = Column(String, default="USD")
    currency_symbol = Column(String, default="$")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    users = relationship("User", back_populates="company")
    expenses = relationship("Expense", back_populates="company")
    approval_rules = relationship("ApprovalRule", back_populates="company")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=True)
    role = Column(String, default="employee")
    company_id = Column(Integer, ForeignKey("companies.id"))
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    department = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="users")
    manager = relationship("User", remote_side=[id], foreign_keys=[manager_id], back_populates="subordinates")
    subordinates = relationship("User", foreign_keys=[manager_id], back_populates="manager")
    submitted_expenses = relationship("Expense", foreign_keys="Expense.submitted_by_id", back_populates="submitted_by")
    approval_steps = relationship("ApprovalStep", foreign_keys="ApprovalStep.approver_id", back_populates="approver")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    amount = Column(Float, nullable=False)
    currency_code = Column(String, nullable=False)
    converted_amount = Column(Float, nullable=True)
    company_currency_code = Column(String, nullable=True)
    category = Column(String, nullable=False)
    expense_date = Column(DateTime(timezone=True), nullable=False)
    receipt_url = Column(String, nullable=True)
    merchant_name = Column(String, nullable=True)
    ocr_data = Column(Text, nullable=True)
    status = Column(SAEnum(ExpenseStatus), default=ExpenseStatus.PENDING)
    submitted_by_id = Column(Integer, ForeignKey("users.id"))
    company_id = Column(Integer, ForeignKey("companies.id"))
    current_step = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    submitted_by = relationship("User", foreign_keys=[submitted_by_id], back_populates="submitted_expenses")
    company = relationship("Company", back_populates="expenses")
    approval_steps = relationship("ApprovalStep", back_populates="expense", order_by="ApprovalStep.step_order")
    audit_logs = relationship("AuditLog", back_populates="expense")


class ApprovalStep(Base):
    __tablename__ = "approval_steps"

    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"))
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approver_role = Column(String, nullable=True)
    step_order = Column(Integer, nullable=False)
    status = Column(SAEnum(ApprovalStepStatus), default=ApprovalStepStatus.PENDING)
    comments = Column(Text, nullable=True)
    acted_at = Column(DateTime(timezone=True), nullable=True)

    expense = relationship("Expense", back_populates="approval_steps")
    approver = relationship("User", foreign_keys=[approver_id], back_populates="approval_steps")


class ApprovalRule(Base):
    __tablename__ = "approval_rules"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    name = Column(String, nullable=False)
    rule_type = Column(SAEnum(RuleType), default=RuleType.SEQUENTIAL)
    percentage_threshold = Column(Float, nullable=True)
    specific_approver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    steps_config = Column(Text, nullable=True)  # JSON string for step configuration
    min_amount = Column(Float, nullable=True)
    max_amount = Column(Float, nullable=True)
    categories = Column(String, nullable=True)  # comma-separated
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="approval_rules")
    specific_approver = relationship("User", foreign_keys=[specific_approver_id])


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    expense = relationship("Expense", back_populates="audit_logs")
    user = relationship("User")
