import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class GeoTile(Base):
    __tablename__ = "geo_tiles"

    tile_id = Column(String(16), primary_key=True)
    intensity = Column(Float, default=0.0, nullable=False)
    dominant_archetype = Column(String(16), nullable=True)
    last_activity_at = Column(DateTime, default=datetime.utcnow)


class GeoEvent(Base):
    __tablename__ = "geo_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(16), nullable=False)
    tile_id = Column(String(16), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
