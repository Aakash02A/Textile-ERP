# ML Intelligence Hub - Integration Guide

## Overview

The ML Intelligence Hub is a comprehensive frontend system for Textile ERP that integrates five AI/ML models for intelligent decision-making across inventory, procurement, production, quality, and sales operations.

## Architecture

### Directory Structure

```
frontend/ml_models/
├── index.html                          # ML Hub main dashboard
├── shared/
│   ├── api-client.js                   # Centralized API client
│   ├── mock-data.js                    # Development mock data
│   ├── utils.js                        # Shared utility functions
│   └── styles.css                      # Base stylesheet
├── demand_forecasting/
│   └── index.html                      # Demand forecasting UI
├── inventory_optimization/
│   └── index.html                      # Inventory optimization UI
├── supplier_risk_scoring/
│   └── index.html                      # Supplier risk scoring UI
├── defect_detection/
│   └── index.html                      # Defect detection UI
└── quality_prediction/
    └── index.html                      # Quality prediction UI
```

## Components

### 1. Shared Infrastructure

#### API Client (`shared/api-client.js`)

Centralized HTTP client for all backend API calls.

**Key Class: `MLApiClient`**

```javascript
const apiClient = new MLApiClient();

// Set authentication token
apiClient.setAuthToken(token);

// Demand Forecasting endpoints
await apiClient.getSKUList();
await apiClient.getDemandForecast(filters);
await apiClient.retrainDemandModel(params);

// Inventory Optimization endpoints
await apiClient.getInventoryOptimization(filters);
await apiClient.updateInventoryParameters(params);

// Supplier Risk Scoring endpoints
await apiClient.getSupplierRisks(filters);
await apiClient.updateSupplierRisks(data);

// Defect Detection endpoints
await apiClient.detectDefects(filters);
await apiClient.classifyDefect(imageData);

// Quality Prediction endpoints
await apiClient.predictBatchQuality(filters);
await apiClient.getBatchAnalysis(batchId);
```

**Configuration:**
- Base URL: `/api/ml/`
- Authentication: Bearer token from localStorage
- Timeout: 30 seconds (configurable)
- Error Handling: Custom `APIError` class

#### Mock Data (`shared/mock-data.js`)

Development data for testing without backend.

```javascript
// Access mock data
MockData.demandForecasting.skus;
MockData.inventoryOptimization.skus;
MockData.supplierRiskScoring.suppliers;
MockData.defectDetection.detections;
MockData.qualityPrediction.batches;

// Generate sample data
MockData.generateTimeSeriesData(points, minValue, maxValue);
MockData.generateMockForecast(skuCode, days);
```

**Toggle Mock Data:**
```javascript
// In any ML model UI
state.useMockData = true; // Enable mock data
state.useMockData = false; // Use real API
```

#### Utilities (`shared/utils.js`)

Common helper functions for all models.

```javascript
// Formatting
Utils.formatDate(date);
Utils.formatNumber(number);
Utils.formatCurrency(amount);
Utils.formatPercentage(value);

// Color Mapping
Utils.getRiskColor(score);
Utils.getQualityColor(score);

// Performance
Utils.debounce(function, delay);
Utils.throttle(function, delay);

// User Feedback
Utils.showNotification(message, type);

// Export Functions
Utils.exportToCSV(headers, rows, filename);
Utils.exportToJSON(data, filename);

// Date Range
Utils.getDateRange(days);
Utils.getStatusClass(status);
```

#### Base Styles (`shared/styles.css`)

Reusable CSS components and utilities.

**CSS Variables:**
```css
--primary: #3b82f6;
--secondary: #10b981;
--warning: #f59e0b;
--danger: #ef4444;
--text-primary: #1f2937;
--text-secondary: #6b7280;
--border-color: #e5e7eb;
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
```

**Components:**
- `.btn` / `.btn-primary` / `.btn-secondary` - Buttons
- `.badge` / `.badge-success` / `.badge-warning` - Status badges
- `.card` - Card container
- `.chart-container` - Chart wrapper
- `.data-table` - Data table styling
- `.alert` / `.alert-info` / `.alert-success` - Alerts

### 2. ML Model UIs

#### Demand Forecasting (`demand_forecasting/index.html`)

LSTM-based time series forecasting for accurate demand predictions.

**Features:**
- SKU selection and date range picker
- Forecast period input (1-180 days)
- Key metrics: MAE, RMSE, MAPE, Accuracy
- Line chart with confidence bands
- Detailed forecast data table
- Export to CSV/JSON

**API Endpoints:**
```
GET  /api/ml/demand-forecast/skus
GET  /api/ml/demand-forecast/{sku_code}
POST /api/ml/demand-forecast/retrain
```

**Mock Data:**
```javascript
{
  sku_code: "POL-2024-001",
  forecast_data: [
    { date: "2024-01-15", actual: 450, predicted: 455, conf_upper: 520, conf_lower: 390, accuracy: 0.98 }
  ],
  metrics: { mae: 12.5, rmse: 15.3, mape: 2.1, accuracy: 0.94 }
}
```

#### Inventory Optimization (`inventory_optimization/index.html`)

EOQ and ABC analysis for optimal stock level recommendations.

**Features:**
- Category and ABC filtering
- ABC analysis visualization (doughnut chart)
- Inventory turnover comparison
- Cost reduction opportunity analysis
- Optimization parameters panel
- SKU-level optimization details

**API Endpoints:**
```
GET  /api/ml/inventory/optimization
POST /api/ml/inventory/parameters
GET  /api/ml/inventory/abc-analysis
```

**Key Metrics:**
- Total current inventory value
- Optimized inventory value
- Potential savings (₹ and %)
- Items at risk (below reorder point)
- Excess stock items (>90 days supply)
- ABC distribution

#### Supplier Risk Scoring (`supplier_risk_scoring/index.html`)

Multi-factor risk assessment for supplier performance monitoring.

**Features:**
- Risk level filtering (Low/Medium/High)
- Risk factor breakdown chart
- Risk distribution visualization
- Risk score trend analysis (12 months)
- Supplier comparison view
- Risk threshold configuration
- Detailed risk scorecard

**API Endpoints:**
```
GET  /api/ml/suppliers/risks
POST /api/ml/suppliers/thresholds
GET  /api/ml/suppliers/performance-history
```

**Risk Factors:**
- Delivery Risk (days late average)
- Quality Risk (defect rate %)
- Price Risk (price variance %)

#### Defect Detection (`defect_detection/index.html`)

Computer vision for real-time textile defect identification.

**Features:**
- Image upload for defect detection
- Real-time defect classification
- Confidence scoring display
- Defect type distribution chart
- Trend analysis (7-day)
- Image gallery with detection results
- Production line filtering

**API Endpoints:**
```
POST /api/ml/defects/detect
GET  /api/ml/defects/history
POST /api/ml/defects/classify
GET  /api/ml/defects/trends
```

**Defect Types:**
- Hole
- Stain
- Tear
- Wrinkle
- Color Defect

#### Quality Prediction (`quality_prediction/index.html`)

Batch quality score prediction with root cause analysis.

**Features:**
- Batch selection and filtering
- Quality score distribution
- Feature importance visualization
- Root cause analysis panel
- Quality trend analysis (30 days)
- Material type comparison
- Batch quality predictions table

**API Endpoints:**
```
GET  /api/ml/quality/predict
GET  /api/ml/quality/batch/{batch_id}
POST /api/ml/quality/thresholds
GET  /api/ml/quality/root-causes
```

**Quality Thresholds:**
- Pass: ≥90%
- Warning: 70-89%
- Fail: <70%

### 3. ML Hub Dashboard (`index.html`)

Central hub linking all ML models with performance overview.

**Features:**
- Quick stats overview (accuracy, savings, risk count)
- Quick action buttons to all ML models
- AI models card grid
- Model performance metrics
- Recent activity feed
- System status indicators

## Integration Points

### Authentication

All API calls require authentication via Bearer token:

```javascript
// Set token after login
localStorage.setItem('auth_token', token);

// Token is automatically included in all API requests
// via Authorization header: "Bearer {token}"
```

### API Configuration

Configure API endpoints in `shared/api-client.js`:

```javascript
class MLApiClient {
    constructor() {
        this.baseURL = '/api/ml/';  // Change as needed
        this.timeout = 30000;        // 30 seconds
    }
    
    setBaseURL(url) {
        this.baseURL = url;
    }
}
```

### Data Flow

```
User Interface (ML Model UI)
    ↓
State Management (state object)
    ↓
API Client / Mock Data
    ↓
Backend API / Mock Data Generator
    ↓
Update State & Re-render Charts/Tables
```

### Error Handling

All models include comprehensive error handling:

```javascript
try {
    const data = await state.api.getOptimizationData(filters);
    // Process data
} catch (error) {
    console.error('Error:', error);
    if (error instanceof APIError) {
        showAlert(`API Error: ${error.message}`, 'error');
    } else {
        showAlert('Unexpected error occurred', 'error');
    }
    
    // Fallback to mock data
    state.useMockData = true;
    // Retry with mock data
}
```

## Usage Examples

### Example 1: Access Demand Forecast

```html
<!-- Navigate to Demand Forecasting -->
<a href="/frontend/ml_models/demand_forecasting/index.html">View Forecasts</a>

<!-- Or use API directly -->
<script>
const api = new MLApiClient();
const forecast = await api.getDemandForecast({
    sku_code: 'POL-2024-001',
    date_range: 'last_90_days'
});
</script>
```

### Example 2: Toggle Mock Data

```javascript
// In any ML model page
const mockToggle = document.getElementById('mockDataToggle');
mockToggle.checked = true; // Enable mock data
state.useMockData = true;
loadData(); // Reload with mock data
```

### Example 3: Export Data

```javascript
// Export to CSV
Utils.exportToCSV(
    ['SKU', 'Category', 'Stock', 'Cost'],
    [
        ['POL-001', 'Raw Materials', 100, 5000],
        ['POL-002', 'Finished Goods', 50, 2500]
    ],
    'inventory-data.csv'
);
```

## Backend API Requirements

### Demand Forecasting Endpoints

```
GET /api/ml/demand-forecast/skus
Response: { skus: [{ sku_code, sku_name }] }

GET /api/ml/demand-forecast/{sku_code}?period=90
Response: { forecast_data: [...], metrics: {...} }

POST /api/ml/demand-forecast/retrain
Request: { sku_code, model_params }
Response: { status, training_time, accuracy }
```

### Inventory Optimization Endpoints

```
GET /api/ml/inventory/optimization
Query: { category, abc_category, warehouse }
Response: { skus: [...], summary: {...} }

POST /api/ml/inventory/parameters
Request: { lead_time, service_level, holding_cost, order_cost }
Response: { status, applied_parameters }
```

### Supplier Risk Scoring Endpoints

```
GET /api/ml/suppliers/risks
Query: { risk_level, category, region }
Response: { suppliers: [...], summary: {...} }

POST /api/ml/suppliers/thresholds
Request: { low_threshold, medium_threshold, alert_threshold }
Response: { status, updated_thresholds }
```

### Defect Detection Endpoints

```
POST /api/ml/defects/detect
Request: { image_file, production_line }
Response: { defect_type, confidence, location, severity }

GET /api/ml/defects/history
Query: { production_line, date_range, confidence_threshold }
Response: { detections: [...], summary: {...} }
```

### Quality Prediction Endpoints

```
GET /api/ml/quality/predict
Query: { quality_threshold, line, material }
Response: { batches: [...], summary: {...} }

GET /api/ml/quality/batch/{batch_id}
Response: { batch_info, quality_score, confidence, root_causes }
```

## Development Workflow

### 1. Development with Mock Data

```javascript
// Enable mock data in development
state.useMockData = true;

// Use mock data generator for all requests
const data = MockData.demandForecasting.skus;
```

### 2. Testing with Real API

```javascript
// Disable mock data
state.useMockData = false;

// API requests will use real backend
const data = await state.api.getDemandForecast(filters);
```

### 3. Switching Between Modes

```html
<!-- Use the toggle switch in UI -->
<label class="toggle-switch">
    <input type="checkbox" id="mockDataToggle" onchange="toggleMockData()" checked>
    <span>Use Mock Data</span>
</label>
```

## Performance Considerations

### Caching

```javascript
// Cache API responses
class MLApiClient {
    constructor() {
        this.cache = new Map();
    }
    
    getCached(key) {
        return this.cache.get(key);
    }
    
    setCached(key, data) {
        this.cache.set(key, data);
    }
}
```

### Pagination

For large datasets, implement pagination:

```javascript
const data = await state.api.getOptimizationData({
    page: 1,
    limit: 50,
    filters: {...}
});
```

### Chart Optimization

```javascript
// Limit chart data points for performance
const maxPoints = 100;
if (data.length > maxPoints) {
    data = data.slice(-maxPoints);
}
```

## Security

### Authentication Tokens

```javascript
// Store token securely
localStorage.setItem('auth_token', token);

// Include in all API requests
headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
}
```

### CORS Configuration

```javascript
// Backend should allow CORS from frontend domain
const api = new MLApiClient();
api.setBaseURL('https://api.example.com/api/ml/');
```

### Input Validation

```javascript
// Validate user input before sending to API
function validateFilters(filters) {
    if (filters.confidenceThreshold < 0 || filters.confidenceThreshold > 100) {
        throw new Error('Invalid confidence threshold');
    }
    return true;
}
```

## Troubleshooting

### Common Issues

**Issue: API endpoints returning 404**
- Check base URL in `api-client.js`
- Verify backend API is running
- Check token validity

**Issue: Charts not displaying**
- Ensure Chart.js is loaded
- Check browser console for errors
- Verify data format matches chart type

**Issue: Mock data not loading**
- Check `MockData` object is properly defined in `mock-data.js`
- Verify mock data toggle is enabled
- Check console for loading errors

### Debug Mode

```javascript
// Enable debug logging
class MLApiClient {
    request(method, endpoint, data = null) {
        console.log(`[DEBUG] ${method} ${this.baseURL}${endpoint}`);
        // ... rest of implementation
    }
}
```

## Deployment

### Production Checklist

- [ ] Update API base URL to production server
- [ ] Disable mock data in production
- [ ] Enable CORS for production domain
- [ ] Set up proper authentication/authorization
- [ ] Configure SSL/TLS for API endpoints
- [ ] Set up error monitoring and logging
- [ ] Configure data caching strategy
- [ ] Test all API endpoints
- [ ] Load testing for concurrent users
- [ ] Security audit

### Environment Configuration

```javascript
// Environment-based configuration
const ENV = process.env.NODE_ENV || 'development';

const config = {
    development: {
        apiBaseURL: 'http://localhost:5000/api/ml/',
        useMockData: true
    },
    production: {
        apiBaseURL: 'https://api.production.com/api/ml/',
        useMockData: false
    }
};

const apiClient = new MLApiClient();
apiClient.setBaseURL(config[ENV].apiBaseURL);
```

## Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] Advanced filtering and search
- [ ] Custom report generation
- [ ] Multi-user collaboration features
- [ ] Mobile responsive design improvements
- [ ] API rate limiting and throttling
- [ ] Advanced caching strategies
- [ ] ML model versioning
- [ ] A/B testing framework
- [ ] Performance analytics dashboard

## Support & Documentation

For questions or issues:
1. Check the troubleshooting section
2. Review API endpoint specifications
3. Check browser console for errors
4. Review mock data structure in `mock-data.js`
5. Contact development team

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** Production Ready
