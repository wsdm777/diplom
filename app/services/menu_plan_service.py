import asyncio
import logging

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
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
from app.services.llm_menu_service import LLMGenerationResult, LLMMenuService
from app.services.manual_menu_service import generate_manual

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


async def _try_llm(
    plan_id: int,
    request: MenuPlanGenerateRequest,
    foods: list,
) -> tuple[LLMGenerationResult | None, str]:
    """Try the LLM with a hard timeout.

    Returns (result, reason). reason is empty on success, otherwise describes
    why we fell through to the manual generator.
    """
    if not settings.OPENROUTER_API_KEY:
        return None, "OPENROUTER_API_KEY not configured"

    timeout = settings.LLM_TIMEOUT_SECONDS
    logger.info(
        "Menu plan %s: calling LLM (model=%s, timeout=%.1fs, target_kcal=%s, foods=%d)",
        plan_id,
        settings.OPENROUTER_MODEL,
        timeout,
        request.target_kcal,
        len(foods),
    )
    started = asyncio.get_event_loop().time()
    try:
        llm = LLMMenuService()
        result = await asyncio.wait_for(
            llm.generate(
                target_kcal=request.target_kcal,
                macro_ratio=request.macro_ratio,
                diet_filters=request.diet_filters,
                foods=foods,
            ),
            timeout=timeout,
        )
        elapsed = asyncio.get_event_loop().time() - started
        logger.info("Menu plan %s: LLM responded in %.2fs", plan_id, elapsed)
        return result, ""
    except asyncio.TimeoutError:
        elapsed = asyncio.get_event_loop().time() - started
        return None, f"LLM timeout after {elapsed:.2f}s (budget {timeout:.1f}s)"
    except Exception as exc:  # noqa: BLE001 — any LLM failure should fall through to manual
        elapsed = asyncio.get_event_loop().time() - started
        return None, f"LLM error after {elapsed:.2f}s: {type(exc).__name__}: {exc}"


async def run_generation_job(plan_id: int, request: MenuPlanGenerateRequest) -> None:
    """Background task: try the LLM with a 10s budget, otherwise compute manually.

    The plan is always finalized as `completed` if the food catalog is non-empty —
    the caller cannot distinguish LLM-generated from manually-generated menus.
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

            result, fallback_reason = await _try_llm(plan_id, request, foods)
            source = "llm"
            if result is None:
                logger.warning(
                    "Menu plan %s: %s — falling back to manual generator",
                    plan_id,
                    fallback_reason,
                )
                manual_started = asyncio.get_event_loop().time()
                result = generate_manual(
                    target_kcal=request.target_kcal,
                    macro_ratio=request.macro_ratio,
                    diet_filters=request.diet_filters,
                    foods=foods,
                )
                manual_elapsed = asyncio.get_event_loop().time() - manual_started
                source = "manual"
                logger.info(
                    "Menu plan %s: manual generator produced %d items in %.3fs",
                    plan_id,
                    len(result.items),
                    manual_elapsed,
                )

            await repo.fill_completed(
                plan_id=plan_id,
                items=result.items,
                total_kcal=result.total_kcal,
                total_protein=result.total_protein,
                total_fat=result.total_fat,
                total_carb=result.total_carb,
            )
            logger.info(
                "Menu plan %s generated (source=%s, total_kcal=%d)",
                plan_id,
                source,
                result.total_kcal,
            )
        except Exception as exc:  # noqa: BLE001
            logger.exception("Menu plan %s generation failed", plan_id)
            await repo.set_status(
                plan_id,
                MenuPlanStatus.failed,
                error_message=str(exc)[:500],
            )
