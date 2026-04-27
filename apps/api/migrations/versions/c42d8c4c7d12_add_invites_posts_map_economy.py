"""add invites posts map economy

Revision ID: c42d8c4c7d12
Revises: 9f2c1c8b2f3a
Create Date: 2026-04-25 18:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c42d8c4c7d12"
down_revision: Union[str, Sequence[str], None] = "9f2c1c8b2f3a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("game_profiles", sa.Column("invite_balance", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("game_profiles", sa.Column("invite_daily_used", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("game_profiles", sa.Column("invite_last_reset_at", sa.DateTime(), nullable=True))
    op.add_column("game_profiles", sa.Column("geo_visibility", sa.String(length=16), nullable=False, server_default="approx"))
    op.add_column("game_profiles", sa.Column("last_geo_tile", sa.String(length=16), nullable=True))

    op.create_table(
        "shards_ledger",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("delta", sa.Integer(), nullable=False),
        sa.Column("reason", sa.String(length=32), nullable=False),
        sa.Column("meta", sa.JSON(), nullable=True),
        sa.Column("balance_after", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "invites",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("code", sa.String(length=24), nullable=False),
        sa.Column("creator_id", sa.UUID(), nullable=False),
        sa.Column("redeemed_by", sa.UUID(), nullable=True),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["creator_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["redeemed_by"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_invites_code", "invites", ["code"], unique=True)

    op.create_table(
        "geo_tiles",
        sa.Column("tile_id", sa.String(length=16), nullable=False),
        sa.Column("intensity", sa.Float(), nullable=False),
        sa.Column("dominant_archetype", sa.String(length=16), nullable=True),
        sa.Column("last_activity_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("tile_id"),
    )

    op.create_table(
        "geo_events",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("event_type", sa.String(length=16), nullable=False),
        sa.Column("tile_id", sa.String(length=16), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "posts",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("author_id", sa.UUID(), nullable=False),
        sa.Column("post_type", sa.String(length=16), nullable=False),
        sa.Column("text", sa.Text(), nullable=True),
        sa.Column("is_anonymous", sa.Boolean(), nullable=False),
        sa.Column("geo_tile", sa.String(length=16), nullable=True),
        sa.Column("is_boosted", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "post_media",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("post_id", sa.UUID(), nullable=False),
        sa.Column("media_url", sa.String(), nullable=False),
        sa.Column("media_type", sa.String(length=16), nullable=False),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("post_media")
    op.drop_table("posts")
    op.drop_table("geo_events")
    op.drop_table("geo_tiles")
    op.drop_index("ix_invites_code", table_name="invites")
    op.drop_table("invites")
    op.drop_table("shards_ledger")

    op.drop_column("game_profiles", "last_geo_tile")
    op.drop_column("game_profiles", "geo_visibility")
    op.drop_column("game_profiles", "invite_last_reset_at")
    op.drop_column("game_profiles", "invite_daily_used")
    op.drop_column("game_profiles", "invite_balance")
