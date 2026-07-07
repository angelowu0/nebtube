from sqlalchemy import Column, Integer, String, DateTime
from database import Base


class Channel(Base):
    """A channel/creator we want to pull videos from."""
    __tablename__ = "channels"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String, nullable=False)       # "youtube" or "nebula"
    identifier = Column(String, nullable=False)      # YouTube channel_id or Nebula channel_slug
    display_name = Column(String, nullable=False)    # friendly name shown in UI


class Video(Base):
    """A single video pulled from a feed, cached in our DB."""
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String, nullable=False)
    title = Column(String, nullable=False)
    link = Column(String, nullable=False, unique=True)  # used to dedupe
    thumbnail = Column(String, nullable=True)
    published_at = Column(DateTime, nullable=False)
    channel_name = Column(String, nullable=False)