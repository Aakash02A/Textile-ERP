# Textile-based ERP with Integrated Machine Learning for Intelligent Decision Support

## Overview

This project is a comprehensive Enterprise Resource Planning (ERP) system tailored for the textile industry, augmented with Machine Learning capabilities for intelligent decision support. The system addresses key challenges in the textile industry including demand volatility, inefficient resource utilization, and quality-control gaps.

## Features

### Core ERP Modules
- **Authentication & RBAC**: User management with role-based access control
- **Procurement**: Supplier management, purchase orders, raw material purchasing
- **Inventory**: Stock management, batch traceability, stock lot tracking
- **Production**: Work orders, bill-of-materials, production progress tracking
- **Quality Control**: Defect logging, automated defect classification
- **Sales & Reporting**: Order management, customer feedback, dashboards

### Machine Learning Capabilities
- **Demand Forecasting**: LSTM-based model for predicting future demand
- **Inventory Optimization**: Random Forest Regression for optimal stock levels
- **Defect Detection**: CNN/Logistic Regression for automated defect classification
- **Supplier Scoring**: SVM for supplier performance prediction

## Technology Stack

### Backend
- Python 3.11+
- Django 4.x
- Django REST Framework
- PostgreSQL (production) / SQLite (development)
- JWT Authentication
- Celery + Redis for background tasks

### Frontend
- React 18+
- Vite
- React Router
- Zustand for state management

### Machine Learning
- scikit-learn
- TensorFlow/Keras
- Pandas, NumPy

### DevOps
- Docker & Docker Compose
- Gunicorn for production deployment

## Project Structure

```
textile-erp/
├── backend/
│   ├── config/              # Django configuration
│   ├── apps/                # Django apps (users, procurement, inventory, etc.)
│   ├── core/                # Shared utilities and permissions
│   ├── ml_models/           # Trained ML models
│   ├── Dockerfile           # Docker configuration
│   └── compose.dev.yml      # Docker Compose for development
├── frontend/
│   ├── src/                 # React source code
│   ├── routes/              # Page routes
│   ├── components/          # React components
│   └── stores/              # State management
├── docs/                    # Documentation
├── tests/                   # Test files
└── README.md                # This file
```

## Installation

### Backend Setup

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

4. Run database migrations:
   ```bash
   python manage.py migrate
   ```

5. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Docker Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Start services with Docker Compose:
   ```bash
   docker-compose -f compose.dev.yml up --build
   ```

## API Documentation

The API follows RESTful principles and is documented in `docs/api_spec.md`. All endpoints are prefixed with `/api/v1/`.

## Machine Learning Models

ML models are documented in `docs/ml_plan.md` and implemented in the `ml_service` Django app.

## Testing

Backend tests are located in `tests/backend/` and can be run with:
```bash
python manage.py test
```

Frontend tests are located in `tests/frontend/` and can be run with:
```bash
npm test
```

## Deployment

For production deployment, use the Docker configuration or deploy the backend with Gunicorn and the frontend as a static site.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.