"""006 add unique constraint to product_name

Revision ID: a3c7e2f1b9d5
Revises: f4b2c1a8e7d6
Create Date: 2026-06-18 00:00:00.000000

"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "a3c7e2f1b9d5"
down_revision = "c9e4f1b2a3d6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_unique_constraint("uq_products_product_name", "products", ["product_name"])


def downgrade() -> None:
    op.drop_constraint("uq_products_product_name", "products", type_="unique")
