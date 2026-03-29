from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user_id
from app.db.session import get_session
from app.schemas.menu_plan import MenuPlanCreate, MenuPlanOut, MenuPlanSummary
from app.services.menu_plan_service import MenuPlanService

router = APIRouter(prefix="/menu-plans", tags=["menu-plans"])


@router.post("", response_model=MenuPlanOut, status_code=201)
async def save_menu_plan(
    data: MenuPlanCreate,
    current_user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    return await MenuPlanService(session).save(current_user_id, data)


@router.get("", response_model=list[MenuPlanSummary])
async def list_menu_plans(
    current_user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    return await MenuPlanService(session).list_plans(current_user_id)


@router.get("/{plan_id}", response_model=MenuPlanOut)
async def get_menu_plan(
    plan_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    return await MenuPlanService(session).get_plan(plan_id, current_user_id)


@router.delete("/{plan_id}", status_code=204)
async def delete_menu_plan(
    plan_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    await MenuPlanService(session).delete_plan(plan_id, current_user_id)
