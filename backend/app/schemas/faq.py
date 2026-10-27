from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class FAQCreate(BaseModel):
    question_en: str
    answer_en: str
    question_ta: Optional[str] = None
    answer_ta: Optional[str] = None
    category: Optional[str] = None
    is_published: bool = True


class FAQUpdate(BaseModel):
    question_en: Optional[str] = None
    answer_en: Optional[str] = None
    question_ta: Optional[str] = None
    answer_ta: Optional[str] = None
    category: Optional[str] = None
    is_published: Optional[bool] = None


class FAQResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    question_en: str
    answer_en: str
    question_ta: Optional[str]
    answer_ta: Optional[str]
    category: Optional[str]
    is_published: bool
    updated_at: datetime
