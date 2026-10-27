"""Empathy check-in routes"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.models.empathy import EmpathyCheckIn
from app.schemas.empathy import EmpathyCheckInCreate, EmpathyCheckInResponse

router = APIRouter(prefix="/empathy-checkins", tags=["Empathy Check-In"])


@router.post("", response_model=EmpathyCheckInResponse, status_code=201)
def submit_checkin(
    data: EmpathyCheckInCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.patient:
        raise HTTPException(status_code=403, detail="Only patients can submit check-ins")
    checkin = EmpathyCheckIn(
        patient_id=current_user.id,
        selected_feeling=data.selected_feeling,
        optional_comment=data.optional_comment,
    )
    db.add(checkin)
    db.commit()
    db.refresh(checkin)
    return checkin


@router.get("/mine", response_model=List[EmpathyCheckInResponse])
def my_checkins(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(EmpathyCheckIn)
        .filter(EmpathyCheckIn.patient_id == current_user.id)
        .order_by(EmpathyCheckIn.created_at.desc())
        .limit(10)
        .all()
    )
