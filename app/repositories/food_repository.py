from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.food import Food


class FoodRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(
        self,
        vegan: bool = False,
        lactose_free: bool = False,
        gluten_free: bool = False,
    ) -> list[Food]:
        stmt = select(Food)
        if vegan:
            stmt = stmt.where(Food.is_vegan.is_(True))
        if lactose_free:
            stmt = stmt.where(Food.is_lactose_free.is_(True))
        if gluten_free:
            stmt = stmt.where(Food.is_gluten_free.is_(True))
        result = await self.session.execute(stmt.order_by(Food.meal_type, Food.id))
        return list(result.scalars().all())
