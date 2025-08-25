#!/usr/bin/env python3
import requests
import json

def test_backend():
    base_url = "http://localhost:5000"
    
    print("Testing backend API...")
    
    # Test 1: Check if server is running
    try:
        response = requests.get(f"{base_url}/api/queue/status")
        print(f"✓ Server is running (Status: {response.status_code})")
        print(f"Response: {response.json()}")
    except requests.exceptions.ConnectionError:
        print("✗ Server is not running or not accessible")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    # Test 2: Add a test case to queue
    try:
        test_data = {
            "case_type": "DVRO",
            "user_name": "Test User",
            "user_email": "test@example.com",
            "phone_number": "555-1234",
            "language": "en"
        }
        
        response = requests.post(f"{base_url}/api/queue/join", json=test_data)
        print(f"✓ Added test case to queue (Status: {response.status_code})")
        result = response.json()
        print(f"Response: {result}")
        
        if result.get('success') and result.get('queue_number'):
            queue_number = result['queue_number']
            print(f"✓ Queue number generated: {queue_number}")
            
            # Test 3: Update progress
            progress_data = {
                "node_id": "test_node",
                "node_text": "Test progress update",
                "user_response": "Test response"
            }
            
            response = requests.post(f"{base_url}/api/queue/{queue_number}/progress", json=progress_data)
            print(f"✓ Updated progress (Status: {response.status_code})")
            print(f"Response: {response.json()}")
            
            # Test 4: Get updated queue status
            response = requests.get(f"{base_url}/api/queue/status")
            print(f"✓ Got updated queue status (Status: {response.status_code})")
            print(f"Response: {response.json()}")
            
            # Test 5: Complete the case
            complete_data = {"queue_number": queue_number}
            response = requests.post(f"{base_url}/api/queue/{queue_number}/complete", json=complete_data)
            print(f"✓ Completed case (Status: {response.status_code})")
            print(f"Response: {response.json()}")
            
        else:
            print("✗ Failed to get queue number from response")
            return False
            
    except Exception as e:
        print(f"✗ Error during queue operations: {e}")
        return False
    
    print("\n✓ All tests passed!")
    return True

if __name__ == "__main__":
    test_backend()
