from datetime import datetime

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user_id, require_operator
from app.db.session import get_session
from app.repositories.support_repository import SupportRepository
from app.schemas.support import MessageType, SupportMessageCreate, SupportMessageOut

router = APIRouter(prefix="/support", tags=["support"])


class ConversationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    user_id: int
    user_name: str
    last_at: datetime
    unread_count: int


# ── User endpoints ──────────────────────────────────────────────────────────

@router.get("/messages", response_model=list[SupportMessageOut])
async def get_messages(
    current_user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    return await SupportRepository(session).list_by_user(current_user_id)


@router.post("/messages", response_model=SupportMessageOut, status_code=201)
async def send_message(
    data: SupportMessageCreate,
    current_user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    return await SupportRepository(session).create(
        current_user_id, data.content, data.message_type.value
    )


# ── Operator endpoints ──────────────────────────────────────────────────────

@router.get("/conversations", response_model=list[ConversationOut])
async def list_conversations(
    message_type: MessageType | None = Query(default=None),
    _op_id: int = Depends(require_operator),
    session: AsyncSession = Depends(get_session),
):
    return await SupportRepository(session).list_conversations(
        message_type=message_type.value if message_type else None
    )


@router.get("/conversations/{user_id}", response_model=list[SupportMessageOut])
async def get_conversation(
    user_id: int,
    _op_id: int = Depends(require_operator),
    session: AsyncSession = Depends(get_session),
):
    repo = SupportRepository(session)
    await repo.mark_read(user_id)
    return await repo.list_by_user_for_operator(user_id)


@router.post("/conversations/{user_id}", response_model=SupportMessageOut, status_code=201)
async def reply_to_user(
    user_id: int,
    data: SupportMessageCreate,
    _op_id: int = Depends(require_operator),
    session: AsyncSession = Depends(get_session),
):
    return await SupportRepository(session).create_operator_reply(user_id, data.content)
