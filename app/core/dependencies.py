from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyCookie
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_session

cookie_scheme = APIKeyCookie(name="access_token")


def get_current_user_id(
    access_token: str = Depends(cookie_scheme),
) -> int:
    user_id = decode_access_token(access_token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return user_id


async def require_admin(
    current_user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
) -> int:
    from app.repositories.user_repository import UserRepository

    user = await UserRepository(session).get_by_id(current_user_id)
    if not user or user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user_id
