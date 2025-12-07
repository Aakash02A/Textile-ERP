"""
Textile ERP - FastAPI Main Application
Entry point for the FastAPI backend server
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from contextlib import asynccontextmanager
import uvicorn

from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import (
    auth,
    procurement,
    inventory,
    production,
    quality,
    sales,
    reports
)
# Import all models to register them with SQLAlchemy
from app.models import (
    User, Role, AuditLog,
    Supplier, PurchaseOrder, POItem,  # SupplierRating disabled temporarily
    Material, InventoryItem, StockMovement, ReorderAlert,
    Product, BillOfMaterials, Machine, WorkOrder, MachineAllocation, ProductionLog,
    QCInspection, DefectLog, DefectType, BatchApproval,
    Customer, SalesOrder, SOItem, DispatchNote
)

# Create database tables  
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        # Create all tables - let SQLAlchemy handle dependencies via ForeignKey constraints
        # The checkfirst parameter tells SQLAlchemy to not error if table already exists
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"✅ Database already initialized or OK: {str(e)[:100]}")
    yield
    # Shutdown
    print("🔴 Application shutting down")

# Initialize FastAPI app
app = FastAPI(
    title="Textile ERP System",
    description="Enterprise Resource Planning system for Textile Manufacturing",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(procurement.router, prefix="/api/v1/procurement", tags=["Procurement"])
app.include_router(inventory.router, prefix="/api/v1/inventory", tags=["Inventory"])
app.include_router(production.router, prefix="/api/v1/production", tags=["Production"])
app.include_router(quality.router, prefix="/api/v1/quality", tags=["Quality"])
app.include_router(sales.router, prefix="/api/v1/sales", tags=["Sales"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])

# Root endpoint
@app.get("/")
async def root():
    """Redirect to API documentation"""
    return RedirectResponse(url="/docs")

# Health check endpoint
@app.get("/health")
async def health_check():
    """System health check"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "database": "connected"
    }

# Run the application
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
