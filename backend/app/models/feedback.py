"""Feedback model"""
from datetime import datetime, timezone
from sqlalchemy import Integer, Text, String, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    communication_rating: Mapped[int] = mapped_column(Integer, nullable=False)
    information_rating: Mapped[int] = mapped_column(Integer, nullable=False)
    assistance_rating: Mapped[int] = mapped_column(Integer, nullable=False)
    overall_rating: Mapped[int] = mapped_column(Integer, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=True)
    comments: Mapped[str] = mapped_column(Text, nullable=True)
    preferred_language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    is_demo: Mapped[bool] = mapped_column(default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )

    __table_args__ = (
        CheckConstraint("communication_rating BETWEEN 1 AND 5", name="ck_comm_rating"),
        CheckConstraint("information_rating BETWEEN 1 AND 5", name="ck_info_rating"),
        CheckConstraint("assistance_rating BETWEEN 1 AND 5", name="ck_assist_rating"),
        CheckConstraint("overall_rating BETWEEN 1 AND 5", name="ck_overall_rating"),
    )

    # Relationships
    patient: Mapped["User"] = relationship(back_populates="feedback")
