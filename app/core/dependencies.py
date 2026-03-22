from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyCookie

from app.core.security import decode_access_token

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
