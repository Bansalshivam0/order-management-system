"""005 add otp to users

Revision ID: c9e4f1b2a3d6
Revises: b7f3e2a1c9d5
Create Date: 2026-06-18 00:00:05.000000

"""

from alembic import op
import sqlalchemy as sa


revision = "c9e4f1b2a3d6"
down_revision = "b7f3e2a1c9d5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("otp", sa.String(length=6), nullable=True))
    op.add_column("users", sa.Column("otp_expires_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "otp_expires_at")
    op.drop_column("users", "otp")
