from datetime import date
from enum import Enum

from pydantic import BaseModel, EmailStr, Field


class Gender(str, Enum):
    male = "male"
    female = "female"


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=100)
    gender: Gender
    height: float = Field(gt=0, le=300, description="Height in cm")
    birth_date: date


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    gender: Gender
    height: float
    birth_date: date

    model_config = {"from_attributes": True}
