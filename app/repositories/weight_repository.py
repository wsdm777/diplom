from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.weight import WeightEntry


class WeightRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, user_id: int, weight: float) -> WeightEntry:
        entry = WeightEntry(user_id=user_id, weight=weight)
        self.session.add(entry)
        await self.session.commit()
        await self.session.refresh(entry)
        return entry

    async def get_by_id(self, entry_id: int) -> WeightEntry | None:
        result = await self.session.execute(
            select(WeightEntry).where(WeightEntry.id == entry_id)
        )
        return result.scalar_one_or_none()

    async def delete(self, entry: WeightEntry) -> None:
        await self.session.delete(entry)
        await self.session.commit()

    async def get_history_by_user(self, user_id: int) -> list[WeightEntry]:
        result = await self.session.execute(
            select(WeightEntry)
            .where(WeightEntry.user_id == user_id)
            .order_by(WeightEntry.measured_at.asc())
        )
        return list(result.scalars().all())
