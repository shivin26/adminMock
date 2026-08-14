# DigiLocal Admin Panel — Enterprise Backend REST API Specification
> **Document Control & Architecture Standard**  
> **Author**: Principal Systems Architect (20+ Years Enterprise Engineering)  
> **Version**: `2.4.0-RELEASE`  
> **Status**: APPROVED FOR PRODUCTION IMPLEMENTATION  
> **Base URLs**:  
> - **Local Development**: `http://172.25.12.195:5001/api`  
> - **Staging / Cloud**: `https://digi-local-backend.onrender.com/api`  

---

## 📋 Table of Contents
1. [Architectural Guiding Principles & Engineering Standards](#1-architectural-guiding-principles--engineering-standards)
2. [Global Headers, Authentication & Envelope Specifications](#2-global-headers-authentication--envelope-specifications)
3. [Module 1: Authentication & Identity Management](#module-1-authentication--identity-management)
4. [Module 2: Residential Societies & Enclaves Management](#module-2-residential-societies--enclaves-management)
5. [Module 3: Vendor Store & Merchant Management](#module-3-vendor-store--merchant-management)
6. [Module 4: User & Resident Directory Management](#module-4-user--resident-directory-management)
7. [Module 5: Merchant Subscriptions & Billing Engine](#module-5-merchant-subscriptions--billing-engine)
8. [Module 6: Payment Ledger, Financial Revenue & Refunds](#module-6-payment-ledger-financial-revenue--refunds)
9. [Module 7: Hero Carousels & Promotional Banners](#module-7-hero-carousels--promotional-banners)
10. [Module 8: Sub-Admin Delegation & RBAC Permissions](#module-8-sub-admin-delegation--rbac-permissions)
11. [Module 9: Helpdesk & Support Desk Ticket System](#module-9-helpdesk--support-desk-ticket-system)
12. [Module 10: Executive Analytics & Telemetry Exports](#module-10-executive-analytics--telemetry-exports)
13. [Module 11: Real-Time Notification Center](#module-11-real-time-notification-center)
14. [Module 12: Compliance Audit Logs & Security Trails](#module-12-compliance-audit-logs--security-trails)
15. [Module 13: System Settings & Platform Configuration](#module-13-system-settings--platform-configuration)
16. [Production SQL Schemas (DDL & Indexes)](#production-sql-schemas-ddl--indexes)
17. [Senior Architect Non-Functional Requirements (NFRs)](#senior-architect-non-functional-requirements-nfrs)

---

## 1. Architectural Guiding Principles & Engineering Standards

1. **Strict RESTful Conventions**: Resource nouns are pluralized (e.g., `/api/societies`, `/api/vendors`). HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) dictate semantics explicitly.
2. **Idempotency Standards**: `PUT` and `DELETE` calls MUST be strictly idempotent. Financial state-modifying `POST` endpoints (e.g., `/api/payments/refund`) REQUIRE an `X-Idempotency-Key` header.
3. **Stateless JWT Authorization**: Session state is completely decoupled from the application tier. Access tokens expire in 15 minutes; refresh tokens use rolling 7-day expiration with single-use rotation.
4. **Predictable Payload Envelopes**: All responses adhere to a consistent root envelope schema regardless of resource type.
5. **Zero-Trust Input Validation**: All input contracts must be validated at API gateway boundaries using strict schema validation (e.g. Zod / Joi / Class-Validator) returning `422 Unprocessable Entity` with field-level details on failure.

---

## 2. Global Headers, Authentication & Envelope Specifications

### 2.1 Required Standard Request Headers
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
Content-Type: application/json
Accept: application/json
X-Platform-Client: admin_dashboard
X-Request-ID: req_99f2b801-4473-4c91-9e20-71a28a3f81e2
```

### 2.2 Standard Success Response Envelope (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {},
  "pagination": {
    "total": 128,
    "page": 1,
    "limit": 20,
    "total_pages": 7,
    "has_next": true,
    "has_prev": false
  },
  "timestamp": "2026-08-14T12:30:00.000Z",
  "request_id": "req_99f2b801-4473-4c91-9e20-71a28a3f81e2"
}
```

### 2.3 Standard Error Response Envelope (`400`, `401`, `403`, `404`, `422`, `500`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request payload failed field validation checks.",
    "details": [
      {
        "field": "phone",
        "issue": "Invalid phone format. Expected 10-digit numeric string."
      }
    ]
  },
  "timestamp": "2026-08-14T12:30:00.000Z",
  "request_id": "req_99f2b801-4473-4c91-9e20-71a28a3f81e2"
}
```

---

## Module 1: Authentication & Identity Management

### 1.1 Super Admin Login
- **Endpoint**: `POST /auth/login`
- **Auth Required**: No (Public)
- **Request Body**:
```json
{
  "email": "admin@digilocal.com",
  "password": "SuperSecretPassword123!"
}
```
- **Expected Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Authentication successful.",
  "data": {
    "user": {
      "id": "usr-admin-01",
      "name": "Super Administrator",
      "email": "admin@digilocal.com",
      "role": "SUPER_ADMIN",
      "permissions": ["ALL"]
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItYWRtaW4tMDEiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3ODYzNzI1OTAsImV4cCI6MTc4NjM3MzQ5MH0.sample_signature",
    "refresh_token": "def456uvw789_refresh_token_string",
    "expires_in": 900
  },
  "timestamp": "2026-08-14T12:30:00.000Z"
}
```
- **Expected Failure Response (`401 Unauthorized`)**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password combination."
  },
  "timestamp": "2026-08-14T12:30:00.000Z"
}
```

### 1.2 Refresh JWT Token
- **Endpoint**: `POST /auth/refresh`
- **Auth Required**: No
- **Request Body**:
```json
{
  "refresh_token": "def456uvw789_refresh_token_string"
}
```
- **Expected Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1Ni...new_access_token",
    "refresh_token": "def456uvw789...rotated_refresh_token",
    "expires_in": 900
  },
  "timestamp": "2026-08-14T12:30:00.000Z"
}
```

---

## Module 2: Residential Societies & Enclaves Management

### 2.1 List All Societies
- **Endpoint**: `GET /societies` (Fallback: `GET /admin/societies`)
- **Auth Required**: Bearer JWT (`SOCIETIES` permission)
- **Query Parameters**:
  - `search` *(optional, string)*: Filter by society name, code, city, or location address.
  - `page` *(optional, integer, default: 1)*: Page number.
  - `limit` *(optional, integer, default: 20)*: Page size limit.
  - `status` *(optional, string: `all`, `active`, `suspended`, `pending`)*: Filter status.
- **Expected Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Societies retrieved successfully.",
  "data": [
    {
      "society_id": 1,
      "society_name": "Greenwood Residency",
      "public_id": "SOC-GWH-01",
      "location": "Block A, Sector 62, Noida, Uttar Pradesh",
      "city": "Noida",
      "state": "Uttar Pradesh",
      "pincode": "201301",
      "secretary_name": "Ramesh Kumar",
      "secretary_mobile": "9876543210",
      "vendor_count": 5,
      "resident_count": 450,
      "status": "active",
      "created_at": "2026-01-15T08:30:00.000Z"
    },
    {
      "society_id": 22,
      "society_name": "Anupam apartment",
      "public_id": "SOC-ANP-22",
      "location": "Anupam Apartment, Jaipur, Rajasthan",
      "city": "Jaipur",
      "state": "Rajasthan",
      "pincode": "302015",
      "secretary_name": "Society Secretary",
      "secretary_mobile": "9876543210",
      "vendor_count": 4,
      "resident_count": 210,
      "status": "active",
      "created_at": "2026-02-10T10:15:00.000Z"
    }
  ],
  "pagination": {
    "total": 9,
    "page": 1,
    "limit": 20,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  },
  "timestamp": "2026-08-14T12:30:00.000Z"
}
```

### 2.2 Register New Society
- **Endpoint**: `POST /societies` (Fallback: `POST /admin/societies`)
- **Auth Required**: Bearer JWT (`SOCIETIES` write permission)
- **Request Body**:
```json
{
  "society_name": "Grand Sapphire Towers",
  "location": "Sector 128, Golf Course Expressway, Noida, UP",
  "secretary_name": "Vikramaditya Roy",
  "secretary_mobile": "9810012345",
  "pincode": "201304"
}
```
- **Expected Success Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Society registered successfully.",
  "data": {
    "society_id": 134,
    "society_name": "Grand Sapphire Towers",
    "public_id": "SOC-134",
    "location": "Sector 128, Golf Course Expressway, Noida, UP",
    "city": "Noida",
    "state": "UP",
    "pincode": "201304",
    "status": "active",
    "vendor_count": 0,
    "created_at": "2026-08-14T12:30:00.000Z"
  },
  "timestamp": "2026-08-14T12:30:00.000Z"
}
```

### 2.3 Update Society Details
- **Endpoint**: `PUT /societies/:society_id`
- **Auth Required**: Bearer JWT
- **Request Body**:
```json
{
  "society_name": "Grand Sapphire Towers & Enclave",
  "location": "Sector 128, Golf Course Expressway, Noida, UP"
}
```
- **Expected Success Response (`200 OK`)**: Standard envelope containing updated society object.

### 2.4 Toggle Society Block / Suspension Status
- **Endpoint**: `PATCH /societies/:society_id/status`
- **Auth Required**: Bearer JWT
- **Request Body**:
```json
{
  "status": "suspended",
  "reason": "Regulatory compliance audit pending."
}
```
- **Expected Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Society status updated to suspended.",
  "data": {
    "society_id": 134,
    "status": "suspended",
    "updated_at": "2026-08-14T12:30:00.000Z"
  }
}
```

---

## Module 3: Vendor Store & Merchant Management

### 3.1 List All Vendors
- **Endpoint**: `GET /admin/vendors` (Fallback: `GET /vendors`)
- **Auth Required**: Bearer JWT (`VENDORS` permission)
- **Query Parameters**:
  - `status` *(optional, string: `all`, `active`, `pending`, `suspended`)*: Filter status.
  - `limit` *(optional, integer, default: 1000)*: Limit.
  - `search` *(optional, string)*: Store name, owner name, phone, or society search.
- **Expected Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Vendors list retrieved successfully.",
  "data": [
    {
      "vendor_id": 437,
      "id": 437,
      "store_name": "Guptas and Sons",
      "owner_name": "Shivin",
      "email": "1786613798571@vendor.digilocal",
      "phone": "8005625999",
      "gstin": "07AAAAA140001Z5",
      "society_id": 18,
      "society_name": "DODO Residency",
      "subscription_tier": "pro",
      "renewal_date": "2026-12-30T18:30:00.000Z",
      "status": "active",
      "total_orders": 1420,
      "total_revenue": 245000.00,
      "avatar_url": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400",
      "created_at": "2026-07-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 31,
    "page": 1,
    "limit": 1000,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  },
  "timestamp": "2026-08-14T12:30:00.000Z"
}
```

### 3.2 List Pending Vendor Onboarding Applications
- **Endpoint**: `GET /admin/requests`
- **Expected Success Response (`200 OK`)**: Returns array of pending vendor DTO objects with submitted GSTIN & identity docs.

### 3.3 Approve Vendor Application
- **Endpoint**: `POST /admin/requests/:vendor_id/approve`
- **Auth Required**: Bearer JWT
- **Request Body**: `{}`
- **Expected Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Vendor application approved successfully.",
  "data": {
    "vendor_id": 111,
    "status": "active",
    "approved_at": "2026-08-14T12:30:00.000Z"
  }
}
```

### 3.4 Reject Vendor Application
- **Endpoint**: `POST /admin/requests/:vendor_id/reject`
- **Request Body**:
```json
{
  "rejection_reason": "GSTIN verification failed against Government GST portal registry."
}
```

### 3.5 Update Vendor Account Status (Suspend / Reactivate)
- **Endpoint**: `PATCH /vendors/:vendor_id/status`
- **Request Body**:
```json
{
  "status": "suspended"
}
```

---

## Module 4: User & Resident Directory Management

### 4.1 List All Platform Users
- **Endpoint**: `GET /admin/users` (Fallback: `GET /people`)
- **Auth Required**: Bearer JWT
- **Expected Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "usr_101",
      "name": "Shivin",
      "email": "lovelysethia53@gmail.com",
      "phone": "9764694949",
      "person_type": "user_vendor",
      "status": "active",
      "society_name": "Udb",
      "store_name": "Shop",
      "flags_count": 0,
      "registered_at": "2026-08-06T08:27:22.660Z"
    }
  ]
}
```

### 4.2 Issue Warning Strike (Flag Account)
- **Endpoint**: `POST /admin/users/:user_id/flag`
- **Request Body**:
```json
{
  "reason": "Spam comments on society community board."
}
```
- **Expected Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Warning strike issued successfully.",
  "data": {
    "user_id": "usr_101",
    "flags_count": 1,
    "status": "warned"
  }
}
```

---

## Module 5: Merchant Subscriptions & Billing Engine

### 5.1 List Active Merchant Subscriptions
- **Endpoint**: `GET /subscriptions`
- **Expected Success Response (`200 OK`)**: List of subscriptions with tier (`free`, `pro`, `enterprise`), billing cycle, and renewal dates.

### 5.2 Subscription Telemetry & MRR Summary
- **Endpoint**: `GET /subscriptions/stats`
- **Expected Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "mrr": 58450.00,
    "arr": 701400.00,
    "active_subscriptions": 980,
    "expiring_soon_15_days": 14,
    "tier_breakdown": {
      "free": 120,
      "pro": 650,
      "enterprise": 210
    }
  }
}
```

### 5.3 Manual Subscription Plan Upgrade / Renewal
- **Endpoint**: `POST /subscriptions/renew`
- **Request Body**:
```json
{
  "vendor_id": 90,
  "plan_tier": "enterprise",
  "billing_cycle": "annual",
  "payment_method": "INVOICE_OFFLINE"
}
```

---

## Module 6: Payment Ledger, Financial Revenue & Refunds

### 6.1 Payment Transactions Ledger
- **Endpoint**: `GET /payments/transactions`
- **Query Params**: `start_date`, `end_date`, `status`, `vendor_id`

### 6.2 Process Customer / Merchant Refund
- **Endpoint**: `POST /payments/refund`
- **Headers**: `X-Idempotency-Key: ref_uuid_12345`
- **Request Body**:
```json
{
  "transaction_id": "TXN-9001",
  "amount": 450.00,
  "reason": "Damaged perishable goods during delivery."
}
```
- **Expected Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Refund processed successfully via Razorpay API gateway.",
  "data": {
    "refund_id": "RFD-88201",
    "transaction_id": "TXN-9001",
    "amount": 450.00,
    "status": "PROCESSED",
    "processed_at": "2026-08-14T12:30:00.000Z"
  }
}
```

---

## Module 7: Hero Carousels & Promotional Banners

### 7.1 List Promotional Banners
- **Endpoint**: `GET /promotions` (Public) / `GET /admin/promotions` (Admin)

### 7.2 Create Promotional Banner
- **Endpoint**: `POST /admin/promotions`
- **Request Body**:
```json
{
  "title": "Independence Day Flash Discount",
  "description": "Flat 30% OFF on all organic grocery items across enclaves!",
  "image_url": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200",
  "target_type": "CATEGORY",
  "target_value": "Grocery & Organic Fresh",
  "placement": "HERO_SLIDER",
  "display_order": 1,
  "is_active": true
}
```

---

## Module 8: Sub-Admin Delegation & RBAC Permissions

### 8.1 Create Sub-Admin Account
- **Endpoint**: `POST /admin/sub-admins`
- **Request Body**:
```json
{
  "name": "Priya Sharma",
  "email": "priya.admin@digilocal.com",
  "phone": "+91 98123 45678",
  "role": "SOCIETY_ADMIN",
  "assigned_society_id": 1,
  "permissions": ["SOCIETIES_READ", "VENDORS_READ", "VENDORS_APPROVE"]
}
```

---

## Module 9: Helpdesk & Support Desk Ticket System

### 9.1 List Support Tickets
- **Endpoint**: `GET /support/tickets`
- **Query Params**: `status` (`open`, `in_progress`, `resolved`, `closed`), `priority`

### 9.2 Post Response Message to Ticket
- **Endpoint**: `POST /support/tickets/:ticket_id/messages`
- **Request Body**:
```json
{
  "message": "We have verified your store documents. Your account is now fully approved.",
  "sender_type": "ADMIN"
}
```

---

## Module 10: Executive Analytics & Telemetry Exports

### 10.1 Executive Dashboard Telemetry
- **Endpoint**: `GET /reports/telemetry`
- **Query Params**: `timeframe` (`daily`, `monthly`, `yearly`)

---

## Module 11: Real-Time Notification Center

### 11.1 Broadcast System-Wide Announcement
- **Endpoint**: `POST /notifications/broadcast`
- **Request Body**:
```json
{
  "title": "Platform Scheduled Maintenance",
  "message": "DigiLocal will undergo scheduled maintenance tonight from 2 AM to 4 AM IST.",
  "target_audience": "ALL_VENDORS"
}
```

---

## Module 12: Compliance Audit Logs & Security Trails

### 12.1 List Compliance Audit Trails
- **Endpoint**: `GET /audit-logs`
- **Query Params**: `actor_id`, `action`, `page`, `limit`

---

## Module 13: System Settings & Platform Configuration

### 13.1 Update Platform Configuration Parameters
- **Endpoint**: `PUT /settings`
- **Request Body**:
```json
{
  "gst_percentage": 18,
  "maintenance_mode": false,
  "currency": "INR",
  "platform_fee_percent": 2.5
}
```

---

## Production SQL Schemas (DDL & Indexes)

```sql
-- 1. SOCIETIES TABLE
CREATE TABLE societies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    secretary_name VARCHAR(255),
    secretary_mobile VARCHAR(50),
    status ENUM('active', 'inactive', 'suspended', 'pending') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_societies_status (status),
    INDEX idx_societies_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. VENDORS TABLE
CREATE TABLE vendors (
    vendor_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    gstin VARCHAR(20),
    society_id BIGINT,
    society_name VARCHAR(255),
    subscription_tier ENUM('free', 'pro', 'enterprise') DEFAULT 'pro',
    renewal_date TIMESTAMP NULL,
    status ENUM('active', 'pending', 'suspended', 'expired') DEFAULT 'pending',
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0.00,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE SET NULL,
    INDEX idx_vendors_status (status),
    INDEX idx_vendors_society (society_id),
    INDEX idx_vendors_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. USERS DIRECTORY TABLE
CREATE TABLE users (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    person_type ENUM('user', 'vendor', 'user_vendor', 'sub_admin') DEFAULT 'user',
    status ENUM('active', 'warned', 'banned', 'suspended') DEFAULT 'active',
    society_id BIGINT,
    society_name VARCHAR(255),
    flags_count INT DEFAULT 0,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE SET NULL,
    INDEX idx_users_person_type (person_type),
    INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Senior Architect Non-Functional Requirements (NFRs)

1. **P95 Latency SLA**: All standard read (`GET`) APIs MUST respond within **< 100ms** at P95 under standard operational load.
2. **Database Connection Pooling**: PostgreSQL / MySQL pools should maintain a maximum of 50 active pooled connections per node with automated health checks (`SELECT 1`).
3. **CORS Policy**: CORS headers MUST explicitly restrict origins to approved admin dashboard domains. Wildcard (`*`) origin headers are forbidden in production builds.
4. **OWASP Security Enforcement**: All API responses MUST inject OWASP security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security: max-age=31536000; includeSubDomains`.
