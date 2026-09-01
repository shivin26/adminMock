# 🚀 DIGILOCAL ADMIN PORTAL
## Sub-Admin Panel & Role-Based Access Control (RBAC) — Production Backend API & Architecture Specification

> **Document Version**: `v3.0.0 (Production Master)`  
> **Status**: APPROVED FOR BACKEND IMPLEMENTATION  
> **Target Audience**: Lead Backend Engineers, Database Architects, API Developers  
> **Module**: Sub-Admin Management, Multi-Tier Power Delegation, Parent-Child Hierarchy, Audit Ledger  
> **Protocol**: RESTful HTTP / JSON over TLS 1.3  
> **Base URL Path**: `/api/v1`  

---

### 📋 COMPREHENSIVE TABLE OF CONTENTS
1. [Executive Summary & System Architecture](#1-executive-summary--system-architecture)
2. [Authentication, JWT Claims & Session Authorization](#2-authentication-jwt-claims--session-authorization)
3. [Database Schema & ORM Model Definitions](#3-database-schema--orm-model-definitions)
   - [3.1 Relational SQL DDL Schema](#31-relational-sql-ddl-schema)
   - [3.2 Prisma ORM Schema Specification](#32-prisma-orm-schema-specification)
4. [RBAC Module Authorization Matrix](#4-rbac-module-authorization-matrix)
5. [Core Business Logic & Security Enforcements](#5-core-business-logic--security-enforcements)
6. [Complete REST API Endpoints Specification](#6-complete-rest-api-endpoints-specification)
   - [6.1 POST /auth/admin/login — Sub-Admin Login Authentication](#61-post-authadminlogin--sub-admin-login-authentication)
   - [6.2 GET /admin/subadmins — Fetch All Sub-Admin Accounts](#62-get-adminsubadmins--fetch-all-sub-admin-accounts)
   - [6.3 POST /admin/subadmins — Create Sub-Admin Account](#63-post-adminsubadmins--create-sub-admin-account)
   - [6.4 PUT /admin/subadmins/:id — Update Sub-Admin Powers & Delegation Ceiling](#64-put-adminsubadminsid--update-sub-admin-powers--delegation-ceiling)
   - [6.5 POST /admin/subadmins/:id/toggle-status — Toggle Account Active/Suspended Status](#65-post-adminsubadminsidtoggle-status--toggle-account-activesuspended-status)
   - [6.6 DELETE /admin/subadmins/:id — Revoke Sub-Admin Account Access](#66-delete-adminsubadminsid--revoke-sub-admin-account-access)
   - [6.7 POST /admin/audit-logs — Record Backend Action Audit Entry](#67-post-adminaudit-logs--record-backend-action-audit-entry)
   - [6.8 GET /admin/audit-logs — Super Admin Exclusive Audit Ledger](#68-get-adminaudit-logs--super-admin-exclusive-audit-ledger)
7. [Edge Cases & Backend Middleware Validation Suite](#7-edge-cases--backend-middleware-validation-suite)
8. [Standardized Error Codes & HTTP Response Schemas](#8-standardized-error-codes--http-response-schemas)

---

### 1. EXECUTIVE SUMMARY & SYSTEM ARCHITECTURE

The DigiLocal Admin Portal utilizes a multi-tier Role-Based Access Control (RBAC) architecture supporting 6 distinct power sections. The system empowers Super Admins to delegate granular operational capabilities to Sub-Admins and Sub-Admin Managers, while strictly preventing security breaches, power escalations, or unauthorized deletions.

```
                    ┌─────────────────────────────────────────┐
                    │            SUPER ADMIN ROOT             │
                    │        (Full Access / Audit View)       │
                    └────────────────────┬────────────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
      ┌─────────────────────────┐                 ┌─────────────────────────┐
      │     SUB-ADMIN MANAGER   │                 │     STANDARD SUB-ADMIN  │
      │  (e.g., Aarushi Verma)  │                 │    (e.g., Ananya Sharma) │
      │  Powers: SOCIETIES,     │                 │    Powers: SUBSCRIPTIONS│
      │  VENDORS, SUB_ADMINS    │                 └─────────────────────────┘
      └────────────┬────────────┘
                   │ (Delegates permitted powers)
                   ▼
      ┌─────────────────────────┐
      │    CHILD SUB-ADMINS     │
      │ (e.g. Raj Kumar, Jenga) │
      │ Powers: SOCIETIES,      │
      │ VENDORS, SUPPORT        │
      └─────────────────────────┘
```

---

### 2. AUTHENTICATION, JWT CLAIMS & SESSION AUTHORIZATION

Every authenticated request sent from the client MUST carry a Bearer JWT Token in the HTTP Authorization header:

```http
Authorization: Bearer <jwt_access_token>
Content-Type: application/json
Accept: application/json
```

#### Decoded JWT Payload Claims Format (`sub_admin` Token):
```json
{
  "sub": "sub-aarushi",
  "email": "aarushi.admin@digilocal.com",
  "name": "Aarushi Verma",
  "role": "sub_admin",
  "powers": ["SOCIETIES", "VENDORS", "SUB_ADMINS"],
  "allowed_delegation_powers": ["SOCIETIES", "VENDORS"],
  "created_by": "Super Admin",
  "creator_id": "super-admin",
  "created_role": "super_admin",
  "iat": 1788204000,
  "exp": 1788290400
}
```

---

### 3. DATABASE SCHEMA & ORM MODEL DEFINITIONS

#### 3.1 Relational SQL DDL Schema (PostgreSQL / MySQL)

```sql
-- 1. Enum Types
CREATE TYPE user_role_enum AS ENUM ('super_admin', 'sub_admin');
CREATE TYPE sub_admin_status_enum AS ENUM ('active', 'suspended');
CREATE TYPE power_section_enum AS ENUM ('SOCIETIES', 'VENDORS', 'SUBSCRIPTIONS', 'SUPPORT', 'SETTINGS', 'SUB_ADMINS');
CREATE TYPE audit_module_enum AS ENUM ('VENDORS', 'SOCIETIES', 'USERS', 'SUB_ADMINS', 'SUPPORT', 'SUBSCRIPTIONS', 'SETTINGS');
CREATE TYPE audit_action_enum AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'REPLY', 'ESCALATION');

-- 2. Sub-Admins Core Table
CREATE TABLE sub_admins (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'sub_admin',
    status sub_admin_status_enum NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(120) NOT NULL DEFAULT 'Super Admin',
    creator_id VARCHAR(64) NOT NULL DEFAULT 'super-admin',
    created_role user_role_enum NOT NULL DEFAULT 'super_admin'
);

-- 3. Delegated Power Sections Junction Table
CREATE TABLE sub_admin_powers (
    id SERIAL PRIMARY KEY,
    sub_admin_id VARCHAR(64) NOT NULL REFERENCES sub_admins(id) ON DELETE CASCADE,
    power_code power_section_enum NOT NULL,
    UNIQUE(sub_admin_id, power_code)
);

-- 4. Permitted Delegation Powers Ceiling Table (For Sub-Admin Managers)
CREATE TABLE sub_admin_allowed_delegation_powers (
    id SERIAL PRIMARY KEY,
    sub_admin_id VARCHAR(64) NOT NULL REFERENCES sub_admins(id) ON DELETE CASCADE,
    allowed_power_code power_section_enum NOT NULL,
    UNIQUE(sub_admin_id, allowed_power_code)
);

-- 5. Backend Mutation Audit Ledger Table
CREATE TABLE backend_audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    timestamp_readable VARCHAR(64) NOT NULL,
    user_email VARCHAR(160) NOT NULL,
    user_name VARCHAR(120) NOT NULL,
    user_role VARCHAR(32) NOT NULL,
    module audit_module_enum NOT NULL,
    action_type audit_action_enum NOT NULL,
    summary VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    entity_id VARCHAR(64),
    page_path VARCHAR(255) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_sub_admins_email ON sub_admins(email);
CREATE INDEX idx_sub_admins_creator ON sub_admins(creator_id);
CREATE INDEX idx_audit_logs_timestamp ON backend_audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_module ON backend_audit_logs(module);
```

#### 3.2 Prisma ORM Schema Specification

```prisma
model SubAdmin {
  id                      String              @id @default(uuid())
  name                    String
  email                   String              @unique
  passwordHash            String              @map("password_hash")
  role                    String              @default("sub_admin")
  status                  String              @default("active")
  createdAt               DateTime            @default(now()) @map("created_at")
  updatedAt               DateTime            @updatedAt @map("updated_at")
  createdBy               String              @default("Super Admin") @map("created_by")
  creatorId               String              @default("super-admin") @map("creator_id")
  createdRole             String              @default("super_admin") @map("created_role")
  powers                  SubAdminPower[]
  allowedDelegationPowers AllowedDelegation[]

  @@map("sub_admins")
}

model SubAdminPower {
  id         Int      @id @default(autoincrement())
  subAdmin   SubAdmin @relation(fields: [subAdminId], references: [id], onDelete: Cascade)
  subAdminId String   @map("sub_admin_id")
  powerCode  String   @map("power_code")

  @@unique([subAdminId, powerCode])
  @@map("sub_admin_powers")
}

model AllowedDelegation {
  id               Int      @id @default(autoincrement())
  subAdmin         SubAdmin @relation(fields: [subAdminId], references: [id], onDelete: Cascade)
  subAdminId       String   @map("sub_admin_id")
  allowedPowerCode String   @map("allowed_power_code")

  @@unique([subAdminId, allowedPowerCode])
  @@map("sub_admin_allowed_delegation_powers")
}

model AuditLog {
  id                String   @id @default(uuid())
  timestamp         DateTime @default(now())
  timestampReadable String   @map("timestamp_readable")
  userEmail         String   @map("user_email")
  userName          String   @map("user_name")
  userRole          String   @map("user_role")
  module            String
  actionType        String   @map("action_type")
  summary           String
  details           String
  entityId          String?  @map("entity_id")
  pagePath          String   @map("page_path")

  @@map("backend_audit_logs")
}
```

---

### 4. RBAC MODULE AUTHORIZATION MATRIX

The backend API authorization middleware MUST check the user's `role` and `powers` array before allowing access to any route:

| API Route Group | Required Role or Power Section Code | Description |
| :--- | :--- | :--- |
| `/api/v1/societies/*` | `super_admin` OR `powers.includes('SOCIETIES')` | Register, edit, delete residential societies & areas |
| `/api/v1/vendors/*` | `super_admin` OR `powers.includes('VENDORS')` | Review onboarding requests, approve/reject vendors, edit parameters |
| `/api/v1/subscriptions/*` | `super_admin` OR `powers.includes('SUBSCRIPTIONS')` | Financial renewals, billing plans, tax invoices |
| `/api/v1/support/*` | `super_admin` OR `powers.includes('SUPPORT')` | Support ticket responses, status changes, internal notes |
| `/api/v1/config/*` | `super_admin` OR `powers.includes('SETTINGS')` | Platform branding, logos, password updates |
| `/api/v1/admin/subadmins/*` | `super_admin` OR `powers.includes('SUB_ADMINS')` | Create, view, edit sub-admin permissions |
| `/api/v1/admin/audit-logs` (GET) | **STRICTLY `super_admin` ONLY** | Audit ledger access (Forbidden to sub-admins) |

---

### 5. CORE BUSINESS LOGIC & SECURITY ENFORCEMENTS

#### Rule 1: Delegation Power Ceiling Validation (Middleware Layer)
```typescript
function validateDelegationCeiling(requestorUser: User, targetPowers: string[]): boolean {
  if (requestorUser.role === 'super_admin') return true;

  // Sub-admins cannot grant SUB_ADMINS power
  if (targetPowers.includes('SUB_ADMINS')) return false;

  // Sub-admins can only grant powers listed in allowed_delegation_powers
  const allowedSet = requestorUser.allowedDelegationPowers || requestorUser.powers;
  return targetPowers.every(p => allowedSet.includes(p));
}
```

#### Rule 2: Parent-Only Revocation Security (Delete Middleware)
```typescript
function validateRevocationPermission(requestorUser: User, targetSubAdmin: SubAdminUser): boolean {
  if (requestorUser.role === 'super_admin') return true;

  // Sub-admin cannot delete themselves
  if (requestorUser.id === targetSubAdmin.id) return false;

  // Sub-admin can ONLY delete if they are the direct parent creator
  return targetSubAdmin.creatorId === requestorUser.id;
}
```

---

### 6. COMPLETE REST API ENDPOINTS SPECIFICATION

---

#### 6.1 `POST /auth/admin/login` — Sub-Admin Login Authentication
- **Method**: `POST`
- **Path**: `/api/v1/auth/admin/login`
- **Public Endpoint**: Yes

##### Request Body:
```json
{
  "email": "aarushi.admin@digilocal.com",
  "admin_secret": "SecurePassword123!"
}
```

##### Response Payload (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
  "refreshToken": "def456-refresh-token",
  "role": "sub_admin",
  "user": {
    "id": "sub-aarushi",
    "email": "aarushi.admin@digilocal.com",
    "name": "Aarushi Verma",
    "role": "sub_admin",
    "powers": ["SOCIETIES", "VENDORS", "SUB_ADMINS"],
    "allowed_delegation_powers": ["SOCIETIES", "VENDORS"]
  }
}
```

---

#### 6.2 `GET /admin/subadmins` — Fetch All Sub-Admin Accounts
- **Method**: `GET`
- **Path**: `/api/v1/admin/subadmins` (also `/api/v1/admin/sub-admins`)
- **Access Level**: Super Admin or Sub-Admin with `SUB_ADMINS` power.

##### Response Payload (`200 OK`):
```json
{
  "success": true,
  "message": "Sub-admin list retrieved",
  "data": [
    {
      "id": "sub-aarushi",
      "name": "Aarushi Verma",
      "email": "aarushi.admin@digilocal.com",
      "role": "sub_admin",
      "powers": ["SOCIETIES", "VENDORS", "SUB_ADMINS"],
      "allowed_delegation_powers": ["SOCIETIES", "VENDORS"],
      "status": "active",
      "created_at": "2026-08-01T11:00:00Z",
      "created_by": "Super Admin",
      "creator_id": "super-admin",
      "created_role": "super_admin"
    },
    {
      "id": "sub-raj",
      "name": "Raj Kumar",
      "email": "raj.admin@digilocal.com",
      "role": "sub_admin",
      "powers": ["SOCIETIES", "VENDORS"],
      "allowed_delegation_powers": [],
      "status": "active",
      "created_at": "2026-08-15T12:00:00Z",
      "created_by": "Sub-Admin Aarushi Verma",
      "creator_id": "sub-aarushi",
      "created_role": "sub_admin"
    }
  ]
}
```

---

#### 6.3 `POST /admin/subadmins` — Create Sub-Admin Account
- **Method**: `POST`
- **Path**: `/api/v1/admin/subadmins`
- **Access Level**: Super Admin or Sub-Admin with `SUB_ADMINS` power.

##### Request Body:
```json
{
  "name": "Raj Kumar",
  "email": "raj.admin@digilocal.com",
  "password": "Password123!",
  "powers": ["SOCIETIES", "VENDORS"],
  "allowed_delegation_powers": ["SOCIETIES"],
  "created_by": "Sub-Admin Aarushi Verma",
  "creator_id": "sub-aarushi",
  "created_role": "sub_admin"
}
```

##### Response Payload (`201 Created`):
```json
{
  "success": true,
  "message": "Sub-admin account created successfully",
  "data": {
    "id": "sub-raj",
    "name": "Raj Kumar",
    "email": "raj.admin@digilocal.com",
    "role": "sub_admin",
    "powers": ["SOCIETIES", "VENDORS"],
    "allowed_delegation_powers": ["SOCIETIES"],
    "status": "active",
    "created_at": "2026-09-01T13:10:00.000Z",
    "created_by": "Sub-Admin Aarushi Verma",
    "creator_id": "sub-aarushi",
    "created_role": "sub_admin"
  }
}
```

---

#### 6.4 `PUT /admin/subadmins/:id` — Update Sub-Admin Powers & Delegation Ceiling
- **Method**: `PUT`
- **Path**: `/api/v1/admin/subadmins/:id`
- **Access Level**: Super Admin or Sub-Admin with `SUB_ADMINS` power.

##### Request Body:
```json
{
  "powers": ["SOCIETIES", "VENDORS", "SUPPORT"],
  "allowed_delegation_powers": ["SOCIETIES", "VENDORS"],
  "status": "active"
}
```

##### Response Payload (`200 OK`):
```json
{
  "success": true,
  "message": "Sub-admin permissions updated",
  "data": {
    "id": "sub-raj",
    "name": "Raj Kumar",
    "email": "raj.admin@digilocal.com",
    "powers": ["SOCIETIES", "VENDORS", "SUPPORT"],
    "allowed_delegation_powers": ["SOCIETIES", "VENDORS"],
    "status": "active"
  }
}
```

---

#### 6.5 `POST /admin/subadmins/:id/toggle-status` — Toggle Account Active/Suspended Status
- **Method**: `POST`
- **Path**: `/api/v1/admin/subadmins/:id/toggle-status`

##### Request Body:
```json
{
  "status": "suspended"
}
```

##### Response Payload (`200 OK`):
```json
{
  "success": true,
  "message": "Sub-admin status updated to suspended",
  "subAdmin": {
    "id": "sub-raj",
    "status": "suspended"
  }
}
```

---

#### 6.6 `DELETE /admin/subadmins/:id` — Revoke Sub-Admin Account Access
- **Method**: `DELETE`
- **Path**: `/api/v1/admin/subadmins/:id`
- **Access Level**: Super Admin OR Direct Parent Creator (`creator_id === authenticated_user_id`).

##### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Sub-admin account revoked successfully"
}
```

---

#### 6.7 `POST /admin/audit-logs` — Record Backend Action Audit Entry
- **Method**: `POST`
- **Path**: `/api/v1/admin/audit-logs`

##### Request Body:
```json
{
  "user_email": "aarushi.admin@digilocal.com",
  "user_name": "Aarushi Verma",
  "user_role": "sub_admin",
  "module": "SUB_ADMINS",
  "action_type": "CREATE",
  "summary": "Created Sub-Admin account \"Raj Kumar\" (raj.admin@digilocal.com)",
  "details": "Assigned powers: SOCIETIES, VENDORS",
  "entity_id": "sub-raj",
  "page_path": "/dashboard/sub-admins",
  "timestamp": "2026-09-01T13:10:00.000Z"
}
```

---

#### 6.8 `GET /admin/audit-logs` — Super Admin Exclusive Audit Ledger
- **Method**: `GET`
- **Path**: `/api/v1/admin/audit-logs`
- **Access Level**: **Super Admin Exclusive ONLY (`role === 'super_admin'`)**.

##### Response Payload (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": "audit-1788204000000",
      "timestamp": "2026-09-01T13:10:00.000Z",
      "timestamp_readable": "01 Sep 2026, 01:10:00 PM",
      "user_email": "aarushi.admin@digilocal.com",
      "user_name": "Aarushi Verma",
      "user_role": "sub_admin",
      "module": "SUB_ADMINS",
      "action_type": "CREATE",
      "summary": "Created Sub-Admin account \"Raj Kumar\" (raj.admin@digilocal.com)",
      "details": "Assigned powers: SOCIETIES, VENDORS",
      "entity_id": "sub-raj",
      "page_path": "/dashboard/sub-admins"
    }
  ]
}
```

---

### 7. EDGE CASES & BACKEND MIDDLEWARE VALIDATION SUITE

The backend engineering team MUST write unit tests covering the following 6 critical edge cases:

1. **Attempting to Grant `SUB_ADMINS` Power by Non-Super-Admin**:
   - Sub-Admin requests `POST /admin/subadmins` with `powers: ["SUB_ADMINS"]`.
   - **Expected**: Reject with `403 FORBIDDEN_POWER_CEILING`.

2. **Granting Powers Exceeding Permitted Delegation List**:
   - Sub-Admin Aarushi (allowed: `["SOCIETIES", "VENDORS"]`) attempts to grant `["SUBSCRIPTIONS"]`.
   - **Expected**: Reject with `403 FORBIDDEN_DELEGATION_CEILING`.

3. **Self-Power Escalation Attempt**:
   - Sub-Admin Aarushi sends `PUT /admin/subadmins/sub-aarushi` to add `SUPPORT`.
   - **Expected**: Reject with `403 FORBIDDEN_SELF_ESCALATION`.

4. **Revocation by Non-Parent Sub-Admin**:
   - Sub-Admin Vikram attempts `DELETE /admin/subadmins/sub-raj` (created by Aarushi).
   - **Expected**: Reject with `403 FORBIDDEN_REVOCATION`.

5. **Audit Ledger Access by Sub-Admin**:
   - Sub-Admin Aarushi sends `GET /admin/audit-logs`.
   - **Expected**: Reject with `403 FORBIDDEN_SUPER_ADMIN_ONLY`.

6. **Self-Account Revocation Attempt**:
   - Sub-Admin Aarushi sends `DELETE /admin/subadmins/sub-aarushi`.
   - **Expected**: Reject with `400 BAD_REQUEST_SELF_REVOCATION`.

---

### 8. STANDARDIZED ERROR CODES & HTTP RESPONSE SCHEMAS

```json
{
  "success": false,
  "error": "FORBIDDEN_REVOCATION",
  "message": "Revocation Restricted: Only the Parent Sub-Admin Creator or Super Admin can delete this child sub-admin account."
}
```

| HTTP Code | Error Key | Description |
| :--- | :--- | :--- |
| `400` | `INVALID_PAYLOAD` | Missing required parameters or malformed JSON |
| `400` | `DUPLICATE_EMAIL` | Sub-admin email address already exists |
| `401` | `UNAUTHORIZED` | Missing or invalid Bearer JWT Token |
| `403` | `FORBIDDEN_POWER_CEILING` | Sub-admin attempted to grant SUB_ADMINS power |
| `403` | `FORBIDDEN_DELEGATION_CEILING` | Sub-admin granted powers outside permitted ceiling |
| `403` | `FORBIDDEN_SELF_ESCALATION` | Sub-admin attempted to edit their own powers |
| `403` | `FORBIDDEN_REVOCATION` | Non-parent sub-admin attempted account deletion |
| `403` | `FORBIDDEN_SUPER_ADMIN_ONLY` | Sub-admin attempted to access Super Admin Audit Log |
| `404` | `NOT_FOUND` | Sub-admin ID does not exist |

---
*End of Master Backend API Specification v3.0.0*
