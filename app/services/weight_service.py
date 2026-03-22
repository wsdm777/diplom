from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_repository import UserRepository
from app.repositories.weight_repository import WeightRepository
from app.schemas.weight import WeightCreate, WeightOut


class WeightService:
    def __init__(self, session: AsyncSession):
        self.weight_repo = WeightRepository(session)
        self.user_repo = UserRepository(session)

    async def add_weight(self, user_id: int, data: WeightCreate) -> WeightOut:
        entry = await self.weight_repo.create(user_id, data.weight)
        return WeightOut.model_validate(entry)

    async def get_history(self, user_id: int, requesting_user_id: int) -> list[WeightOut]:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        entries = await self.weight_repo.get_history_by_user(user_id)
        return [WeightOut.model_validate(e) for e in entries]
