from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.food import MealType


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
    total_kcal: Mapped[int] = mapped_column(Integer, nullable=False)
    total_protein: Mapped[float] = mapped_column(Float, nullable=False)
    total_fat: Mapped[float] = mapped_column(Float, nullable=False)
    total_carb: Mapped[float] = mapped_column(Float, nullable=False)

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
