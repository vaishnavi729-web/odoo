from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from models.models import Company, User
from schemas.schemas import CompanyOut
from utils.auth import get_current_user, require_admin
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/company", tags=["company"])


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    currency_code: Optional[str] = None
    currency_symbol: Optional[str] = None
    country: Optional[str] = None


@router.get("/", response_model=CompanyOut)
async def get_company(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    return company


@router.put("/", response_model=CompanyOut)
async def update_company(
    payload: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(company, field, value)
    db.commit()
    db.refresh(company)
    return company
