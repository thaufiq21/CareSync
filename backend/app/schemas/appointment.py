from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class AppointmentCreate(BaseModel):
    title: str
    department_id: Optional[int] = None
    appointment_date: datetime
    notes: Optional[str] = None
    questions: Optional[str] = None  # JSON string of questions list

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Title must be at least 2 characters")
        if len(v) > 300:
            raise ValueError("Title too long")
        return v


class AppointmentUpdate(BaseModel):
    title: Optional[str] = None
    department_id: Optional[int] = None
    appointment_date: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    questions: Optional[str] = None


class AppointmentResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    patient_id: int
    department_id: Optional[int]
    title: str
    appointment_date: datetime
    status: str
    notes: Optional[str]
    questions: Optional[str]
    is_demo: bool
    created_at: datetime
    updated_at: datetime
