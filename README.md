# Horizon Seekers – Reliable Payment Infrastructure Simulator

## 🚨 Problem Statement
Short, crisp, real-world example of duplicate payments due to retries, network failures, etc.

## 🎯 Our Goal
Guarantee exactly-once execution and eliminate duplicate payments.

## 🧩 Why This Project Matters
- Users get charged twice
- Merchants receive duplicate orders
- Refunds cause friction
- Bank reconciliation overhead

## 🏗️ Architecture Overview
(Insert diagram — I can generate one if you want)

## ⚙️ Features
✔ Idempotent payment execution  
✔ Safe retry handling  
✔ Bank failure handling  
✔ Network failure simulation  
✔ Fingerprint/intent validation  
✔ Audit logs  
✔ State machine visualization  
✔ Rich UI simulator  

## 🖥️ Tech Stack
Frontend: React  
Backend: FastAPI (Python)  
DB: SQLite  
Infra: (Render Deployment)  
Protocol: REST  
Pattern: Exactly-Once Semantics + Idempotency  

## 🧠 System Behavior
Bullet examples of:
- Success
- Retry
- Bank failure
- Network failure
- Fingerprint mismatch

## 🧠 Innovation Highlights
- Intent fingerprinting
- State-aware retries
- Idempotency key protocol
- Deduplication invariant
- Failure simulation

## 🔐 Security Considerations
- No storage of UPI or sensitive data
- Only metadata for reliability
- Tamper-evident logs possible future scope

## 🚀 Future Work
- UPI PSP integration layer
- Distributed ledger for audit
- Consistency model upgrade
- Backpressure retry queues
- Reconciliation module
