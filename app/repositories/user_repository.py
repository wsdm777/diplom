from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.user import User
from app.models.weight import WeightEntry
from app.schemas.user import UserRegister


class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: int) -> User | None:
        result = await self.session.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.session.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create(self, data: UserRegister) -> User:
        user = User(
            email=data.email,
            hashed_password=hash_password(data.password),
            name=data.name,
            gender=data.gender,
            height=data.height,
            birth_date=data.birth_date,
        )
        self.session.add(user)
        await self.session.flush()
        if data.weight is not None:
            self.session.add(WeightEntry(user_id=user.id, weight=data.weight))
        await self.session.commit()
        await self.session.refresh(user)
        return user
