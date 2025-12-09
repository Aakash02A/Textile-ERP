![Textile ERP Banner](https://raw.githubusercontent.com/your-org/textile-erp/main/banner.png)

# Textile ERP System

A comprehensive Enterprise Resource Planning (ERP) solution for textile manufacturing businesses with integrated Machine Learning capabilities for predictive analytics and optimization.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Modules](#modules)
- [Machine Learning Capabilities](#machine-learning-capabilities)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview

Textile ERP is a modern, full-stack enterprise resource planning system designed specifically for textile manufacturing companies. It combines traditional ERP functionalities with advanced machine learning algorithms to provide predictive analytics, optimization, and automation capabilities.

The system features a clean, responsive web interface built with modern frontend technologies and a robust backend API powered by FastAPI with asynchronous processing capabilities.

## Key Features

### Core ERP Functionality
- **Procurement Management**: Purchase order creation, supplier management, and procurement tracking
- **Inventory Control**: Real-time stock monitoring, material tracking, and warehouse management
- **Production Planning**: Work order management, bill of materials (BOM), and production scheduling
- **Quality Control**: Defect logging, quality assurance workflows, and compliance tracking
- **Sales Management**: Customer relationship management, sales order processing, and order fulfillment
- **Reporting & Analytics**: Comprehensive dashboards and customizable reports

### Machine Learning Intelligence
- **Demand Forecasting**: LSTM-based time series forecasting for inventory planning
- **Inventory Optimization**: Random Forest regression for optimal stock levels
- **Supplier Risk Scoring**: SVM-based supplier performance prediction and evaluation
- **Defect Detection**: CNN/Logistic Regression for automated defect classification
- **Quality Prediction**: Predictive models for quality outcomes

### Technical Features
- Role-based access control (RBAC)
- JWT token authentication with refresh capability
- Responsive web interface with mobile support
- RESTful API with comprehensive documentation
- Asynchronous processing for high performance
- Docker containerization support
- PostgreSQL database with connection pooling

## Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL 18 with asyncpg driver
- **ORM**: SQLAlchemy 2.0 (Async)
- **Authentication**: JWT with OAuth2 password flow
- **Migration**: Alembic
- **Validation**: Pydantic v2
- **Testing**: pytest

### Frontend
- **Core**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome
- **Charts**: Chart.js
- **UI Components**: Custom responsive design

### Machine Learning
- **Frameworks**: Scikit-learn, TensorFlow/Keras
- **Models**: LSTM, Random Forest, SVM, CNN
- **Deployment**: Flask API for ML services

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx (reverse proxy)
- **Database Management**: pgAdmin
- **Orchestration**: Docker Compose

## Architecture

The system follows a clean architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (HTML/CSS/JS)                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
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
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Data Access Layer (ORM)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SQLAlchemy 2.0 Async ORM                           │   │
│  │  • User model & RefreshToken                        │   │
│  │  • PurchaseOrder & POLineItem                       │   │
│  │  • SalesOrder & SOLineItem                          │   │
│  │  • WorkOrder                                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 ML Services (Flask APIs)                    │
└─────────────────────────────────────────────────────────────┘
```

## Modules

### 1. Procurement & Suppliers
- Purchase order creation and management
- Supplier database with performance tracking
- Goods receipt and approval workflows
- Integration with Supplier Risk Scoring ML model

### 2. Inventory & Optimization
- Real-time inventory tracking
- Material master management
- Stock level monitoring
- Integration with Inventory Optimization ML model

### 3. Production & BOM
- Work order management
- Bill of materials tracking
- Production scheduling
- Progress monitoring and reporting

### 4. Quality Control
- Defect logging system
- Quality inspection workflows
- Compliance tracking
- Integration with Defect Detection ML model

### 5. Sales & Orders
- Customer relationship management
- Sales order processing
- Order fulfillment tracking
- Integration with Demand Forecasting ML model

### 6. Reports & Analytics
- Financial reporting
- Operational dashboards
- Performance metrics
- Customizable report generation

## Machine Learning Capabilities

### Demand Forecasting
- **Model**: LSTM neural network
- **Purpose**: Predict future demand patterns for inventory planning
- **Features**: Time series forecasting with confidence intervals
- **Integration**: Feeds data to procurement and inventory modules

### Inventory Optimization
- **Model**: Random Forest Regression
- **Purpose**: Recommend optimal stock levels and reorder points
- **Features**: Minimize holding costs while preventing stockouts
- **Integration**: Provides recommendations in inventory dashboard

### Supplier Risk Scoring
- **Model**: Support Vector Machine (SVM)
- **Purpose**: Evaluate and score supplier performance and reliability
- **Features**: Risk classification and early warning system
- **Integration**: Flags high-risk suppliers during PO creation

### Defect Detection
- **Model**: Convolutional Neural Network (CNN) with Logistic Regression
- **Purpose**: Automatically classify and quantify product defects
- **Features**: Image-based defect recognition and categorization
- **Integration**: Processes QC images and generates defect reports

### Quality Prediction
- **Model**: Ensemble methods
- **Purpose**: Predict final product quality based on process parameters
- **Features**: Early quality intervention recommendations
- **Integration**: Provides real-time quality predictions during production

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Git (optional, for cloning the repository)

### Quick Start with Docker
```bash
# Clone the repository
git clone <repository-url>
cd Textile-ERP

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8000
# pgAdmin: http://localhost:5050
```

### Manual Installation

#### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Start the backend server:
   ```bash
   python -m uvicorn app.main:app --reload
   ```

#### Frontend Access
Open `index.html` in your web browser or serve it with a local web server.

## Project Structure

```
Textile-ERP/
├── backend/                    # FastAPI backend application
│   ├── app/
│   │   ├── api/               # API endpoints (routers)
│   │   ├── core/              # Core configuration and security
│   │   ├── db/                # Database configuration
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic services
│   │   └── utils/             # Utility functions
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile             # Backend Docker configuration
├── frontend/                   # Frontend web application
│   ├── procurement/           # Procurement module pages
│   ├── inventory/             # Inventory module pages
│   ├── production/            # Production module pages
│   ├── quality/               # Quality control pages
│   ├── sales/                 # Sales module pages
│   ├── reports/               # Reporting module pages
│   ├── ml_models/             # Machine learning model interfaces
│   └── js/                    # JavaScript utility files
├── docker-compose.yml          # Docker Compose configuration
├── nginx.conf                 # Nginx reverse proxy configuration
└── README.md                  # This file
```

## Deployment

### Production Deployment Options

#### Docker Compose (Recommended)
```bash
# Build and start all services
docker-compose up -d --build

# Scale backend services (optional)
docker-compose up -d --scale backend=3
```

#### Kubernetes Deployment
Create Kubernetes manifests for:
- Backend deployment and service
- PostgreSQL deployment and service
- pgAdmin deployment and service
- Nginx ingress controller

#### Cloud Platforms
Deploy to cloud platforms like:
- AWS ECS/EKS
- Google Cloud Run/GKE
- Azure Container Instances/AKS
- Heroku (with Docker support)

### Environment Configuration
For production deployments, ensure to:
1. Generate a strong SECRET_KEY
2. Configure proper CORS origins
3. Set DEBUG=False
4. Use production-grade PostgreSQL instance
5. Configure SSL/TLS certificates
6. Set up proper logging and monitoring

## API Documentation

The backend API is documented using Swagger UI and ReDoc:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Authentication Flow
1. Register a new user: `POST /api/v1/auth/register`
2. Login to get tokens: `POST /api/v1/auth/login`
3. Use access token in Authorization header: `Bearer <access_token>`
4. Refresh token when expired: `POST /api/v1/auth/refresh`

### Core Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get tokens
- `POST /api/v1/auth/refresh` - Refresh access token

#### Purchase Orders
- `POST /api/v1/purchase-orders` - Create purchase order
- `GET /api/v1/purchase-orders` - Get all purchase orders
- `GET /api/v1/purchase-orders/{id}` - Get purchase order by ID
- `PUT /api/v1/purchase-orders/{id}` - Update purchase order
- `DELETE /api/v1/purchase-orders/{id}` - Delete purchase order

#### Sales Orders
- `POST /api/v1/sales-orders` - Create sales order
- `GET /api/v1/sales-orders` - Get all sales orders
- `GET /api/v1/sales-orders/{id}` - Get sales order by ID
- `PUT /api/v1/sales-orders/{id}` - Update sales order
- `DELETE /api/v1/sales-orders/{id}` - Delete sales order

#### Work Orders
- `POST /api/v1/work-orders` - Create work order
- `GET /api/v1/work-orders` - Get all work orders
- `GET /api/v1/work-orders/{id}` - Get work order by ID
- `PUT /api/v1/work-orders/{id}` - Update work order
- `DELETE /api/v1/work-orders/{id}` - Delete work order

## Contributing

We welcome contributions to the Textile ERP project. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Submit a pull request

Please ensure your code follows the existing style and includes appropriate documentation.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Note**: This is a demonstration/educational project. For production use, additional security measures, error handling, and scalability considerations should be implemented.