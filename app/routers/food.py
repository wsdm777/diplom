from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user_id
from app.db.session import get_session
from app.schemas.food import FoodOut
from app.services.food_service import FoodService

router = APIRouter(prefix="/foods", tags=["foods"])


@router.get("", response_model=list[FoodOut])
async def get_foods(
    vegan: bool = Query(False),
    lactose_free: bool = Query(False),
    gluten_free: bool = Query(False),
    _current_user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    return await FoodService(session).get_foods(
        vegan=vegan, lactose_free=lactose_free, gluten_free=gluten_free,
    )
