"""add arcade runs

Revision ID: e3a0d8c2f741
Revises: c42d8c4c7d12
Create Date: 2026-11-22
"""
from alembic import op
import sqlalchemy as sa

revision = "e3a0d8c2f741"
down_revision = "c42d8c4c7d12"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        "arcade_runs",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("duration_seconds", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_arcade_runs_user_id", "arcade_runs", ["user_id"])

def downgrade() -> None:
    op.drop_index("ix_arcade_runs_user_id", table_name="arcade_runs")
    op.drop_table("arcade_runs")
