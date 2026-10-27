"""Assistance Request and Response models"""
import enum
import secrets
from datetime import datetime, timezone
from sqlalchemy import String, ForeignKey, Enum, DateTime, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class RequestCategory(str, enum.Enum):
    navigation = "hospital_navigation"
    language = "language_assistance"
    procedures = "understanding_procedures"
    mobility = "wheelchair_mobility_assistance"
    appointment = "appointment_related_support"
    communication = "communication_assistance"
    general = "general_patient_service"
    other = "other_non_emergency"


class RequestStatus(str, enum.Enum):
    submitted = "submitted"
    acknowledged = "acknowledged"
    in_progress = "in_progress"
    awaiting_patient = "awaiting_patient"
    resolved = "resolved"
    closed = "closed"


class RequestPriority(str, enum.Enum):
    normal = "normal"
    high = "high"


# Allowed status transitions (patient-initiated and staff-initiated)
ALLOWED_TRANSITIONS = {
    RequestStatus.submitted: [RequestStatus.acknowledged, RequestStatus.closed],
    RequestStatus.acknowledged: [RequestStatus.in_progress, RequestStatus.awaiting_patient, RequestStatus.closed],
    RequestStatus.in_progress: [RequestStatus.awaiting_patient, RequestStatus.resolved, RequestStatus.closed],
    RequestStatus.awaiting_patient: [RequestStatus.in_progress, RequestStatus.resolved, RequestStatus.closed],
    RequestStatus.resolved: [RequestStatus.closed],
    RequestStatus.closed: [],
}

# Only staff can set these statuses
STAFF_ONLY_STATUSES = {
    RequestStatus.acknowledged,
    RequestStatus.in_progress,
    RequestStatus.awaiting_patient,
    RequestStatus.resolved,
    RequestStatus.closed,
}


def generate_reference_code() -> str:
    """Generate a non-sequential reference code"""
    return f"CS-{secrets.token_hex(3).upper()}"


class AssistanceRequest(Base):
    __tablename__ = "assistance_requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    reference_code: Mapped[str] = mapped_column(
        String(20), unique=True, index=True, default=generate_reference_code, nullable=False
    )
    patient_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    category: Mapped[RequestCategory] = mapped_column(Enum(RequestCategory), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    preferred_language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"), nullable=True)
    contact_preference: Mapped[str] = mapped_column(String(100), nullable=True)
    accessibility_needs: Mapped[str] = mapped_column(String(300), nullable=True)
    priority: Mapped[RequestPriority] = mapped_column(
        Enum(RequestPriority), default=RequestPriority.normal, nullable=False
    )
    status: Mapped[RequestStatus] = mapped_column(
        Enum(RequestStatus), default=RequestStatus.submitted, nullable=False, index=True
    )
    assigned_staff_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    resolved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    patient: Mapped["User"] = relationship(back_populates="assistance_requests", foreign_keys=[patient_id])
    assigned_staff: Mapped["User"] = relationship(back_populates="assigned_requests", foreign_keys=[assigned_staff_id])
    department: Mapped["Department"] = relationship(back_populates="assistance_requests")
    responses: Mapped[list["AssistanceResponse"]] = relationship(
        back_populates="request", cascade="all, delete-orphan", order_by="AssistanceResponse.created_at"
    )


class AssistanceResponse(Base):
    __tablename__ = "assistance_responses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    request_id: Mapped[int] = mapped_column(ForeignKey("assistance_requests.id"), nullable=False, index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_internal_note: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    request: Mapped["AssistanceRequest"] = relationship(back_populates="responses")
    author: Mapped["User"] = relationship(back_populates="responses")
