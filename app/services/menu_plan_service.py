from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.menu_plan_repository import MenuPlanRepository
from app.schemas.menu_plan import MenuPlanCreate, MenuPlanOut, MenuPlanSummary


class MenuPlanService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = MenuPlanRepository(session)

    async def save(self, user_id: int, data: MenuPlanCreate) -> MenuPlanOut:
        plan = await self.repo.create(user_id, data)
        return MenuPlanOut.model_validate(plan)

    async def list_plans(self, user_id: int) -> list[MenuPlanSummary]:
        plans = await self.repo.list_by_user(user_id)
        return [MenuPlanSummary.model_validate(p) for p in plans]

    async def get_plan(self, plan_id: int, user_id: int) -> MenuPlanOut:
        plan = await self.repo.get_by_id(plan_id)
        if not plan or plan.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
        return MenuPlanOut.model_validate(plan)

    async def delete_plan(self, plan_id: int, user_id: int) -> None:
        plan = await self.repo.get_by_id(plan_id)
        if not plan or plan.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
        await self.repo.delete(plan)
