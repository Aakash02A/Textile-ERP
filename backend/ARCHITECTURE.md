# Textile ERP Backend Architecture Guide

## System Architecture Overview

This backend implements a **clean architecture pattern** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (FastAPI)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  HTTP Endpoints (Routers) - /api/v1/*               │   │
│  │  • Authentication (auth.py)                          │   │
│  │  • Purchase Orders (purchase_order.py)              │   │
│  │  • Sales Orders (sales_order.py)                    │   │
│  │  • Work Orders (work_order.py)                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Service/Business Logic Layer                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Services containing business logic:                 │   │
│  │  • UserService (authentication, user management)    │   │
│  │  • PurchaseOrderService (PO operations)             │   │
│  │  • SalesOrderService (SO operations)                │   │
│  │  • WorkOrderService (WO operations)                 │   │
│  │                                                      │   │
│  │  Responsibilities:                                   │   │
│  │  • Data validation & business rules                 │   │
│  │  • Calculation & aggregation logic                  │   │
│  │  • Number generation (PO-XXXXXX, SO-XXXXXX)        │   │
│  │  • Error handling & exceptions                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Data Access Layer (ORM)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SQLAlchemy 2.0 Async ORM:                          │   │
│  │  • User model & RefreshToken                        │   │
│  │  • PurchaseOrder & POLineItem                       │   │
│  │  • SalesOrder & SOLineItem                          │   │
│  │  • WorkOrder                                        │   │
│  │                                                      │   │
│  │  Features:                                           │   │
│  │  • Async session management (asyncpg)              │   │
│  │  • Connection pooling                               │   │
│  │  • Automatic timestamps (created_at, updated_at)   │   │
│  │  • Relationships & cascading deletes                │   │
│  │  • Database indexes for performance                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Relational Data Store:                             │   │
│  │  • users table with roles (admin, manager, staff)   │   │
│  │  • purchase_orders & po_line_items                  │   │
│  │  • sales_orders & so_line_items                     │   │
│  │  • work_orders                                      │   │
│  │  • refresh_tokens (token blacklisting)              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. API Layer (Routers)

**Location**: `app/api/v1/routers/`

**Purpose**: 
- HTTP request/response handling
- Route definitions
- Request validation using Pydantic schemas
- Response serialization

**Key Components**:
```python
# Example: auth.py
@router.post("/register")
async def register(request: RegisterRequest):
    # Validate input
    # Call service
    # Return response
    pass
```

### 2. Service Layer (Business Logic)

**Location**: `app/services/`

**Purpose**:
- Implement business rules
- Data validation and transformation
- Orchestrate database operations
- Handle application logic

**Example**: `PurchaseOrderService`
```python
class PurchaseOrderService:
    async def create_purchase_order(self, request):
        # Validate dates: po_date <= due_date
        # Validate tax rate: 0-100%
        # Calculate: subtotal, tax, total
        # Generate PO number: PO-000001, PO-000002, etc.
        # Create record with line items
        return po
```

### 3. Model Layer (Database Models)

**Location**: `app/models/`

**Purpose**:
- Define data structures
- Database relationships
- Indexing strategy
- Constraints & validation

**Features**:
- Inherits from `BaseModel` (auto timestamps)
- Enum types for statuses (DRAFT, APPROVED, etc.)
- Foreign keys with cascading deletes
- Relationships for efficient querying
- Database indexes for performance

**Example**: User model
```python
class User(Base, BaseModel):
    email: str          # Unique index
    username: str       # Unique index
    role: UserRole      # Enum: admin, manager, staff
    is_active: bool
    
    # Relationships
    tokens = relationship("RefreshToken", cascade="all, delete-orphan")
    purchase_orders = relationship("PurchaseOrder")
```

### 4. Schema Layer (Validation & Serialization)

**Location**: `app/schemas/__init__.py`

**Purpose**:
- Request validation (Pydantic v2)
- Response serialization
- API documentation examples
- Type safety

**Key Schemas**:
- `RegisterRequest` - User registration
- `LoginRequest` - Login credentials
- `CreatePurchaseOrderRequest` - Create PO
- `PurchaseOrderResponse` - API response
- `PaginatedResponse` - Paginated list response

### 5. Core Layer (Configuration & Security)

**Location**: `app/core/`

**Components**:

#### `config.py` - Settings Management
```python
class Settings:
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
```

#### `security.py` - Authentication & Encryption
```python
def hash_password(password: str) -> str
def verify_password(plain: str, hashed: str) -> bool
def create_access_token(subject: str) -> str
def create_refresh_token(subject: str) -> str
def verify_token(token: str) -> dict
```

#### `exceptions.py` - Custom Exceptions
```python
class AppException
class AuthenticationException
class ValidationException
class NotFoundException
class ConflictException
```

#### `logging.py` - Structured Logging
```python
# Rotating file logs + console output
# Automatic log level configuration
```

### 6. Database Layer (Session Management)

**Location**: `app/db/`

**Components**:

#### `session.py` - Connection Management
```python
# Async SQLAlchemy engine with:
# - Connection pooling (pool_size=20)
# - Connection pre-ping (verify connections alive)
# - Async session factory
# - Dependency injection
```

#### `base.py` - Base Model
```python
class BaseModel:
    id: int (primary key)
    created_at: datetime (auto-generated)
    updated_at: datetime (auto-updated)
```

### 7. Utility Layer

**Location**: `app/utils/`

**Functions**:
- `PaginationUtil` - Handle pagination calculations
- `ResponseUtil` - Format success/error responses
- `ValidationUtil` - Common validation rules

## Data Flow Example: Create Purchase Order

```
1. HTTP Request
   POST /api/v1/purchase-orders
   {
     "supplier_id": 1,
     "supplier_name": "ABC Corp",
     "po_date": "2024-01-15",
     "due_date": "2024-02-15",
     "tax_rate": 10,
     "line_items": [...]
   }

2. Router (purchase_order.py)
   ├── Validate input with Pydantic
   ├── Create PurchaseOrderService
   └── Call service.create_purchase_order()

3. Service (PurchaseOrderService)
   ├── Validate date range (po_date < due_date)
   ├── Validate tax rate (0-100)
   ├── Calculate amounts:
   │  ├── subtotal = sum(quantity * unit_price)
   │  ├── tax_amount = subtotal * (tax_rate / 100)
   │  └── total_amount = subtotal + tax_amount
   ├── Generate PO number (PO-000001)
   ├── Create ORM object with relationships
   └── Persist to database

4. Database (PostgreSQL)
   ├── Insert purchase_orders record
   ├── Insert po_line_items records
   └── Update timestamps & constraints

5. Response
   {
     "id": 1,
     "po_number": "PO-000001",
     "status": "draft",
     "total_amount": 1100.5,
     "line_items": [...],
     "created_at": "2024-01-15T10:30:00Z"
   }
```

## Authentication Flow

```
1. User Registration
   POST /auth/register
   {email, username, password}
   
   UserService:
   ├── Check if user exists (prevent duplicates)
   ├── Hash password with bcrypt
   ├── Create user record
   └── Return UserResponse

2. User Login
   POST /auth/login
   {username, password}
   
   UserService:
   ├── Find user by username
   ├── Verify password (bcrypt)
   ├── Check if active
   
   Security:
   ├── Create access token (JWT, 30 min)
   ├── Create refresh token (JWT, 7 days)
   └── Return TokenResponse

3. Protected Endpoint Request
   GET /api/v1/purchase-orders
   Authorization: Bearer <access_token>
   
   FastAPI:
   ├── Extract token from header
   ├── Verify JWT signature
   ├── Validate expiration
   └── Authorize request

4. Token Refresh
   POST /auth/refresh
   {refresh_token}
   
   Security:
   ├── Verify refresh token validity
   ├── Create new access token
   └── Return TokenResponse
```

## Design Patterns Used

### 1. **Repository Pattern** (Implicit)
Service classes act as repositories, encapsulating database queries.

### 2. **Service Layer Pattern**
Business logic separated from HTTP layer.

### 3. **Dependency Injection**
FastAPI's `Depends()` for session injection.

```python
@router.post("/orders")
async def create(
    request: CreateOrderRequest,
    session: AsyncSession = Depends(get_session)  # Injected
):
    service = OrderService(session)
    return await service.create(request)
```

### 4. **DTO (Data Transfer Object)**
Pydantic schemas separate API contracts from internal models.

### 5. **Factory Pattern**
`create_app()` function creates configured FastAPI instance.

### 6. **Strategy Pattern**
Different validators in `FormValidator` class.

## Performance Optimizations

### 1. **Async/Await**
```python
async def get_all_purchase_orders():
    # Non-blocking database operations
    # Can handle 1000s of concurrent requests
```

### 2. **Connection Pooling**
```python
engine = create_async_engine(
    url,
    pool_size=20,      # 20 connections available
    max_overflow=0,    # No overflow connections
)
```

### 3. **Database Indexing**
```python
class PurchaseOrder(Base):
    __table_args__ = (
        Index("idx_po_number", "po_number"),
        Index("idx_po_status", "status"),
        Index("idx_po_supplier_id", "supplier_id"),
    )
```

### 4. **Eager Loading**
```python
# Load relationships with single query
result = await session.execute(
    select(PurchaseOrder)
    .options(selectinload(PurchaseOrder.line_items))
)
```

### 5. **Pagination**
```python
# Default 10 items per page, max 100
GET /api/v1/purchase-orders?skip=0&limit=10
```

## Security Features

### 1. **Password Hashing**
```python
import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
```

### 2. **JWT Tokens**
```python
# Signed with SECRET_KEY
# Includes expiration time
# Can include custom claims (role, user_id)
```

### 3. **SQL Injection Prevention**
SQLAlchemy ORM prevents SQL injection:
```python
# Safe: Using ORM
select(User).where(User.email == email)

# Unsafe: Raw SQL (never do this)
f"SELECT * FROM users WHERE email = '{email}'"
```

### 4. **Input Validation**
Pydantic validates all requests:
```python
class RegisterRequest(BaseModel):
    email: EmailStr              # Email format validation
    username: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=8)  # Min 8 chars
```

### 5. **CORS Configuration**
```python
CORSMiddleware with whitelist of allowed origins
```

## Error Handling

### Custom Exceptions Hierarchy
```
AppException
├── AuthenticationException (401)
├── AuthorizationException (403)
├── ValidationException (422)
├── NotFoundException (404)
├── ConflictException (409)
└── BadRequestException (400)
```

### Error Response Format
```json
{
  "error": "Validation Error",
  "message": "Invalid input",
  "status_code": 422,
  "error_code": "VALIDATION_ERROR"
}
```

## Database Schema

### Tables

#### `users`
- id (pk)
- email (unique)
- username (unique)
- full_name
- hashed_password
- is_active
- role (enum: admin, manager, staff, viewer)
- created_at, updated_at

#### `refresh_tokens`
- id (pk)
- user_id (fk → users)
- token (unique)
- is_revoked
- created_at, updated_at

#### `purchase_orders`
- id (pk)
- po_number (unique)
- supplier_id
- supplier_name
- po_date
- due_date
- status (enum: draft, pending, approved, received)
- subtotal, tax_amount, tax_rate, total_amount
- created_by (fk → users)
- notes
- created_at, updated_at

#### `po_line_items`
- id (pk)
- purchase_order_id (fk → purchase_orders, cascade delete)
- material_code
- material_name
- quantity
- unit_price
- amount
- created_at, updated_at

#### `sales_orders`
- Similar structure to purchase_orders
- Status: draft, pending, confirmed, shipped, delivered

#### `so_line_items`
- Similar structure to po_line_items
- product_code, product_name instead of material

#### `work_orders`
- id (pk)
- wo_number (unique)
- product_name
- quantity
- due_date
- priority
- status (draft, pending, in_progress, completed)
- progress_percentage
- estimated_completion_date
- created_by (fk → users)
- created_at, updated_at

## Testing Strategy

### Unit Tests
```python
# Test individual services
class TestUserService:
    async def test_create_user_success()
    async def test_create_user_duplicate_email()
    async def test_authenticate_user_invalid_password()
```

### Integration Tests
```python
# Test full flow with database
class TestPurchaseOrderAPI:
    async def test_create_po_end_to_end()
    async def test_unauthorized_access()
    async def test_pagination()
```

### API Tests
```python
# Test HTTP endpoints with client
async def test_register_endpoint(client):
    response = client.post("/auth/register", json={...})
    assert response.status_code == 201
```

## Deployment Strategy

### Local Development
```bash
python -m uvicorn app.main:app --reload
```

### Docker
```bash
docker-compose up -d
```

### Production
```bash
gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000
```

### Environment-Specific Settings
```python
# Development: DEBUG=True, Echo SQL queries
# Testing: In-memory SQLite database
# Production: DEBUG=False, Connection pooling, HTTPS
```

## Future Enhancements

1. **WebSocket Support** - Real-time updates
2. **Caching Layer** - Redis for frequently accessed data
3. **Message Queue** - Celery for async tasks
4. **Search** - Elasticsearch for full-text search
5. **Audit Logging** - Track all data changes
6. **Multi-tenancy** - Multiple organizations
7. **API Rate Limiting** - Prevent abuse
8. **GraphQL** - Alternative query language

---

**Architecture Type**: Layered Architecture with Clean Code Principles
**Pattern**: Service-Oriented with Repository Pattern
**Concurrency**: Async/await for high performance
**Database**: PostgreSQL with async SQLAlchemy ORM
