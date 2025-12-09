"""
Sales Order routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import NotFoundException, get_logger
from app.db import get_session
from app.schemas import (
    CreateSalesOrderRequest,
    SalesOrderResponse,
    UpdateSalesOrderRequest,
    PaginatedResponse,
)
from app.services import SalesOrderService

logger = get_logger(__name__)

router = APIRouter(prefix="/sales-orders", tags=["sales-orders"])


@router.post("", response_model=SalesOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_sales_order(
    request: CreateSalesOrderRequest,
    session: AsyncSession = Depends(get_session),
):
    """Create a new sales order"""
    try:
        service = SalesOrderService(session)
        so = await service.create_sales_order(request)
        logger.info(f"Sales order created: {so.so_number}")
        return so
    except Exception as e:
        logger.error(f"Error creating sales order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/{so_id}", response_model=SalesOrderResponse)
async def get_sales_order(
    so_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Get sales order by ID"""
    try:
        service = SalesOrderService(session)
        so = await service.get_sales_order(so_id)
        return so
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get("", response_model=PaginatedResponse)
async def get_sales_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: str = Query(None),
    session: AsyncSession = Depends(get_session),
):
    """Get all sales orders with pagination"""
    try:
        service = SalesOrderService(session)
        sos, total = await service.get_all_sales_orders(
            skip=skip,
            limit=limit,
            status=status,
        )

        return {
            "total": total,
            "page": (skip // limit) + 1,
            "limit": limit,
            "pages": (total + limit - 1) // limit,
            "data": sos,
        }
    except Exception as e:
        logger.error(f"Error fetching sales orders: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/{so_id}", response_model=SalesOrderResponse)
async def update_sales_order(
    so_id: int,
    request: UpdateSalesOrderRequest,
    session: AsyncSession = Depends(get_session),
):
    """Update a sales order"""
    try:
        service = SalesOrderService(session)
        so = await service.update_sales_order(so_id, request)
        logger.info(f"Sales order updated: {so.so_number}")
        return so
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error updating sales order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete("/{so_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sales_order(
    so_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Delete a sales order"""
    try:
        service = SalesOrderService(session)
        await service.delete_sales_order(so_id)
        logger.info(f"Sales order deleted: {so_id}")
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
