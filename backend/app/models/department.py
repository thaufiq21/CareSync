"""Department model"""
from datetime import datetime, timezone
from sqlalchemy import String, Text, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    location: Mapped[str] = mapped_column(String(300), nullable=False, default="")
    building: Mapped[str] = mapped_column(String(100), nullable=True)
    floor: Mapped[str] = mapped_column(String(50), nullable=True)
    opening_hours: Mapped[str] = mapped_column(String(300), nullable=True)
    contact_information: Mapped[str] = mapped_column(String(300), nullable=True)
    directions: Mapped[str] = mapped_column(Text, nullable=True)
    accessibility_info: Mapped[str] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    appointments: Mapped[list["Appointment"]] = relationship(back_populates="department")
    assistance_requests: Mapped[list["AssistanceRequest"]] = relationship(back_populates="department")
