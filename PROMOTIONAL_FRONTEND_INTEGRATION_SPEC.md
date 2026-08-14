# 📘 DigiLocal System Architecture & Main Frontend Integration Specification

**Document Title:** Main Frontend (User App, Vendor Portal & Promotional Web) Integration Guide  
**Target Audience:** Main Frontend Engineering Team & Full-Stack Developers  
**Backend Target Base URL (Testing):** `http://172.25.12.195:5001`  
**Backend Target Base URL (Production):** `https://digi-local-backend.onrender.com/api`  
**Version:** 2.0.0  

---

## 📄 Executive Summary & Architecture Overview

The **DigiLocal Platform** relies on a three-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│       Tier 1: Main Promotional & Client Frontend       │
│  • Resident Customer Mobile/Web App                     │
│  • Vendor Mobile/Web Portal                             │
│  • Promotional Landing Website                          │
└───────────────────────────┬─────────────────────────────┘
                            │
              HTTP / REST API Requests & Webhooks
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│               Tier 2: Production Backend                │
│             (Node.js / Express Server API)               │
│               http://172.25.12.195:5001                │
└───────────────────────────┬─────────────────────────────┘
                            │
              HTTP / REST API Requests & Admin RBAC
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│          Tier 3: DigiLocal Super Admin Panel            │
│  • System Governance & Operations Dashboard             │
│  • Vendor Application Approvals & RBAC Controls         │
│  • Support SLA Engine & Complaint Escalation            │
└─────────────────────────────────────────────────────────┘
```

### Core Data Flow Rule:
1. **Users & Vendors** interact **exclusively** with Tier 1 (Main Frontend), sending API requests to Tier 2 (Backend).
2. **Super Admins & Staff** interact with Tier 3 (Admin Dashboard), executing governance, approvals, and status overrides on Tier 2 (Backend).
3. Tier 2 (Backend) serves as the **Single Source of Truth**, broadcasting state changes, approvals, suspensions, and configuration flags between Tier 1 and Tier 3.

---

## 1. Global Integration Guidelines & Mandatory Headers

All API requests dispatched from Tier 1 (Main Frontend) to Tier 2 (Backend) MUST include mandatory headers for authentication and platform identification:

```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
Content-Type: application/json
Accept: application/json
X-Platform-Client: mobile_app | vendor_portal | landing_website
```

### Unified Backend Response Schema
All backend responses follow the standardized JSON envelope:

```json
{
  "success": true,
  "status_code": 200,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total_records": 100,
    "total_pages": 5
  },
  "timestamp": "2026-08-10T14:30:00.000Z"
}
```

---

## 2. Admin-Impacting Operations & Main Frontend Workflows

This section details every operation performed by the Admin Panel that impacts the Main Frontend experience for Users and Vendors.

---

### 🛍️ Workflow 1: Vendor Onboarding, Application Approval & Store Status

#### A. Vendor Application Submission (Main Frontend → Backend)
When a merchant registers on the Vendor Portal or Promotional Landing Page:
- **Main Frontend Call:** `POST /auth/vendor-register` or `POST /vendors/apply`
- **Request Body:**
  ```json
  {
    "store_name": "FreshBites Daily Grocery",
    "vendor_name": "Rajesh Sharma",
    "email": "rajesh.freshbites@gmail.com",
    "phone_number": "+91 98765 43210",
    "location": "Shop #12, Greenwood Commercial Block",
    "society_id": "soc-101",
    "gst_number": "07AAAAA0000A1Z5",
    "subscription_tier": "pro"
  }
  ```
- **Initial Status:** Vendor account is created with `status = "pending"`.
- **Main Frontend State:** Display screen: *"Your store application is under Admin review. You will be notified upon approval."*

#### B. Admin Approval / Rejection (Admin Panel → Backend)
Admin inspects the application in the Admin Dashboard:
- **Approve:** Admin calls `POST /admin/requests/:vendorId/approve`
- **Reject:** Admin calls `POST /admin/requests/:vendorId/reject` with `{ "reason": "Invalid GST documentation" }`

#### C. Main Frontend Behavior on Status Change
1. **Upon Approval (`status = "ACTIVE"`)**:
   - Vendor can log in to Vendor Portal.
   - Merchant store appears in the Resident User App under their assigned Society.
   - Products are indexable and ready for customer orders.
2. **Upon Rejection (`status = "REJECTED"`)**:
   - Vendor portal displays rejection screen with reason provided by Admin.
3. **Upon Admin Suspension (`status = "SUSPENDED"`)**:
   - Admin calls `POST /admin/vendors/:vendorId/status` with `status = "suspended"`.
   - **Immediate Impact:** Vendor store is hidden from Resident User App. Active product listings become unavailable for purchase. Vendor login displays: *"Account suspended by Administrator."*

---

### 🏙️ Workflow 2: Housing Societies & Residential Enclaves Directory

#### A. Society Listing & User/Vendor Alignment
- **Main Frontend Endpoint:** `GET /societies` or `GET /api/v1/societies`
- Returns active societies where residents reside and vendors operate.

#### B. Admin Society Management (Admin Panel → Backend)
1. **New Society Registration**:
   - Admin registers a new enclave via `POST /admin/societies`.
   - Main Frontend dropdowns for User/Vendor registration immediately include the new society.
2. **Society Suspension / Enclave Lock**:
   - Admin toggles society status via `POST /admin/societies/:societyId/status` (`active` ↔ `suspended`).
   - **Main Frontend Impact:** If a society is suspended by Admin, the backend automatically flags vendors servicing that society as `suspended`. Main Frontend displays notice to residents: *"Services in this enclave are temporarily paused for administrative maintenance."*

---

### 👤 Workflow 3: User Accounts, Dual-Role (User-Vendor) & Account Enforcement

#### A. Person Types & User Roles
The platform recognizes two primary resident roles in the User Directory:
1. `user` — Pure resident customer.
2. `user_vendor` — Dual-role profile (resident customer who also runs a home store/service).

#### B. Admin Enforcement & Strike Engine
- **Admin Action:** Admin inspects account CRM (`GET /admin/users/:userId`).
- **Issue Strike / Block:** Admin calls `POST /admin/users/:userId/block` with `{ "reason": "Repeated policy violations" }`.
- **Main Frontend Impact**:
  - Backend invalidates JWT access and refresh tokens.
  - User app session is terminated.
  - Subsequent API calls return `HTTP 403 Forbidden` with `{ "error": "ACCOUNT_BLOCKED", "message": "Your account has been suspended by Admin." }`.
- **Admin Unblock:** Admin calls `POST /admin/users/:userId/unblock`.
  - User can perform password reset or request login OTP on Main Frontend.

---

### 🎧 Workflow 4: Support Desk Intake Channels & SLA Engine

#### A. Support Ticket Submission by Channel

##### 1. User Complaint Submission (Landing Website / User App)
- **Main Frontend Endpoint:** `POST /support/tickets`
- **Request Body:**
  ```json
  {
    "user_type": "user",
    "source": "landing_website",
    "reporter_name": "Aarav Gupta",
    "reporter_email": "aarav@gmail.com",
    "subject": "Delayed Order Refund",
    "description": "Order #ORD-9842 was canceled but refund not received.",
    "category": "billing",
    "priority": "medium"
  }
  ```

##### 2. Vendor Dispute Submission (Vendor Portal / Mobile App)
- **Main Frontend Endpoint:** `POST /support/tickets`
- **Request Body:**
  ```json
  {
    "user_type": "vendor",
    "source": "vendor_portal",
    "reporter_name": "Rajesh Sharma",
    "reporter_email": "rajesh.freshbites@gmail.com",
    "entity_name": "FreshBites Daily Grocery",
    "subject": "Payout Settlement Query",
    "description": "Weekly settlement payout for Aug 1-7 is pending.",
    "category": "payouts",
    "priority": "high"
  }
  ```

#### B. Admin Response & Ticket Lifecycle
1. **Admin Reply**: Admin posts reply via `POST /support/tickets/:ticketId/reply`.
   - Backend notifies User/Vendor via Push Notification / In-App Message.
   - Main Frontend ticket detail screen updates thread with Admin response (`sender_role = "admin"`).
2. **Admin Priority Escalation**:
   - Admin escalates ticket via `POST /support/tickets/:ticketId/escalate`.
   - Backend SLA timer updates (`sla_minutes` reduced).
   - If ticket is already `URGENT`, backend returns `HTTP 422 Unprocessable Entity` (`BUSINESS_RULE_BREACH`).

---

### ⚙️ Workflow 5: Global Platform Configuration & Maintenance Mode

#### A. Config Fetch on App Launch (Main Frontend → Backend)
When User App, Vendor Portal, or Landing Web initializes, it MUST call:
- **Endpoint:** `GET /config`
- **Response Data:**
  ```json
  {
    "platform_name": "DigiLocal",
    "platform_logo": "https://cdn.digilocal.in/assets/logo.png",
    "maintenance_mode": false,
    "support_email": "support@digilocal.in",
    "support_phone": "+91 1800 123 4567",
    "max_upload_size_mb": 10,
    "default_currency": "INR",
    "timezone": "Asia/Kolkata"
  }
  ```

#### B. Admin Configuration Updates (Admin Panel → Backend)
Admin updates platform config via `PUT /config`:
- **Maintenance Mode Trigger (`maintenance_mode = true`)**:
  - Main Frontend MUST display full-screen Maintenance Banner: *"DigiLocal is currently undergoing scheduled maintenance. Please check back shortly."*
  - Blocks order placement and vendor transactions until `maintenance_mode = false`.
- **Support Contact Info Update**:
  - Updating `support_email` or `support_phone` in Admin Panel immediately updates contact footers on Landing Web and App.

---

### 📦 Workflow 6: Orders Telemetry & Audit Operations

#### A. Order Creation (Main Frontend → Backend)
- **Main Frontend Call:** `POST /orders`
- Order transitions: `PENDING` → `CONFIRMED` → `DISPATCHED` → `DELIVERED`.

#### B. Admin Telemetry & Refund Overrides
- Admin monitors order telemetry via `GET /admin/orders`.
- If an order dispute is escalated, Admin can issue a refund flag or order audit.
- Status update reflects on User App order tracking screen (`payment_status = "REFUNDED"`).

---

## 3. Comprehensive REST API Reference Summary

| Module | HTTP Method | Backend Endpoint | Trigger Source | Purpose & Main Frontend Impact |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/login` | Frontend | Authenticate Staff / User / Vendor |
| **Auth** | `POST` | `/auth/refresh` | Frontend | Refresh JWT Access Token |
| **Config** | `GET` | `/config` | Frontend | App launch config & Maintenance mode check |
| **Config** | `PUT` | `/config` | Admin Dashboard | Admin updates platform settings & banners |
| **Vendors** | `POST` | `/vendors/apply` | Vendor Portal | Submit store onboarding application |
| **Vendors** | `GET` | `/admin/requests` | Admin Dashboard | Admin views pending applications |
| **Vendors** | `POST` | `/admin/requests/:id/approve` | Admin Dashboard | Approve vendor store & publish to User App |
| **Vendors** | `POST` | `/admin/requests/:id/reject` | Admin Dashboard | Reject vendor application with reason |
| **Vendors** | `POST` | `/admin/vendors/:id/status` | Admin Dashboard | Suspend/Activate vendor store |
| **Societies** | `GET` | `/societies` | Main Frontend | List active residential enclaves |
| **Societies** | `POST` | `/admin/societies` | Admin Dashboard | Register new society enclave |
| **Societies** | `POST` | `/admin/societies/:id/status` | Admin Dashboard | Toggle society status (`active`/`suspended`) |
| **Users** | `GET` | `/admin/users` | Admin Dashboard | Admin User Directory (`user` & `user_vendor`) |
| **Users** | `POST` | `/admin/users/:id/block` | Admin Dashboard | Block abusive user & revoke App session |
| **Users** | `POST` | `/admin/users/:id/unblock` | Admin Dashboard | Restore user account access |
| **Support** | `POST` | `/support/tickets` | Main Frontend | Log complaint from Web (`landing_website`) or App (`vendor_portal`) |
| **Support** | `GET` | `/support/tickets/:id/messages` | Both | View support thread replies |
| **Support** | `POST` | `/support/tickets/:id/reply` | Both | Post message or Admin resolution reply |
| **Orders** | `GET` | `/admin/orders` | Admin Dashboard | Monitor commerce orders telemetry |

---

## 4. Error Handling & Standard Error Codes

When backend operations fail or business rules are breached, backend returns appropriate HTTP status codes:

| HTTP Status | Error Code | Meaning & Main Frontend Handling |
| :--- | :--- | :--- |
| `401 Unauthorized` | `INVALID_TOKEN` | Token expired; invoke `POST /auth/refresh` or redirect to login. |
| `403 Forbidden` | `ACCOUNT_SUSPENDED` | User/Vendor blocked by Admin; display suspension message. |
| `404 Not Found` | `RESOURCE_NOT_FOUND` | Requested entity does not exist. |
| `422 Unprocessable` | `BUSINESS_RULE_BREACH` | SLA violation (e.g. escalating ticket already URGENT); show toast message. |
| `503 Service Unavailable` | `MAINTENANCE_MODE` | Platform in maintenance; display Maintenance Screen. |

---

## 5. Contact & Support for Integration Engineers

For technical queries regarding this integration specification or backend testing endpoints, contact the DigiLocal Core Engineering Team:

- **Testing Network Base URL:** `http://172.25.12.195:5001`
- **Support Contact:** `support@digilocal.in`
- **Specification Version:** 2.0.0 (Production Verified)
