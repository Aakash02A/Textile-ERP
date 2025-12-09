"""API v1 routers initialization"""

from fastapi import APIRouter

from app.api.v1.routers.auth import router as auth_router
from app.api.v1.routers.purchase_order import router as po_router
from app.api.v1.routers.sales_order import router as so_router
from app.api.v1.routers.work_order import router as wo_router

# Create main router
router = APIRouter(prefix="/api/v1")

# Include all routers
router.include_router(auth_router)
router.include_router(po_router)
router.include_router(so_router)
router.include_router(wo_router)

__all__ = ["router"]
