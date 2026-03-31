"""add user profile fields

Revision ID: 9f2c1c8b2f3a
Revises: 6ccbd5df4a0a
Create Date: 2026-03-31 23:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9f2c1c8b2f3a"
down_revision: Union[str, Sequence[str], None] = "6ccbd5df4a0a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("users", sa.Column("bio", sa.Text(), nullable=True))
    op.add_column(
        "users",
        sa.Column(
            "privacy",
            sa.String(length=20),
            nullable=False,
            server_default="public",
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("users", "privacy")
    op.drop_column("users", "bio")
