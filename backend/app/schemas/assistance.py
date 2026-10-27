from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, field_validator


class AssistanceRequestCreate(BaseModel):
    category: str
    description: str
    preferred_language: str = "en"
    department_id: Optional[int] = None
    contact_preference: Optional[str] = None
    accessibility_needs: Optional[str] = None
    consent: bool

    @field_validator("description")
    @classmethod
    def description_not_empty(cls, v):
        v = v.strip()
        if len(v) < 10:
            raise ValueError("Description must be at least 10 characters")
        if len(v) > 2000:
            raise ValueError("Description too long (max 2000 characters)")
        return v

    @field_validator("consent")
    @classmethod
    def must_consent(cls, v):
        if not v:
            raise ValueError("You must agree to the privacy notice")
        return v


class AssistanceStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None  # Optional response note when changing status


class AssistanceAssign(BaseModel):
    staff_id: int


class AssistanceResponseCreate(BaseModel):
    message: str
    is_internal_note: bool = False

    @field_validator("message")
    @classmethod
    def message_not_empty(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Response message must not be empty")
        if len(v) > 5000:
            raise ValueError("Response too long")
        return v


class AssistanceResponseOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    request_id: int
    author_id: int
    author_name: str = ""
    message: str
    is_internal_note: bool
    created_at: datetime


class AssistanceRequestOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    reference_code: str
    patient_id: int
    category: str
    description: str
    preferred_language: str
    department_id: Optional[int]
    contact_preference: Optional[str]
    accessibility_needs: Optional[str]
    priority: str
    status: str
    assigned_staff_id: Optional[int]
    is_demo: bool
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]
    responses: List[AssistanceResponseOut] = []
