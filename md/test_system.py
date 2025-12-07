"""
System Health Check Script
Tests all critical endpoints to verify the ERP system is functioning correctly.
"""

import requests
import sys
from datetime import datetime

API_BASE = "http://localhost:8000/api"

def print_status(test_name, success, message=""):
    """Print test result with color."""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} | {test_name}")
    if message:
        print(f"     └─ {message}")

def test_health_check():
    """Test basic health endpoint."""
    try:
        response = requests.get(f"{API_BASE.replace('/api', '')}/health", timeout=5)
        return response.status_code == 200, f"Status: {response.status_code}"
    except Exception as e:
        return False, str(e)

def test_login():
    """Test authentication and return token."""
    try:
        data = {
            "username": "admin",
            "password": "admin123"
        }
        response = requests.post(
            f"{API_BASE}/auth/login",
            data=data,
            timeout=5
        )
        if response.status_code == 200:
            token = response.json().get("access_token")
            return True, f"Token obtained: {token[:20]}...", token
        return False, f"Status: {response.status_code}", None
    except Exception as e:
        return False, str(e), None

def test_suppliers(token):
    """Test supplier endpoint."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/procurement/suppliers", headers=headers, timeout=5)
        if response.status_code == 200:
            count = len(response.json())
            return True, f"Found {count} suppliers"
        return False, f"Status: {response.status_code}"
    except Exception as e:
        return False, str(e)

def test_stock(token):
    """Test inventory stock endpoint."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/inventory/stock", headers=headers, timeout=5)
        if response.status_code == 200:
            count = len(response.json())
            return True, f"Found {count} stock items"
        return False, f"Status: {response.status_code}"
    except Exception as e:
        return False, str(e)

def test_materials(token):
    """Test materials endpoint."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/inventory/materials", headers=headers, timeout=5)
        if response.status_code == 200:
            count = len(response.json())
            return True, f"Found {count} materials"
        return False, f"Status: {response.status_code}"
    except Exception as e:
        return False, str(e)

def test_work_orders(token):
    """Test work orders endpoint."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/production/work-orders", headers=headers, timeout=5)
        if response.status_code == 200:
            count = len(response.json())
            return True, f"Found {count} work orders"
        return False, f"Status: {response.status_code}"
    except Exception as e:
        return False, str(e)

def test_inspections(token):
    """Test quality inspections endpoint."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/quality/inspections", headers=headers, timeout=5)
        if response.status_code == 200:
            count = len(response.json())
            return True, f"Found {count} inspections"
        return False, f"Status: {response.status_code}"
    except Exception as e:
        return False, str(e)

def test_customers(token):
    """Test customers endpoint."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/sales/customers", headers=headers, timeout=5)
        if response.status_code == 200:
            count = len(response.json())
            return True, f"Found {count} customers"
        return False, f"Status: {response.status_code}"
    except Exception as e:
        return False, str(e)

def test_dashboard(token):
    """Test dashboard KPIs endpoint."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/reports/dashboard", headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            return True, f"KPIs loaded: {', '.join(data.keys())}"
        return False, f"Status: {response.status_code}"
    except Exception as e:
        return False, str(e)

def test_reorder_alerts(token):
    """Test reorder alerts endpoint."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/inventory/reorder-alerts", headers=headers, timeout=5)
        if response.status_code == 200:
            count = len(response.json())
            return True, f"Found {count} reorder alerts"
        return False, f"Status: {response.status_code}"
    except Exception as e:
        return False, str(e)

def test_defect_types(token):
    """Test defect types endpoint."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/quality/defects/types", headers=headers, timeout=5)
        if response.status_code == 200:
            count = len(response.json())
            return True, f"Found {count} defect types"
        return False, f"Status: {response.status_code}"
    except Exception as e:
        return False, str(e)

def main():
    print("=" * 70)
    print("🏭 TEXTILE ERP - SYSTEM HEALTH CHECK")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    print()

    tests_passed = 0
    tests_failed = 0

    # Test 1: Health Check
    print("Testing API Health...")
    success, message = test_health_check()
    print_status("Health Check", success, message)
    if success:
        tests_passed += 1
    else:
        tests_failed += 1
    print()

    # Test 2: Authentication
    print("Testing Authentication...")
    success, message, token = test_login()
    print_status("Login (admin/admin123)", success, message)
    if success:
        tests_passed += 1
    else:
        tests_failed += 1
        print("\n❌ Cannot continue without authentication token")
        print_summary(tests_passed, tests_failed)
        sys.exit(1)
    print()

    # Test 3-10: Module Endpoints
    print("Testing Module Endpoints...")
    
    tests = [
        ("Procurement - Suppliers", lambda: test_suppliers(token)),
        ("Inventory - Stock Levels", lambda: test_stock(token)),
        ("Inventory - Materials", lambda: test_materials(token)),
        ("Production - Work Orders", lambda: test_work_orders(token)),
        ("Quality - Inspections", lambda: test_inspections(token)),
        ("Quality - Defect Types", lambda: test_defect_types(token)),
        ("Sales - Customers", lambda: test_customers(token)),
        ("Reports - Dashboard KPIs", lambda: test_dashboard(token)),
        ("Inventory - Reorder Alerts", lambda: test_reorder_alerts(token)),
    ]

    for test_name, test_func in tests:
        success, message = test_func()
        print_status(test_name, success, message)
        if success:
            tests_passed += 1
        else:
            tests_failed += 1

    print()
    print_summary(tests_passed, tests_failed)

    return 0 if tests_failed == 0 else 1

def print_summary(passed, failed):
    """Print test summary."""
    total = passed + failed
    print("=" * 70)
    print("📊 TEST SUMMARY")
    print("=" * 70)
    print(f"Total Tests:  {total}")
    print(f"✅ Passed:     {passed}")
    print(f"❌ Failed:     {failed}")
    print(f"Success Rate: {(passed/total*100):.1f}%")
    print("=" * 70)

    if failed == 0:
        print("\n🎉 All systems operational! The ERP is ready to use.")
        print("\n📝 Next Steps:")
        print("   1. Access web UI: http://localhost")
        print("   2. View API docs: http://localhost:8000/docs")
        print("   3. Login with: admin / admin123")
    else:
        print("\n⚠️  Some tests failed. Please check:")
        print("   1. Is Docker running? (docker-compose ps)")
        print("   2. Are all services up? (docker-compose logs)")
        print("   3. Is seed data loaded? (docker-compose exec backend python scripts/seed_data.py)")

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        sys.exit(1)
