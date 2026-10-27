"""EmpathyCheckIn model"""
from datetime import datetime, timezone
from sqlalchemy import String, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class EmpathyCheckIn(Base):
    __tablename__ = "empathy_checkins"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    selected_feeling: Mapped[str] = mapped_column(String(50), nullable=False)
    optional_comment: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    patient: Mapped["User"] = relationship(back_populates="empathy_checkins")
