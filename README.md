# 🏭 Textile ERP - Enterprise Resource Planning System

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue)](https://www.postgresql.org/)

## Overview

A comprehensive, full-stack Enterprise Resource Planning system designed specifically for the textile manufacturing industry. Built with modern technologies (FastAPI, PostgreSQL, HTML/CSS/JS) and scalable architecture to handle all aspects of textile operations from procurement to sales, with planned Machine Learning integration for intelligent decision support.

## Features

### ✅ Phase 1 - Core ERP (COMPLETE)

**Authentication & Authorization**
- JWT-based authentication with bcrypt password hashing
- Role-based access control (Admin, Manager, Supervisor, Operator, Viewer)
- Session management and audit logging

**Procurement Module**
- ✅ Supplier management with ratings and status tracking
- ✅ Purchase order creation and approval workflow
- ✅ PO item management with material tracking
- ✅ Delivery status and date tracking
- ✅ Supplier performance ratings
- **Pages**: Supplier List, Create PO, PO Details

**Inventory Module**
- ✅ Material master with categories and units
- ✅ Stock level monitoring with real-time updates
- ✅ Stock receive/issue operations with batch tracking
- ✅ Movement history and audit trail
- ✅ Reorder alerts with priority calculation
- ✅ Category-wise stock analysis with charts
- **Pages**: Stock Dashboard, Material List, Movement History

**Production Module**
- ✅ Work order management with status workflow
- ✅ Bill of Materials (BOM) management
- ✅ Machine allocation and scheduling
- ✅ Production logging by shift
- ✅ Progress tracking with completion percentages
- ✅ Downtime and rejection tracking
- **Pages**: Work Order List, Create WO, Production Log

**Quality Control Module**
- ✅ QC inspection with auto-result determination
- ✅ Defect logging with severity levels (Minor/Major/Critical)
- ✅ Automatic pass/fail calculation based on thresholds
- ✅ Batch approval workflow
- ✅ Inspection reports with defect analysis
- **Pages**: QC Form, Inspection List, Defect Reports

**Sales Module**
- ✅ Customer management with credit limits
- ✅ Sales order processing with status tracking
- ✅ Order item management
- ✅ Dispatch note generation
- ✅ Delivery status tracking
- **Pages**: Customer List, Create Sales Order, Dispatch Management

**Reports & Analytics**
- ✅ Comprehensive dashboard with KPIs
- ✅ Module-wise analytical reports
- ✅ Trend analysis (sales, production, quality)
- ✅ Chart visualizations (Chart.js)
- ✅ Real-time data updates

### 🔄 Phase 2 - Automation (PLANNED)

## Quick Start

### Using Docker (Recommended)

1. **Start all services**:
   ```powershell
   docker-compose up -d
   ```

2. **Initialize database** (first time only):
   ```powershell
   docker-compose exec backend python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"
   ```

3. **Load sample data**:
   ```powershell
   docker-compose exec backend python scripts/seed_data.py
   ```

4. **Access the application**:
   - **Web UI**: http://localhost
   - **API Docs**: http://localhost:8000/docs
   - **Login Credentials**:
     - Admin: `admin` / `admin123`
     - Manager: `manager1` / `manager123`
     - Operator: `operator1` / `operator123`

📖 **See [QUICKSTART.md](QUICKSTART.md) for detailed walkthrough, testing workflows, and troubleshooting.**

### Manual Setup

For development without Docker, see [SETUP.md](SETUP.md) for detailed installation instructions.

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes with step-by-step guide
- **[SETUP.md](SETUP.md)** - Detailed installation and configuration guide
- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Technical architecture and API reference
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview and delivery status

## Available Pages

### Frontend Web Pages (Implemented)
- ✅ **Login** (`/login.html`) - Authentication with JWT
- ✅ **Dashboard** (`/dashboard.html`) - Main dashboard with KPIs and charts
- ✅ **Supplier List** (`/procurement/supplier-list.html`) - Manage suppliers
- ✅ **Create PO** (`/procurement/create-po.html`) - Create purchase orders
- ✅ **Stock Dashboard** (`/inventory/stock-dashboard.html`) - Inventory management
- ✅ **QC Form** (`/quality/qc-form.html`) - Quality inspection form

### API Endpoints (60+)
All endpoints documented at http://localhost:8000/docs:
- `/api/auth/*` - Authentication (4 endpoints)
- `/api/procurement/*` - Procurement management (10 endpoints)
- `/api/inventory/*` - Inventory operations (11 endpoints)
- `/api/production/*` - Production management (12 endpoints)
- `/api/quality/*` - Quality control (10 endpoints)
- `/api/sales/*` - Sales management (11 endpoints)
- `/api/reports/*` - Analytics and reporting (9 endpoints)

## Testing Workflows

### Workflow 1: Create Purchase Order
1. Login as admin
2. Navigate to Procurement → Supplier List
3. Click "Add New Supplier" (or select existing)
4. Click "Create PO" icon next to supplier
5. Add materials with quantities and prices
6. Submit purchase order

### Workflow 2: Receive Stock
1. Go to Inventory → Stock Dashboard
2. Click "Receive Stock"
3. Select material and enter quantity/cost
4. System creates inventory item and movement record
5. View updated stock levels and charts

### Workflow 3: Quality Inspection
1. Navigate to Quality → QC Form
2. Select inspection type (Production/Procurement)
3. Enter batch details and quantities
4. Add defects if found (severity: Minor/Major/Critical)
5. System auto-calculates defect rate and pass/fail result
6. Submit inspection

### 🔄 Phase 2 - Automation (PLANNED)
