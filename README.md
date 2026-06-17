# 🏦 Bank Ledger — Backend API
A robust, production-ready **banking backend** built with **Node.js**, **Express**, and **MongoDB**. It implements a **double-entry ledger system** for accurate and immutable financial record-keeping, complete with JWT authentication, idempotent transactions, and email notifications.
---
## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Server](#running-the-server)
- [API Reference](#-api-reference)
  - [Authentication](#authentication-apiauthroutes)
  - [Accounts](#accounts-apiaccountsroutes)
  - [Transactions](#transactions-apitransactionsroutes)
- [Data Models](#-data-models)
- [Architecture & Design Decisions](#-architecture--design-decisions)
- [Security](#-security)
---
## ✨ Features
- 🔐 **JWT-based Authentication** — Secure login/logout with token blacklisting
- 📒 **Double-Entry Ledger** — Every transaction creates immutable DEBIT & CREDIT entries
- ⚙️ **Atomic Transactions** — MongoDB sessions ensure all-or-nothing money transfers
- 🔁 **Idempotency Keys** — Prevent duplicate transactions on retries
- 📧 **Email Notifications** — Automatic emails on registration and transaction events
- 🛡️ **System User Role** — Privileged user for seeding initial funds
- 🚫 **Token Blacklisting** — Invalidated tokens are blocked on logout
---
## 🛠 Tech Stack
|
 Layer        
|
 Technology                          
|
|
--------------
|
-------------------------------------
|
|
 Runtime      
|
 Node.js (CommonJS)                  
|
|
 Framework    
|
 Express v5                          
|
|
 Database     
|
 MongoDB (via Mongoose v9)           
|
|
 Auth         
|
 JSON Web Tokens (
`jsonwebtoken`
)    
|
|
 Passwords    
|
`bcryptjs`
|
|
 Email        
|
 Nodemailer (Gmail SMTP)             
|
|
 Dev Server   
|
 Nodemon                             
|
|
 Config       
|
 dotenv                              
|
---
## 📁 Project Structure
```
bank-ledger/
├── server.js                   # Entry point — starts server & connects to DB
├── src/
│   ├── app.js                  # Express app setup, middleware, route mounting
│   ├── config/
│   │   └── db.js               # MongoDB connection logic
│   ├── controllers/
│   │   ├── auth.controller.js        # Register, Login, Logout
│   │   ├── account.controller.js     # Create account, get accounts, get balance
│   │   └── transaction.controller.js # Transfer funds, seed initial funds
│   ├── middleware/
│   │   └── auth.middleware.js        # JWT auth + System user guard
│   ├── models/
│   │   ├── user.model.js        # User schema (bcrypt password hashing)
│   │   ├── account.model.js     # Account schema + getBalance() via ledger aggregation
│   │   ├── transaction.model.js # Transaction schema with idempotency key
│   │   ├── ledger.model.js      # Immutable ledger entries (DEBIT/CREDIT)
│   │   └── blackList.model.js   # Blacklisted JWT tokens
│   └── services/
│       └── email.service.js     # Nodemailer transporter & email helpers
├── .env                        # Environment variables (not committed)
├── .gitignore
└── package.json
```
---
## 🚀 Getting Started
### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or local MongoDB instance)
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) enabled
### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/bank-ledger.git
cd bank-ledger
# Install dependencies
npm install
```
### Environment Variables
Create a `.env` file in the project root with the following keys:
```env
# MongoDB connection string
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/bank-ledger
# Secret key for signing JWT tokens
JWT_SECRET=your_super_secret_key
# Gmail credentials for Nodemailer
EMAIL_USER=your_email@gmail.com
PASSWORD=your_gmail_app_password
```
> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.
### Running the Server
```bash
# Development (with hot-reload via nodemon)
npm run dev
# Production
npm start
```
The server will start on **http://localhost:5000**.
---
## 📡 API Reference
All routes are prefixed with `/api`. Protected routes require a valid JWT token passed either as:
- A **cookie** named `token`, or
- An **Authorization** header: `Bearer <token>`
---
### Authentication `/api/auth/...`
#### `POST /api/auth/register`
Register a new user.
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```
**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "user": { ... }
}
```
---
#### `POST /api/auth/login`
Login and receive a JWT token.
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```
**Response:** `200 OK` — Sets a `token` cookie and returns the token.
---
#### `POST /api/auth/logout`
🔒 **Protected** — Invalidates the current token by blacklisting it.
**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```
---
### Accounts `/api/accounts/...`
#### `POST /api/accounts`
🔒 **Protected** — Create a new bank account for the authenticated user.
**Request Body:**
```json
{
  "currency": "INR"
}
```
**Response:** `201 Created`
---
#### `GET /api/accounts`
🔒 **Protected** — Retrieve all accounts belonging to the authenticated user.
**Response:** `200 OK`
```json
[
  {
    "_id": "account_id",
    "user": "user_id",
    "status": "ACTIVE",
    "currency": "INR"
  }
]
```
---
#### `GET /api/accounts/balance/:accountId`
🔒 **Protected** — Get the real-time balance of a specific account, derived by aggregating ledger entries.
**Response:** `200 OK`
```json
{
  "balance": 5000
}
```
---
### Transactions `/api/transactions/...`
#### `POST /api/transactions`
🔒 **Protected** — Transfer funds between two accounts.
Implements a **10-step atomic transfer flow** using MongoDB sessions:
1. Validate request fields
2. Validate idempotency key (prevents duplicate transfers)
3. Check both accounts are `ACTIVE`
4. Verify sender has sufficient balance
5. Create transaction record (`PENDING`)
6. Create `DEBIT` ledger entry for sender
7. Create `CREDIT` ledger entry for receiver
8. Mark transaction as `COMPLETED`
9. Commit MongoDB session
10. Send email notification to sender
**Request Body:**
```json
{
  "fromAccount": "sender_account_id",
  "toAccount": "receiver_account_id",
  "amount": 1000,
  "idempotencyKey": "unique-client-generated-uuid"
}
```
**Response:** `201 Created`
```json
{
  "message": "Transaction completed successfully",
  "transaction": { ... }
}
```
---
#### `POST /api/transactions/system/inital-funds`
🔒 **System User Only** — Seed initial funds into a user's account from the system account. Used for bootstrapping new accounts.
**Request Body:**
```json
{
  "toAccount": "target_account_id",
  "amount": 10000,
  "idempotencyKey": "unique-client-generated-uuid"
}
```
**Response:** `201 Created`
---
## 🗄 Data Models
### User
|
 Field        
|
 Type    
|
 Notes                                
|
|
--------------
|
---------
|
--------------------------------------
|
|
`email`
|
 String  
|
 Unique, validated format             
|
|
`name`
|
 String  
|
 Required                             
|
|
`password`
|
 String  
|
 Hashed with bcrypt (min 6 chars)     
|
|
`systemUser`
|
 Boolean 
|
 Hidden field, immutable, default: false 
|
### Account
|
 Field      
|
 Type     
|
 Notes                                      
|
|
------------
|
----------
|
--------------------------------------------
|
|
`user`
|
 ObjectId 
|
 Ref to 
`User`
|
|
`status`
|
 String   
|
`ACTIVE`
 \| 
`FROZEN`
 \| 
`CLOSED`
|
|
`currency`
|
 String   
|
 Default: 
`INR`
|
> Balance is **not stored** on the account. It is computed in real-time via ledger aggregation.
### Transaction
|
 Field            
|
 Type     
|
 Notes                                           
|
|
------------------
|
----------
|
-------------------------------------------------
|
|
`fromAccount`
|
 ObjectId 
|
 Ref to 
`Account`
|
|
`toAccount`
|
 ObjectId 
|
 Ref to 
`Account`
|
|
`amount`
|
 Number   
|
 Must be positive                                
|
|
`status`
|
 String   
|
`PENDING`
 \| 
`COMPLETED`
 \| 
`FAILED`
 \| 
`REVERSED`
|
|
`idempotencyKey`
|
 String   
|
 Unique, client-generated                        
|
### Ledger Entry
|
 Field         
|
 Type     
|
 Notes                                
|
|
---------------
|
----------
|
--------------------------------------
|
|
`account`
|
 ObjectId 
|
 Ref to 
`Account`
, immutable          
|
|
`amount`
|
 Number   
|
 Immutable                            
|
|
`transaction`
|
 ObjectId 
|
 Ref to 
`Transaction`
, immutable      
|
|
`type`
|
 String   
|
`DEBIT`
 \| 
`CREDIT`
, immutable       
|
> ⚠️ Ledger entries are **strictly immutable** — all update/delete operations are blocked via Mongoose pre-hooks for audit and compliance.
---
## 🏗 Architecture & Design Decisions
### Double-Entry Bookkeeping
Every money transfer creates **two** ledger entries: a `DEBIT` from the sender and a `CREDIT` to the receiver. Account balances are always derived by aggregating these entries (`totalCredit - totalDebit`), providing a full, tamper-evident audit trail.
### Atomic Sessions
Fund transfers use **MongoDB multi-document transactions** (`session.startTransaction()` / `session.commitTransaction()`). If any step fails, the entire operation is rolled back automatically, preventing partial state.
### Idempotency
Each transaction requires a client-generated `idempotencyKey`. If the same key is submitted again, the server returns the existing transaction result instead of processing a duplicate payment — critical for retry safety in distributed systems.
### Token Blacklisting
On logout, the JWT is stored in a `blackList` collection. Every protected request checks this list before proceeding, ensuring logged-out tokens cannot be reused.
---
## 🔒 Security
- Passwords are hashed with **bcryptjs** (10 salt rounds) before storage
- The `password` and `systemUser` fields are excluded from all queries by default (`select: false`)
- JWTs are verified on every protected request, and blacklisted on logout
- The `systemUser` role is `immutable` and cannot be changed after creation
- `.env` secrets (DB URI, JWT secret, email credentials) are never exposed in source code
