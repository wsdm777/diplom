import logging

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.models.menu_plan import MenuPlanStatus
from app.repositories.food_repository import FoodRepository
from app.repositories.menu_plan_repository import MenuPlanRepository
from app.schemas.menu_plan import (
    MenuPlanCreate,
    MenuPlanGenerateRequest,
    MenuPlanOut,
    MenuPlanSummary,
)
from app.services.llm_menu_service import LLMMenuService

logger = logging.getLogger(__name__)


class MenuPlanService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
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

    async def start_generation(
        self, user_id: int, data: MenuPlanGenerateRequest
    ) -> MenuPlanOut:
        plan = await self.repo.create_pending(user_id, data.target_kcal)
        return MenuPlanOut.model_validate(plan)


async def run_generation_job(plan_id: int, request: MenuPlanGenerateRequest) -> None:
    """Background task: call the LLM and fill the pending plan.

    Uses a fresh DB session because the request-scoped session is closed by the
    time BackgroundTasks runs.
    """
    async with AsyncSessionLocal() as session:
        repo = MenuPlanRepository(session)
        await repo.set_status(plan_id, MenuPlanStatus.processing)

        try:
            food_repo = FoodRepository(session)
            foods = await food_repo.get_all(
                vegan=request.diet_filters.vegan,
                lactose_free=request.diet_filters.lactose_free,
                gluten_free=request.diet_filters.gluten_free,
            )

            llm = LLMMenuService()
            result = await llm.generate(
                target_kcal=request.target_kcal,
                macro_ratio=request.macro_ratio,
                diet_filters=request.diet_filters,
                foods=foods,
            )

            await repo.fill_completed(
                plan_id=plan_id,
                items=result.items,
                total_kcal=result.total_kcal,
                total_protein=result.total_protein,
                total_fat=result.total_fat,
                total_carb=result.total_carb,
            )
            logger.info("Menu plan %s generated successfully", plan_id)
        except Exception as exc:  # noqa: BLE001 — surface any failure to the user
            logger.exception("Menu plan %s generation failed", plan_id)
            await repo.set_status(
                plan_id,
                MenuPlanStatus.failed,
                error_message=str(exc)[:500],
            )
