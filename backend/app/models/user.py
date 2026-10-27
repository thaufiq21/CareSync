"""User model"""
import enum
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Enum, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class UserRole(str, enum.Enum):
    patient = "patient"
    staff = "staff"
    admin = "admin"


class Language(str, enum.Enum):
    en = "en"
    ta = "ta"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(512), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.patient, nullable=False)
    preferred_language: Mapped[Language] = mapped_column(Enum(Language), default=Language.en, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    appointments: Mapped[list["Appointment"]] = relationship(back_populates="patient", cascade="all, delete-orphan")
    assistance_requests: Mapped[list["AssistanceRequest"]] = relationship(
        back_populates="patient", foreign_keys="AssistanceRequest.patient_id", cascade="all, delete-orphan"
    )
    assigned_requests: Mapped[list["AssistanceRequest"]] = relationship(
        back_populates="assigned_staff", foreign_keys="AssistanceRequest.assigned_staff_id"
    )
    responses: Mapped[list["AssistanceResponse"]] = relationship(back_populates="author")
    feedback: Mapped[list["Feedback"]] = relationship(back_populates="patient", cascade="all, delete-orphan")
    empathy_checkins: Mapped[list["EmpathyCheckIn"]] = relationship(back_populates="patient", cascade="all, delete-orphan")
    notifications: Mapped[list["Notification"]] = relationship(back_populates="user", cascade="all, delete-orphan")
