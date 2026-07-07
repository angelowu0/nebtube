import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Locally, set DATABASE_URL in a .env file.
# On Railway, this env var is provided automatically once you attach a Postgres service.
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./local.db")

# Railway/Render sometimes give a URL starting with "postgres://" but SQLAlchemy
# needs "postgresql://" — this line fixes that automatically.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()