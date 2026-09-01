# 🚩 Admin Panel Backend API Specification — User Warning Strikes & Auto-Ban System

> **Document Version**: `v3.7.0 (User Moderation Specification)`  
> **Status**: APPROVED & LIVE IN PRODUCTION  
> **Target Audience**: Backend Engineers, Database Architects, Admin Panel Frontend Developers (`adminMock`)  
> **Production Base URL**: `https://digi-local-backend.onrender.com/api`  
> **Local Base URL**: `http://localhost:5000/api`  
> **Standard Timezone**: India Standard Time (IST, UTC+05:30)  

---

## 📋 Table of Contents
1. [Overview & Core Architecture](#1-overview--core-architecture)
2. [3-Strikes Auto-Ban Enforcement Rules](#2-3-strikes-auto-ban-enforcement-rules)
3. [Database Schema (`user_flags` & `users`)](#3-database-schema-user_flags--users)
4. [API Endpoints Summary](#4-api-endpoints-summary)
5. [Detailed Endpoint Specifications](#5-detailed-endpoint-specifications)
   - [5.1 Issue Warning Strike 🚩](#51-issue-warning-strike-)
   - [5.2 Fetch User Strike History](#52-fetch-user-strike-history)
   - [5.3 Reset / Clear User Warning Strikes](#53-reset--clear-user-warning-strikes)
   - [5.4 List All Flagged & Banned Users](#54-list-all-flagged--banned-users)
6. [Frontend UI Warning Modal Specifications](#6-frontend-ui-warning-modal-specifications)
7. [TypeScript Integration Code & DTOs](#7-typescript-integration-code--dtos)
8. [Standard Error Responses](#8-standard-error-responses)

---

## 1. Overview & Core Architecture

The **Warning Strikes & Flags System** allows platform administrators to manage resident compliance, enforce community guidelines, and prevent fraudulent behavior (*e.g., repeated non-payment of COD orders, abuse of store vendors, fake order placements*).

### Key Features:
- **Incremental Warning Counter (`flags_count`)**: Tracks active warning strikes issued to a resident account (`0`, `1`, `2`, `3`).
- **3-Strikes Auto-Ban Policy**: Upon receiving the 3rd strike, the backend automatically transitions the user account to `BANNED` status, revokes all active auth sessions, and blocks order checkout.
- **Audit Logging**: Every strike issued or reset is permanently logged with the issuing admin's credentials, timestamp, and justification reason.
- **Confirmation Prompts**: The frontend (`adminMock`) prompts admins with explicit warning alerts before issuing a strike or saving changes.

---

## 2. 3-Strikes Auto-Ban Enforcement Rules

The backend service MUST execute the following business logic whenever a strike is issued:

```
                  ┌──────────────────────────────┐
                  │ Admin Issues Warning Strike  │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                     flags_count = flags_count + 1
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
       flags_count < 3                 flags_count >= 3
  ┌──────────────────────────┐    ┌──────────────────────────┐
  │ Status remains ACTIVE    │    │ Status = "BANNED"        │
  │ is_banned = false        │    │ is_banned = true         │
  │ Return remaining strikes │    │ Revoke JWT Token Sessions│
  └──────────────────────────┘    │ Trigger Auto-Ban Email   │
                                  └──────────────────────────┘
```

### Business Logic Summary:
1. **Strike 1 (`flags_count = 1`)**: Account status remains `ACTIVE`. Response indicates `2` strikes remaining.
2. **Strike 2 (`flags_count = 2`)**: Account status remains `ACTIVE`. Response indicates `1` strike remaining.
3. **Strike 3 (`flags_count = 3`)**: **AUTO-BAN TRIGGERED!**
   - Backend MUST set `status = "BANNED"` and `is_banned = true`.
   - Backend MUST invalidate all active JWT refresh/access tokens for this user.
   - Resident mobile app and website MUST block checkout with HTTP `403 Forbidden` (`USER_BANNED`).
   - Response returns `was_banned = true`.

---

## 3. Database Schema (`user_flags` & `users`)

### PostgreSQL `user_flags` Table (Audit Log of Strikes)
```sql
CREATE TABLE IF NOT EXISTS user_flags (
    id SERIAL PRIMARY KEY,
    flag_id VARCHAR(64) UNIQUE NOT NULL,
    user_id VARCHAR(64) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    strike_number INT NOT NULL CHECK (strike_number BETWEEN 1 AND 3),
    reason TEXT NOT NULL,
    admin_id VARCHAR(64) NOT NULL,
    admin_email VARCHAR(128) NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### PostgreSQL `users` Table Updated Columns
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS flags_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE;
```

---

## 4. API Endpoints Summary

| HTTP Method | Endpoint Path | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/users/:userId/strike` | Issue a warning strike 🚩 (**Auto-Bans if `flags_count >= 3`**). |
| `GET` | `/api/admin/users/:userId/flags` | Fetch historical strikes log for a specific resident user. |
| `DELETE` | `/api/admin/users/:userId/strikes` | Reset / clear warning strikes and unban account if applicable. |
| `GET` | `/api/admin/users/flagged` | List all resident users currently holding strikes or banned due to strikes. |

---

## 5. Detailed Endpoint Specifications

### 5.1 Issue Warning Strike 🚩

Issues an incremental strike to a resident user. If the new strike count reaches 3, the backend MUST automatically ban the account.

- **Endpoint**: `POST /api/admin/users/:userId/strike`
- **Headers**:
  ```http
  Authorization: Bearer <ADMIN_JWT_TOKEN>
  Content-Type: application/json
  ```

#### Request Body
```json
{
  "reason": "Repeated non-payment of Cash-on-Delivery (COD) orders at doorstep.",
  "admin_email": "admin@digilocal.com",
  "admin_id": "sub_admin_007"
}
```

#### Success Response (`HTTP 200 OK` — Strike 1 or 2 Issued)
```json
{
  "success": true,
  "message": "Warning strike issued to user (1/3 strikes count).",
  "flags_count": 1,
  "remaining_strikes": 2,
  "was_banned": false,
  "data": {
    "user_id": "usr_708296",
    "name": "Garvit Sharma",
    "email": "garvit@gmail.com",
    "flags_count": 1,
    "status": "ACTIVE",
    "is_banned": false,
    "issued_strike": {
      "flag_id": "flg_992101",
      "strike_number": 1,
      "reason": "Repeated non-payment of Cash-on-Delivery (COD) orders at doorstep.",
      "issued_by": "admin@digilocal.com",
      "issued_at": "2026-09-01T18:35:00+05:30",
      "issued_at_readable": "01 Sep 2026, 06:35 pm IST"
    }
  }
}
```

#### Success Response (`HTTP 200 OK` — Strike 3 Auto-Ban Triggered)
```json
{
  "success": true,
  "message": "User reached 3 strikes and has been automatically BANNED from platform access.",
  "flags_count": 3,
  "remaining_strikes": 0,
  "was_banned": true,
  "data": {
    "user_id": "usr_708296",
    "name": "Garvit Sharma",
    "email": "garvit@gmail.com",
    "flags_count": 3,
    "status": "BANNED",
    "is_banned": true,
    "banned_at": "2026-09-01T18:35:10+05:30",
    "issued_strike": {
      "flag_id": "flg_992103",
      "strike_number": 3,
      "reason": "Abusive behavior towards delivery partner and refusal of order acceptance.",
      "issued_by": "admin@digilocal.com",
      "issued_at": "2026-09-01T18:35:10+05:30",
      "issued_at_readable": "01 Sep 2026, 06:35 pm IST"
    }
  }
}
```

---

### 5.2 Fetch User Strike History

Retrieves all historical warning strikes issued to a resident user.

- **Endpoint**: `GET /api/admin/users/:userId/flags`

#### Example Request
```http
GET /api/admin/users/usr_708296/flags HTTP/1.1
Host: digi-local-backend.onrender.com
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

#### Success Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "user_id": "usr_708296",
  "name": "Garvit Sharma",
  "flags_count": 2,
  "is_banned": false,
  "data": [
    {
      "flag_id": "flg_992102",
      "strike_number": 2,
      "reason": "Abusive behavior towards merchant vendor.",
      "admin_email": "admin@digilocal.com",
      "issued_at": "2026-08-25T14:20:00+05:30",
      "issued_at_readable": "25 Aug 2026, 02:20 pm IST"
    },
    {
      "flag_id": "flg_992101",
      "strike_number": 1,
      "reason": "Repeated non-payment of COD order at doorstep.",
      "admin_email": "support@digilocal.com",
      "issued_at": "2026-08-10T10:15:00+05:30",
      "issued_at_readable": "10 Aug 2026, 10:15 am IST"
    }
  ]
}
```

---

### 5.3 Reset / Clear User Warning Strikes

Clears warning strikes for a resident user (e.g. after a successful appeal) and optionally reactivates their account status.

- **Endpoint**: `DELETE /api/admin/users/:userId/strikes` or `POST /api/admin/users/:userId/reset-strikes`
- **Request Body**:
```json
{
  "reason": "User appeal accepted by administration board.",
  "reactivate_account": true,
  "admin_email": "admin@digilocal.com"
}
```

#### Success Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "message": "Warning strikes cleared and account reactivated.",
  "flags_count": 0,
  "data": {
    "user_id": "usr_708296",
    "name": "Garvit Sharma",
    "flags_count": 0,
    "status": "ACTIVE",
    "is_banned": false,
    "reset_at": "2026-09-01T18:36:00+05:30"
  }
}
```

---

### 5.4 List All Flagged & Banned Users

Lists all resident accounts holding active strikes or banned due to strikes.

- **Endpoint**: `GET /api/admin/users/flagged`
- **Query Parameters**:
  - `min_strikes` *(optional, integer, default: 1)*: Filter users with at least `N` strikes.
  - `is_banned` *(optional, boolean)*: Filter only banned users.

#### Example Request
```http
GET /api/admin/users/flagged?min_strikes=1 HTTP/1.1
Host: digi-local-backend.onrender.com
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

#### Success Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "user_id": "usr_708296",
      "name": "Garvit Sharma",
      "email": "garvit@gmail.com",
      "phone": "+919876543210",
      "society_name": "Greenwood Residency",
      "flags_count": 3,
      "status": "BANNED",
      "is_banned": true,
      "banned_at": "2026-09-01T18:35:10+05:30"
    },
    {
      "user_id": "usr_881204",
      "name": "Amit Patel",
      "email": "amit.p@gmail.com",
      "phone": "+919123456789",
      "society_name": "Bais Godam Heights",
      "flags_count": 2,
      "status": "ACTIVE",
      "is_banned": false,
      "last_strike_at": "2026-08-20T16:45:00+05:30"
    }
  ]
}
```

---

## 6. Frontend UI Warning Modal Specifications

To prevent accidental clicks, the frontend (`adminMock`) renders explicit confirmation prompts before issuing strikes:

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Confirm Strike Issuance                                  │
│ Target Account: Garvit Sharma (#usr_708296)                 │
├─────────────────────────────────────────────────────────────┤
│ 🚩 WARNING NOTICE:                                          │
│ Are you sure you want to issue a warning strike to Garvit   │
│ Sharma? Current Strike Count: (1/3 Strikes).                │
│                                                             │
│ Note: Reaching 3 strikes will automatically BAN the user    │
│ from placing orders across the DigiLocal platform.          │
├─────────────────────────────────────────────────────────────┤
│                    [ Cancel ]  [ Yes, Issue Strike 🚩 ]     │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. TypeScript Integration Code & DTOs

```typescript
export interface UserFlagDTO {
  flag_id: string;
  user_id: string;
  strike_number: number;
  reason: string;
  admin_email: string;
  issued_at: string;
  issued_at_readable: string;
}

export interface IssueStrikePayload {
  reason: string;
  admin_email: string;
  admin_id?: string;
}

export interface IssueStrikeResponse {
  success: boolean;
  message: string;
  flags_count: number;
  remaining_strikes: number;
  was_banned: boolean;
  data: {
    user_id: string;
    name: string;
    email: string;
    flags_count: number;
    status: 'ACTIVE' | 'BANNED' | 'SUSPENDED';
    is_banned: boolean;
    banned_at?: string;
    issued_strike: UserFlagDTO;
  };
}
```

---

## 8. Standard Error Responses

#### `HTTP 400 Bad Request` (Max Strikes Reached)
```json
{
  "success": false,
  "error": "MAX_STRIKES_REACHED",
  "message": "User already has 3 strikes and is currently BANNED."
}
```

#### `HTTP 404 Not Found`
```json
{
  "success": false,
  "error": "USER_NOT_FOUND",
  "message": "No resident user account found matching ID 'usr_999999'."
}
```

#### `HTTP 403 Forbidden` (User Banned Order Checkout Error)
```json
{
  "success": false,
  "error": "USER_BANNED",
  "message": "Your account has been banned due to receiving 3 warning strikes. Please contact support."
}
```
