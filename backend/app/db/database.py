from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator
import sys

from app.core.config import settings

# Adjust sqlite URL for async tests if needed
db_url = settings.DATABASE_URL
if db_url.startswith("sqlite") and not db_url.startswith("sqlite+aiosqlite"):
    db_url = db_url.replace("sqlite", "sqlite+aiosqlite")
elif db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

db_url = db_url.replace("sslmode=", "ssl=")

engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    pool_pre_ping=True,
)

async_session_maker = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
