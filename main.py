import sqlite3
import time
import uuid
import logging
import json
import hashlib
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from contextlib import asynccontextmanager
import os
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

DB_FILE = "payments.db"

# --- Database Helper Functions ---
def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with the payments table and ensure schema is up to date."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create table if it doesn't exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS payments (
            idempotency_key TEXT PRIMARY KEY,
            amount INTEGER,
            state TEXT,
            transaction_id TEXT,
            response_body TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Check for request_fingerprint column and add if missing (Migration)
    cursor.execute("PRAGMA table_info(payments)")
    columns = [info[1] for info in cursor.fetchall()]
    if 'request_fingerprint' not in columns:
        logger.info("Migrating database: Adding 'request_fingerprint' column.")
        cursor.execute("ALTER TABLE payments ADD COLUMN request_fingerprint TEXT")
    
    conn.commit()
    conn.close()
    logger.info("Database initialized.")

def generate_fingerprint(key: str, amount: int) -> str:
    """Generate a SHA-256 fingerprint from the request data."""
    raw_str = f"{key}:{amount}"
    return hashlib.sha256(raw_str.encode()).hexdigest()

# --- Pydantic Models ---
class PaymentRequest(BaseModel):
    idempotency_key: str
    amount: int
    simulate_outcome: str = "SUCCESS"  # SUCCESS, BANK_FAILURE, NETWORK_ERROR

# --- FastAPI App ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

# CORS Configuration
allowed_origins = os.getenv("CORS_ORIGIN", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the basic HTML UI."""
    try:
        with open("index.html", "r") as f:
            return f.read()
    except FileNotFoundError:
        return "<h1>index.html not found. Please create it.</h1>"

@app.post("/pay")
async def process_payment(payment: PaymentRequest):
    """
    Idempotent payment processing endpoint with reliability simulation.
    """
    key = payment.idempotency_key
    amount = payment.amount
    outcome = payment.simulate_outcome
    current_fingerprint = generate_fingerprint(key, amount)
    
    logger.info(f"Received payment request: Key='{key}', Amount={amount}, Outcome='{outcome}'")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 1. Check if idempotency key exists
        cursor.execute("SELECT * FROM payments WHERE idempotency_key = ?", (key,))
        existing_record = cursor.fetchone()

        if existing_record:
            stored_fingerprint = existing_record['request_fingerprint']
            state = existing_record['state']
            
            # --- FINGERPRINT VALIDATION ---
            # Validation: Amount + Key (Outcome is excluded from fingerprint to allow retrying with different outcome)
            if stored_fingerprint and stored_fingerprint != current_fingerprint:
                logger.warning(f"Fingerprint mismatch for Key='{key}'.")
                return JSONResponse(
                    content={"message": "Idempotency key reuse with different request data is not allowed"},
                    status_code=400
                )
            
            logger.info(f"Duplicate request detected for Key='{key}'. Current State: {state}")

            if state == 'COMPLETED':
                # Return cached response with updated message
                transaction_id = existing_record['transaction_id']
                logger.info(f"Transaction is already completed with the already done transaction key: {transaction_id}")
                
                response_data = json.loads(existing_record['response_body'])
                response_data['message'] = "Transaction already performed"
                return JSONResponse(content=response_data)
            
            elif state == 'PROCESSING':
                # Payment is still in progress
                logger.info(f"Request blocked: Key='{key}' is still processing")
                return JSONResponse(
                    content={"message": "Payment is still processing. Please try again later.", "state": "PROCESSING"},
                    status_code=409 
                )
            
            elif state == 'FAILED':
                # Allow retry! Fall through to processing logic.
                logger.info(f"Retrying FAILED transaction for Key='{key}'...")
                # We will update the row instead of inserting
                pass
        
        # 2. Start Processing (Insert or Update)
        try:
            if existing_record and existing_record['state'] == 'FAILED':
                cursor.execute(
                    "UPDATE payments SET state = 'PROCESSING', created_at = CURRENT_TIMESTAMP WHERE idempotency_key = ?",
                    (key,)
                )
            elif not existing_record:
                cursor.execute(
                    "INSERT INTO payments (idempotency_key, amount, state, request_fingerprint) VALUES (?, ?, ?, ?)",
                    (key, amount, 'PROCESSING', current_fingerprint)
                )
            conn.commit()
        except sqlite3.IntegrityError:
            # Race condition handling
            return JSONResponse(
                content={"message": "Concurrent request detected. Please retry."},
                status_code=409
            )

        # 3. Simulate Outcome
        logger.info(f"Simulating processing delay for Key='{key}' (Outcome: {outcome})...")
        time.sleep(2)  # Simulate delay

        if outcome == "BANK_FAILURE":
            logger.error(f"Simulating BANK_FAILURE for Key='{key}'")
            cursor.execute("UPDATE payments SET state = 'FAILED' WHERE idempotency_key = ?", (key,))
            conn.commit()
            return JSONResponse(
                content={"message": "Bank failure simulated. Retry allowed.", "state": "FAILED"},
                status_code=502 # Bad Gateway as a proxy for bank error
            )

        # For SUCCESS or NETWORK_ERROR, we generate the transaction
        transaction_id = str(uuid.uuid4())
        final_state = 'COMPLETED'
        
        response_data = {
            "message": "Payment successful",
            "transaction_id": transaction_id,
            "amount": amount,
            "state": final_state,
            "idempotency_key": key
        }
        response_json = json.dumps(response_data)

        # Update DB with final result
        cursor.execute(
            '''
            UPDATE payments 
            SET state = ?, transaction_id = ?, response_body = ? 
            WHERE idempotency_key = ?
            ''',
            (final_state, transaction_id, response_json, key)
        )
        conn.commit()
        
        if outcome == "NETWORK_ERROR":
            logger.warning(f"Simulating NETWORK_ERROR for Key='{key}'. Response saved but NOT sent.")
            # Simulate lost response by timing out or returning 504
            raise HTTPException(status_code=504, detail="Network Timeout Simulated")

        logger.info(f"Payment completed for Key='{key}'. Transaction ID: {transaction_id}")
        return JSONResponse(content=response_data)

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error processing payment: {e}")
        # Only rollback if we haven't committed the final state? 
        # Actually standard practice is to rollback on error, but we carefully committed steps.
        # If the UPDATE to COMPLETED failed, we want rollback.
        # If it succeeded but the "NETWORK_ERROR" raise happened, the data is safe.
        # We need to be careful not to rollback the 'COMPLETED' state if we intended to save it.
        # In the NETWORK_ERROR case, we successfully committed, then raised HTTPException. 
        # The 'finally' block handles close. 
        # The 'except Exception' block won't catch HTTPException (it inherits from Exception but FastAPI handles it? No, generic Exception catches it).
        # We should catch HTTPException separately above.
        conn.rollback()
        raise HTTPException(status_code=500, detail="Internal Server Error")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
