# Textile ERP - Full Implementation Guide

## 🏗️ System Architecture

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla + Chart.js)
- **Backend**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL 14+
- **ML**: TensorFlow, scikit-learn, pandas
- **Automation**: Python scripts, Celery (for scheduled tasks)

---

## 📊 Database Schema

### Core Tables (20+ tables)

**Authentication & Authorization**
- users (user_id, username, email, password_hash, role_id)
- roles (role_id, role_name, permissions)
- audit_logs (log_id, user_id, action, timestamp, details)

**Procurement Module**
- suppliers (supplier_id, name, contact, rating, status)
- purchase_orders (po_id, supplier_id, order_date, status, total_amount)
- po_items (item_id, po_id, material_id, quantity, unit_price)
- supplier_ratings (rating_id, supplier_id, score, delivery_time)

**Inventory Module**
- materials (material_id, code, name, category, unit, reorder_level)
- inventory_items (item_id, material_id, batch, quantity, location)
- stock_movements (movement_id, material_id, type, quantity, date, reference)
- reorder_alerts (alert_id, material_id, threshold, current_stock)

**Production Module**
- work_orders (wo_id, product_id, quantity, start_date, status)
- bom (bom_id, product_id, material_id, quantity_required)
- production_logs (log_id, wo_id, quantity_produced, shift, operator)
- machine_allocation (allocation_id, wo_id, machine_id, start_time)
- machines (machine_id, name, status, capacity)

**Quality Module**
- qc_inspections (inspection_id, wo_id, batch, inspector, result)
- defect_logs (defect_id, inspection_id, defect_type, quantity, severity)
- defect_types (type_id, name, category, threshold)
- batch_approval (approval_id, batch_id, status, approved_by)

**Sales Module**
- customers (customer_id, name, contact, credit_limit, region)
- sales_orders (so_id, customer_id, order_date, delivery_date, status)
- so_items (item_id, so_id, product_id, quantity, unit_price)
- dispatch_notes (dispatch_id, so_id, dispatch_date, vehicle, driver)

**ML Tables (Phase 3)**
- demand_forecasts (forecast_id, product_id, period, predicted_demand)
- supplier_predictions (pred_id, supplier_id, risk_score, confidence)
- defect_predictions (pred_id, wo_id, predicted_defects, model_version)

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
GET    /api/auth/profile
```

### Procurement (/api/procurement)
```
GET    /suppliers              # List all suppliers
POST   /suppliers              # Add new supplier
GET    /suppliers/{id}         # Get supplier details
PUT    /suppliers/{id}         # Update supplier
DELETE /suppliers/{id}         # Deactivate supplier

GET    /purchase-orders        # List POs (with filters)
POST   /purchase-orders        # Create PO
GET    /purchase-orders/{id}   # Get PO details
PUT    /purchase-orders/{id}/approve  # Approve PO
PUT    /purchase-orders/{id}/receive  # Mark as received
POST   /purchase-orders/{id}/items    # Add PO items

GET    /pending-approvals     # POs awaiting approval
POST   /delivery-update       # Update delivery status
```

### Inventory (/api/inventory)
```
GET    /materials             # List all materials
POST   /materials             # Add material
GET    /materials/{id}        # Material details
PUT    /materials/{id}        # Update material

GET    /stock                 # Current stock levels
POST   /stock/receive         # Add stock (from PO)
POST   /stock/issue           # Issue stock (to production)
GET    /stock/movements       # Stock movement history
GET    /stock/ledger          # Stock ledger report

GET    /reorder-alerts        # Items below reorder level
POST   /reorder-alerts/auto   # Trigger auto-reorder
```

### Production (/api/production)
```
GET    /work-orders           # List work orders
POST   /work-orders           # Create work order
GET    /work-orders/{id}      # WO details
PUT    /work-orders/{id}/start   # Start production
PUT    /work-orders/{id}/complete # Complete WO
POST   /work-orders/{id}/log     # Log production

GET    /machines              # Machine list
GET    /machines/{id}/status  # Machine status
POST   /machines/allocate     # Allocate machine to WO

GET    /bom                   # Bill of materials
POST   /bom                   # Create BOM entry
```

### Quality (/api/quality)
```
GET    /inspections           # List inspections
POST   /inspections           # Create inspection
GET    /inspections/{id}      # Inspection details
PUT    /inspections/{id}/approve  # Approve batch

POST   /defects               # Log defect
GET    /defects               # List defects (filterable)
GET    /defects/types         # Defect types

GET    /batch-approval/{batch_id}  # Batch status
POST   /batch-approval/{batch_id}  # Approve/reject batch
```

### Sales (/api/sales)
```
GET    /customers             # List customers
POST   /customers             # Add customer
GET    /customers/{id}        # Customer details
PUT    /customers/{id}        # Update customer

GET    /sales-orders          # List sales orders
POST   /sales-orders          # Create SO
GET    /sales-orders/{id}     # SO details
PUT    /sales-orders/{id}/confirm  # Confirm SO
POST   /sales-orders/{id}/items    # Add SO items

POST   /dispatch              # Create dispatch note
GET    /dispatch/{so_id}      # Dispatch details
```

### Reports (/api/reports)
```
GET    /dashboard             # KPI summary
GET    /procurement-report    # Procurement analytics
GET    /inventory-report      # Inventory analytics
GET    /production-report     # Production metrics
GET    /quality-report        # Quality metrics
GET    /sales-report          # Sales analytics

GET    /export/excel          # Export to Excel
GET    /export/pdf            # Export to PDF
GET    /trends                # Trend analysis
```

---

## 🎨 Frontend Pages

### Layout Structure
All pages follow consistent layout:
- Header (logo, user menu, notifications)
- Sidebar navigation (module links)
- Main content area
- Footer

### Page List

**Procurement Module**
1. `supplier-list.html` - Supplier management grid
2. `create-po.html` - Purchase order creation form
3. `pending-approvals.html` - PO approval workflow
4. `delivery-update.html` - Delivery tracking

**Inventory Module**
1. `stock-dashboard.html` - Real-time stock overview
2. `stock-receive.html` - Stock receipt form
3. `stock-issue.html` - Stock issuance form
4. `stock-ledger.html` - Detailed stock movements
5. `reorder-alerts.html` - Low stock alerts

**Production Module**
1. `work-order-list.html` - Active work orders
2. `create-wo.html` - Work order creation
3. `machine-allocation.html` - Machine scheduling
4. `production-tracking.html` - Real-time progress

**Quality Module**
1. `qc-form.html` - Inspection data entry
2. `defect-entry.html` - Defect logging
3. `batch-approval.html` - Batch approval interface
4. `quality-dashboard.html` - Quality metrics

**Sales Module**
1. `customer-list.html` - Customer management
2. `create-so.html` - Sales order form
3. `dispatch-page.html` - Dispatch note creation
4. `sales-dashboard.html` - Sales overview

**Reports Module**
1. `kpi-dashboard.html` - Executive dashboard
2. `export-page.html` - Report export interface
3. `trend-charts.html` - Visual analytics

---

## 🤖 Phase 2 - Automation Scripts

### Auto-Reorder Script
```python
# scripts/auto_reorder.py
# Runs daily to check stock levels
# Generates POs for items below reorder level
```

### Inventory Auto-Update
```python
# scripts/inventory_sync.py
# Updates inventory after production completion
# Deducts raw materials, adds finished goods
```

### Auto-Numbering
```python
# scripts/numbering_service.py
# Generates sequential numbers for:
# - Purchase orders (PO-YYYYMMDD-XXX)
# - Work orders (WO-YYYYMMDD-XXX)
# - Sales orders (SO-YYYYMMDD-XXX)
```

### Alert Notifications
```python
# scripts/alert_service.py
# Sends notifications for:
# - Low stock alerts
# - PO approval pending
# - Quality failures
# - Delivery delays
```

---

## 🧠 Phase 3 - ML Models

### Procurement ML
1. **Supplier Rating Model** (Random Forest)
   - Features: delivery_time, quality_score, price, defect_rate
   - Output: rating_score (0-100)

2. **Delivery Delay Predictor** (Gradient Boosting)
   - Features: supplier, distance, order_size, season
   - Output: delay_days (0-30)

### Inventory ML
1. **Demand Forecasting** (LSTM)
   - Features: historical_sales, season, trends, promotions
   - Output: predicted_demand (next 30/60/90 days)

2. **Stock-out Prediction** (Logistic Regression)
   - Features: current_stock, lead_time, demand_pattern
   - Output: stockout_probability (0-1)

### Production ML
1. **Machine Downtime Predictor** (XGBoost)
   - Features: machine_age, usage_hours, maintenance_history
   - Output: downtime_probability, recommended_maintenance

2. **Wastage Prediction** (Neural Network)
   - Features: material_type, operator, shift, machine
   - Output: predicted_wastage_percentage

3. **Optimal Scheduling** (Reinforcement Learning)
   - Optimizes: machine allocation, batch sizes, sequencing
   - Objective: minimize makespan, maximize throughput

### Quality ML
1. **Defect Pattern Recognition** (CNN)
   - Input: defect images, process parameters
   - Output: defect_type, root_cause, severity

2. **QC Risk Scoring** (Ensemble Model)
   - Features: supplier, material, operator, shift
   - Output: risk_score (0-100)

### Sales ML
1. **Sales Forecasting** (Prophet)
   - Features: historical_sales, seasonality, trends
   - Output: sales_forecast (weekly/monthly)

2. **Customer Churn Prediction** (XGBoost)
   - Features: order_frequency, payment_delays, complaints
   - Output: churn_probability (0-1)

---

## 🔄 Phase 4 - ML Integration Workflow

### Procurement Workflow
```
User creates PO → System suggests:
  - Best supplier (based on rating + delivery prediction)
  - Optimal order quantity (based on demand forecast)
  - Expected delivery date (based on delay prediction)
User reviews → Approves/Modifies → Places order
```

### Inventory Workflow
```
Daily check → System:
  - Forecasts demand for next 30 days
  - Calculates reorder quantities
  - Predicts stockout risks
  - Generates reorder recommendations
Manager reviews → Approves → Auto-creates POs
```

### Production Workflow
```
Sales order received → System:
  - Checks current capacity
  - Predicts machine availability
  - Suggests optimal schedule
  - Estimates wastage
Planner reviews → Adjusts → Creates work orders
```

### Quality Workflow
```
Production completed → System:
  - Calculates QC risk score
  - Prioritizes high-risk batches
  - Predicts defect types
  - Recommends inspection focus areas
Inspector conducts QC → Logs results → System learns
```

### Sales Workflow
```
End of week → System:
  - Forecasts next week's sales
  - Identifies churn-risk customers
  - Suggests targeted promotions
Sales team reviews → Takes action
```

---

## 🚀 Deployment Configuration

### Docker Setup
```yaml
version: '3.8'
services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: textile_erp
      POSTGRES_USER: erp_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://erp_user:secure_password@db:5432/textile_erp
    ports:
      - "8000:8000"
    depends_on:
      - db

  nginx:
    image: nginx:alpine
    volumes:
      - ./frontend:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
    depends_on:
      - backend
```

### Environment Variables
```bash
# .env
DATABASE_URL=postgresql://user:pass@localhost:5432/textile_erp
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000,http://localhost:80
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ML_MODEL_PATH=/app/ml_modules/models
```

### Requirements
```txt
# backend/requirements.txt
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
python-jose==3.3.0
passlib==1.7.4
python-multipart==0.0.6
pandas==2.1.3
numpy==1.26.2
scikit-learn==1.3.2
tensorflow==2.15.0
xgboost==2.0.2
prophet==1.1.5
celery==5.3.4
redis==5.0.1
openpyxl==3.1.2
reportlab==4.0.7
```

---

## 📖 Sample Workflows

### Complete Order-to-Dispatch Flow

1. **Customer places order** (Sales module)
   - Create sales order
   - System checks inventory
   - If stock insufficient → triggers production

2. **Production planning** (Production module)
   - Create work order
   - Check BOM for raw materials
   - System suggests optimal schedule
   - Allocate machines

3. **Material procurement** (if needed)
   - System checks stock levels
   - Auto-generates PO for shortfall
   - Suggests best supplier (ML)
   - Send for approval

4. **Production execution**
   - Start work order
   - Issue raw materials from inventory
   - Log production progress
   - System predicts wastage

5. **Quality control**
   - Inspect finished goods
   - Log any defects
   - System identifies patterns
   - Approve batch

6. **Inventory update**
   - Add finished goods to stock
   - Deduct raw materials used
   - Update stock ledger

7. **Dispatch**
   - Create dispatch note
   - Update sales order status
   - Deduct from finished goods inventory
   - Generate invoice

8. **Reporting**
   - Update KPIs
   - Generate analytics
   - ML models learn from cycle

---

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing (bcrypt)
- SQL injection prevention (SQLAlchemy ORM)
- CORS configuration
- Audit logging for all actions
- Session management
- API rate limiting

---

## 📈 Key Performance Indicators (KPIs)

### Procurement
- Average PO processing time
- Supplier on-time delivery rate
- Cost savings percentage
- Number of pending approvals

### Inventory
- Inventory turnover ratio
- Stock-out incidents
- Carrying cost
- Reorder frequency

### Production
- Production efficiency (%)
- Machine utilization rate
- Wastage percentage
- On-time completion rate

### Quality
- First-pass yield (%)
- Defect rate per batch
- Customer complaints
- Rework percentage

### Sales
- Order fulfillment rate
- Average order value
- Customer retention rate
- Revenue growth

---

## 🎯 Next Steps

After completing Phase 1:
1. Deploy to staging environment
2. Conduct user acceptance testing (UAT)
3. Implement Phase 2 automation scripts
4. Collect historical data for ML training
5. Develop and train ML models (Phase 3)
6. Integrate ML predictions into UI (Phase 4)
7. Deploy to production
8. Monitor and continuously improve

---

## 📞 Support & Maintenance

- Regular database backups (automated)
- System health monitoring
- Error logging and alerting
- Performance optimization
- Security patches
- Feature enhancements based on user feedback

---

**System Status**: Phase 1 Complete ✅
**Current Focus**: Building remaining frontend pages and API integrations
**Next Milestone**: Phase 2 Automation Scripts
