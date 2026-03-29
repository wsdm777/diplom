from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user_id
from app.db.session import get_session
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserOut, UserUpdate
from app.schemas.weight import WeightCreate, WeightOut
from app.services.weight_service import WeightService

router = APIRouter(prefix="/users", tags=["weight"])


@router.patch("/me", response_model=UserOut)
async def update_profile(
    data: UserUpdate,
    current_user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    repo = UserRepository(session)
    user = await repo.get_by_id(current_user_id)
    updated = await repo.update(user, data)
    return UserOut.model_validate(updated)


@router.post("/me/weight", response_model=WeightOut, status_code=201)
async def add_weight(
    data: WeightCreate,
    current_user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    return await WeightService(session).add_weight(current_user_id, data)


@router.delete("/me/weight/{entry_id}", status_code=204)
async def delete_weight(
    entry_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    await WeightService(session).delete_weight(entry_id, current_user_id)


@router.get("/{user_id}/weight", response_model=list[WeightOut])
async def get_weight_history(
    user_id: int,
    current_user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    return await WeightService(session).get_history(user_id, current_user_id)
