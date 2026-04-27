import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class ShardLedger(Base):
    __tablename__ = "shards_ledger"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    delta = Column(Integer, nullable=False)
    reason = Column(String(32), nullable=False)
    meta = Column(JSON, nullable=True)
    balance_after = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
