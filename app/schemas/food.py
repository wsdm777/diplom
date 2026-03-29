from pydantic import BaseModel

from app.models.food import MealType


class FoodOut(BaseModel):
    id: int
    name: str
    meal_type: MealType
    kcal: float
    protein: float
    fat: float
    carb: float
    is_vegan: bool
    is_lactose_free: bool
    is_gluten_free: bool

    model_config = {"from_attributes": True}
