import requests
import time
import json

BASE_URL = "http://localhost:8000"
ENDPOINT = f"{BASE_URL}/pay"

def test_idempotency():
    idempotency_key = "unique-key-123"
    payload = {
        "idempotency_key": idempotency_key,
        "amount": 100
    }

    print("--- [TEST 1] Sending discovery request ---")
    try:
        response1 = requests.post(ENDPOINT, json=payload)
        print(f"Status Code: {response1.status_code}")
        print(f"Response: {response1.json()}")
        
        if response1.status_code == 200:
            tx_id1 = response1.json().get("transaction_id")
            print(f"Transaction ID 1: {tx_id1}")
        else:
            print("Failed Test 1")
            return

        print("\n--- [TEST 2] Sending duplicate request ---")
        response2 = requests.post(ENDPOINT, json=payload)
        print(f"Status Code: {response2.status_code}")
        print(f"Response: {response2.json()}")
        
        tx_id2 = response2.json().get("transaction_id")
        print(f"Transaction ID 2: {tx_id2}")

        if tx_id1 == tx_id2:
            print("\n[SUCCESS] Idempotency verified: Both requests returned the same transaction ID.")
        else:
            print("\n[FAILURE] Idempotency failed: Requests returned different transaction IDs.")

    except Exception as e:
        print(f"Error connecting to server: {e}")

if __name__ == "__main__":
    # Wait for server to start if needed (though we'll run it separately)
    test_idempotency()
