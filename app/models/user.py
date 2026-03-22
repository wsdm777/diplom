from datetime import date
from enum import Enum as PyEnum

from sqlalchemy import Date, Enum, Float, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Gender(str, PyEnum):
    male = "male"
    female = "female"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    gender: Mapped[Gender] = mapped_column(Enum(Gender), nullable=False)
    height: Mapped[float] = mapped_column(Float, nullable=False)  # cm
    birth_date: Mapped[date] = mapped_column(Date, nullable=False)

    weight_entries: Mapped[list["WeightEntry"]] = relationship(
        "WeightEntry", back_populates="user", cascade="all, delete-orphan"
    )
