import re
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..auth import hash_password, verify_password, create_access_token, to_profile
from ..deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

def is_valid_email(email: str) -> bool:
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email))

@router.post("/signup")
def signup(payload: schemas.SignupRequest, db: Session = Depends(get_db)):
    if not payload.name or len(payload.name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Please enter your full name.")
    if not is_valid_email(payload.email):
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    normalized = payload.email.strip().lower()
    exists = db.query(models.User).filter(models.User.email == normalized).first()
    if exists:
        raise HTTPException(status_code=409, detail="An account with this email already exists. Please log in.")
    hashed = hash_password(payload.password)
    user = models.User(
        name=payload.name.strip(),
        email=normalized,
        passwordHash=hashed,
        avatarColor="#7c3aed",
        targetBand=7,
        examDate="",
        dailyGoalMin=30,
        notifications='{"practice":true,"reminders":true,"results":true}',
        planType="free",
        role="student",
        status="active",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"id": user.id, "email": user.email, "role": user.role})
    return {"user": to_profile(user), "token": token}

@router.post("/login")
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    normalized = (payload.email or "").strip().lower()
    if not normalized or not payload.password:
        raise HTTPException(status_code=400, detail="Email and password required")
    user = db.query(models.User).filter(models.User.email == normalized).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password. Try demo@ieltsmaster.com / demo1234 or admin@ieltsmaster.com / admin123.")
    if not verify_password(payload.password, user.passwordHash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if user.status == "banned":
        raise HTTPException(status_code=403, detail=f"Account banned: {user.bannedReason or 'contact support'}")
    user.lastActiveAt = datetime.utcnow()
    db.commit()
    db.refresh(user)
    token = create_access_token({"id": user.id, "email": user.email, "role": user.role})
    return {"user": to_profile(user), "token": token}

@router.post("/google")
def google_login(payload: dict = None, db: Session = Depends(get_db)):
    import requests, os
    # Real Google OAuth: expect {"id_token": "..."} from frontend GIS
    id_token = None
    if payload and isinstance(payload, dict):
        id_token = payload.get("id_token") or payload.get("credential") or payload.get("token")
    # If no id_token, fallback to demo (for backward compat)
    if not id_token:
        user = db.query(models.User).filter(models.User.email == "alex.carter@gmail.com").first()
        if not user:
            user = models.User(
                name="Alex Carter",
                email="alex.carter@gmail.com",
                passwordHash=hash_password("google-oauth"),
                avatarColor="#0ea5e9",
                targetBand=7,
                planType="free",
                role="student",
                status="active",
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        if user.status == "banned":
            raise HTTPException(status_code=403, detail=f"Account banned: {user.bannedReason}")
        token = create_access_token({"id": user.id, "email": user.email, "role": user.role})
        return {"user": to_profile(user), "token": token}
    # Verify with Google
    try:
        # Use tokeninfo endpoint (no client secret needed)
        resp = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}", timeout=5)
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Google token")
        info = resp.json()
        email = info.get("email")
        name = info.get("name") or email.split("@")[0]
        sub = info.get("sub")
        picture = info.get("picture")
        if not email:
            raise HTTPException(status_code=401, detail="Google token missing email")
        # Optional: verify audience if GOOGLE_CLIENT_ID set
        expected_aud = os.getenv("GOOGLE_CLIENT_ID")
        if expected_aud and info.get("aud") != expected_aud:
            # allow anyway but log
            print(f"Google aud mismatch: {info.get('aud')} vs {expected_aud}")
        user = db.query(models.User).filter(models.User.email == email.lower()).first()
        if not user:
            user = models.User(
                name=name,
                email=email.lower(),
                passwordHash=hash_password(f"google-{sub}"),
                avatarColor="#0ea5e9",
                targetBand=7,
                planType="free",
                role="student",
                status="active",
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        if user.status == "banned":
            raise HTTPException(status_code=403, detail=f"Account banned: {user.bannedReason}")
        user.lastActiveAt = datetime.utcnow()
        db.commit()
        token = create_access_token({"id": user.id, "email": user.email, "role": user.role})
        return {"user": to_profile(user), "token": token}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Google verify error: {e}")
        raise HTTPException(status_code=401, detail="Google authentication failed")

@router.get("/me")
def me(current_user: models.User = Depends(get_current_user)):
    return {"user": to_profile(current_user)}

@router.post("/forgot-password")
def forgot_password(payload: schemas.ForgotRequest):
    if not is_valid_email(payload.email):
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    return {"message": "Reset link sent (mock)"}
