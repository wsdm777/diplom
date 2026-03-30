"""add message_type to support_messages

Revision ID: 0008
Revises: 0007
Create Date: 2026-03-30

"""
from alembic import op
import sqlalchemy as sa

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "support_messages",
        sa.Column(
            "message_type",
            sa.String(20),
            nullable=False,
            server_default="complaint",
        ),
    )


def downgrade() -> None:
    op.drop_column("support_messages", "message_type")
