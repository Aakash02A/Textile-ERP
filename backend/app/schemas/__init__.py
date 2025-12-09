"""
Pydantic schemas for request/response validation
"""

from datetime import datetime, date
from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field


# ==================== AUTH SCHEMAS ====================

class TokenResponse(BaseModel):
    """Token response schema"""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 1800,
            }
        }


class RegisterRequest(BaseModel):
    """User registration request"""

    email: EmailStr
    username: str = Field(..., min_length=3, max_length=255)
    full_name: Optional[str] = Field(None, max_length=255)
    password: str = Field(..., min_length=8, max_length=255)

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "username": "johndoe",
                "full_name": "John Doe",
                "password": "secure_password_123",
            }
        }


class LoginRequest(BaseModel):
    """User login request"""

    username: str
    password: str

    class Config:
        json_schema_extra = {
            "example": {"username": "johndoe", "password": "secure_password_123"}
        }


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""

    refresh_token: str


# ==================== USER SCHEMAS ====================

class UserResponse(BaseModel):
    """User response schema"""

    id: int
    email: str
    username: str
    full_name: Optional[str]
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "email": "user@example.com",
                "username": "johndoe",
                "full_name": "John Doe",
                "role": "staff",
                "is_active": True,
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:30:00Z",
            }
        }


# ==================== PURCHASE ORDER SCHEMAS ====================

class POLineItemRequest(BaseModel):
    """PO line item request"""

    material_code: str
    material_name: str
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)


class POLineItemResponse(POLineItemRequest):
    """PO line item response"""

    id: int
    amount: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CreatePurchaseOrderRequest(BaseModel):
    """Create purchase order request"""

    supplier_id: int = Field(..., gt=0)
    supplier_name: str
    po_date: date
    due_date: date
    tax_rate: float = Field(0, ge=0, le=100)
    notes: Optional[str] = None
    line_items: List[POLineItemRequest]

    class Config:
        json_schema_extra = {
            "example": {
                "supplier_id": 1,
                "supplier_name": "ABC Textile Co.",
                "po_date": "2024-01-15",
                "due_date": "2024-02-15",
                "tax_rate": 10,
                "notes": "Urgent order",
                "line_items": [
                    {
                        "material_code": "MAT-001",
                        "material_name": "Cotton Fabric",
                        "quantity": 100,
                        "unit_price": 10.5,
                    }
                ],
            }
        }


class PurchaseOrderResponse(BaseModel):
    """Purchase order response"""

    id: int
    po_number: str
    supplier_id: int
    supplier_name: str
    po_date: date
    due_date: date
    status: str
    subtotal: float
    tax_amount: float
    tax_rate: float
    total_amount: float
    notes: Optional[str]
    created_by: Optional[int]
    line_items: List[POLineItemResponse]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UpdatePurchaseOrderRequest(BaseModel):
    """Update purchase order request"""

    supplier_name: Optional[str] = None
    due_date: Optional[date] = None
    tax_rate: Optional[float] = Field(None, ge=0, le=100)
    notes: Optional[str] = None
    status: Optional[str] = None


# ==================== SALES ORDER SCHEMAS ====================

class SOLineItemRequest(BaseModel):
    """SO line item request"""

    product_code: str
    product_name: str
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)


class SOLineItemResponse(SOLineItemRequest):
    """SO line item response"""

    id: int
    amount: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CreateSalesOrderRequest(BaseModel):
    """Create sales order request"""

    customer_id: int = Field(..., gt=0)
    customer_name: str
    order_date: date
    due_date: date
    tax_rate: float = Field(0, ge=0, le=100)
    notes: Optional[str] = None
    line_items: List[SOLineItemRequest]


class SalesOrderResponse(BaseModel):
    """Sales order response"""

    id: int
    so_number: str
    customer_id: int
    customer_name: str
    order_date: date
    due_date: date
    status: str
    subtotal: float
    tax_amount: float
    tax_rate: float
    total_amount: float
    notes: Optional[str]
    created_by: Optional[int]
    line_items: List[SOLineItemResponse]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UpdateSalesOrderRequest(BaseModel):
    """Update sales order request"""

    customer_name: Optional[str] = None
    due_date: Optional[date] = None
    tax_rate: Optional[float] = Field(None, ge=0, le=100)
    notes: Optional[str] = None
    status: Optional[str] = None


# ==================== WORK ORDER SCHEMAS ====================

class CreateWorkOrderRequest(BaseModel):
    """Create work order request"""

    product_name: str
    quantity: int = Field(..., gt=0)
    due_date: date
    priority: str = "normal"
    notes: Optional[str] = None


class WorkOrderResponse(BaseModel):
    """Work order response"""

    id: int
    wo_number: str
    product_name: str
    quantity: int
    due_date: date
    priority: str
    status: str
    progress_percentage: float
    estimated_completion_date: Optional[date]
    notes: Optional[str]
    created_by: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UpdateWorkOrderRequest(BaseModel):
    """Update work order request"""

    status: Optional[str] = None
    progress_percentage: Optional[float] = Field(None, ge=0, le=100)
    estimated_completion_date: Optional[date] = None
    notes: Optional[str] = None


# ==================== PAGINATION SCHEMAS ====================

class PaginationParams(BaseModel):
    """Pagination parameters"""

    page: int = Field(1, ge=1)
    limit: int = Field(10, ge=1, le=100)
    skip: int = Field(0, ge=0)

    class Config:
        json_schema_extra = {
            "example": {"page": 1, "limit": 10, "skip": 0}
        }


class PaginatedResponse(BaseModel):
    """Generic paginated response"""

    total: int
    page: int
    limit: int
    pages: int
    data: List

    class Config:
        json_schema_extra = {
            "example": {
                "total": 100,
                "page": 1,
                "limit": 10,
                "pages": 10,
                "data": [],
            }
        }


# ==================== ERROR RESPONSE ====================

class ErrorResponse(BaseModel):
    """Error response schema"""

    error: str
    message: str
    status_code: int
    error_code: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "error": "Validation Error",
                "message": "Invalid input parameters",
                "status_code": 422,
                "error_code": "VALIDATION_ERROR",
            }
        }
