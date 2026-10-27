"""Authentication routes"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import settings
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.schemas.user import UserRegister, UserLogin, UserResponse
from app.services.audit import record_audit_event

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)

_login_attempts: dict = {}
MAX_ATTEMPTS = 10
WINDOW_SECONDS = 300


def _check_rate_limit(ip: str):
    import time
    now = time.time()
    attempts = _login_attempts.get(ip, [])
    attempts = [t for t in attempts if now - t < WINDOW_SECONDS]
    if len(attempts) >= MAX_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later.",
        )
    attempts.append(now)
    _login_attempts[ip] = attempts


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    data: UserRegister,
    response: Response,
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )

    user = User(
        name=data.name.strip(),
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        role=UserRole.patient,
        preferred_language=data.preferred_language,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=not settings.is_development,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    record_audit_event(db, actor_id=user.id, action="user_registered", entity_type="user", entity_id=user.id)
    db.commit()
    logger.info(f"New patient registered: id={user.id}")
    return user


@router.post("/login", response_model=UserResponse)
def login(
    data: UserLogin,
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
):
    ip = request.client.host if request.client else "unknown"
    _check_rate_limit(ip)

    user = db.query(User).filter(User.email == data.email.lower()).first()

    auth_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
    )

    if not user or not verify_password(data.password, user.password_hash):
        raise auth_error
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=not settings.is_development,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    record_audit_event(db, actor_id=user.id, action="user_login", entity_type="user", entity_id=user.id)
    db.commit()
    return user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user
