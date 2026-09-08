# 🛠️ Admin Panel Backend API Specification — Resident User Management & Orders

> **Document Version**: `v3.5.0 (User Management Specification)`  
> **Status**: APPROVED & LIVE IN PRODUCTION  
> **Target Audience**: Backend Engineers, Integration Engineers, Admin Panel Developers (`adminMock`)  
> **Production Base URL**: `https://digi-local-backend.onrender.com/api`  
> **Local Base URL**: `http://localhost:5000/api`  
> **Standard Timezone**: India Standard Time (IST, UTC+05:30)  

---

## 📋 Table of Contents
1. [Overview & Core Architecture](#1-overview--core-architecture)
2. [Global Standards & IST Timezone Format](#2-global-standards--ist-timezone-format)
3. [User Profile Schema Definition](#3-user-profile-schema-definition)
4. [API Endpoints Summary](#4-api-endpoints-summary)
5. [Detailed API Endpoints Specification](#5-detailed-api-endpoints-specification)
   - [5.1 List & Search Users](#51-list--search-users)
   - [5.2 Get User Profile Details](#52-get-user-profile-details)
   - [5.3 Create New User Account](#53-create-new-user-account)
   - [5.4 Edit / Update User Profile Details](#54-edit--update-user-profile-details)
   - [5.5 Issue Strike 🚩 (3-Strikes Auto-Ban Rule)](#55-issue-strike--3-strikes-auto-ban-rule)
   - [5.6 Update User Account Status (Ban / Unban / Block)](#56-update-user-account-status-ban--unban--block)
   - [5.7 Fetch Resident Order History (With Itemized Unit Prices & Addresses)](#57-fetch-resident-order-history-with-itemized-unit-prices--addresses)
   - [5.8 Fetch Resident Support Ticket Complaints](#58-fetch-resident-support-ticket-complaints)
   - [5.9 Fetch Resident Payment Transactions](#59-fetch-resident-payment-transactions)
   - [5.10 Fetch Resident Audit Logs](#510-fetch-resident-audit-logs)
6. [TypeScript Interfaces & Integration Examples](#6-typescript-interfaces--integration-examples)

---

## 1. Overview & Core Architecture

This document provides exact, comprehensive specifications for backend engineers to implement and update the **Resident User Management Module** in the DigiLocal Admin Panel (`adminMock`).

The User Management section enables administrators to:
1. Search, filter, and inspect resident user profiles across all registered housing societies.
2. Edit user account parameters (*Name, Email, Phone, Flat Number, Society Name, Area, City, Pincode, Address*).
3. Issue warning strikes 🚩 with an **automatic 3-strikes auto-ban policy**.
4. Ban, unban, or block user accounts with audit notifications.
5. Inspect complete itemized order logs (*Product items, Unit prices, Qty, Item totals, Subtotal, Delivery charge, Taxes, Promo discounts, IST Timestamps, Checkout delivery address*).
6. Track customer support tickets, payment gateway reference IDs, and compliance audit entries.

---

## 2. Global Standards & IST Timezone Format

Per specification **v3.3.0**, all timestamps returned by the backend MUST be in **India Standard Time (IST, +05:30)**:

- **`created_at` / `updated_at`**: ISO 8601 string with IST offset: `"2026-09-01T17:45:00+05:30"`
- **`created_at_readable`**: Human-formatted string: `"01 Sep 2026, 05:45 pm IST"`
- **Authentication**: All endpoints require an HTTP `Authorization` header with a Bearer token:
  ```http
  Authorization: Bearer <ADMIN_JWT_TOKEN>
  Content-Type: application/json
  ```

---

## 3. User Profile Schema Definition

The PostgreSQL `users` table and API response payloads MUST contain the following field names:

| Field Name | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `user_id` / `id` | `VARCHAR(64)` | Yes | Unique user identifier (e.g., `"usr_708296"`). |
| `name` | `VARCHAR(128)` | Yes | Full name of the resident. |
| `email` | `VARCHAR(128)` | Yes | Resident email address. |
| `phone` | `VARCHAR(20)` | Yes | 10-digit mobile phone number. |
| `flat` | `VARCHAR(64)` | No | Flat / Door number (e.g., `"Flat 402"`). |
| `society_id` | `VARCHAR(64)` | No | Associated Housing Society ID (e.g., `"soc_101"`). |
| `society_name` | `VARCHAR(128)` | No | Housing Society / Complex Name (e.g., `"Greenwood Residency"`). |
| `area` | `VARCHAR(128)` | No | Area / Sector Name (e.g., `"Sector 62 Commercial Area"`). |
| `city` | `VARCHAR(64)` | No | City (e.g., `"Noida"`, `"Jaipur"`). |
| `pincode` | `VARCHAR(10)` | No | 6-digit Pincode (e.g., `"201301"`). |
| `address` | `TEXT` | No | Complete residential address string. If null, frontend combines `[flat, society_name, area, city, pincode]`. |
| `status` | `VARCHAR(20)` | Yes | Account status: `"ACTIVE"`, `"BANNED"`, `"SUSPENDED"`, `"BLOCKED"`. |
| `flags_count` | `INTEGER` | Yes | Current strike count (`0` to `3`). Auto-bans user when set to `3`. |
| `is_banned` | `BOOLEAN` | Yes | `true` if account is currently banned from placing orders. |
| `total_orders` | `INTEGER` | No | Total lifetime orders completed by user. |
| `total_spent` | `NUMERIC(10,2)` | No | Total lifetime monetary spend in INR (₹). |
| `created_at` | `TIMESTAMP` | Yes | ISO 8601 timestamp in IST (`"2026-09-01T17:45:00+05:30"`). |
| `created_at_readable`| `VARCHAR(64)` | No | Formatted IST timestamp string (`"01 Sep 2026, 05:45 pm IST"`). |

---

## 4. API Endpoints Summary

| HTTP Method | Endpoint Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/users` | List, search, filter, and paginate resident users. |
| `GET` | `/api/admin/users/:userId` | Get complete single user profile details. |
| `POST` | `/api/admin/users` | Create a new resident user account. |
| `PUT` | `/api/admin/users/:userId` | Update editable user details (*Name, Email, Phone, Flat, Address, Status*). |
| `POST` | `/api/admin/users/:userId/strike` | Issue a warning strike 🚩 (**3-Strikes Auto-Ban Rule**). |
| `PUT` / `PATCH`| `/api/admin/users/:userId/status` | Ban, unban, or block user account. |
| `GET` | `/api/admin/users/:userId/orders` | Fetch resident's order history with itemized unit prices & checkout addresses. |
| `GET` | `/api/admin/users/:userId/tickets` | Fetch customer support complaints raised by or against this resident. |
| `GET` | `/api/admin/users/:userId/payments` | Fetch user payment transactions and gateway reference IDs. |
| `GET` | `/api/admin/users/:userId/audit-logs` | Fetch compliance audit trail for user account. |

---

## 5. Detailed API Endpoints Specification

### 5.1 List & Search Users

#### Request
- **Endpoint**: `GET /api/admin/users`
- **Query Parameters**:
  - `search` *(optional, string)*: Filter by name, email, phone, flat, or society name.
  - `status` *(optional, string)*: Filter by status (`"ACTIVE"`, `"BANNED"`, `"BLOCKED"`).
  - `society_id` *(optional, string)*: Filter users belonging to a specific housing society.
  - `page` *(optional, integer, default: 1)*: Page number for pagination.
  - `limit` *(optional, integer, default: 20)*: Number of users per page.

#### Example Request
```http
GET /api/admin/users?search=garvit&status=ACTIVE&page=1&limit=10 HTTP/1.1
Host: digi-local-backend.onrender.com
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

#### Success Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "count": 2,
  "total": 45,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "user_id": "usr_708296",
      "name": "Garvit Sharma",
      "email": "garvit@gmail.com",
      "phone": "+919876543210",
      "flat": "Flat 402, Block C",
      "society_id": "soc_101",
      "society_name": "Greenwood Residency",
      "area": "Sector 62",
      "city": "Noida",
      "pincode": "201301",
      "address": "Flat 402, Block C, Greenwood Residency, Sector 62, Noida, 201301",
      "status": "ACTIVE",
      "flags_count": 1,
      "is_banned": false,
      "total_orders": 18,
      "total_spent": 12450.50,
      "created_at": "2026-08-15T10:30:00+05:30",
      "created_at_readable": "15 Aug 2026, 10:30 am IST"
    },
    {
      "user_id": "usr_708297",
      "name": "Usher Malhotra",
      "email": "usher@gmail.com",
      "phone": "+918585858585",
      "flat": "Flat 101, Tower 4",
      "society_id": "soc_102",
      "society_name": "Bais Godam Heights",
      "area": "Bais Godam",
      "city": "Jaipur",
      "pincode": "302001",
      "address": "Flat 101, Tower 4, Bais Godam Heights, Jaipur, 302001",
      "status": "ACTIVE",
      "flags_count": 0,
      "is_banned": false,
      "total_orders": 5,
      "total_spent": 3200.00,
      "created_at": "2026-08-20T14:15:00+05:30",
      "created_at_readable": "20 Aug 2026, 02:15 pm IST"
    }
  ]
}
```

---

### 5.2 Get User Profile Details

#### Request
- **Endpoint**: `GET /api/admin/users/:userId`

#### Example Request
```http
GET /api/admin/users/usr_708296 HTTP/1.1
Host: digi-local-backend.onrender.com
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

#### Success Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "data": {
    "user_id": "usr_708296",
    "name": "Garvit Sharma",
    "email": "garvit@gmail.com",
    "phone": "+919876543210",
    "flat": "Flat 402, Block C",
    "society_id": "soc_101",
    "society_name": "Greenwood Residency",
    "area": "Sector 62",
    "city": "Noida",
    "state": "Uttar Pradesh",
    "pincode": "201301",
    "address": "Flat 402, Block C, Greenwood Residency, Sector 62, Noida, 201301",
    "status": "ACTIVE",
    "flags_count": 1,
    "is_banned": false,
    "total_orders": 18,
    "total_spent": 12450.50,
    "created_at": "2026-08-15T10:30:00+05:30",
    "created_at_readable": "15 Aug 2026, 10:30 am IST"
  }
}
```

---

### 5.3 Create New User Account

#### Request
- **Endpoint**: `POST /api/admin/users`
- **Request Body**:
```json
{
  "name": "Rohan Verma",
  "email": "rohan.v@gmail.com",
  "phone": "9812345678",
  "flat": "Flat 502, Tower B",
  "society_id": "soc_101",
  "society_name": "Greenwood Residency",
  "area": "Sector 62",
  "city": "Noida",
  "pincode": "201301",
  "address": "Flat 502, Tower B, Greenwood Residency, Sector 62, Noida, 201301"
}
```

#### Success Response (`HTTP 201 Created`)
```json
{
  "success": true,
  "message": "User account created successfully.",
  "data": {
    "user_id": "usr_992104",
    "name": "Rohan Verma",
    "email": "rohan.v@gmail.com",
    "phone": "+919812345678",
    "flat": "Flat 502, Tower B",
    "society_id": "soc_101",
    "society_name": "Greenwood Residency",
    "area": "Sector 62",
    "city": "Noida",
    "pincode": "201301",
    "address": "Flat 502, Tower B, Greenwood Residency, Sector 62, Noida, 201301",
    "status": "ACTIVE",
    "flags_count": 0,
    "is_banned": false,
    "total_orders": 0,
    "total_spent": 0,
    "created_at": "2026-09-01T18:30:00+05:30",
    "created_at_readable": "01 Sep 2026, 06:30 pm IST"
  }
}
```

---

### 5.4 Edit / Update User Profile Details

#### Request
- **Endpoint**: `PUT /api/admin/users/:userId`
- **Request Body**:
```json
{
  "name": "Garvit Sharma",
  "email": "garvit.updated@gmail.com",
  "phone": "9876543210",
  "flat": "Flat 402, Block C",
  "society_name": "Greenwood Residency",
  "area": "Sector 62 Commercial Hub",
  "city": "Noida",
  "pincode": "201301",
  "address": "Flat 402, Block C, Greenwood Residency, Sector 62 Commercial Hub, Noida, Uttar Pradesh, 201301",
  "status": "ACTIVE"
}
```

#### Success Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "message": "User account profile parameters saved successfully.",
  "data": {
    "user_id": "usr_708296",
    "name": "Garvit Sharma",
    "email": "garvit.updated@gmail.com",
    "phone": "+919876543210",
    "flat": "Flat 402, Block C",
    "society_name": "Greenwood Residency",
    "area": "Sector 62 Commercial Hub",
    "city": "Noida",
    "pincode": "201301",
    "address": "Flat 402, Block C, Greenwood Residency, Sector 62 Commercial Hub, Noida, Uttar Pradesh, 201301",
    "status": "ACTIVE",
    "flags_count": 1,
    "is_banned": false,
    "updated_at": "2026-09-01T18:31:00+05:30"
  }
}
```

---

### 5.5 Issue Strike 🚩 (3-Strikes Auto-Ban Rule)

> ⚠️ **CRITICAL BACKEND LOGIC**:
> When `POST /api/admin/users/:userId/strike` is called:
> 1. Increment `flags_count` by `1` (`flags_count = flags_count + 1`).
> 2. If `flags_count >= 3`, the backend **MUST automatically set `status = "BANNED"` and `is_banned = true`**.
> 3. Return `was_banned: true` when auto-ban triggers.

#### Request
- **Endpoint**: `POST /api/admin/users/:userId/strike`
- **Request Body**:
```json
{
  "reason": "Repeated fake order placement and refusal of COD payment at doorstep.",
  "admin_email": "admin@digilocal.com"
}
```

#### Success Response (`HTTP 200 OK` — Strike 1 or 2)
```json
{
  "success": true,
  "message": "Warning strike issued to user (2/3 strikes count).",
  "flags_count": 2,
  "was_banned": false,
  "data": {
    "user_id": "usr_708296",
    "name": "Garvit Sharma",
    "flags_count": 2,
    "status": "ACTIVE",
    "is_banned": false
  }
}
```

#### Success Response (`HTTP 200 OK` — 3rd Strike Auto-Ban Triggered)
```json
{
  "success": true,
  "message": "User reached 3 strikes and has been automatically BANNED from platform access.",
  "flags_count": 3,
  "was_banned": true,
  "data": {
    "user_id": "usr_708296",
    "name": "Garvit Sharma",
    "flags_count": 3,
    "status": "BANNED",
    "is_banned": true,
    "banned_at": "2026-09-01T18:32:00+05:30"
  }
}
```

---

### 5.6 Update User Account Status (Ban / Unban / Block)

#### Request
- **Endpoint**: `PUT /api/admin/users/:userId/status` or `PATCH /api/admin/users/:userId/status`
- **Request Body**:
```json
{
  "status": "BANNED",
  "reason": "Administrative security suspension due to fraudulent activity."
}
```

#### Success Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "message": "User account status updated to BANNED.",
  "data": {
    "user_id": "usr_708296",
    "name": "Garvit Sharma",
    "status": "BANNED",
    "is_banned": true,
    "updated_at": "2026-09-01T18:33:00+05:30"
  }
}
```

---

### 5.7 Fetch Resident Order History (With Itemized Unit Prices & Addresses)

> 📍 **v3.4.0 Specification**:
> Each order object MUST include the specific checkout delivery address (`delivery_address` / `full_address` / `flat` / `area` / `city` / `state` / `pincode`) entered at checkout, along with itemized product objects containing **`unit_price`** and **`item_total`**.

#### Request
- **Endpoint**: `GET /api/admin/users/:userId/orders`

#### Example Request
```http
GET /api/admin/users/usr_708296/orders HTTP/1.1
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
      "order_id": "ORD-6692",
      "user_id": "usr_708296",
      "vendor_id": 1216,
      "customer_name": "Garvit Sharma",
      "customer_phone": "+919876543210",
      "store_name": "FreshMart Grocery Store",
      "vendor_category": "Grocery & Daily Needs",
      "status": "COMPLETED",
      "payment_method": "UPI / Online",
      "payment_status": "PAID",
      "payment_ref": "pay_Lkw908123981",
      "flat": "wtp second floor",
      "area": "Bais Godam",
      "city": "Jaipur",
      "state": "Rajasthan",
      "pincode": "302001",
      "delivery_address": "wtp second floor, Jaipur, Rajasthan, 302001",
      "full_address": "wtp second floor, Jaipur, Rajasthan, 302001",
      "subtotal": 500.00,
      "delivery_charge": 40.00,
      "tax_amount": 25.00,
      "discount": 10.00,
      "total_amount": 555.00,
      "created_at": "2026-09-01T17:45:00+05:30",
      "created_at_readable": "01 Sep 2026, 05:45 pm IST",
      "items": [
        {
          "item_id": "item_101",
          "item_name": "Fortune Sunflower Oil 1L",
          "quantity": 2,
          "unit_price": 180.00,
          "price": 180.00,
          "item_total": 360.00
        },
        {
          "item_id": "item_102",
          "item_name": "Amul Butter 500g",
          "quantity": 1,
          "unit_price": 140.00,
          "price": 140.00,
          "item_total": 140.00
        }
      ]
    },
    {
      "order_id": "ORD-5427",
      "user_id": "usr_708296",
      "vendor_id": 1218,
      "customer_name": "Garvit Sharma",
      "customer_phone": "+919876543210",
      "store_name": "Flower's Point",
      "vendor_category": "Florist & Gifts",
      "status": "DELIVERED",
      "payment_method": "Razorpay Online",
      "payment_status": "PAID",
      "payment_ref": "pay_Mnx88230192",
      "flat": "Flat 402, Block C",
      "area": "Sector 62",
      "city": "Noida",
      "state": "Uttar Pradesh",
      "pincode": "201301",
      "delivery_address": "Flat 402, Block C, Greenwood Residency, Sector 62, Noida, 201301",
      "full_address": "Flat 402, Block C, Greenwood Residency, Sector 62, Noida, 201301",
      "subtotal": 1200.00,
      "delivery_charge": 50.00,
      "tax_amount": 60.00,
      "discount": 0.00,
      "total_amount": 1310.00,
      "created_at": "2026-08-28T11:20:00+05:30",
      "created_at_readable": "28 Aug 2026, 11:20 am IST",
      "items": [
        {
          "item_id": "item_301",
          "item_name": "Red Rose Bouquet (12 Stems)",
          "quantity": 1,
          "unit_price": 1200.00,
          "price": 1200.00,
          "item_total": 1200.00
        }
      ]
    }
  ]
}
```

---

### 5.8 Fetch Resident Support Ticket Complaints

#### Request
- **Endpoint**: `GET /api/admin/users/:userId/tickets`

#### Success Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "ticket_id": "TCK-8812",
      "ticket_number": "8812",
      "subject": "Delay in grocery delivery for Order #ORD-6692",
      "description": "Order delivered 45 minutes past estimated delivery window.",
      "category": "DELIVERY_DELAY",
      "status": "RESOLVED",
      "priority": "MEDIUM",
      "reporter_name": "Garvit Sharma",
      "reporter_email": "garvit@gmail.com",
      "created_at": "2026-09-01T17:55:00+05:30"
    }
  ]
}
```

---

### 5.9 Fetch Resident Payment Transactions

#### Request
- **Endpoint**: `GET /api/admin/users/:userId/payments`

#### Success Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "payment_id": "pay_Lkw908123981",
      "order_id": "ORD-6692",
      "amount": 555.00,
      "method": "UPI",
      "status": "SUCCESS",
      "gateway": "Razorpay",
      "created_at": "2026-09-01T17:45:05+05:30"
    }
  ]
}
```

---

### 5.10 Fetch Resident Audit Logs

#### Request
- **Endpoint**: `GET /api/admin/users/:userId/audit-logs`

#### Success Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "audit-9012",
      "action_type": "STATUS_CHANGE",
      "summary": "Issued Strike 1/3 to Garvit Sharma",
      "details": "Warning strike issued due to non-payment of COD order.",
      "user_email": "admin@digilocal.com",
      "timestamp": "2026-09-01T18:00:00+05:30"
    }
  ]
}
```

---

## 6. TypeScript Interfaces & Integration Examples

The following TypeScript code can be directly referenced by frontend & backend developers:

```typescript
export interface UserProfileDTO {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  flat?: string;
  society_id?: string;
  society_name?: string;
  area?: string;
  city?: string;
  pincode?: string;
  address?: string;
  status: 'ACTIVE' | 'BANNED' | 'SUSPENDED' | 'BLOCKED';
  flags_count: number;
  is_banned: boolean;
  total_orders?: number;
  total_spent?: number;
  created_at: string;
  created_at_readable?: string;
}

export interface OrderItemDTO {
  item_id: string | number;
  item_name: string;
  quantity: number;
  unit_price: number;
  price: number;
  item_total: number;
}

export interface UserOrderDTO {
  order_id: string;
  user_id: string;
  vendor_id: number;
  customer_name: string;
  customer_phone: string;
  store_name: string;
  vendor_category: string;
  status: string;
  payment_method: string;
  payment_status: string;
  payment_ref: string;
  flat?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  delivery_address: string;
  full_address: string;
  subtotal: number;
  delivery_charge: number;
  tax_amount: number;

#### `HTTP 500 Internal Server Error`
```json
{
  "success": false,
  "error": "INTERNAL_SERVER_ERROR",
  "message": "Database query execution failed while updating user strike count."
}
```
