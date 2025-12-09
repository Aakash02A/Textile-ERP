"""
Purchase Order routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import NotFoundException, get_logger
from app.db import get_session
from app.schemas import (
    CreatePurchaseOrderRequest,
    PurchaseOrderResponse,
    UpdatePurchaseOrderRequest,
    PaginatedResponse,
)
from app.services import PurchaseOrderService
from app.utils import PaginationUtil

logger = get_logger(__name__)

router = APIRouter(prefix="/purchase-orders", tags=["purchase-orders"])


@router.post("", response_model=PurchaseOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_purchase_order(
    request: CreatePurchaseOrderRequest,
    session: AsyncSession = Depends(get_session),
):
    """Create a new purchase order"""
    try:
        service = PurchaseOrderService(session)
        po = await service.create_purchase_order(request)
        logger.info(f"Purchase order created: {po.po_number}")
        return po
    except Exception as e:
        logger.error(f"Error creating purchase order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/{po_id}", response_model=PurchaseOrderResponse)
async def get_purchase_order(
    po_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Get purchase order by ID"""
    try:
        service = PurchaseOrderService(session)
        po = await service.get_purchase_order(po_id)
        return po
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get("", response_model=PaginatedResponse)
async def get_purchase_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: str = Query(None),
    session: AsyncSession = Depends(get_session),
):
    """Get all purchase orders with pagination"""
    try:
        service = PurchaseOrderService(session)
        pos, total = await service.get_all_purchase_orders(
            skip=skip,
            limit=limit,
            status=status,
        )

        return {
            "total": total,
            "page": (skip // limit) + 1,
            "limit": limit,
            "pages": (total + limit - 1) // limit,
            "data": pos,
        }
    except Exception as e:
        logger.error(f"Error fetching purchase orders: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/{po_id}", response_model=PurchaseOrderResponse)
async def update_purchase_order(
    po_id: int,
    request: UpdatePurchaseOrderRequest,
    session: AsyncSession = Depends(get_session),
):
    """Update a purchase order"""
    try:
        service = PurchaseOrderService(session)
        po = await service.update_purchase_order(po_id, request)
        logger.info(f"Purchase order updated: {po.po_number}")
        return po
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error updating purchase order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete("/{po_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_purchase_order(
    po_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Delete a purchase order"""
    try:
        service = PurchaseOrderService(session)
        await service.delete_purchase_order(po_id)
        logger.info(f"Purchase order deleted: {po_id}")
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
