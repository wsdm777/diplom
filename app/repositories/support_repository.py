from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.support import SupportMessage


class SupportRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, user_id: int, content: str) -> SupportMessage:
        msg = SupportMessage(user_id=user_id, content=content)
        self.session.add(msg)
        await self.session.commit()
        await self.session.refresh(msg)
        return msg

    async def list_by_user(self, user_id: int) -> list[SupportMessage]:
        result = await self.session.execute(
            select(SupportMessage)
            .where(SupportMessage.user_id == user_id)
            .order_by(SupportMessage.created_at.asc())
        )
        return list(result.scalars().all())
