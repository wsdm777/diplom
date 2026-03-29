"""add operator role and seed operator user

Revision ID: 0007
Revises: 0006
Create Date: 2026-03-29

"""
from alembic import op
import sqlalchemy as sa

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None

OPERATOR_HASH = "$2b$12$kqobHmWu0LOJOwuxWDoB2OG3k5cbPCm9KmfJkSl3B2uKNYYnPFnM2"


def upgrade() -> None:
    # ALTER TYPE ADD VALUE must be committed before the new value can be used.
    # We COMMIT the current alembic transaction, run ALTER TYPE (auto-commit),
    # then the INSERT runs in a fresh implicit transaction.
    conn = op.get_bind()
    conn.execute(sa.text("COMMIT"))
    conn.execute(sa.text("ALTER TYPE role ADD VALUE IF NOT EXISTS 'operator'"))

    # Seed operator user (new implicit transaction)
    conn.execute(
        sa.text(
            "INSERT INTO users (email, hashed_password, name, gender, height, birth_date, role) "
            f"VALUES (:email, :pw, :name, 'male'::gender, 175, '1990-01-01', 'operator'::role) "
            "ON CONFLICT (email) DO NOTHING"
        ).bindparams(
            email="operator@operator.com",
            pw=OPERATOR_HASH,
            name="Оператор",
        )
    )
    conn.execute(sa.text("COMMIT"))


def downgrade() -> None:
    op.execute(sa.text("DELETE FROM users WHERE email = 'operator@operator.com'"))
    # PostgreSQL does not support DROP VALUE from enum — skip type downgrade
