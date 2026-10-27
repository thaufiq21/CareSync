"""Database session management - standard sync engine for rock-solid SQLite stability"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# Format database URL for sync sqlite
db_url = settings.DATABASE_URL
if "aiosqlite" in db_url:
    db_url = db_url.replace("sqlite+aiosqlite:///", "sqlite:///")
elif not db_url.startswith("sqlite:///"):
    db_url = "sqlite:///./caresync.db"

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    db_url,
    echo=False,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
