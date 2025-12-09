"""
User service with business logic
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import (
    AuthenticationException,
    ConflictException,
    hash_password,
    verify_password,
)
from app.models.user import User, UserRole


class UserService:
    """Service class for user operations"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_user(
        self,
        email: str,
        username: str,
        password: str,
        full_name: str = None,
        role: UserRole = UserRole.STAFF,
    ) -> User:
        """Create a new user"""
        # Check if user already exists
        existing_user = await self.session.execute(
            select(User).where((User.email == email) | (User.username == username))
        )
        if existing_user.scalar_one_or_none():
            raise ConflictException("User with this email or username already exists")

        # Create new user
        hashed_password = hash_password(password)
        user = User(
            email=email,
            username=username,
            full_name=full_name,
            hashed_password=hashed_password,
            role=role,
            is_active=True,
        )

        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)

        return user

    async def get_user_by_email(self, email: str) -> User:
        """Get user by email"""
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_user_by_username(self, username: str) -> User:
        """Get user by username"""
        result = await self.session.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()

    async def get_user_by_id(self, user_id: int) -> User:
        """Get user by ID"""
        return await self.session.get(User, user_id)

    async def authenticate_user(self, username: str, password: str) -> User:
        """Authenticate user with username and password"""
        user = await self.get_user_by_username(username)

        if not user or not verify_password(password, user.hashed_password):
            raise AuthenticationException("Invalid credentials")

        if not user.is_active:
            raise AuthenticationException("User account is inactive")

        return user

    async def update_user(self, user_id: int, **kwargs) -> User:
        """Update user information"""
        user = await self.get_user_by_id(user_id)

        if not user:
            raise ValueError("User not found")

        for key, value in kwargs.items():
            if hasattr(user, key) and value is not None:
                if key == "password":
                    value = hash_password(value)
                    key = "hashed_password"
                setattr(user, key, value)

        await self.session.commit()
        await self.session.refresh(user)

        return user
