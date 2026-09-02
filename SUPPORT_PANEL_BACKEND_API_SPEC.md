# ⚡ Master Support System Backend API Specification: Multi-App & Support Panel

> **Document Version**: `v5.0.0 (Unified Support Desk, User App, Vendor App & Website Specification)`  
> **Status**: APPROVED & LIVE IN PRODUCTION  
> **Base URL**: `https://digi-local-backend.onrender.com/api`  
> **Target Audience**: Backend Engineers, Support Desk Frontend Team (`adminMock`), Resident App Developers, Vendor App Developers  

---

## 📋 Executive Overview & Cross-Platform Architecture

The DigiLocal Support System provides unified, end-to-end ticketing across **all 3 platform ecosystems**:

1. **Admin Panel Support Desk (`adminMock`)**:  
   Full administrative control over all tickets, internal staff notes, priority escalations, ticket merging, SLA configuration, analytics KPIs, and follower assignments.
2. **Resident User App & Website (`user-app`)**:  
   Inbound ticket submission, order dispute filing, personal ticket history, and real-time customer reply messaging.
3. **Merchant Vendor App & Portal (`vendor-portal`)**:  
   Store inquiry submission, payout disputes, vendor-vs-user dispute management, and support response tracking.

---

## 📊 Database DDL Schema Specifications (PostgreSQL)

### 1. `support_tickets` Table
```sql
CREATE TABLE support_tickets (
    id VARCHAR(64) PRIMARY KEY,                     -- e.g. 't-1788287963713'
    ticket_number VARCHAR(32) NOT NULL UNIQUE,      -- Reference ID e.g. 'TICK-9082'
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,                  -- 'vendor_vs_user', 'vendor_vs_vendor', 'user_vs_vendor', 'technical', 'billing', 'onboarding', 'general'
    priority VARCHAR(32) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status VARCHAR(32) NOT NULL DEFAULT 'open',     -- 'open', 'in_progress', 'resolved', 'closed'
    user_type VARCHAR(32) NOT NULL DEFAULT 'user',  -- 'user', 'vendor', 'user_vendor'
    source VARCHAR(64) DEFAULT 'landing_website',   -- 'landing_website', 'mobile_app', 'vendor_portal'
    reporter_name VARCHAR(128) NOT NULL,
    reporter_email VARCHAR(128) NOT NULL,
    reporter_user_id VARCHAR(64),                   -- User ID or Vendor ID of creator
    entity_name VARCHAR(128),                       -- Society or Vendor Store name
    target_vendor VARCHAR(128),                     -- Reported vendor store name if dispute
    order_id VARCHAR(64),                           -- Associated Order ID e.g. 'ORD-9842'
    order_amount DECIMAL(10, 2),                    -- Order amount in INR e.g. 707.00
    assigned_to VARCHAR(128) DEFAULT 'Super Admin', -- Assigned Admin staff name
    sla_minutes_remaining INT DEFAULT 120,           -- SLA countdown in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at_ist TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at_readable VARCHAR(64),                -- e.g. '02 Sep 2026, 06:32 am IST'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. `ticket_messages` Table
```sql
CREATE TABLE ticket_messages (
    id VARCHAR(64) PRIMARY KEY,                     -- e.g. 'm-1788287963713'
    ticket_id VARCHAR(64) NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_name VARCHAR(128) NOT NULL,
    sender_role VARCHAR(32) NOT NULL,               -- 'admin', 'sub_admin', 'vendor', 'user'
    sender_avatar VARCHAR(255),
    message TEXT NOT NULL,
    is_internal_note BOOLEAN DEFAULT FALSE,        -- True if internal staff note (hidden from customer & vendor)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at_ist TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at_readable VARCHAR(64)
);
```

### 3. `ticket_attachments` Table
```sql
CREATE TABLE ticket_attachments (
    id VARCHAR(64) PRIMARY KEY,
    ticket_id VARCHAR(64) NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes INT NOT NULL,
    file_url VARCHAR(512) NOT NULL,
    uploaded_by VARCHAR(128) NOT NULL,
    uploaded_at_ist TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 📡 SECTION I: Admin Panel Support Desk API Endpoints (`adminMock`)

### 1. Fetch All Support Tickets (`GET /api/admin/support/tickets`)

#### Request Query Parameters:
- `status`: `all`, `open`, `in_progress`, `resolved`, `closed`
- `category`: `user_vs_vendor`, `billing`, `technical`, etc.
- `search`: `Garvit`, `TICK-9082`, `aarushi@gmail.com`

#### Response Example (`HTTP 200 OK`):
```json
{
  "code": 200,
  "status": "success",
  "message": "Support tickets retrieved successfully.",
  "data": [
    {
      "id": "t-1788287963713",
      "ticket_number": "TICK-9082",
      "subject": "Missing Item & Delayed Delivery Complaint",
      "description": "Customer reported 2 items missing from Order #ORD-9842 fulfilled by Aarushi Sweets.",
      "category": "user_vs_vendor",
      "priority": "high",
      "status": "in_progress",
      "user_type": "user",
      "source": "mobile_app",
      "reporter_name": "Garvit Sharma",
      "reporter_email": "garvit@gmail.com",
      "entity_name": "Greenwood Residency",
      "target_vendor": "Aarushi Sweets",
      "order_id": "ORD-9842",
      "order_amount": 707.00,
      "assigned_to": "Aarushi Admin",
      "sla_minutes_remaining": 45,
      "created_at": "2026-09-02T01:02:11.000Z",
      "created_at_ist": "2026-09-02T06:32:11+05:30",
      "created_at_readable": "02 Sep 2026, 06:32 am IST",
      "updated_at": "2026-09-02T06:45:00+05:30"
    }
  ]
}
```

---

### 2. Fetch Single Ticket Details (`GET /api/admin/support/tickets/:ticketId`)

#### Response Example (`HTTP 200 OK`):
```json
{
  "code": 200,
  "status": "success",
  "data": {
    "id": "t-1788287963713",
    "ticket_number": "TICK-9082",
    "subject": "Missing Item & Delayed Delivery Complaint",
    "description": "Customer reported 2 items missing from Order #ORD-9842 fulfilled by Aarushi Sweets.",
    "category": "user_vs_vendor",
    "priority": "urgent",
    "status": "open",
    "user_type": "user",
    "source": "mobile_app",
    "reporter_name": "Garvit Sharma",
    "reporter_email": "garvit@gmail.com",
    "entity_name": "Greenwood Residency",
    "target_vendor": "Aarushi Sweets",
    "order_id": "ORD-9842",
    "order_amount": 707.00,
    "assigned_to": "Super Admin",
    "sla_minutes_remaining": 15,
    "created_at": "2026-09-02T01:02:11.000Z",
    "created_at_ist": "2026-09-02T06:32:11+05:30",
    "created_at_readable": "02 Sep 2026, 06:32 am IST",
    "updated_at": "2026-09-02T06:32:11+05:30"
  }
}
```

---

### 3. Fetch Ticket Message History (`GET /api/support/tickets/:ticketId/messages`)

#### Response Example (`HTTP 200 OK`):
```json
{
  "code": 200,
  "status": "success",
  "data": [
    {
      "id": "m-101",
      "ticket_id": "t-1788287963713",
      "sender_name": "Garvit Sharma",
      "sender_role": "user",
      "sender_avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Garvit",
      "message": "I placed order #ORD-9842 but 2 milk packets were missing when rider delivered.",
      "is_internal_note": false,
      "created_at_ist": "2026-09-02T06:32:11+05:30",
      "created_at_readable": "02 Sep 2026, 06:32 am IST"
    },
    {
      "id": "m-102",
      "ticket_id": "t-1788287963713",
      "sender_name": "Super Admin",
      "sender_role": "admin",
      "message": "Internal Note: Verified store CCTV footage with merchant Aarushi Sweets.",
      "is_internal_note": true,
      "created_at_ist": "2026-09-02T06:40:00+05:30",
      "created_at_readable": "02 Sep 2026, 06:40 am IST"
    }
  ]
}
```

---

### 4. Admin Reply or Internal Staff Note (`POST /api/support/tickets/:ticketId/reply`)

#### Request Body:
```json
{
  "message": "We have verified dispatch logs and issued a ₹150 refund to your Razorpay wallet.",
  "is_internal_note": false,
  "new_status": "resolved"
}
```

#### Response Example (`HTTP 200 OK`):
```json
{
  "code": 200,
  "status": "success",
  "message": "Reply sent successfully.",
  "data": {
    "id": "m-178830012",
    "ticket_id": "t-1788287963713",
    "sender_name": "Super Admin",
    "sender_role": "admin",
    "message": "We have verified dispatch logs and issued a ₹150 refund to your Razorpay wallet.",
    "is_internal_note": false,
    "created_at_ist": "2026-09-02T12:50:00+05:30",
    "created_at_readable": "02 Sep 2026, 12:50 pm IST"
  }
}
```

---

### 5. Update Ticket Status / Priority / Assignee (`PATCH /api/admin/support/tickets/:ticketId/status`)

#### Request Body:
```json
{
  "status": "in_progress",
  "priority": "urgent",
  "assigned_to": "Aarushi Admin"
}
```

#### Response Example (`HTTP 200 OK`):
```json
{
  "code": 200,
  "status": "success",
  "message": "Ticket status updated to IN_PROGRESS (Priority: URGENT, Assigned: Aarushi Admin).",
  "data": {
    "id": "t-1788287963713",
    "ticket_number": "TICK-9082",
    "status": "in_progress",
    "priority": "urgent",
    "assigned_to": "Aarushi Admin",
    "sla_minutes_remaining": 15,
    "updated_at": "2026-09-02T12:52:00+05:30"
  }
}
```

---

### 6. Escalate Priority Level (`POST /api/support/tickets/:ticketId/escalate`)

- Priority step escalation: `LOW -> MEDIUM -> HIGH -> URGENT`.

#### Response Example (`HTTP 200 OK`):
```json
{
  "code": 200,
  "status": "success",
  "message": "Ticket #TICK-9082 priority escalated to URGENT.",
  "data": {
    "id": "t-1788287963713",
    "priority": "urgent",
    "sla_minutes_remaining": 15
  }
}
```

---

### 7. De-escalate Priority Level (`POST /api/support/tickets/:ticketId/deescalate`)

- Priority step de-escalation: `URGENT -> HIGH -> MEDIUM -> LOW`.

#### Response Example (`HTTP 200 OK`):
```json
{
  "code": 200,
  "status": "success",
  "message": "Ticket #TICK-9082 priority de-escalated to LOW.",
  "data": {
    "id": "t-1788287963713",
    "priority": "low",
    "sla_minutes_remaining": 240
  }
}
```

---

### 8. Merge Duplicate Ticket (`POST /api/support/tickets/:ticketId/merge`)

#### Request Body:
```json
{
  "target_master_ticket_number": "TICK-9082"
}
```

#### Response Example (`HTTP 200 OK`):
```json
{
  "code": 200,
  "status": "success",
  "message": "Ticket #TICK-9083 merged into master ticket TICK-9082.",
  "targetMaster": "TICK-9082"
}
```

---

### 9. Unmerge Child Ticket (`POST /api/support/tickets/:ticketId/unmerge`)

#### Request Body:
```json
{
  "child_ticket_number": "TICK-9083"
}
```

#### Response Example (`HTTP 200 OK`):
```json
{
  "code": 200,
  "status": "success",
  "message": "Child ticket TICK-9083 unmerged from ticket #TICK-9082.",
  "childTicket": "TICK-9083"
}
```

---

### 10. Add / Remove Staff Followers (`POST /api/support/tickets/:ticketId/followers`)

#### Request Body:
```json
{
  "follower_name": "Garvit SubAdmin",
  "action": "add"
}
```

#### Response Example (`HTTP 200 OK`):
```json
{
  "code": 200,
  "status": "success",
  "message": "Staff Garvit SubAdmin subscribed to ticket #TICK-9082 notifications.",
  "followerName": "Garvit SubAdmin"
}
```

---

### 11. Support Desk Analytics & KPIs (`GET /api/admin/support/analytics`)

#### Response Example (`HTTP 200 OK`):
```json
{
  "code": 200,
  "status": "success",
  "message": "Support desk analytics retrieved successfully.",
  "data": {
    "total_tickets_count": 142,
    "open_tickets_count": 28,
    "in_progress_count": 19,
    "resolved_count": 86,
    "closed_count": 9,
    "urgent_tickets_count": 4,
    "high_priority_count": 12,
    "avg_first_response_time_minutes": 14.5,
    "avg_resolution_time_hours": 3.2,
    "sla_compliance_rate_percent": 96.4,
    "sla_breached_count": 3,
    "category_breakdown": {
      "user_vs_vendor": 42,
      "vendor_vs_vendor": 8,
      "vendor_vs_user": 14,
      "technical": 25,
      "billing": 31,
      "onboarding": 12,
      "general": 10
    }
  }
}
```

---

### 12. SLA Policy Configuration (`GET` & `PUT /api/admin/support/sla`)

#### Request Body (`PUT /api/admin/support/sla`):
```json
{
  "urgent_sla_minutes": 15,
  "high_sla_minutes": 45,
  "medium_sla_minutes": 120,
  "low_sla_minutes": 240,
  "auto_escalate_on_breach": true,
  "notify_assigned_staff": true
}
```

#### Response Example (`HTTP 200 OK`):
```json
{
  "code": 200,
  "status": "success",
  "message": "SLA policy configuration updated successfully.",
  "data": {
    "urgent_sla_minutes": 15,
    "high_sla_minutes": 45,
    "medium_sla_minutes": 120,
    "low_sla_minutes": 240,
    "auto_escalate_on_breach": true,
    "notify_assigned_staff": true
  }
}
```

---

### 13. Ticket Tag Management (`GET`, `POST`, `DELETE /api/admin/support/tags`)

#### Request Body (`POST /api/admin/support/tags`):
```json
{
  "name": "Refund Dispatched",
  "color": "#10B981"
}
```

#### Response Example (`HTTP 201 Created`):
```json
{
  "code": 201,
  "status": "success",
  "message": "Support tag created successfully.",
  "data": {
    "tag_id": "tag_101",
    "name": "Refund Dispatched",
    "color": "#10B981"
  }
}
```

---

### 14. File Attachments & Photo Upload (`POST /api/support/tickets/:ticketId/attachments`)

#### Headers:
```http
Content-Type: multipart/form-data
Authorization: Bearer <USER_OR_VENDOR_JWT_TOKEN>
```

#### Request FormData:
- `file`: binary image or PDF file (*max 10MB*)

#### Response Example (`HTTP 201 Created`):
```json
{
  "code": 201,
  "status": "success",
  "message": "Attachment uploaded successfully.",
  "data": {
    "attachment_id": "att_98421",
    "ticket_id": "t-1788287963713",
    "file_name": "damaged_delivery_photo.jpg",
    "file_size_bytes": 1420500,
    "file_url": "https://storage.digilocal.in/support/att_98421.jpg",
    "uploaded_at_ist": "2026-09-02T06:35:00+05:30"
  }
}
```

---

## 📡 SECTION II: Resident User Mobile App & Landing Website Support Endpoints (`user-app`)

### 1. Submit New Customer Complaint / Inquiry (`POST /api/user/tickets`)

#### Request Body:
```json
{
  "subject": "Damaged Item Delivered",
  "description": "The sweets box in order #ORD-9842 was completely crushed upon arrival.",
  "category": "user_vs_vendor",
  "order_id": "ORD-9842",
  "target_vendor": "Aarushi Sweets",
  "reporter_name": "Garvit Sharma",
  "reporter_email": "garvit@gmail.com",
  "source": "mobile_app"
}
```

#### Response Example (`HTTP 201 Created`):
```json
{
  "code": 201,
  "status": "success",
  "message": "Your support ticket TICK-9082 has been submitted. Our team will respond within 45 minutes.",
  "data": {
    "ticket_id": "t-1788287963713",
    "ticket_number": "TICK-9082",
    "status": "open",
    "sla_minutes_remaining": 45,
    "created_at_readable": "02 Sep 2026, 06:32 am IST"
  }
}
```

---

### 2. Fetch User's Submitted Tickets (`GET /api/user/tickets`)

#### Response Example (`HTTP 200 OK`):
```json
{
  "code": 200,
  "status": "success",
  "data": [
    {
      "ticket_id": "t-1788287963713",
      "ticket_number": "TICK-9082",
      "subject": "Damaged Item Delivered",
      "category": "user_vs_vendor",
      "status": "in_progress",
      "order_id": "ORD-9842",
      "unread_messages_count": 1,
      "created_at_readable": "02 Sep 2026, 06:32 am IST",
      "updated_at_readable": "02 Sep 2026, 06:45 am IST"
    }
  ]
}
```

---

### 3. User Reply to Ticket (`POST /api/user/tickets/:ticketId/reply`)

- Customer replies automatically exclude `is_internal_note: true` messages.

#### Request Body:
```json
{
  "message": "Thank you, I have attached the damaged box photo."
}
```

#### Response Example (`HTTP 200 OK`):
```json
{
  "code": 200,
  "status": "success",
  "message": "Reply added to ticket.",
  "data": {
    "id": "m-108",
    "ticket_id": "t-1788287963713",
    "sender_name": "Garvit Sharma",
    "sender_role": "user",
    "message": "Thank you, I have attached the damaged box photo.",
    "created_at_readable": "02 Sep 2026, 07:00 am IST"
  }
}
```

---

## 📡 SECTION III: Merchant Vendor Mobile App & Portal Support Endpoints (`vendor-portal`)

### 1. Submit Vendor Inquiry / Payout Dispute (`POST /api/vendor/tickets`)

#### Request Body:
```json
{
  "subject": "Store Settlement Discrepancy",
  "description": "Settlement amount for order #ORD-9842 reflects 10% commission deduction instead of 5% agreed rate.",
  "category": "billing",
  "priority": "high",
  "store_name": "Flower's Point",
  "reporter_email": "aarushi20@gmail.com"
}
```

#### Response Example (`HTTP 201 Created`):
```json
{
  "code": 201,
  "status": "success",
  "message": "Merchant inquiry TICK-4912 submitted successfully.",
  "data": {
    "ticket_id": "t-178829910011",
    "ticket_number": "TICK-4912",
    "status": "open",
    "priority": "high",
    "sla_minutes_remaining": 45,
    "created_at_readable": "02 Sep 2026, 12:45 pm IST"
  }
}
```

---

### 2. Fetch Merchant's Submitted Tickets (`GET /api/vendor/tickets`)

#### Response Example (`HTTP 200 OK`):
```json
{
  "code": 200,
  "status": "success",
  "data": [
    {
      "ticket_id": "t-178829910011",
      "ticket_number": "TICK-4912",
      "subject": "Store Settlement Discrepancy",
      "category": "billing",
      "status": "open",
      "priority": "high",
      "unread_messages_count": 0,
      "created_at_readable": "02 Sep 2026, 12:45 pm IST"
    }
  ]
}
```

---

## ❌ Standard Error Codes & Responses across All Endpoints

#### `HTTP 401 Unauthorized`
```json
{
  "code": 401,
  "status": "error",
  "error": "UNAUTHORIZED",
  "message": "JWT authorization token expired or invalid."
}
```

#### `HTTP 404 Not Found`
```json
{
  "code": 404,
  "status": "error",
  "error": "TICKET_NOT_FOUND",
  "message": "Support Ticket #TICK-9999 not found."
}
```

#### `HTTP 422 Business Rule Breach`
```json
{
  "code": 422,
  "status": "error",
  "error": "BUSINESS_RULE_BREACH",
  "message": "Ticket is already at the highest priority level (URGENT). Cannot escalate further."
}
```
