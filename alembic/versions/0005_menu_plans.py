"""add menu_plans tables

Revision ID: 0005
Revises: 0004
Create Date: 2026-03-29

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ENUM as PgEnum

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None

# reuse existing enum — do NOT create it again
meal_type_enum = PgEnum("breakfast", "lunch", "dinner", "snack", name="mealtype", create_type=False)


def upgrade() -> None:
    op.create_table(
        "menu_plans",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("target_kcal", sa.Integer(), nullable=False),
        sa.Column("total_kcal", sa.Integer(), nullable=False),
        sa.Column("total_protein", sa.Float(), nullable=False),
        sa.Column("total_fat", sa.Float(), nullable=False),
        sa.Column("total_carb", sa.Float(), nullable=False),
    )
    op.create_index("ix_menu_plans_user_id", "menu_plans", ["user_id"])

    op.create_table(
        "menu_plan_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "plan_id",
            sa.Integer(),
            sa.ForeignKey("menu_plans.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("meal_type", meal_type_enum, nullable=False),
        sa.Column("food_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("grams", sa.Integer(), nullable=False),
        sa.Column("kcal", sa.Integer(), nullable=False),
        sa.Column("protein", sa.Float(), nullable=False),
        sa.Column("fat", sa.Float(), nullable=False),
        sa.Column("carb", sa.Float(), nullable=False),
    )
    op.create_index("ix_menu_plan_items_plan_id", "menu_plan_items", ["plan_id"])


def downgrade() -> None:
    op.drop_table("menu_plan_items")
    op.drop_table("menu_plans")
