from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user_id
from app.db.session import get_session
from app.schemas.user import UserLogin, UserOut, UserRegister
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=201)
async def register(data: UserRegister, session: AsyncSession = Depends(get_session)):
    return await AuthService(session).register(data)


@router.post("/login", response_model=UserOut)
async def login(
    data: UserLogin,
    response: Response,
    session: AsyncSession = Depends(get_session),
):
    return await AuthService(session).login(data, response)


@router.post("/logout", status_code=204)
async def logout(
    response: Response,
    current_user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    await AuthService(session).logout(response)


@router.get("/me", response_model=UserOut)
async def get_me(
    current_user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    from app.repositories.user_repository import UserRepository
    from fastapi import HTTPException, status

    user = await UserRepository(session).get_by_id(current_user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserOut.model_validate(user)
