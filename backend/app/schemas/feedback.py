from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class FeedbackCreate(BaseModel):
    communication_rating: int
    information_rating: int
    assistance_rating: int
    overall_rating: int
    category: Optional[str] = None
    comments: Optional[str] = None
    preferred_language: str = "en"

    @field_validator("communication_rating", "information_rating", "assistance_rating", "overall_rating")
    @classmethod
    def rating_range(cls, v):
        if not 1 <= v <= 5:
            raise ValueError("Rating must be between 1 and 5")
        return v

    @field_validator("comments")
    @classmethod
    def comments_length(cls, v):
        if v and len(v) > 2000:
            raise ValueError("Comments too long (max 2000 characters)")
        return v


class FeedbackResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    patient_id: int
    communication_rating: int
    information_rating: int
    assistance_rating: int
    overall_rating: int
    category: Optional[str]
    comments: Optional[str]
    preferred_language: str
    is_demo: bool
    created_at: datetime
