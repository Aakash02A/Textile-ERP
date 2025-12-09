"""
Database session and configuration management
"""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings


def get_engine():
    """Create and return async SQLAlchemy engine"""
    settings = get_settings()

    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.SQLALCHEMY_ECHO,
        future=True,
        pool_pre_ping=True,
        pool_size=20,
        max_overflow=0,
    )

    return engine


# Create async session factory
engine = get_engine()

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
