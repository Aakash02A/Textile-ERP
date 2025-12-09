"""
User database model
"""

from enum import Enum

from sqlalchemy import Column, String, Enum as SQLEnum, Boolean, Index
from sqlalchemy.orm import relationship

from app.db.base import Base, BaseModel


class UserRole(str, Enum):
    """User roles for RBAC"""

    ADMIN = "admin"
    MANAGER = "manager"
    STAFF = "staff"
    VIEWER = "viewer"


class User(Base, BaseModel):
    """User model"""

    __tablename__ = "users"

    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    role = Column(
        SQLEnum(UserRole),
        default=UserRole.STAFF,
        nullable=False,
    )

    # Relationships
    tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    purchase_orders = relationship("PurchaseOrder", back_populates="created_by_user")
    sales_orders = relationship("SalesOrder", back_populates="created_by_user")
    work_orders = relationship("WorkOrder", back_populates="created_by_user")

    # Indexes
    __table_args__ = (
        Index("idx_user_email", "email"),
        Index("idx_user_username", "username"),
        Index("idx_user_role", "role"),
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, username={self.username}, role={self.role})>"


class RefreshToken(Base, BaseModel):
    """Refresh token model for token management"""

    __tablename__ = "refresh_tokens"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token = Column(String(512), unique=True, nullable=False, index=True)
    is_revoked = Column(Boolean, default=False, nullable=False)

    # Relationships
    user = relationship("User", back_populates="tokens")

    __table_args__ = (
        Index("idx_refresh_token_user_id", "user_id"),
        Index("idx_refresh_token_is_revoked", "is_revoked"),
    )

    def __repr__(self) -> str:
        return f"<RefreshToken(id={self.id}, user_id={self.user_id})>"


# Import at the end to avoid circular imports
from sqlalchemy import Integer, ForeignKey
