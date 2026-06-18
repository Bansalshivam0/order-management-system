import binascii
import hashlib
import os
import random
import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from twilio.rest import Client as TwilioClient

from app.core.config import settings
from app.db.session import get_db
from app.models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])

DbDep = Annotated[Session, Depends(get_db)]


def _hash_password(password: str) -> str:
    salt = os.urandom(32)
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
    return binascii.hexlify(salt).decode() + ":" + binascii.hexlify(key).decode()


def _verify_password(stored: str, password: str) -> bool:
    try:
        salt_hex, key_hex = stored.split(":")
        salt = binascii.unhexlify(salt_hex)
        expected = binascii.unhexlify(key_hex)
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
        return actual == expected
    except Exception:
        return False


def _user_dict(user: User) -> dict:
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "phone_number": user.phone_number,
    }


class SignupBody(BaseModel):
    name: str
    email: str
    phone_number: str
    password: str


class LoginBody(BaseModel):
    email: str
    password: str


class ProfileUpdateBody(BaseModel):
    email: str
    current_password: str
    name: Optional[str] = None
    phone_number: Optional[str] = None
    new_password: Optional[str] = None
    new_email: Optional[str] = None


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(body: SignupBody, db: DbDep):
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        id=uuid.uuid4(),
        name=body.name,
        email=body.email,
        phone_number=body.phone_number,
        password_hash=_hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"status": "ok", "message": "Account created", "user": _user_dict(user)}


@router.post("/login")
def login(body: LoginBody, db: DbDep):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not _verify_password(user.password_hash, body.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"status": "ok", "message": "Logged in", "user": _user_dict(user)}


class GetPhoneBody(BaseModel):
    email: str


@router.post("/get-phone")
def get_phone(body: GetPhoneBody, db: DbDep):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with that email")
    return {"phone_number": user.phone_number}


class RequestOtpBody(BaseModel):
    phone_number: str


class VerifyOtpBody(BaseModel):
    phone_number: str
    otp: str


def _send_sms(to: str, body: str) -> None:
    client = TwilioClient(settings.twilio_account_sid, settings.twilio_auth_token)
    client.messages.create(to=to, from_=settings.twilio_from_number, body=body)


@router.post("/request-otp")
def request_otp(body: RequestOtpBody, db: DbDep):
    user = db.query(User).filter(User.phone_number == body.phone_number).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with that phone number")
    otp = str(random.randint(100_000, 999_999))
    user.otp = otp
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    db.commit()
    _send_sms(user.phone_number, f"Your OTP is {otp}. It expires in 10 minutes.")
    phone = user.phone_number or ""
    masked = ("*" * (len(phone) - 4) + phone[-4:]) if len(phone) >= 4 else "your phone"
    return {"status": "ok", "message": "OTP sent", "phone_hint": masked}


@router.post("/verify-otp")
def verify_otp(body: VerifyOtpBody, db: DbDep):
    user = db.query(User).filter(User.phone_number == body.phone_number).first()
    if not user or not user.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    if user.otp_expires_at is None or datetime.now(timezone.utc) > user.otp_expires_at:
        raise HTTPException(status_code=400, detail="OTP has expired")
    if user.otp != body.otp:
        raise HTTPException(status_code=400, detail="Incorrect OTP")
    user.otp = None
    user.otp_expires_at = None
    db.commit()
    return {"status": "ok", "message": "Logged in", "user": _user_dict(user)}


@router.put("/profile")
def update_profile(body: ProfileUpdateBody, db: DbDep):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not _verify_password(user.password_hash, body.current_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if body.name is not None:
        user.name = body.name
    if body.phone_number is not None:
        user.phone_number = body.phone_number
    if body.new_email is not None and body.new_email != body.email:
        if db.query(User).filter(User.email == body.new_email).first():
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = body.new_email
    if body.new_password is not None:
        if len(body.new_password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
        user.password_hash = _hash_password(body.new_password)
    db.commit()
    db.refresh(user)
    return {"status": "ok", "user": _user_dict(user)}
