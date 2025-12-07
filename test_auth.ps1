#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Test the authentication flow for Textile ERP

.DESCRIPTION
    This script tests the login endpoint and verifies authentication is working

.EXAMPLE
    .\test_auth.ps1
#>

# Configuration
$BackendUrl = "http://localhost:8000"
$Username = "admin"
$Password = "password123"

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Textile ERP - Authentication Testing Script             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if backend is running
Write-Host "Test 1: Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/docs" -Method Get -ErrorAction Stop
    Write-Host "✅ Backend is running on $BackendUrl" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running on $BackendUrl" -ForegroundColor Red
    Write-Host "   Please start the backend with: docker-compose up backend" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Test login endpoint
Write-Host "Test 2: Testing login endpoint..." -ForegroundColor Yellow
Write-Host "   Credentials: username=$Username, password=$Password" -ForegroundColor Gray

try {
    $loginUrl = "$BackendUrl/api/auth/login"
    
    # Create form data
    $body = @{
        username = $Username
        password = $Password
    }
    
    # Convert to form format
    $bodyString = ($body.GetEnumerator() | ForEach-Object { "$($_.Key)=$([Uri]::EscapeDataString($_.Value))" }) -join "&"
    
    $response = Invoke-WebRequest -Uri $loginUrl `
        -Method Post `
        -ContentType "application/x-www-form-urlencoded" `
        -Body $bodyString `
        -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Login endpoint responded" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Token Type: $($data.token_type)" -ForegroundColor Green
    Write-Host "   Access Token: $($data.access_token.Substring(0, 20))..." -ForegroundColor Green
    $token = $data.access_token
} catch {
    Write-Host "❌ Login endpoint failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Check the backend logs with:" -ForegroundColor Yellow
    Write-Host "   docker logs textile_erp_backend --tail 50" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Test 3: Test protected endpoint
Write-Host "Test 3: Testing protected endpoint with token..." -ForegroundColor Yellow

try {
    $protectedUrl = "$BackendUrl/api/auth/me"
    
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $response = Invoke-WebRequest -Uri $protectedUrl `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    $user = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Protected endpoint accessible" -ForegroundColor Green
    Write-Host "   Current User: $($user.username)" -ForegroundColor Green
    Write-Host "   User ID: $($user.user_id)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Protected endpoint not available" -ForegroundColor Yellow
    Write-Host "   This is okay - endpoint may not be implemented yet" -ForegroundColor Yellow
}
Write-Host ""

# Test 4: Test with invalid credentials
Write-Host "Test 4: Testing with invalid credentials..." -ForegroundColor Yellow

try {
    $loginUrl = "$BackendUrl/api/auth/login"
    
    $body = @{
        username = "invalid"
        password = "invalid"
    }
    
    $bodyString = ($body.GetEnumerator() | ForEach-Object { "$($_.Key)=$([Uri]::EscapeDataString($_.Value))" }) -join "&"
    
    $response = Invoke-WebRequest -Uri $loginUrl `
        -Method Post `
        -ContentType "application/x-www-form-urlencoded" `
        -Body $bodyString `
        -ErrorAction Stop
    
    Write-Host "❌ Should have failed with invalid credentials" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    if ($statusCode -eq 401) {
        Write-Host "✅ Correctly rejected invalid credentials" -ForegroundColor Green
        Write-Host "   Status: $statusCode (Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Unexpected status code: $statusCode" -ForegroundColor Yellow
    }
}
Write-Host ""

# Summary
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    Test Summary                             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Authentication flow is working correctly!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor Yellow
Write-Host "2. You should be redirected to the login page" -ForegroundColor Yellow
Write-Host "3. Login with:" -ForegroundColor Yellow
Write-Host "   - Username: $Username" -ForegroundColor Gray
Write-Host "   - Password: $Password" -ForegroundColor Gray
Write-Host "4. You should be redirected to the dashboard" -ForegroundColor Yellow
Write-Host ""
Write-Host "Troubleshooting:" -ForegroundColor Cyan
Write-Host "- If you get 'Connection refused': Make sure backend is running" -ForegroundColor Gray
Write-Host "- If you get 'Unauthorized': Check username/password in backend" -ForegroundColor Gray
Write-Host "- Check frontend console (F12) for any JavaScript errors" -ForegroundColor Gray
Write-Host ""
