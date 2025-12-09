"""
SQLAlchemy Base model for all database models
"""

from sqlalchemy import Column, DateTime, func
from sqlalchemy.orm import declarative_base, declared_attr

Base = declarative_base()


class BaseModel:
    """Base model class with common columns"""

    @declared_attr
    def id(cls):
        return Column(
            "id",
            type_=lambda: __import__("sqlalchemy").Integer,
            primary_key=True,
            index=True,
        )

    @declared_attr
    def created_at(cls):
        return Column(
            "created_at",
            DateTime,
            server_default=func.now(),
            nullable=False,
        )

    @declared_attr
    def updated_at(cls):
        return Column(
            "updated_at",
            DateTime,
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False,
        )
