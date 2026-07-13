from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")


class Subscription(Base):
    """A channel a specific user wants to see videos from."""
    __tablename__ = "subscriptions"
    __table_args__ = (UniqueConstraint("user_id", "platform", "identifier", name="uq_user_platform_identifier"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform = Column(String, nullable=False)       # "youtube" or "nebula"
    identifier = Column(String, nullable=False)      # YouTube channel_id or Nebula channel_slug
    display_name = Column(String, nullable=False)    # friendly name shown in UI

    user = relationship("User", back_populates="subscriptions")


class Video(Base):
    """A single video pulled from a feed, cached in our DB."""
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String, nullable=False)
    identifier = Column(String, nullable=False)      # source channel's identifier, used to map back to subscriptions
    title = Column(String, nullable=False)
    link = Column(String, nullable=False, unique=True)  # used to dedupe
    thumbnail = Column(String, nullable=True)
    published_at = Column(DateTime, nullable=False)
    channel_name = Column(String, nullable=False)
