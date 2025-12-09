"""
Quick Start Guide for Backend API
"""

# QUICK START GUIDE

## Running the Backend

### 1. Install Dependencies
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

### 2. Configure Database
Create `.env` file in backend directory:
```
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/textile_erp
SECRET_KEY=your-secret-key-min-32-chars
```

### 3. Start Server
```bash
python -m uvicorn app.main:app --reload
```

Access API: http://localhost:8000

## API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Essential Endpoints

### Authentication
```bash
# Register
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "username": "john",
  "password": "password123"
}

# Login
POST /api/v1/auth/login
{
  "username": "john",
  "password": "password123"
}
```

### Purchase Orders
```bash
# Create
POST /api/v1/purchase-orders

# Get all
GET /api/v1/purchase-orders?skip=0&limit=10

# Get by ID
GET /api/v1/purchase-orders/1

# Update
PUT /api/v1/purchase-orders/1

# Delete
DELETE /api/v1/purchase-orders/1
```

### Sales Orders
```bash
POST /api/v1/sales-orders
GET /api/v1/sales-orders
GET /api/v1/sales-orders/1
PUT /api/v1/sales-orders/1
DELETE /api/v1/sales-orders/1
```

### Work Orders
```bash
POST /api/v1/work-orders
GET /api/v1/work-orders
GET /api/v1/work-orders/1
PUT /api/v1/work-orders/1
DELETE /api/v1/work-orders/1
```

## Using Docker

```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
```

## Key Features Implemented

✅ JWT Authentication with access & refresh tokens
✅ Role-Based Access Control (RBAC)
✅ Async database operations with SQLAlchemy 2.0
✅ Comprehensive input validation with Pydantic
✅ Error handling with custom exceptions
✅ Structured logging
✅ Pagination support
✅ Database migrations with Alembic
✅ Production-ready configuration
✅ Docker support

## Testing Endpoints with cURL

```bash
# Register user
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","username":"testuser","password":"password123"}'

# Login
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Create purchase order (use token from login response)
curl -X POST "http://localhost:8000/api/v1/purchase-orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "supplier_id":1,
    "supplier_name":"ABC Corp",
    "po_date":"2024-01-15",
    "due_date":"2024-02-15",
    "tax_rate":10,
    "line_items":[{"material_code":"MAT-001","material_name":"Fabric","quantity":100,"unit_price":10.5}]
  }'
```

## File Structure

```
backend/
├── app/
│   ├── api/v1/routers/           # API endpoints
│   ├── core/                      # Config, security, exceptions
│   ├── db/                        # Database session, base model
│   ├── models/                    # SQLAlchemy models
│   ├── schemas/                   # Pydantic schemas
│   ├── services/                  # Business logic
│   ├── utils/                     # Utility functions
│   └── main.py                    # FastAPI app
├── requirements.txt               # Dependencies
├── .env.example                   # Environment template
├── README.md                      # Full documentation
└── docker-compose.yml             # Docker configuration
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | - | PostgreSQL connection string |
| SECRET_KEY | - | JWT signing key (required) |
| ALGORITHM | HS256 | JWT algorithm |
| ACCESS_TOKEN_EXPIRE_MINUTES | 30 | Token expiration time |
| REFRESH_TOKEN_EXPIRE_DAYS | 7 | Refresh token expiration |
| APP_ENV | development | Environment type |
| DEBUG | True | Debug mode |
| HOST | 0.0.0.0 | Server host |
| PORT | 8000 | Server port |

## Common Issues

**Issue**: Database connection refused
**Solution**: Ensure PostgreSQL is running:
```bash
# Check service (Windows)
Get-Service postgres

# Start service (Windows)
Start-Service postgres
```

**Issue**: Port 8000 already in use
**Solution**: Use different port
```bash
python -m uvicorn app.main:app --port 8001
```

**Issue**: ModuleNotFoundError
**Solution**: Install dependencies
```bash
pip install -r requirements.txt
```

## Next Steps

1. Complete integration tests
2. Add more business logic endpoints
3. Implement WebSocket for real-time updates
4. Add caching layer (Redis)
5. Setup CI/CD pipeline
6. Deploy to production

---

For detailed documentation, see `README.md`
