from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.db.session import get_session
from app.models.food import Food
from app.models.user import Gender, User
from app.models.weight import WeightEntry

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
async def get_stats(
    _admin_id: int = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    total_users = (await session.execute(select(func.count(User.id)))).scalar() or 0
    total_weights = (await session.execute(select(func.count(WeightEntry.id)))).scalar() or 0
    total_foods = (await session.execute(select(func.count(Food.id)))).scalar() or 0

    male_count = (
        await session.execute(
            select(func.count(User.id)).where(User.gender == Gender.male)
        )
    ).scalar() or 0
    female_count = total_users - male_count

    avg_height = (await session.execute(select(func.avg(User.height)))).scalar()
    avg_weight = (await session.execute(select(func.avg(WeightEntry.weight)))).scalar()

    # weight entries per day (last 30 days)
    from datetime import datetime, timedelta, timezone

    since = datetime.now(timezone.utc) - timedelta(days=30)
    daily_entries = (
        await session.execute(
            select(
                func.date(WeightEntry.measured_at).label("day"),
                func.count(WeightEntry.id).label("count"),
            )
            .where(WeightEntry.measured_at >= since)
            .group_by(func.date(WeightEntry.measured_at))
            .order_by(func.date(WeightEntry.measured_at))
        )
    ).all()

    # registrations per day (approximate by user id — no created_at, use weight first entry)
    users_with_weight = (
        await session.execute(
            select(
                func.date(func.min(WeightEntry.measured_at)).label("day"),
                func.count(func.distinct(WeightEntry.user_id)).label("count"),
            )
            .where(WeightEntry.measured_at >= since)
            .group_by(func.date(func.min(WeightEntry.measured_at)))
        )
    ).all()

    return {
        "total_users": total_users,
        "total_weight_entries": total_weights,
        "total_foods": total_foods,
        "gender": {"male": male_count, "female": female_count},
        "avg_height": round(avg_height, 1) if avg_height else None,
        "avg_weight": round(avg_weight, 1) if avg_weight else None,
        "daily_weight_entries": [{"day": str(r.day), "count": r.count} for r in daily_entries],
        "daily_new_users": [{"day": str(r.day), "count": r.count} for r in users_with_weight],
    }
