from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.balance import ENERGY_COSTS, cost, get_mode
from app.game.service import GameService
from app.posts.models import Post, PostMedia
from app.posts.schemas import CreatePostDto, PostAuthor, PostMediaDto, PostResponse, PostStats
from app.users.models import User


class PostsService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.game = GameService(session)

    @staticmethod
    def _parse_cursor(cursor: str | None) -> datetime | None:
        if not cursor:
            return None
        candidate = cursor.strip()
        if candidate.endswith("Z"):
            candidate = candidate[:-1] + "+00:00"
        try:
            dt = datetime.fromisoformat(candidate)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="invalid_cursor") from exc
        if dt.tzinfo:
            dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
        return dt

    def _base_query(self):
        return select(Post).options(
            selectinload(Post.author).selectinload(User.game_profile),
            selectinload(Post.media_items),
        )

    def to_response(self, post: Post) -> PostResponse:
        if post.is_anonymous:
            author = PostAuthor(id=None, nickname=None, archetype=None)
        else:
            archetype = None
            if post.author and post.author.game_profile:
                archetype = post.author.game_profile.archetype
            author = PostAuthor(
                id=post.author_id,
                nickname=post.author.nickname if post.author else None,
                archetype=archetype,
            )

        media = [PostMediaDto(url=item.media_url, type=item.media_type) for item in post.media_items]

        return PostResponse(
            id=post.id,
            author=author,
            post_type=post.post_type,
            text=post.text,
            media=media,
            is_anonymous=post.is_anonymous,
            geo_tile=post.geo_tile,
            created_at=post.created_at,
            stats=PostStats(views=0, replies=0),
        )

    async def list_feed(self, cursor: str | None, limit: int):
        cursor_dt = self._parse_cursor(cursor)
        stmt = self._base_query().order_by(Post.created_at.desc(), Post.id.desc()).limit(limit + 1)
        if cursor_dt:
            stmt = stmt.where(Post.created_at < cursor_dt)

        rows = list((await self.session.execute(stmt)).scalars().all())
        next_cursor = None
        if len(rows) > limit:
            rows = rows[:limit]
            next_cursor = rows[-1].created_at.isoformat()

        return [self.to_response(post) for post in rows], next_cursor, get_mode()

    async def get_post_or_404(self, post_id: UUID):
        stmt = self._base_query().where(Post.id == post_id)
        post = (await self.session.execute(stmt)).scalar_one_or_none()
        if not post:
            raise HTTPException(status_code=404, detail="not_found")
        return post

    async def create_post(self, current_user: User, dto: CreatePostDto):
        profile = await self.game.get_or_create_profile(current_user.id)

        energy_cost = int(ENERGY_COSTS.get("post", 2))
        if profile.energy < energy_cost:
            raise HTTPException(status_code=403, detail="energy_empty")

        shards_spent = 0
        if dto.boost:
            shards_spent += cost("post_boost")
        if dto.is_anonymous:
            shards_spent += cost("post_anonymous")

        if profile.shards < shards_spent:
            raise HTTPException(status_code=402, detail="not_enough_shards")

        profile.energy -= energy_cost
        profile.shards -= shards_spent

        post = Post(
            author_id=current_user.id,
            post_type=dto.post_type,
            text=dto.text.strip() if dto.text else None,
            is_anonymous=dto.is_anonymous,
            geo_tile=dto.geo_tile,
            is_boosted=dto.boost,
        )
        self.session.add(post)
        await self.session.flush()

        for media in dto.media:
            self.session.add(
                PostMedia(
                    post_id=post.id,
                    media_url=media.url,
                    media_type=media.type,
                )
            )

        await self.session.commit()
        await self.session.refresh(profile)

        created = await self.get_post_or_404(post.id)
        return created, shards_spent, profile
