"""add user roles

Revision ID: 0003
Revises: 0002
Create Date: 2026-03-29

"""
from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None

ADMIN_HASH = "$2b$12$duAmxccPT/DFw0vKLlN66OUtHPEM4Z6Vqg8Zjl6rrCkwj9LYhahOi"  # bcrypt of "admin"


def upgrade() -> None:
    role_enum = sa.Enum("user", "admin", name="role")
    role_enum.create(op.get_bind(), checkfirst=True)

    op.add_column("users", sa.Column("role", role_enum, nullable=False, server_default="user"))

    op.execute(
        sa.text(
            "INSERT INTO users (email, hashed_password, name, gender, height, birth_date, role) "
            "VALUES ('admin@admin.com', :pw, 'Admin', 'male', 180, '2000-01-01', 'admin')"
        ).bindparams(pw=ADMIN_HASH)
    )


def downgrade() -> None:
    op.execute("DELETE FROM users WHERE email = 'admin@admin.com'")
    op.drop_column("users", "role")
    op.execute("DROP TYPE IF EXISTS role")
