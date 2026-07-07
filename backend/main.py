from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy import select

from database import Base, engine, get_db
from models import Channel, Video
from feeds import fetch_channel_videos

# Creates the tables in the database if they don't already exist.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Video RSS Integrator")

# Allow your React frontend (running on a different origin) to call this API.
# For now this allows everything — you'll want to restrict it to your actual
# Vercel URL once deployed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hardcoded starter channels — replace with your favorites, or later let users
# add these dynamically via a POST endpoint.
SEED_CHANNELS = [
    {"platform": "nebula", "identifier": "realengineering", "display_name": "Real Engineering"},
    # Add a YouTube channel_id here, e.g.:
    {"platform": "youtube", "identifier": "UCq6VFHwMzcMXbuKyG7SQYIg", "display_name": "penguinz0"},
]


@app.get("/")
def root():
    return {"status": "ok"}


@app.get("/api/feed")
def get_feed(db: Session = Depends(get_db)):
    """
    Fetches videos from every seed channel, upserts them into the DB,
    then returns everything sorted by publish date (newest first).
    """
    for ch in SEED_CHANNELS:
        videos = fetch_channel_videos(ch["platform"], ch["identifier"], ch["display_name"])
        for v in videos:
            existing = db.execute(select(Video).where(Video.link == v["link"])).scalar_one_or_none()
            if existing is None:
                db.add(Video(**v))
    db.commit()

    all_videos = db.execute(select(Video).order_by(Video.published_at.desc())).scalars().all()

    return [
        {
            "id": v.id,
            "platform": v.platform,
            "title": v.title,
            "link": v.link,
            "thumbnail": v.thumbnail,
            "published_at": v.published_at.isoformat(),
            "channel_name": v.channel_name,
        }
        for v in all_videos
    ]