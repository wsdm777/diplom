from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, field_validator


class MessageType(str, Enum):
    complaint = "complaint"
    suggestion = "suggestion"


class SupportMessageCreate(BaseModel):
    content: str
    message_type: MessageType = MessageType.complaint

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
    message_type: str
    is_from_operator: bool
    is_read: bool
    created_at: datetime
