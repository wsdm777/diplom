from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator


class SupportMessageCreate(BaseModel):
    content: str

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Message cannot be empty")
        return v


class SupportMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    content: str
    is_from_operator: bool
    is_read: bool
    created_at: datetime
