# Test API Endpoints
$baseUrl = "http://localhost/api/v1"

Write-Host "Testing Textile ERP API Endpoints..." -ForegroundColor Green
Write-Host "Base URL: $baseUrl`n" -ForegroundColor Cyan

# Test health endpoint
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost/health" -ErrorAction Stop -UseBasicParsing
    Write-Host "✓ Health: OK ($($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Health: FAILED - $_" -ForegroundColor Red
}

# Test procurement endpoints
Write-Host "`n2. Testing Procurement Endpoints..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/procurement/purchase-orders" -ErrorAction Stop -UseBasicParsing
    Write-Host "✓ Procurement POs: OK ($($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Procurement POs: FAILED - $_" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/procurement/suppliers" -ErrorAction Stop -UseBasicParsing
    Write-Host "✓ Procurement Suppliers: OK ($($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Procurement Suppliers: FAILED - $_" -ForegroundColor Red
}

# Test inventory endpoints
Write-Host "`n3. Testing Inventory Endpoints..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/inventory/materials" -ErrorAction Stop -UseBasicParsing
    Write-Host "✓ Inventory Materials: OK ($($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Inventory Materials: FAILED - $_" -ForegroundColor Red
}

# Test production endpoints
Write-Host "`n4. Testing Production Endpoints..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/production/work-orders" -ErrorAction Stop -UseBasicParsing
    Write-Host "✓ Production Work Orders: OK ($($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Production Work Orders: FAILED - $_" -ForegroundColor Red
}

# Test quality endpoints
Write-Host "`n5. Testing Quality Endpoints..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/quality/checks" -ErrorAction Stop -UseBasicParsing
    Write-Host "✓ Quality Checks: OK ($($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Quality Checks: FAILED - $_" -ForegroundColor Red
}

# Test sales endpoints
Write-Host "`n6. Testing Sales Endpoints..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/sales/orders" -ErrorAction Stop -UseBasicParsing
    Write-Host "✓ Sales Orders: OK ($($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Sales Orders: FAILED - $_" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/sales/customers" -ErrorAction Stop -UseBasicParsing
    Write-Host "✓ Sales Customers: OK ($($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Sales Customers: FAILED - $_" -ForegroundColor Red
}

Write-Host "`nAPI Testing Complete!" -ForegroundColor Green
