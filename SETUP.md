# 🏭 Textile ERP - Complete Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start with Docker](#quick-start-docker)
3. [Manual Installation](#manual-installation)
4. [Database Setup](#database-setup)
5. [Initial Data](#initial-data)
6. [Running the Application](#running-the-application)
7. [API Documentation](#api-documentation)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Python**: 3.10 or higher
- **PostgreSQL**: 14 or higher
- **Node.js**: 16+ (optional, for frontend build tools)
- **Docker & Docker Compose**: Latest version (recommended)

### Optional but Recommended
- **Redis**: 7+ (for Phase 2 Celery tasks)
- **Git**: For version control

---

## Quick Start with Docker

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Textile-ERP
```

### 2. Configure Environment
```bash
# Copy example env file
cp backend/.env.example backend/.env

# Edit .env with your settings
# At minimum, change the SECRET_KEY
```

### 3. Start All Services
```bash
# Build and start all containers
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 4. Initialize Database
```bash
# Create tables
docker-compose exec backend python -c "from app.core.database import engine, Base; from app.models import *; Base.metadata.create_all(bind=engine)"

# Run seed script (creates initial data)
docker-compose exec backend python scripts/seed_data.py
```

### 5. Access the Application
- **Frontend**: http://localhost
- **API Docs**: http://localhost:8000/docs
- **API Base**: http://localhost:8000/api

### Default Login Credentials
```
Username: admin
Password: admin123
```

---

## Manual Installation

### 1. Database Setup

#### Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql@14

# Windows
# Download from https://www.postgresql.org/download/windows/
```

#### Create Database
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# In psql terminal:
CREATE DATABASE textile_erp;
CREATE USER erp_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE textile_erp TO erp_user;
\q
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

#### Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### Configure Environment
```bash
cp .env.example .env

# Edit .env file with your settings:
# DATABASE_URL=postgresql://erp_user:your_password@localhost:5432/textile_erp
# SECRET_KEY=generate-a-secure-random-key-at-least-32-characters
```

#### Initialize Database
```bash
# Create all tables
python -c "from app.core.database import engine, Base; from app.models import *; Base.metadata.create_all(bind=engine)"
```

#### Create Initial Data
```bash
# Run seed script
python scripts/seed_data.py
```

### 3. Frontend Setup

```bash
# Frontend is pure HTML/CSS/JS - no build needed
# Just serve from a web server or open in browser
```

---

## Database Setup

### Schema Overview

The system uses 20+ tables organized by module:

**Authentication & Authorization**
- users
- roles
- audit_logs

**Procurement**
- suppliers
- purchase_orders
- po_items
- supplier_ratings

**Inventory**
- materials
- inventory_items
- stock_movements
- reorder_alerts

**Production**
- products
- bom (Bill of Materials)
- work_orders
- machines
- machine_allocations
- production_logs

**Quality**
- qc_inspections
- defect_logs
- defect_types
- batch_approvals

**Sales**
- customers
- sales_orders
- so_items
- dispatch_notes

### Database Migration (Alembic)

```bash
# Initialize Alembic (first time only)
cd backend
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial schema"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## Initial Data

### Seed Data Script

Create `backend/scripts/seed_data.py`:

```python
import sys
sys.path.append('..')

from app.core.database import SessionLocal
from app.models.auth import User, Role
from app.core.security import get_password_hash

def seed_roles():
    db = SessionLocal()
    roles = [
        Role(role_name="admin", permissions='{"all": true}', description="System Administrator"),
        Role(role_name="manager", permissions='{"read": true, "write": true}', description="Department Manager"),
        Role(role_name="operator", permissions='{"read": true}', description="Floor Operator"),
        Role(role_name="viewer", permissions='{"read": true}', description="View Only")
    ]
    
    for role in roles:
        if not db.query(Role).filter(Role.role_name == role.role_name).first():
            db.add(role)
    
    db.commit()
    print("✅ Roles created")

def seed_users():
    db = SessionLocal()
    admin_role = db.query(Role).filter(Role.role_name == "admin").first()
    
    if not db.query(User).filter(User.username == "admin").first():
        admin_user = User(
            username="admin",
            email="admin@textile-erp.com",
            password_hash=get_password_hash("admin123"),
            full_name="System Administrator",
            role_id=admin_role.role_id,
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        print("✅ Admin user created (username: admin, password: admin123)")

if __name__ == "__main__":
    seed_roles()
    seed_users()
    print("✅ Seed data completed")
```

Run the script:
```bash
cd backend
python scripts/seed_data.py
```

---

## Running the Application

### Development Mode

#### Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
# Option 1: Python simple server
cd frontend
python -m http.server 8080

# Option 2: Node.js http-server
npx http-server -p 8080

# Option 3: VS Code Live Server extension
# Just right-click on dashboard.html and "Open with Live Server"
```

### Production Mode

#### Using Docker Compose (Recommended)
```bash
docker-compose up -d
```

#### Manual Production Setup
```bash
# Backend with Gunicorn
cd backend
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Frontend with Nginx
# Copy frontend files to /var/www/textile-erp
# Configure Nginx as per nginx.conf
```

---

## API Documentation

### Access Swagger UI
Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### Authentication

All API endpoints (except login/register) require authentication:

```javascript
// 1. Login
const response = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
        username: 'admin',
        password: 'admin123'
    })
});
const data = await response.json();
const token = data.access_token;

// 2. Use token in subsequent requests
fetch('http://localhost:8000/api/procurement/suppliers', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

### Module Endpoints Summary

**Procurement** (`/api/procurement`)
- GET /suppliers - List suppliers
- POST /suppliers - Create supplier
- GET /purchase-orders - List POs
- POST /purchase-orders - Create PO
- PUT /purchase-orders/{id}/approve - Approve PO

**Inventory** (`/api/inventory`)
- GET /materials - List materials
- GET /stock - Current stock levels
- POST /stock/receive - Receive stock
- POST /stock/issue - Issue stock
- GET /reorder-alerts - Low stock alerts

**Production** (`/api/production`)
- GET /work-orders - List work orders
- POST /work-orders - Create WO
- PUT /work-orders/{id}/start - Start production
- POST /work-orders/{id}/log - Log production

**Quality** (`/api/quality`)
- GET /inspections - List inspections
- POST /inspections - Create inspection
- POST /defects - Log defect
- POST /batch-approval/{batch} - Approve batch

**Sales** (`/api/sales`)
- GET /customers - List customers
- GET /sales-orders - List orders
- POST /sales-orders - Create order
- POST /dispatch - Create dispatch note

**Reports** (`/api/reports`)
- GET /dashboard - KPI summary
- GET /procurement-report - Procurement analytics
- GET /inventory-report - Inventory analytics
- GET /production-report - Production metrics
- GET /quality-report - Quality metrics

---

## Troubleshooting

### Database Connection Issues

**Error**: `could not connect to server`
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Restart PostgreSQL
sudo systemctl restart postgresql  # Linux
brew services restart postgresql  # macOS
```

**Error**: `authentication failed`
```bash
# Verify credentials in .env match database user
# Check pg_hba.conf authentication method
```

### Port Already in Use

**Backend (port 8000)**
```bash
# Find process using port 8000
lsof -i :8000  # Linux/macOS
netstat -ano | findstr :8000  # Windows

# Kill the process
kill -9 <PID>  # Linux/macOS
taskkill /PID <PID> /F  # Windows
```

**Frontend (port 80/8080)**
```bash
# Use different port
python -m http.server 8081
```

### Module Import Errors

```bash
# Ensure you're in virtual environment
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt

# If specific module missing
pip install <module-name>
```

### Docker Issues

**Containers won't start**
```bash
# Check logs
docker-compose logs backend
docker-compose logs db

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Database not initializing**
```bash
# Remove volumes and restart
docker-compose down -v
docker-compose up -d
```

### CORS Issues

If frontend can't connect to backend:

1. Check CORS_ORIGINS in backend/.env
2. Verify API_BASE URL in frontend JavaScript
3. Ensure backend is running and accessible

---

## Testing

### Run Backend Tests
```bash
cd backend
pytest tests/ -v

# With coverage
pytest tests/ --cov=app --cov-report=html
```

### API Manual Testing
```bash
# Using curl
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"

# Using httpie
http POST http://localhost:8000/api/auth/login \
  username=admin password=admin123
```

---

## Performance Tuning

### Database Optimization
```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_wo_product ON work_orders(product_id);
CREATE INDEX idx_stock_material ON inventory_items(material_id);
```

### Backend Optimization
```python
# Use connection pooling (already configured)
# Adjust in config.py:
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=20,
    max_overflow=40
)
```

---

## Security Checklist

- [ ] Change default admin password
- [ ] Generate secure SECRET_KEY (min 32 chars)
- [ ] Use strong database password
- [ ] Enable HTTPS in production
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Implement rate limiting
- [ ] Enable audit logging
- [ ] Backup database regularly

---

## Next Steps

After successful setup:

1. **Explore the System**: Login and navigate through all modules
2. **Create Test Data**: Add suppliers, materials, products
3. **Test Workflows**: Create a complete order-to-dispatch cycle
4. **Phase 2 Implementation**: Add automation scripts
5. **Phase 3 Implementation**: Integrate ML models
6. **Customize**: Adapt to your specific business needs

---

## Support & Documentation

- **Full Documentation**: See IMPLEMENTATION_GUIDE.md
- **API Reference**: http://localhost:8000/docs
- **Issue Tracker**: GitHub Issues
- **Community**: [Your community forum/chat]

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Phase 1 Complete ✅
