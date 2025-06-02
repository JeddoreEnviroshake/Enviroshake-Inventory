import requests
import json
import time
from datetime import datetime

# Base URL from frontend .env file
BASE_URL = "https://02b5412a-cc40-4feb-b7fc-d0d47f6188cd.preview.emergentagent.com/api"

def test_root_endpoint():
    """Test the root endpoint to ensure the server is running."""
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Root Endpoint Test: {'PASSED' if response.status_code == 200 else 'FAILED'}")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Root Endpoint Test FAILED with error: {str(e)}")
        return False

def test_create_status_check():
    """Test creating a status check entry."""
    try:
        data = {"client_name": f"Test Client {datetime.now().isoformat()}"}
        response = requests.post(f"{BASE_URL}/status", json=data)
        print(f"Create Status Check Test: {'PASSED' if response.status_code == 200 else 'FAILED'}")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Create Status Check Test FAILED with error: {str(e)}")
        return False

def test_get_status_checks():
    """Test retrieving status check entries."""
    try:
        response = requests.get(f"{BASE_URL}/status")
        print(f"Get Status Checks Test: {'PASSED' if response.status_code == 200 else 'FAILED'}")
        print(f"Status Code: {response.status_code}")
        print(f"Response contains {len(response.json())} status check entries")
        return response.status_code == 200
    except Exception as e:
        print(f"Get Status Checks Test FAILED with error: {str(e)}")
        return False

def run_all_tests():
    """Run all tests and return overall result."""
    print("Starting Backend API Tests...")
    print("=" * 50)
    
    root_test = test_root_endpoint()
    print("=" * 50)
    
    create_test = test_create_status_check()
    print("=" * 50)
    
    get_test = test_get_status_checks()
    print("=" * 50)
    
    all_passed = root_test and create_test and get_test
    print(f"Overall Test Result: {'PASSED' if all_passed else 'FAILED'}")
    return all_passed

if __name__ == "__main__":
    run_all_tests()