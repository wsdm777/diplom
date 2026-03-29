from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MenuPlanItemCreate(BaseModel):
    meal_type: str
    food_id: int
    name: str
    grams: int
    kcal: int
    protein: float
    fat: float
    carb: float


class MenuPlanCreate(BaseModel):
    target_kcal: int
    total_kcal: int
    total_protein: float
    total_fat: float
    total_carb: float
    items: list[MenuPlanItemCreate]


class MenuPlanItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meal_type: str
    food_id: int
    name: str
    grams: int
    kcal: int
    protein: float
    fat: float
    carb: float


class MenuPlanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    target_kcal: int
    total_kcal: int
    total_protein: float
    total_fat: float
    total_carb: float
    items: list[MenuPlanItemOut]


class MenuPlanSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    target_kcal: int
    total_kcal: int
    total_protein: float
    total_fat: float
    total_carb: float
