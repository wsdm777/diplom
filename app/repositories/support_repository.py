from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.support import SupportMessage
from app.models.user import User


class SupportRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    # ── User side ──────────────────────────────────────────────────────────

    async def create(self, user_id: int, content: str, message_type: str = "complaint") -> SupportMessage:
        msg = SupportMessage(user_id=user_id, content=content, message_type=message_type)
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

    # ── Operator side ──────────────────────────────────────────────────────

    async def list_conversations(self, message_type: str | None = None) -> list:
        """Return one row per user: user_id, user_name, last_at, unread_count."""
        unread_filter = [
            SupportMessage.is_from_operator == False,  # noqa: E712
            SupportMessage.is_read == False,            # noqa: E712
        ]
        if message_type:
            unread_filter.append(SupportMessage.message_type == message_type)

        unread_sq = (
            select(
                SupportMessage.user_id,
                func.count(SupportMessage.id).label("unread_count"),
            )
            .where(and_(*unread_filter))
            .group_by(SupportMessage.user_id)
        ).subquery()

        msg_filter = []
        if message_type:
            msg_filter.append(SupportMessage.message_type == message_type)

        query = (
            select(
                User.id.label("user_id"),
                User.name.label("user_name"),
                func.max(SupportMessage.created_at).label("last_at"),
                func.coalesce(unread_sq.c.unread_count, 0).label("unread_count"),
            )
            .join(SupportMessage, SupportMessage.user_id == User.id)
            .outerjoin(unread_sq, User.id == unread_sq.c.user_id)
            .group_by(User.id, User.name, unread_sq.c.unread_count)
            .order_by(func.max(SupportMessage.created_at).desc())
        )
        if msg_filter:
            query = query.where(and_(*msg_filter))

        result = await self.session.execute(query)
        return result.all()

    async def list_by_user_for_operator(self, user_id: int) -> list[SupportMessage]:
        result = await self.session.execute(
            select(SupportMessage)
            .where(SupportMessage.user_id == user_id)
            .order_by(SupportMessage.created_at.asc())
        )
        return list(result.scalars().all())

    async def create_operator_reply(self, user_id: int, content: str) -> SupportMessage:
        msg = SupportMessage(user_id=user_id, content=content, is_from_operator=True, is_read=True)
        self.session.add(msg)
        await self.session.commit()
        await self.session.refresh(msg)
        return msg

    async def mark_read(self, user_id: int) -> None:
        """Mark all user messages (not from operator) as read."""
        msgs = (
            await self.session.execute(
                select(SupportMessage).where(
                    and_(
                        SupportMessage.user_id == user_id,
                        SupportMessage.is_from_operator == False,  # noqa: E712
                        SupportMessage.is_read == False,           # noqa: E712
                    )
                )
            )
        ).scalars().all()
        for msg in msgs:
            msg.is_read = True
        await self.session.commit()
