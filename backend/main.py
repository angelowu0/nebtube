from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import select

from database import Base, engine, get_db
from models import User, Subscription, Video
from feeds import fetch_channel_videos
from auth import hash_password, verify_password, create_access_token, get_current_user
from schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    SubscriptionCreate,
    SubscriptionOut,
)

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


@app.get("/")
def root():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

@app.post("/api/auth/register", response_model=TokenResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.execute(select(User).where(User.email == body.email)).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=400, detail="An account with that email already exists")

    user = User(email=body.email, hashed_password=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, email=user.email)


@app.post("/api/auth/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.email == body.email.strip().lower())).scalar_one_or_none()
    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, email=user.email)


@app.get("/api/auth/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return UserResponse(id=current_user.id, email=current_user.email)


# ---------------------------------------------------------------------------
# Subscriptions
# ---------------------------------------------------------------------------

@app.get("/api/subscriptions", response_model=list[SubscriptionOut])
def list_subscriptions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    subs = db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id).order_by(Subscription.id)
    ).scalars().all()
    return subs


@app.post("/api/subscriptions", response_model=SubscriptionOut)
def add_subscription(
    body: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.execute(
        select(Subscription).where(
            Subscription.user_id == current_user.id,
            Subscription.platform == body.platform,
            Subscription.identifier == body.identifier,
        )
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=400, detail="You're already subscribed to this channel")

    sub = Subscription(
        user_id=current_user.id,
        platform=body.platform,
        identifier=body.identifier,
        display_name=body.display_name,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@app.delete("/api/subscriptions/{subscription_id}", status_code=204)
def remove_subscription(
    subscription_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sub = db.execute(
        select(Subscription).where(
            Subscription.id == subscription_id,
            Subscription.user_id == current_user.id,
        )
    ).scalar_one_or_none()
    if sub is None:
        raise HTTPException(status_code=404, detail="Subscription not found")

    db.delete(sub)
    db.commit()


# ---------------------------------------------------------------------------
# Feed
# ---------------------------------------------------------------------------

@app.get("/api/feed")
def get_feed(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Fetches videos from every one of the current user's subscriptions, upserts
    them into the DB, then returns them sorted by publish date (newest first).
    """
    subs = db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    ).scalars().all()

    for sub in subs:
        videos = fetch_channel_videos(sub.platform, sub.identifier, sub.display_name)
        for v in videos:
            existing = db.execute(select(Video).where(Video.link == v["link"])).scalar_one_or_none()
            if existing is None:
                db.add(Video(identifier=sub.identifier, **v))
    db.commit()

    sub_keys = {(sub.platform, sub.identifier) for sub in subs}
    if not sub_keys:
        return []

    candidates = db.execute(
        select(Video)
        .where(Video.identifier.in_({identifier for _, identifier in sub_keys}))
        .order_by(Video.published_at.desc())
    ).scalars().all()
    all_videos = [v for v in candidates if (v.platform, v.identifier) in sub_keys]

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
