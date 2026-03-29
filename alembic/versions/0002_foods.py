"""add foods table

Revision ID: 0002
Revises: 0001
Create Date: 2026-03-29

"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None

SEED = [
    # breakfast
    ("Овсяная каша на воде", "breakfast", 88, 3, 1.7, 15, True, True, False),
    ("Яйцо куриное (варёное)", "breakfast", 155, 12.6, 10.6, 1.1, False, True, True),
    ("Творог 5%", "breakfast", 121, 17.2, 5, 1.8, False, False, True),
    ("Банан", "breakfast", 89, 1.1, 0.3, 23, True, True, True),
    ("Цельнозерновой хлеб", "breakfast", 247, 13, 3.4, 41, True, True, False),
    ("Йогурт натуральный", "breakfast", 60, 4, 1.5, 7, False, False, True),
    ("Омлет из 2 яиц", "breakfast", 154, 11, 12, 0.7, False, True, True),
    ("Гречневая каша", "breakfast", 110, 4.2, 1.1, 21, True, True, True),
    ("Тофу жареный", "breakfast", 144, 17, 9, 3, True, True, True),
    ("Смузи из ягод и овса", "breakfast", 75, 2, 1, 15, True, True, False),
    ("Арахисовая паста на тосте", "breakfast", 250, 10, 14, 24, True, True, False),
    # lunch
    ("Куриная грудка (варёная)", "lunch", 165, 31, 3.6, 0, False, True, True),
    ("Рис бурый (варёный)", "lunch", 123, 2.7, 0.9, 25.6, True, True, True),
    ("Гречка (варёная)", "lunch", 110, 4.2, 1.1, 21, True, True, True),
    ("Говядина (тушёная)", "lunch", 232, 25.8, 14.7, 0, False, True, True),
    ("Овощной салат", "lunch", 35, 1.5, 0.2, 7, True, True, True),
    ("Суп куриный", "lunch", 48, 3.6, 1.4, 5, False, True, True),
    ("Макароны (твёрдые сорта)", "lunch", 131, 5.1, 1.1, 27, True, True, False),
    ("Лосось (запечённый)", "lunch", 208, 20, 13, 0, False, True, True),
    ("Картофель (отварной)", "lunch", 82, 2, 0.1, 17, True, True, True),
    ("Чечевица (варёная)", "lunch", 116, 9, 0.4, 20, True, True, True),
    ("Нут (варёный)", "lunch", 164, 8.9, 2.6, 27, True, True, True),
    ("Суп овощной", "lunch", 42, 1.5, 0.5, 8, True, True, True),
    # dinner
    ("Рыба (треска запечённая)", "dinner", 90, 17.8, 0.7, 0, False, True, True),
    ("Салат из свежих овощей", "dinner", 35, 1.5, 0.2, 7, True, True, True),
    ("Куриная грудка (гриль)", "dinner", 165, 31, 3.6, 0, False, True, True),
    ("Тушёные овощи", "dinner", 55, 2, 1.5, 8, True, True, True),
    ("Кефир 1%", "dinner", 40, 3, 1, 4, False, False, True),
    ("Индейка (варёная)", "dinner", 130, 29, 1, 0, False, True, True),
    ("Брокколи на пару", "dinner", 35, 2.4, 0.4, 7, True, True, True),
    ("Творог 2%", "dinner", 103, 18, 2, 3.3, False, False, True),
    ("Фасоль тушёная", "dinner", 123, 7.8, 0.5, 21, True, True, True),
    ("Тофу на пару", "dinner", 76, 8, 4.8, 1.9, True, True, True),
    # snack
    ("Яблоко", "snack", 52, 0.3, 0.2, 14, True, True, True),
    ("Миндаль (30 г)", "snack", 170, 6, 15, 6, True, True, True),
    ("Греческий йогурт", "snack", 59, 10, 0.7, 3.6, False, False, True),
    ("Банан", "snack", 89, 1.1, 0.3, 23, True, True, True),
    ("Протеиновый батончик", "snack", 200, 20, 7, 22, False, False, False),
    ("Морковь", "snack", 41, 0.9, 0.2, 10, True, True, True),
    ("Финики (3 шт)", "snack", 282, 2.5, 0.4, 75, True, True, True),
    ("Хумус с овощами", "snack", 166, 8, 10, 14, True, True, True),
]


def upgrade() -> None:
    foods = op.create_table(
        "foods",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("meal_type", sa.Enum("breakfast", "lunch", "dinner", "snack", name="mealtype"), nullable=False),
        sa.Column("kcal", sa.Float(), nullable=False),
        sa.Column("protein", sa.Float(), nullable=False),
        sa.Column("fat", sa.Float(), nullable=False),
        sa.Column("carb", sa.Float(), nullable=False),
        sa.Column("is_vegan", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_lactose_free", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_gluten_free", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.create_index("ix_foods_meal_type", "foods", ["meal_type"])

    op.bulk_insert(
        foods,
        [
            {
                "name": name,
                "meal_type": meal_type,
                "kcal": kcal,
                "protein": protein,
                "fat": fat,
                "carb": carb,
                "is_vegan": is_vegan,
                "is_lactose_free": is_lf,
                "is_gluten_free": is_gf,
            }
            for name, meal_type, kcal, protein, fat, carb, is_vegan, is_lf, is_gf in SEED
        ],
    )


def downgrade() -> None:
    op.drop_table("foods")
    op.execute("DROP TYPE IF EXISTS mealtype")
