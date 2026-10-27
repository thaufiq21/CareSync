from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator, model_validator
import re


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    password_confirm: str
    preferred_language: str = "en"
    consent: bool

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        if len(v) > 200:
            raise ValueError("Name must be under 200 characters")
        return v

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(v) > 128:
            raise ValueError("Password too long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one digit")
        return v

    @field_validator("preferred_language")
    @classmethod
    def valid_language(cls, v):
        if v not in ("en", "ta"):
            raise ValueError("Preferred language must be 'en' or 'ta'")
        return v

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.password_confirm:
            raise ValueError("Passwords do not match")
        if not self.consent:
            raise ValueError("You must consent to create an account")
        return self


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    preferred_language: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) < 2:
                raise ValueError("Name must be at least 2 characters")
        return v

    @field_validator("preferred_language")
    @classmethod
    def valid_language(cls, v):
        if v is not None and v not in ("en", "ta"):
            raise ValueError("Preferred language must be 'en' or 'ta'")
        return v


class UserResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    name: str
    email: str
    role: str
    preferred_language: str
    is_active: bool
    created_at: datetime
