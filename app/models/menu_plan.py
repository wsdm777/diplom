from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.food import MealType


class MenuPlanStatus(str, PyEnum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class MenuPlan(Base):
    __tablename__ = "menu_plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    target_kcal: Mapped[int] = mapped_column(Integer, nullable=False)
    total_kcal: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_protein: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    total_fat: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    total_carb: Mapped[float] = mapped_column(Float, nullable=False, default=0)

    status: Mapped[MenuPlanStatus] = mapped_column(
        SAEnum(MenuPlanStatus, name="menuplanstatus"),
        nullable=False,
        default=MenuPlanStatus.completed,
        server_default=MenuPlanStatus.completed.value,
    )
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    items: Mapped[list["MenuPlanItem"]] = relationship(
        "MenuPlanItem", back_populates="plan", cascade="all, delete-orphan"
    )


class MenuPlanItem(Base):
    __tablename__ = "menu_plan_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    plan_id: Mapped[int] = mapped_column(
        ForeignKey("menu_plans.id", ondelete="CASCADE"), nullable=False, index=True
    )
    meal_type: Mapped[MealType] = mapped_column(SAEnum(MealType), nullable=False)
    food_id: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    grams: Mapped[int] = mapped_column(Integer, nullable=False)
    kcal: Mapped[int] = mapped_column(Integer, nullable=False)
    protein: Mapped[float] = mapped_column(Float, nullable=False)
    fat: Mapped[float] = mapped_column(Float, nullable=False)
    carb: Mapped[float] = mapped_column(Float, nullable=False)

    plan: Mapped["MenuPlan"] = relationship("MenuPlan", back_populates="items")
