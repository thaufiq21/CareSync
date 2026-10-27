from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    related_entity_type: Optional[str]
    related_entity_id: Optional[int]
    is_read: bool
    created_at: datetime
