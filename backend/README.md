# Textile ERP Backend - Setup and Running Guide

## Overview

This is a production-ready backend for the Textile ERP system built with:
- **FastAPI** - Modern async Python web framework
- **PostgreSQL 18** - Reliable relational database
- **SQLAlchemy 2.0** - Async ORM for database operations
- **Alembic** - Database migration management
- **Pydantic v2** - Data validation and serialization
- **JWT** - Secure token-based authentication

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── routers/           # API endpoint definitions
│   │       │   ├── auth.py
│   │       │   ├── purchase_order.py
│   │       │   ├── sales_order.py
│   │       │   └── work_order.py
│   │       └── controllers/       # Business logic controllers
│   ├── core/
│   │   ├── config.py             # Settings and configuration
│   │   ├── security.py           # JWT and password utilities
│   │   ├── exceptions.py         # Custom exception classes
│   │   └── logging.py            # Logging configuration
│   ├── db/
│   │   ├── session.py            # Database session management
│   │   ├── base.py               # SQLAlchemy base model
│   │   └── migrations/           # Alembic migrations
│   ├── models/
│   │   ├── user.py               # User model
│   │   ├── purchase_order.py     # Purchase order model
│   │   ├── sales_order.py        # Sales order model
│   │   └── work_order.py         # Work order model
│   ├── schemas/
│   │   └── __init__.py           # Pydantic request/response schemas
│   ├── services/
│   │   ├── user_service.py       # User business logic
│   │   ├── purchase_order_service.py
│   │   ├── sales_order_service.py
│   │   └── work_order_service.py
│   ├── utils/
│   │   └── common.py             # Utility functions
│   └── main.py                   # FastAPI application entry point
├── .env.example                  # Environment variables template
├── alembic.ini                   # Alembic configuration
├── requirements.txt              # Python dependencies
└── README.md
```

## Prerequisites

- Python 3.10+
- PostgreSQL 18 (installed and running)
- pip (Python package manager)
- Git (optional)

## Installation Steps

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE textile_erp;

# Create user with password (optional)
CREATE USER textile_user WITH PASSWORD 'your_password';

# Grant privileges
ALTER ROLE textile_user SET client_encoding TO 'utf8';
ALTER ROLE textile_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE textile_user SET default_transaction_deferrable TO on;
ALTER ROLE textile_user SET default_transaction_read_committed TO on;
GRANT ALL PRIVILEGES ON DATABASE textile_erp TO textile_user;

# Exit psql
\q
```

### 2. Set Up Python Virtual Environment

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your configuration
# Required changes:
# - DATABASE_URL: Update with your PostgreSQL credentials
# - SECRET_KEY: Generate a strong secret key (min 32 characters)
```

**Example .env configuration:**

```
DATABASE_URL=postgresql+asyncpg://textile_user:your_password@localhost:5432/textile_erp
SECRET_KEY=your-super-secret-key-minimum-32-characters-long-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
APP_ENV=development
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

### 5. Create Database Tables

```bash
# Run the application (it will auto-create tables on startup)
# Or manually create tables using SQLAlchemy
python -c "from app.db import create_tables; import asyncio; asyncio.run(create_tables())"
```

## Running the Backend

### Development Server

```bash
# From backend directory with venv activated
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

### Production Server

```bash
# Using Gunicorn with Uvicorn workers (recommended for production)
pip install gunicorn

gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --access-logfile - \
    --error-logfile -
```

## API Documentation

### Swagger UI (Interactive)
- **URL**: `http://localhost:8000/docs`
- **Features**: Try out endpoints, see request/response examples

### ReDoc (Alternative Documentation)
- **URL**: `http://localhost:8000/redoc`
- **Features**: Clean, organized API documentation

## Authentication

### JWT Tokens

The API uses JWT tokens for authentication:

1. **Access Token**: Short-lived token for API requests (default: 30 minutes)
2. **Refresh Token**: Long-lived token to obtain new access tokens (default: 7 days)

### Login Flow

```
POST /api/v1/auth/login
{
    "username": "johndoe",
    "password": "password123"
}

Response:
{
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "token_type": "bearer",
    "expires_in": 1800
}
```

### Using Access Token

Include token in Authorization header:

```
Authorization: Bearer <access_token>
```

### Refresh Token

```
POST /api/v1/auth/refresh
{
    "refresh_token": "<refresh_token>"
}
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login and get tokens |
| POST | `/api/v1/auth/refresh` | Refresh access token |

### Purchase Order Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/purchase-orders` | Create purchase order |
| GET | `/api/v1/purchase-orders` | Get all purchase orders (paginated) |
| GET | `/api/v1/purchase-orders/{id}` | Get purchase order by ID |
| PUT | `/api/v1/purchase-orders/{id}` | Update purchase order |
| DELETE | `/api/v1/purchase-orders/{id}` | Delete purchase order |

### Sales Order Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/sales-orders` | Create sales order |
| GET | `/api/v1/sales-orders` | Get all sales orders (paginated) |
| GET | `/api/v1/sales-orders/{id}` | Get sales order by ID |
| PUT | `/api/v1/sales-orders/{id}` | Update sales order |
| DELETE | `/api/v1/sales-orders/{id}` | Delete sales order |

### Work Order Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/work-orders` | Create work order |
| GET | `/api/v1/work-orders` | Get all work orders (paginated) |
| GET | `/api/v1/work-orders/{id}` | Get work order by ID |
| PUT | `/api/v1/work-orders/{id}` | Update work order |
| DELETE | `/api/v1/work-orders/{id}` | Delete work order |

## Example API Calls

### 1. Register User

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "password": "SecurePassword123"
  }'
```

### 2. Login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "SecurePassword123"
  }'
```

### 3. Create Purchase Order

```bash
curl -X POST "http://localhost:8000/api/v1/purchase-orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
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
        "unit_price": 10.5
      }
    ]
  }'
```

### 4. Get All Purchase Orders

```bash
curl -X GET "http://localhost:8000/api/v1/purchase-orders?skip=0&limit=10" \
  -H "Authorization: Bearer <access_token>"
```

### 5. Update Purchase Order

```bash
curl -X PUT "http://localhost:8000/api/v1/purchase-orders/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "status": "approved",
    "tax_rate": 12
  }'
```

## Database Migrations with Alembic

### Create Initial Migration

```bash
# From backend directory
alembic revision --autogenerate -m "Initial migration"
```

### Apply Migrations

```bash
# Apply all pending migrations
alembic upgrade head

# Revert to previous migration
alembic downgrade -1

# See migration history
alembic current
alembic history
```

## Testing

### Run Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v
```

### Manual Testing with Swagger UI

1. Go to `http://localhost:8000/docs`
2. Click "Try it out" on any endpoint
3. Fill in required parameters
4. Click "Execute" to test

## Security Best Practices

1. **Change Secret Key**: Generate a strong secret key for production
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Use HTTPS**: In production, always use HTTPS
3. **Set DEBUG=False**: In production, disable debug mode
4. **Use Environment Variables**: Keep sensitive data in .env files
5. **Validate Input**: All inputs are validated using Pydantic
6. **SQL Injection Protection**: Using SQLAlchemy ORM prevents SQL injection
7. **CORS Configuration**: Whitelist trusted domains

## Environment Variables

### Required

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT signing key (min 32 characters)

### Optional (with defaults)

- `ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration (default: 30)
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration (default: 7)
- `APP_ENV`: Environment type (development/production)
- `DEBUG`: Enable debug mode (True/False)
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)
- `LOG_LEVEL`: Logging level (default: INFO)

## Troubleshooting

### Database Connection Error

```
Error: could not connect to server: Connection refused
```

**Solution**: Ensure PostgreSQL is running
```bash
# Check PostgreSQL service status (on Windows)
Get-Service postgres
# Start PostgreSQL (if needed)
Start-Service postgres
```

### Import Errors

```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution**: Install dependencies
```bash
pip install -r requirements.txt
```

### Port Already in Use

```
OSError: [Errno 48] Address already in use
```

**Solution**: Change port in .env or use different port
```bash
python -m uvicorn app.main:app --port 8001
```

### JWT Token Invalid

Ensure you're using correct token format in Authorization header:
```
Authorization: Bearer <token>
```

## Performance Optimization

- **Async Operations**: All database operations are async for high concurrency
- **Connection Pooling**: Configured with appropriate pool size
- **Database Indexing**: Indexes on frequently queried columns
- **Pagination**: All list endpoints support pagination (default: 10 items)
- **Caching**: Use Redis or FastAPI caching decorators for frequently accessed data

## Deployment

### Using Docker (Optional)

See `docker-compose.yml` in project root.

```bash
docker-compose up -d
```

### Using Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set DATABASE_URL=...
heroku config:set SECRET_KEY=...

# Deploy
git push heroku main
```

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)

## Support

For issues or questions:
1. Check the API documentation at `/docs`
2. Review error logs in `logs/app.log`
3. Check database connectivity with `psql`
4. Verify all environment variables are set correctly

---

**Last Updated**: January 2024
**Version**: 1.0.0
