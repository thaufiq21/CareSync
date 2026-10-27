from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DepartmentCreate(BaseModel):
    name: str
    description: str = ""
    location: str = ""
    building: Optional[str] = None
    floor: Optional[str] = None
    opening_hours: Optional[str] = None
    contact_information: Optional[str] = None
    directions: Optional[str] = None
    accessibility_info: Optional[str] = None


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    building: Optional[str] = None
    floor: Optional[str] = None
    opening_hours: Optional[str] = None
    contact_information: Optional[str] = None
    directions: Optional[str] = None
    accessibility_info: Optional[str] = None
    is_active: Optional[bool] = None


class DepartmentResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    name: str
    description: str
    location: str
    building: Optional[str]
    floor: Optional[str]
    opening_hours: Optional[str]
    contact_information: Optional[str]
    directions: Optional[str]
    accessibility_info: Optional[str]
    is_active: bool
    is_demo: bool
    created_at: datetime
