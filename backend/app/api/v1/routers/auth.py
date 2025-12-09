"""
Authentication routes
"""

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import (
    AuthenticationException,
    create_access_token,
    create_refresh_token,
    get_logger,
    verify_token,
)
from app.db import get_session
from app.schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
    RefreshTokenRequest,
)
from app.services import UserService

logger = get_logger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    session: AsyncSession = Depends(get_session),
):
    """User registration endpoint"""
    try:
        user_service = UserService(session)
        user = await user_service.create_user(
            email=request.email,
            username=request.username,
            password=request.password,
            full_name=request.full_name,
        )
        logger.info(f"User registered: {user.username}")
        return user
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    session: AsyncSession = Depends(get_session),
):
    """User login endpoint"""
    try:
        user_service = UserService(session)
        user = await user_service.authenticate_user(
            username=request.username,
            password=request.password,
        )

        # Create tokens
        access_token = create_access_token(
            subject=str(user.id),
            additional_claims={"role": user.role},
        )
        refresh_token = create_refresh_token(subject=str(user.id))

        logger.info(f"User logged in: {user.username}")

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=30 * 60,  # 30 minutes in seconds
        )
    except AuthenticationException as e:
        logger.warning(f"Login failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    """Refresh access token using refresh token"""
    try:
        # Verify refresh token
        payload = verify_token(request.refresh_token)

        if payload.get("type") != "refresh":
            raise ValueError("Invalid token type")

        # Create new access token
        user_id = payload.get("sub")
        access_token = create_access_token(subject=user_id)

        logger.info(f"Token refreshed for user: {user_id}")

        return TokenResponse(
            access_token=access_token,
            refresh_token=request.refresh_token,
            token_type="bearer",
            expires_in=30 * 60,
        )
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
