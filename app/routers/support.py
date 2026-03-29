from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user_id
from app.db.session import get_session
from app.repositories.support_repository import SupportRepository
from app.schemas.support import SupportMessageCreate, SupportMessageOut

router = APIRouter(prefix="/support", tags=["support"])


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
    return await SupportRepository(session).create(current_user_id, data.content)
