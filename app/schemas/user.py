from datetime import date
from enum import Enum

from pydantic import BaseModel, EmailStr, Field, field_validator


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
    weight: float | None = Field(default=None, gt=0, le=500, description="Weight in kg")

    @field_validator("birth_date")
    @classmethod
    def validate_age(cls, v: date) -> date:
        today = date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 16:
            raise ValueError("Регистрация доступна только для лиц от 16 лет")
        return v


class UserUpdate(BaseModel):
    gender: Gender | None = None
    height: float | None = Field(default=None, gt=0, le=300)
    birth_date: date | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Role(str, Enum):
    user = "user"
    admin = "admin"
    operator = "operator"


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    gender: Gender
    height: float
    birth_date: date
    role: Role

    model_config = {"from_attributes": True}
