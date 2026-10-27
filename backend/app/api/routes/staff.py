"""Staff-specific routes"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_staff_or_admin
from app.models.user import User, UserRole

router = APIRouter(prefix="/staff", tags=["Staff"])


@router.get("/members", response_model=List[dict])
def list_staff_members(
    current_user: User = Depends(get_current_staff_or_admin),
    db: Session = Depends(get_db),
):
    staff = db.query(User).filter(User.role.in_([UserRole.staff, UserRole.admin]), User.is_active == True).all()
    return [{"id": s.id, "name": s.name, "role": s.role.value} for s in staff]
