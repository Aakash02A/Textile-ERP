"""
Production settings for the application
"""

from app.core.config import Settings


class ProductionSettings(Settings):
    """Production environment settings"""

    APP_ENV: str = "production"
    DEBUG: bool = False
    SQLALCHEMY_ECHO: bool = False
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env.production"


class DevelopmentSettings(Settings):
    """Development environment settings"""

    APP_ENV: str = "development"
    DEBUG: bool = True
    SQLALCHEMY_ECHO: bool = False
    LOG_LEVEL: str = "DEBUG"

    class Config:
        env_file = ".env.development"


class TestingSettings(Settings):
    """Testing environment settings"""

    APP_ENV: str = "testing"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite+aiosqlite:///:memory:"
    SQLALCHEMY_ECHO: bool = False
    LOG_LEVEL: str = "DEBUG"

    class Config:
        env_file = ".env.testing"
