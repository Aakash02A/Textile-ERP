# System Architecture

## Overview

The Textile-based ERP with Integrated Machine Learning for Intelligent Decision Support is a comprehensive enterprise resource planning system tailored for the textile industry. The system follows a modern web architecture with a Django backend, React frontend, and integrated machine learning capabilities.

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Django)      │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Redis         │
                       │   (Cache/Queue) │
                       └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   ML Models     │
                       │   (Files)       │
                       └─────────────────┘
```

## Backend Architecture

The backend is built using Django with Django REST Framework, following a modular app structure:

### Core Components

1. **Users App**: Authentication, authorization, and user management
2. **Procurement App**: Supplier management, purchase orders, and procurement processes
3. **Inventory App**: Raw material management, stock lots, and inventory tracking
4. **Production App**: Work orders, bills of materials, and production tracking
5. **Quality App**: Defect logging, quality control, and inspection processes
6. **Sales App**: Sales orders, customer management, and feedback collection
7. **ML Service App**: Machine learning model registry, training, and inference
8. **Core Module**: Shared utilities, permissions, and background tasks

### Technology Stack

- **Framework**: Django 4.x with Django REST Framework
- **Database**: PostgreSQL (production), SQLite (development)
- **Authentication**: JWT (JSON Web Tokens)
- **Background Tasks**: Celery with Redis
- **Machine Learning**: scikit-learn, TensorFlow/Keras
- **Deployment**: Docker with Docker Compose

## Frontend Architecture

The frontend is built using React with modern development practices:

### Core Components

1. **Authentication Module**: Login, registration, and session management
2. **Dashboard**: Overview of key metrics and system status
3. **Procurement Module**: Supplier management and purchase order processing
4. **Inventory Module**: Stock management and lot tracking
5. **Production Module**: Work order management and production tracking
6. **Quality Module**: Defect logging and quality control
7. **Sales Module**: Order management and customer feedback

### Technology Stack

- **Framework**: React 18+
- **State Management**: Zustand
- **Routing**: React Router
- **Build Tool**: Vite
- **Styling**: CSS Modules or Tailwind CSS

## Machine Learning Architecture

The ML component provides intelligent decision support through various predictive models:

### Model Types

1. **Demand Forecasting**: LSTM-based model for predicting future demand
2. **Inventory Optimization**: Random Forest Regression for optimal stock levels
3. **Defect Detection**: CNN/Logistic Regression for automated defect classification
4. **Supplier Scoring**: SVM for supplier performance prediction

### ML Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Data      │───►│   Training  │───►│   Model     │───►│   Inference │
│   Collection│    │   Process   │    │   Storage   │    │   API       │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Data Flow

1. **User Interaction**: Users interact with the React frontend
2. **API Requests**: Frontend makes REST API calls to Django backend
3. **Business Logic**: Django processes requests and applies business rules
4. **Data Persistence**: Data is stored in PostgreSQL database
5. **Background Tasks**: Long-running operations are queued in Redis and processed by Celery
6. **ML Operations**: Training and inference tasks are handled by ML service
7. **Response**: Results are returned to frontend for display

## Security

- **Authentication**: JWT-based authentication with role-based access control
- **Authorization**: Fine-grained permissions based on user roles
- **Data Protection**: Encryption at rest and in transit
- **Input Validation**: Comprehensive validation of all user inputs
- **Audit Trail**: Logging of all critical operations

## Scalability

- **Horizontal Scaling**: Stateless backend services can be scaled horizontally
- **Database Optimization**: Proper indexing and query optimization
- **Caching**: Redis caching for frequently accessed data
- **Background Processing**: Asynchronous task processing with Celery
- **Load Balancing**: Reverse proxy for distributing load across instances

## Deployment

- **Containerization**: Docker containers for consistent deployment
- **Orchestration**: Docker Compose for development, Kubernetes for production
- **CI/CD**: Automated testing and deployment pipelines
- **Monitoring**: Logging and monitoring with Sentry and other tools