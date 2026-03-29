from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.menu_plan import MenuPlan, MenuPlanItem
from app.schemas.menu_plan import MenuPlanCreate


class MenuPlanRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, user_id: int, data: MenuPlanCreate) -> MenuPlan:
        plan = MenuPlan(
            user_id=user_id,
            target_kcal=data.target_kcal,
            total_kcal=data.total_kcal,
            total_protein=data.total_protein,
            total_fat=data.total_fat,
            total_carb=data.total_carb,
        )
        self.session.add(plan)
        await self.session.flush()

        for item_data in data.items:
            item = MenuPlanItem(
                plan_id=plan.id,
                meal_type=item_data.meal_type,
                food_id=item_data.food_id,
                name=item_data.name,
                grams=item_data.grams,
                kcal=item_data.kcal,
                protein=item_data.protein,
                fat=item_data.fat,
                carb=item_data.carb,
            )
            self.session.add(item)

        await self.session.commit()
        await self.session.refresh(plan)

        result = await self.session.execute(
            select(MenuPlan)
            .where(MenuPlan.id == plan.id)
            .options(selectinload(MenuPlan.items))
        )
        return result.scalar_one()

    async def list_by_user(self, user_id: int, limit: int = 10) -> list[MenuPlan]:
        result = await self.session.execute(
            select(MenuPlan)
            .where(MenuPlan.user_id == user_id)
            .order_by(MenuPlan.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_id(self, plan_id: int) -> MenuPlan | None:
        result = await self.session.execute(
            select(MenuPlan)
            .where(MenuPlan.id == plan_id)
            .options(selectinload(MenuPlan.items))
        )
        return result.scalar_one_or_none()

    async def delete(self, plan: MenuPlan) -> None:
        await self.session.delete(plan)
        await self.session.commit()
