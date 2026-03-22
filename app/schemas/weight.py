from datetime import datetime

from pydantic import BaseModel, Field


class WeightCreate(BaseModel):
    weight: float = Field(gt=0, le=500, description="Weight in kg")


class WeightOut(BaseModel):
    id: int
    user_id: int
    weight: float
    measured_at: datetime

    model_config = {"from_attributes": True}
