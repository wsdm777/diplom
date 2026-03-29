from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.food_repository import FoodRepository
from app.schemas.food import FoodOut


class FoodService:
    def __init__(self, session: AsyncSession):
        self.repo = FoodRepository(session)

    async def get_foods(
        self,
        vegan: bool = False,
        lactose_free: bool = False,
        gluten_free: bool = False,
    ) -> list[FoodOut]:
        foods = await self.repo.get_all(vegan=vegan, lactose_free=lactose_free, gluten_free=gluten_free)
        return [FoodOut.model_validate(f) for f in foods]
