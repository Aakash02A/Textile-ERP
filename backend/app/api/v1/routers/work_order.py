"""
Work Order routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import NotFoundException, get_logger
from app.db import get_session
from app.schemas import (
    CreateWorkOrderRequest,
    WorkOrderResponse,
    UpdateWorkOrderRequest,
    PaginatedResponse,
)
from app.services import WorkOrderService

logger = get_logger(__name__)

router = APIRouter(prefix="/work-orders", tags=["work-orders"])


@router.post("", response_model=WorkOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_work_order(
    request: CreateWorkOrderRequest,
    session: AsyncSession = Depends(get_session),
):
    """Create a new work order"""
    try:
        service = WorkOrderService(session)
        wo = await service.create_work_order(request)
        logger.info(f"Work order created: {wo.wo_number}")
        return wo
    except Exception as e:
        logger.error(f"Error creating work order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/{wo_id}", response_model=WorkOrderResponse)
async def get_work_order(
    wo_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Get work order by ID"""
    try:
        service = WorkOrderService(session)
        wo = await service.get_work_order(wo_id)
        return wo
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get("", response_model=PaginatedResponse)
async def get_work_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: str = Query(None),
    session: AsyncSession = Depends(get_session),
):
    """Get all work orders with pagination"""
    try:
        service = WorkOrderService(session)
        wos, total = await service.get_all_work_orders(
            skip=skip,
            limit=limit,
            status=status,
        )

        return {
            "total": total,
            "page": (skip // limit) + 1,
            "limit": limit,
            "pages": (total + limit - 1) // limit,
            "data": wos,
        }
    except Exception as e:
        logger.error(f"Error fetching work orders: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/{wo_id}", response_model=WorkOrderResponse)
async def update_work_order(
    wo_id: int,
    request: UpdateWorkOrderRequest,
    session: AsyncSession = Depends(get_session),
):
    """Update a work order"""
    try:
        service = WorkOrderService(session)
        wo = await service.update_work_order(wo_id, request)
        logger.info(f"Work order updated: {wo.wo_number}")
        return wo
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error updating work order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete("/{wo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_work_order(
    wo_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Delete a work order"""
    try:
        service = WorkOrderService(session)
        await service.delete_work_order(wo_id)
        logger.info(f"Work order deleted: {wo_id}")
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
