from uuid import UUID
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.auth.dependencies import get_current_admin
from app.users.models import User, Role
from app.users.repository import UserRepository
from app.game.models import Archetype, GameProfile
from app.game.schemas import UserWithGameResponse
from app.economy.models import ShardLedger
from app.chat.models import Message
from app.map.models import GeoEvent, GeoTile
from app.posts.models import Post


router = APIRouter(prefix="/admin", tags=["Admin"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_admin_repo(session: AsyncSession = Depends(get_session)) -> UserRepository:
    return UserRepository(session)


@router.get("/users", response_model=list[UserWithGameResponse])
async def list_users(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    _: User = Depends(get_current_admin),
    repo: UserRepository = Depends(get_admin_repo),
):
    """Список пользователей с игровым профилем (только для ADMIN)."""
    users = await repo.list_with_profile(limit=limit, offset=offset)
    return users


class UpdateRoleDto(BaseModel):
    role: Role


@router.patch("/users/{user_id}/role", response_model=UserWithGameResponse)
async def update_user_role(
    user_id: UUID,
    dto: UpdateRoleDto,
    _: User = Depends(get_current_admin),
    repo: UserRepository = Depends(get_admin_repo),
):
    """Изменить роль пользователя (USER/ADMIN)."""
    user = await repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")

    updated = await repo.update(user, {"role": dto.role})
    return updated


class DemoSeedUser(BaseModel):
    id: UUID
    email: str
    nickname: str
    archetype: Archetype


class DemoSeedResponse(BaseModel):
    users: list[DemoSeedUser]
    password: str
    messages_created: int
    posts_created: int
    tiles_seeded: int


DEMO_USERS = (
    ("demo-foxy@metahunt.local", "DemoFoxy", Archetype.FOXY),
    ("demo-oxy@metahunt.local", "DemoOxy", Archetype.OXY),
    ("demo-bear@metahunt.local", "DemoBear", Archetype.BEAR),
    ("demo-owl@metahunt.local", "DemoOwl", Archetype.OWL),
)

DEMO_MESSAGES = (
    ("general", "DemoFoxy", "[DEMO] Вижу OXY в общем канале. Готовлю глитч."),
    ("general", "DemoOxy", "[DEMO] BEAR держит район, нужен прямой удар."),
    ("general", "DemoBear", "[DEMO] FOXY слишком быстро разгоняет сеть. Закрываю порт."),
    ("general", "DemoOwl", "[DEMO] Продам сигнал той стороне, где сейчас больнее."),
)

DEMO_TILES = (
    ("x1439y2075", 0.82, Archetype.FOXY),
    ("x1438y2076", 0.64, Archetype.OXY),
    ("x1439y2076", 0.73, Archetype.BEAR),
    ("x1440y2075", 0.48, Archetype.OWL),
)


async def _get_or_create_demo_user(session: AsyncSession, email: str, nickname: str, archetype: Archetype) -> User:
    user = (await session.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if not user:
        user = User(
            email=email,
            nickname=nickname,
            password_hash=pwd_context.hash("demo12345"),
            verified=True,
            role=Role.USER,
            bio=f"Demo actor for {archetype.value}",
        )
        session.add(user)
        await session.flush()
    else:
        user.nickname = nickname
        user.verified = True
        user.bio = f"Demo actor for {archetype.value}"

    profile = (
        await session.execute(select(GameProfile).where(GameProfile.user_id == user.id))
    ).scalar_one_or_none()
    if not profile:
        profile = GameProfile(user_id=user.id)
        session.add(profile)
        await session.flush()

    profile.archetype = archetype
    profile.shards = max(profile.shards, 160)
    profile.energy = 100
    profile.invite_balance = max(profile.invite_balance, 3)
    profile.last_geo_tile = DEMO_TILES[0][0]
    return user


@router.post("/demo/seed", response_model=DemoSeedResponse)
async def seed_demo(
    _: User = Depends(get_current_admin),
    session: AsyncSession = Depends(get_session),
):
    """Создать демо-актеров и стартовую сцену для показа MVP."""
    now = datetime.utcnow()
    users: dict[str, User] = {}
    for email, nickname, archetype in DEMO_USERS:
        users[nickname] = await _get_or_create_demo_user(session, email, nickname, archetype)

    messages_created = 0
    existing_demo_message = (
        await session.execute(select(Message).where(Message.text.like("[DEMO]%")).limit(1))
    ).scalar_one_or_none()
    if not existing_demo_message:
        for idx, (room, nickname, text) in enumerate(DEMO_MESSAGES):
            session.add(
                Message(
                    sender_id=users[nickname].id,
                    room=room,
                    text=text,
                    created_at=now - timedelta(minutes=len(DEMO_MESSAGES) - idx),
                )
            )
            messages_created += 1

    tiles_seeded = 0
    for tile_id, intensity, archetype in DEMO_TILES:
        tile = await session.get(GeoTile, tile_id)
        if not tile:
            tile = GeoTile(tile_id=tile_id)
            session.add(tile)
        tile.intensity = intensity
        tile.dominant_archetype = archetype.value
        tile.last_activity_at = now
        owner = users[f"Demo{archetype.value.title()}"]
        session.add(GeoEvent(user_id=owner.id, event_type="checkin", tile_id=tile_id, created_at=now))
        tiles_seeded += 1

    posts_created = 0
    existing_demo_post = (
        await session.execute(select(Post).where(Post.text.like("[DEMO]%")).limit(1))
    ).scalar_one_or_none()
    if not existing_demo_post:
        session.add(
            Post(
                author_id=users["DemoFoxy"].id,
                post_type="signal",
                text="[DEMO] Анонимный сигнал с contested tile: FOXY зовет сеть в район.",
                is_anonymous=True,
                geo_tile=DEMO_TILES[0][0],
                is_boosted=True,
                created_at=now,
            )
        )
        posts_created = 1

    for nickname, reason, delta, key in (
        ("DemoFoxy", "quest_reward", 12, "foxy_beautiful_lie"),
        ("DemoOxy", "counter_reward", 14, "direct_strike"),
        ("DemoBear", "tax_income", 20, "demo_tax"),
        ("DemoOwl", "owl_deal", 20, "owl_deal"),
    ):
        user = users[nickname]
        profile = (await session.execute(select(GameProfile).where(GameProfile.user_id == user.id))).scalar_one()
        profile.shards += delta
        session.add(
            ShardLedger(
                user_id=user.id,
                delta=delta,
                reason=reason,
                meta={"key": key, "source": "demo_seed"},
                balance_after=profile.shards,
                created_at=now,
            )
        )

    await session.commit()

    return {
        "users": [
            {"id": user.id, "email": email, "nickname": nickname, "archetype": archetype}
            for email, nickname, archetype in DEMO_USERS
            for user in [users[nickname]]
        ],
        "password": "demo12345",
        "messages_created": messages_created,
        "posts_created": posts_created,
        "tiles_seeded": tiles_seeded,
    }
