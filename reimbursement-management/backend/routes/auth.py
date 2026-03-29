from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.database import get_db
from models.models import User, Company, UserRole
from schemas.schemas import SignupRequest, LoginRequest, FirebaseLoginRequest, Token
from utils.auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


def user_to_dict(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role.value,
        "company_id": user.company_id,
        "manager_id": user.manager_id,
        "department": user.department,
        "is_active": user.is_active,
    }


@router.post("/signup", response_model=Token)
async def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create company
    company = Company(
        name=payload.company_name,
        country=payload.country,
        currency_code=payload.currency_code,
        currency_symbol=payload.currency_symbol,
    )
    db.add(company)
    db.flush()

    # Create admin user
    hashed = None
    if payload.password:
        hashed = get_password_hash(payload.password)

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hashed,
        firebase_uid=payload.firebase_uid,
        role=UserRole.ADMIN,
        company_id=company.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user_to_dict(user)}


@router.post("/login", response_model=Token)
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user_to_dict(user)}


@router.post("/firebase-login", response_model=Token)
async def firebase_login(payload: FirebaseLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.firebase_uid == payload.firebase_uid).first()
    if not user:
        user = db.query(User).filter(User.email == payload.email).first()
        if user:
            user.firebase_uid = payload.firebase_uid
            db.commit()
        else:
            raise HTTPException(status_code=404, detail="User not found. Please sign up first.")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user_to_dict(user)}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return user_to_dict(current_user)
