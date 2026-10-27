"""Feedback routes"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user, get_current_staff_or_admin
from app.models.user import User, UserRole
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate, FeedbackResponse

router = APIRouter(tags=["Feedback"])


@router.post("/feedback", response_model=FeedbackResponse, status_code=201)
def submit_feedback(
    data: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.patient:
        raise HTTPException(status_code=403, detail="Only patients can submit feedback")
    fb = Feedback(patient_id=current_user.id, **data.model_dump())
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb


@router.get("/feedback/mine", response_model=List[FeedbackResponse])
def my_feedback(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Feedback).filter(Feedback.patient_id == current_user.id).order_by(Feedback.created_at.desc()).all()


@router.get("/staff/feedback", response_model=List[FeedbackResponse])
def staff_feedback(
    current_user: User = Depends(get_current_staff_or_admin),
    db: Session = Depends(get_db),
):
    return db.query(Feedback).order_by(Feedback.created_at.desc()).limit(200).all()
