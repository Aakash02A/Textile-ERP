# API Specification

## Overview

This document describes the RESTful API endpoints for the Textile ERP system. All endpoints are prefixed with `/api/v1/` and require appropriate authentication unless otherwise specified.

## Authentication

### Login
```
POST /api/v1/auth/login/
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "full_name": "string",
    "role": "string",
    "phone": "string",
    "is_active": true,
    "last_login": "datetime",
    "created_at": "datetime"
  }
}
```

### Refresh Token
```
POST /api/v1/auth/refresh/
```

**Request Body:**
```json
{
  "refresh_token": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "refresh_token": "string"
}
```

## Users

### List Users
```
GET /api/v1/users/
```

**Response:**
```json
[
  {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "full_name": "string",
    "role": "string",
    "phone": "string",
    "is_active": true,
    "last_login": "datetime",
    "created_at": "datetime"
  }
]
```

### Get User
```
GET /api/v1/users/{id}/
```

**Response:**
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "full_name": "string",
  "role": "string",
  "phone": "string",
  "is_active": true,
  "last_login": "datetime",
  "created_at": "datetime"
}
```

## Procurement

### List Suppliers
```
GET /api/v1/procurement/suppliers/
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "contact_info": "string",
    "rating": 0.0,
    "lead_time_days": 0,
    "payment_terms": "string",
    "created_at": "datetime"
  }
]
```

### Create Supplier
```
POST /api/v1/procurement/suppliers/
```

**Request Body:**
```json
{
  "name": "string",
  "contact_info": "string",
  "rating": 0.0,
  "lead_time_days": 0,
  "payment_terms": "string"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "string",
  "contact_info": "string",
  "rating": 0.0,
  "lead_time_days": 0,
  "payment_terms": "string",
  "created_at": "datetime"
}
```

### Create Purchase Order
```
POST /api/v1/procurement/purchaseorders/
```

**Request Body:**
```json
{
  "supplier": "uuid",
  "order_number": "string",
  "expected_delivery_date": "date",
  "items": [
    {
      "rawmaterial": "uuid",
      "unit_price": 0.0,
      "quantity": 0.0,
      "batch_no": "string"
    }
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "supplier": "uuid",
  "supplier_name": "string",
  "order_number": "string",
  "status": "string",
  "total_cost": 0.0,
  "expected_delivery_date": "date",
  "created_by": "uuid",
  "created_at": "datetime",
  "updated_at": "datetime",
  "items": [
    {
      "id": "uuid",
      "purchaseorder": "uuid",
      "rawmaterial": "uuid",
      "raw_material_name": "string",
      "unit_price": 0.0,
      "quantity": 0.0,
      "batch_no": "string",
      "created_at": "datetime"
    }
  ]
}
```

### Get Purchase Order
```
GET /api/v1/procurement/purchaseorders/{id}/
```

**Response:**
```json
{
  "id": "uuid",
  "supplier": "uuid",
  "supplier_name": "string",
  "order_number": "string",
  "status": "string",
  "total_cost": 0.0,
  "expected_delivery_date": "date",
  "created_by": "uuid",
  "created_at": "datetime",
  "updated_at": "datetime",
  "items": [
    {
      "id": "uuid",
      "purchaseorder": "uuid",
      "rawmaterial": "uuid",
      "raw_material_name": "string",
      "unit_price": 0.0,
      "quantity": 0.0,
      "batch_no": "string",
      "created_at": "datetime"
    }
  ]
}
```

### Update Purchase Order Status
```
PUT /api/v1/procurement/purchaseorders/{id}/update_status/
```

**Request Body:**
```json
{
  "status": "string"
}
```

**Response:**
```json
{
  "status": "string"
}
```

## Inventory

### List Raw Materials
```
GET /api/v1/inventory/rawmaterials/
```

**Response:**
```json
[
  {
    "id": "uuid",
    "code": "string",
    "name": "string",
    "description": "string",
    "unit": "string",
    "safety_stock_level": 0.0,
    "reorder_point": 0.0,
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

### Receive Stock Lot
```
POST /api/v1/inventory/stocklots/receive/
```

**Request Body:**
```json
{
  "rawmaterial": "uuid",
  "batch_no": "string",
  "quantity_on_hand": 0.0,
  "location": "string",
  "received_date": "date",
  "expiry_date": "date",
  "unit_cost": 0.0
}
```

**Response:**
```json
{
  "id": "uuid",
  "rawmaterial": "uuid",
  "raw_material_name": "string",
  "batch_no": "string",
  "quantity_on_hand": 0.0,
  "location": "string",
  "received_date": "date",
  "expiry_date": "date",
  "unit_cost": 0.0,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### List Stock Lots
```
GET /api/v1/inventory/stocklots/
```

**Response:**
```json
[
  {
    "id": "uuid",
    "rawmaterial": "uuid",
    "raw_material_name": "string",
    "batch_no": "string",
    "quantity_on_hand": 0.0,
    "location": "string",
    "received_date": "date",
    "expiry_date": "date",
    "unit_cost": 0.0,
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

### Transfer Stock
```
POST /api/v1/inventory/stocklots/transfer/
```

**Request Body:**
```json
{
  "rawmaterial_id": "uuid",
  "batch_no": "string",
  "from_location": "string",
  "to_location": "string",
  "quantity": 0.0
}
```

**Response:**
```json
{
  "message": "string"
}
```

## Production

### Create Work Order
```
POST /api/v1/production/workorders/
```

**Request Body:**
```json
{
  "workorder_number": "string",
  "product_code": "string",
  "planned_qty": 0.0,
  "start_date": "date",
  "end_date": "date",
  "status": "string"
}
```

**Response:**
```json
{
  "id": "uuid",
  "workorder_number": "string",
  "product_code": "string",
  "planned_qty": 0.0,
  "start_date": "date",
  "end_date": "date",
  "status": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Get Work Order
```
GET /api/v1/production/workorders/{id}/
```

**Response:**
```json
{
  "id": "uuid",
  "workorder_number": "string",
  "product_code": "string",
  "planned_qty": 0.0,
  "start_date": "date",
  "end_date": "date",
  "status": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Update Work Order Progress
```
POST /api/v1/production/workorders/{id}/progress/
```

**Request Body:**
```json
{
  "phase": "string",
  "completed_qty": 0.0,
  "notes": "string"
}
```

**Response:**
```json
{
  "id": "uuid",
  "work_order": "uuid",
  "work_order_number": "string",
  "phase": "string",
  "completed_qty": 0.0,
  "completed_at": "datetime",
  "notes": "string",
  "created_at": "datetime"
}
```

## Quality

### Log Defect
```
POST /api/v1/quality/defects/
```

**Request Body:**
```json
{
  "sample_image_path": "string",
  "defect_type": "string",
  "severity": "string",
  "production_batch_id": "string",
  "ml_flag": true,
  "ml_confidence": 0.0,
  "remarks": "string"
}
```

**Response:**
```json
{
  "id": "uuid",
  "sample_image_path": "string",
  "defect_type": "string",
  "severity": "string",
  "detected_by": "uuid",
  "detected_by_name": "string",
  "detected_at": "datetime",
  "production_batch_id": "string",
  "ml_flag": true,
  "ml_confidence": 0.0,
  "remarks": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### List Defects
```
GET /api/v1/quality/defects/
```

**Response:**
```json
[
  {
    "id": "uuid",
    "sample_image_path": "string",
    "defect_type": "string",
    "severity": "string",
    "detected_by": "uuid",
    "detected_by_name": "string",
    "detected_at": "datetime",
    "production_batch_id": "string",
    "ml_flag": true,
    "ml_confidence": 0.0,
    "remarks": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

### Predict Defects
```
POST /api/v1/quality/defects/predict/
```

**Request Body:**
```json
{
  "image_data": ["string"],
  "image_paths": ["string"]
}
```

**Response:**
```json
{
  "message": "string",
  "task_id": "string"
}
```

## Sales

### Create Sales Order
```
POST /api/v1/sales/orders/
```

**Request Body:**
```json
{
  "order_number": "string",
  "customer_info": "string",
  "order_date": "date",
  "status": "string",
  "total_value": 0.0,
  "items": [
    {
      "product_code": "string",
      "quantity": 0.0,
      "unit_price": 0.0
    }
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "order_number": "string",
  "customer_info": "string",
  "order_date": "date",
  "status": "string",
  "total_value": 0.0,
  "created_at": "datetime",
  "updated_at": "datetime",
  "items": [
    {
      "id": "uuid",
      "sales_order": "uuid",
      "product_code": "string",
      "quantity": 0.0,
      "unit_price": 0.0,
      "total_price": 0.0,
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ]
}
```

### Get Sales Order
```
GET /api/v1/sales/orders/{id}/
```

**Response:**
```json
{
  "id": "uuid",
  "order_number": "string",
  "customer_info": "string",
  "order_date": "date",
  "status": "string",
  "total_value": 0.0,
  "created_at": "datetime",
  "updated_at": "datetime",
  "items": [
    {
      "id": "uuid",
      "sales_order": "uuid",
      "product_code": "string",
      "quantity": 0.0,
      "unit_price": 0.0,
      "total_price": 0.0,
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ]
}
```

## ML Service

### List Models
```
GET /api/v1/ml/models/
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "model_type": "string",
    "version": "string",
    "path_on_disk": "string",
    "metrics_json": "string",
    "last_trained_at": "datetime",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

### Train Model
```
POST /api/v1/ml/models/train/
```

**Request Body:**
```json
{
  "model_type": "string",
  "training_data_path": "string",
  "parameters": {}
}
```

**Response:**
```json
{
  "message": "string",
  "task_id": "string"
}
```

### Predict with Model
```
POST /api/v1/ml/models/{id}/predict/
```

**Request Body:**
```json
{
  "input_data": {}
}
```

**Response:**
```json
{
  "prediction": [],
  "probabilities": []
}
```