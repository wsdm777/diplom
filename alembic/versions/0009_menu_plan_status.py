"""add status fields to menu_plans

Revision ID: 0009
Revises: 0008
Create Date: 2026-04-29

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ENUM as PgEnum

revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None


status_enum = PgEnum(
    "pending", "processing", "completed", "failed",
    name="menuplanstatus",
    create_type=False,
)


def upgrade() -> None:
    status_enum.create(op.get_bind(), checkfirst=True)

    op.add_column(
        "menu_plans",
        sa.Column(
            "status",
            status_enum,
            nullable=False,
            server_default="completed",
        ),
    )
    op.add_column(
        "menu_plans",
        sa.Column("error_message", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("menu_plans", "error_message")
    op.drop_column("menu_plans", "status")
    status_enum.drop(op.get_bind(), checkfirst=True)
