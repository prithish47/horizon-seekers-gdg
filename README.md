# Fail-Safe Payment Processor

A robust, idempotent payment processing system designed to ensure exactly-once execution and prevent duplicate payments in distributed environments.

## 🚀 Overview
Fail-Safe Payment Processor is a reference implementation of an idempotent payment gateway. It solves the critical problem of duplicate transactions caused by network retries, bank failures, or intermittent connectivity issues. By implementing strict idempotency keys and request fingerprinting, the system guarantees that any given payment intent is processed exactly once.

## ✨ Key Features
- **Idempotent Execution**: Ensures that multiple requests with the same idempotency key do not result in duplicate transactions.
- **Request Fingerprinting**: Validates request parameters (e.g., amount) against the original intent to prevent key reuse with different data.
- **State-Aware Retries**: Safely handles retries for failed transactions while blocking concurrent requests for active ones.
- **Failure Simulation**: Built-in simulators for bank failures and network timeouts to test system resilience.
- **Real-Time Visualization**: A comprehensive dashboard to monitor transaction logs, state transitions, and audit trails.

## 🏗️ Architecture
The system follows a modern decoupled architecture:
- **Backend**: FastAPI (Python) with SQLite for persistent state management.
- **Frontend**: React (Vite) with real-time state visualization and log console.
- **Protocol**: REST with Idempotency-Key header support.

## 🛠️ Tech Stack
- **Frontend**: React, Lucide-React, Tailwind CSS
- **Backend**: FastAPI, Pydantic, SQLite
- **Deployment**: Configured for Render/Docker

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+

### Backend Setup
1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   python main.py
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🧠 System Behavior
The processor handles several real-world scenarios:
- **Success**: Payment is processed, transaction ID is generated, and result is cached.
- **Retry**: Subsequent requests with the same key receive the cached successful response.
- **Bank Failure**: Simulated bank error; the system marks the transaction as failed and allows a safe retry.
- **Network Error**: Simulated response loss; the server completes the transaction, but the client must retry to fetch the cached result.
- **Fingerprint Mismatch**: Prevents a key from being reused for a different amount (409 Conflict).

## 🔐 Security
- Uses SHA-256 fingerprinting for intent validation.
- Implements state-level isolation to prevent race conditions during concurrent processing.
- No storage of sensitive financial data (metadata only for reliability).

## 📝 License
MIT License
