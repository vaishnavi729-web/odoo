import io
import json
import os
import re
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
from utils.auth import get_current_user
from models.models import User

router = APIRouter(prefix="/api/ocr", tags=["ocr"])

try:
    import pytesseract
    # Try common Tesseract paths on Windows
    for path in [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    ]:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            break
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False


def extract_amount(text: str):
    patterns = [
        r"(?:total|amount|subtotal|grand total)[:\s]*[\$£€₹]?\s*([\d,]+\.?\d*)",
        r"[\$£€₹]\s*([\d,]+\.?\d*)",
        r"([\d,]+\.\d{2})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            amount_str = match.group(1).replace(",", "")
            try:
                return float(amount_str)
            except ValueError:
                pass
    return None


def extract_date(text: str):
    patterns = [
        r"\b(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})\b",
        r"\b(\d{4}[/\-]\d{1,2}[/\-]\d{1,2})\b",
        r"\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    return None


def extract_merchant(text: str):
    lines = [l.strip() for l in text.strip().split("\n") if l.strip()]
    if lines:
        return lines[0][:100]
    return None


@router.post("/extract")
async def extract_receipt(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if not TESSERACT_AVAILABLE:
        return JSONResponse(
            status_code=200,
            content={
                "success": False,
                "message": "Tesseract OCR is not installed. Please install it from https://github.com/UB-Mannheim/tesseract/wiki",
                "data": {}
            }
        )

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        text = pytesseract.image_to_string(image)

        amount = extract_amount(text)
        date = extract_date(text)
        merchant = extract_merchant(text)

        return {
            "success": True,
            "raw_text": text,
            "data": {
                "amount": amount,
                "date": date,
                "merchant_name": merchant,
                "description": f"Receipt from {merchant}" if merchant else "Scanned receipt",
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")
