"""Admin routes"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.db.session import get_db
from app.core.deps import get_current_admin
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.audit import AuditEvent
from app.services.audit import record_audit_event

router = APIRouter(prefix="/admin", tags=["Administration"])


class StaffCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "staff"


class StaffUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None


@router.get("/staff", response_model=List[dict])
def list_all_staff(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    users = db.query(User).filter(User.role.in_([UserRole.staff, UserRole.admin])).all()
    return [
        {"id": u.id, "name": u.name, "email": u.email, "role": u.role.value, "is_active": u.is_active}
        for u in users
    ]


@router.post("/staff", status_code=201)
def create_staff(
    data: StaffCreate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")

    if data.role not in ("staff", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'staff' or 'admin'")

    user = User(
        name=data.name,
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        role=UserRole(data.role),
    )
    db.add(user)
    db.flush()
    record_audit_event(db, actor_id=admin.id, action="staff_created", entity_type="user", entity_id=user.id)
    db.commit()
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role.value}


@router.patch("/staff/{user_id}")
def update_staff(
    user_id: int,
    data: StaffUpdate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role == UserRole.patient:
        raise HTTPException(status_code=404, detail="Staff member not found")
    if data.name:
        user.name = data.name
    if data.is_active is not None:
        user.is_active = data.is_active
    if data.role:
        if data.role not in ("staff", "admin"):
            raise HTTPException(status_code=400, detail="Invalid role")
        user.role = UserRole(data.role)
    record_audit_event(db, actor_id=admin.id, action="staff_updated", entity_type="user", entity_id=user.id)
    db.commit()
    return {"id": user.id, "name": user.name, "is_active": user.is_active, "role": user.role.value}


@router.get("/audit-events")
def list_audit_events(
    page: int = 1,
    page_size: int = 50,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    offset = (page - 1) * page_size
    events = db.query(AuditEvent).order_by(AuditEvent.created_at.desc()).offset(offset).limit(page_size).all()
    return [
        {
            "id": e.id,
            "actor_id": e.actor_id,
            "action": e.action,
            "entity_type": e.entity_type,
            "entity_id": e.entity_id,
            "created_at": e.created_at.isoformat(),
        }
        for e in events
    ]


@router.get("/health")
def system_health(admin=Depends(get_current_admin)):
    return {"status": "ok", "service": "CareSync", "version": "1.0.0"}
