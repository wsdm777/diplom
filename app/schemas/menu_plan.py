from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.menu_plan import MenuPlanStatus


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


class MacroRatio(BaseModel):
    protein: int = Field(ge=5, le=80)
    fat: int = Field(ge=5, le=80)
    carb: int = Field(ge=5, le=80)


class DietFilters(BaseModel):
    vegan: bool = False
    lactose_free: bool = False
    gluten_free: bool = False


class MenuPlanGenerateRequest(BaseModel):
    target_kcal: int = Field(ge=800, le=10000)
    macro_ratio: MacroRatio | None = None
    diet_filters: DietFilters = Field(default_factory=DietFilters)


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
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: int
    created_at: datetime
    target_kcal: int
    total_kcal: int
    total_protein: float
    total_fat: float
    total_carb: float
    status: MenuPlanStatus
    error_message: str | None = None
    items: list[MenuPlanItemOut]


class MenuPlanSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: int
    created_at: datetime
    target_kcal: int
    total_kcal: int
    total_protein: float
    total_fat: float
    total_carb: float
    status: MenuPlanStatus
