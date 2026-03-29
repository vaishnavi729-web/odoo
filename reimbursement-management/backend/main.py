import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config.database import engine, Base
from models import models
from routes import auth, users, expenses, rules, ocr, company

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Reimbursement Management System API",
    description="Full-stack expense reimbursement management with multi-level approvals",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(expenses.router)
app.include_router(rules.router)
app.include_router(ocr.router)
app.include_router(company.router)


@app.get("/")
async def root():
    return {"message": "Reimbursement Management System API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
