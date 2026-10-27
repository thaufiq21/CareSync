from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator

VALID_FEELINGS = {"comfortable", "confused", "worried", "frustrated", "need_assistance", "prefer_not_to_answer"}


class EmpathyCheckInCreate(BaseModel):
    selected_feeling: str
    optional_comment: Optional[str] = None

    @field_validator("selected_feeling")
    @classmethod
    def valid_feeling(cls, v):
        if v not in VALID_FEELINGS:
            raise ValueError(f"Invalid feeling. Must be one of: {', '.join(VALID_FEELINGS)}")
        return v

    @field_validator("optional_comment")
    @classmethod
    def comment_length(cls, v):
        if v and len(v) > 500:
            raise ValueError("Comment too long")
        return v


class EmpathyCheckInResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    patient_id: int
    selected_feeling: str
    optional_comment: Optional[str]
    created_at: datetime
