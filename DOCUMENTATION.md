# DigiLocal Admin Panel — Complete Operational & Technical Documentation

Welcome to the official technical and operational documentation for **DigiLocal Admin Panel**, an enterprise-grade, production-ready SaaS administration dashboard engineered for hyperlocal vendor management, residential society operations, subscription billing, payment processing, executive intelligence, and security compliance.

---

## 📋 Table of Contents

1. [Executive Summary & Tech Stack](#1-executive-summary--tech-stack)
2. [Design Aesthetics & Color Tokens](#2-design-aesthetics--color-tokens)
3. [Folder Structure & Modular Architecture](#3-folder-structure--modular-architecture)
4. [Routing Architecture & Code Splitting](#4-routing-architecture--code-splitting)
5. [Detailed Module Documentation](#5-detailed-module-documentation)
   - [Authentication & Security](#51-authentication--security-module)
   - [Executive Dashboard Overview](#52-executive-dashboard-overview)
   - [Society Management](#53-society-management-module)
   - [Vendor Management](#54-vendor-management-module)
   - [Subscription Management](#55-subscription-management-module)
   - [Payment & Payout Management](#56-payment--payout-management-module)
   - [Reports & Executive Intelligence](#57-reports--executive-intelligence-module)
   - [Notification Center](#58-notification-center-module)
   - [Audit Log & Security Trail](#59-audit-log--security-trail-module)
   - [Platform Settings & Configuration](#510-platform-settings--configuration-module)
6. [Reusable Components & SOLID Compliance](#6-reusable-components--solid-compliance)
7. [Developer & Build Guide](#7-developer--build-guide)

---

## 🚀 1. Executive Summary & Tech Stack

DigiLocal is designed to manage complex hyperlocal SaaS operations connecting residential societies, local merchant vendors, customers, and platform administrators. The frontend application is built on top of React 19, TypeScript, and Vite, adhering strictly to enterprise SOLID design principles and clean code practices.

### Technology Stack
- **Core Library**: React 19
- **Type Safety**: TypeScript (Strict `tsconfig.app.json` with **0 `any` types**)
- **Build Engine & Bundler**: Vite (Fast HMR + Rollup dynamic code-splitting)
- **Styling**: Vanilla CSS custom properties with OKLCH color tokens in `src/index.css`
- **Routing**: React Router v7 with `React.lazy()` and `<Suspense>` route-level code splitting
- **Server State & Caching**: TanStack Query v5 (Optimistic cache updates via `onMutate`, `onError`, `onSettled`)
- **Form Management**: React Hook Form
- **Schema Validation**: Zod
- **HTTP Client**: Axios with Bearer token injection and automatic 401 token refresh queueing
- **Data Visualization**: Recharts (Responsive Area, Bar, Line, and Donut charts)
- **Toast Notifications**: Sonner
- **Icons**: Lucide Icons

---

## 🎨 2. Design Aesthetics & Color Tokens

DigiLocal utilizes curated OKLCH color design tokens tailored for high legibility, visual warmth, and executive elegance.

### Design Tokens
| Token | Role | Value | Hex Equivalent |
|---|---|---|---|
| `--background` | Page background | `oklch(0.972 0.012 85)` | Warm Ivory (`#f9f7f2`) |
| `--foreground` | Primary body text | `oklch(0.24 0.02 55)` | Deep Espresso (`#2a2421`) |
| `--card` | Cards / panels | `oklch(0.985 0.008 85)` | Lighter Ivory (`#fcfbfa`) |
| `--muted-foreground` | Captions, meta | `oklch(0.5 0.02 60)` | Muted Taupe (`#827973`) |
| `--border` | Subtle rules | `oklch(0.87 0.015 75)` | Soft Greige (`#ded7cd`) |
| `--secondary` | Secondary surfaces | `oklch(0.93 0.018 80)` | Warm Sand (`#efebe3`) |
| `--ink` | Headlines, nav, buttons | `oklch(0.22 0.02 55)` | Deep Espresso (`#224636`) |
| `--gold` | Accent / highlights | `oklch(0.68 0.11 75)` | Warm Gold (`#cba358`) |
| `--primary` | CTA / interactive | `oklch(0.32 0.035 155)` | Deep Forest (`#224636`) |

### Typography Guidelines
- **Headlines & Titles**: `Cormorant Garamond` (Serif display typography)
- **Body Text & Controls**: `Inter` (Clean sans-serif)
- **Numerals & Identifiers**: `JetBrains Mono` (Monospace for codes, timestamps, and amounts)

---

## 📂 3. Folder Structure & Modular Architecture

```
digi-local_admin/src/
├── api/                     # SOLID BaseApiService & domain endpoint implementations
│   ├── client.ts            # Base Axios instance
│   ├── interceptors.ts     # Bearer token injection & 401 token refresh queue
│   └── services/            # Endpoint services (auth, dashboard, society, vendor, subscription, payment, report, settings, notification, audit)
├── components/              # Modular, reusable UI components
│   ├── auth/                # SessionTimeoutWarning modal
│   ├── data-table/          # Generic DataTable<TData> with selection, sorting, pagination
│   ├── feedback/            # Skeleton, PageLoader, ErrorBoundary, ErrorState, EmptyState, ToastSystem
│   ├── form/                # Form, FormInput, FormSelect, FormCheckbox (RHF + Zod)
│   ├── ui/                  # Button, Input, Card, Badge, Modal (a11y enhanced)
│   ├── dashboard/           # MetricsGrid, RevenueChart, VendorGrowthChart, SubscriptionChart, NotificationMenu
│   ├── society/             # SocietyFormModal, SocietyDetailsDrawer, SocietyFilterBar, BulkActionsToolbar
│   ├── vendor/              # VendorFormModal, VendorProfileDrawer, VendorFilterBar, VendorBulkActionsToolbar
│   ├── subscription/        # SubscriptionAnalyticsCharts, SubscriptionDetailsDrawer, RenewSubscriptionModal, CancelSubscriptionModal, SubscriptionFilterBar
│   ├── payment/             # RevenueDashboardCharts, TransactionDetailsDrawer, IssueRefundModal, PaymentFilterBar
│   ├── reports/             # RevenueReportChart, OrdersReportChart, SubscriptionGrowthReportChart, VendorGrowthReportChart, TopVendorsTable, SocietyPerformanceChart, ReportExportBar
│   ├── settings/            # AdminProfileTab, SecurityTab, EmailSettingsTab, TaxSettingsTab, SubscriptionPlansTab, SystemSettingsTab, NotificationPreferencesTab, BrandingTab
│   ├── notification/        # NotificationCard, NotificationFilterBar
│   └── audit/               # AuditLogDetailsDrawer, AuditFilterBar
├── context/                 # AuthContext (JWT memory token & mock fallback)
├── hooks/                   # Domain custom TanStack Query hooks
├── layouts/                 # DashboardLayout, AuthLayout, Sidebar, Navbar, Breadcrumbs
├── pages/                   # Feature Dashboard pages (lazy-loaded)
├── routes/                  # React Router v7 config with React.lazy & Suspense code splitting
├── schemas/                 # Zod validation schemas
├── types/                   # TypeScript interfaces
└── utils/                   # cn, formatters
```

---

## 🚦 4. Routing Architecture & Code Splitting

All dashboard feature routes are code-split into dynamic chunks using `React.lazy()` and `<Suspense fallback={<PageLoader />}>`.

| Route Path | Page Component | Description |
|---|---|---|
| `/auth/login` | `LoginPage` | Administrator JWT login page |
| `/auth/forgot-password` | `ForgotPasswordPage` | Password recovery request page |
| `/auth/reset-password` | `ResetPasswordPage` | Reset password entry page |
| `/dashboard` | `DashboardOverviewPage` | Main executive telemetry console |
| `/dashboard/analytics` | `ReportsPage` | Reports & Business Intelligence console |
| `/dashboard/societies` | `SocietyListPage` | Residential societies management directory |
| `/dashboard/users` | `VendorListPage` | Local merchant vendor registry |
| `/dashboard/subscriptions` | `SubscriptionListPage` | Merchant recurring subscription management |
| `/dashboard/payments` | `PaymentListPage` | Payment transactions ledger & refunds |
| `/dashboard/notifications` | `NotificationListPage` | Real-time notification dispatch feed |
| `/dashboard/security` | `AuditLogPage` | Compliance audit log & security trail |
| `/dashboard/settings` | `SettingsPage` | Platform settings & system configuration |

---

## ⚙️ 5. Detailed Module Documentation

### 5.1 Authentication & Security Module
- **JWT & Refresh Rotation**: Access tokens stored in memory. Response 401 interceptor automatically queues pending requests while refreshing token via HTTP-only cookie.
- **Inactivity Session Timeout (`useSessionTimeout`)**: Tracks user mouse/keyboard activity. Displays a warning modal 2 minutes prior to session expiration and automatically logs out administrators upon expiry.

### 5.2 Executive Dashboard Overview (`/dashboard`)
- **4 Telemetry KPI Cards**: Total Platform Revenue (`$184,950`), Active Local Vendors (`1,420`), Active Subscriptions (`980`), Platform Retention Rate (`94.6%`).
- **Data Visualizations**: Recharts AreaChart for Gross Revenue & Net Profit, BarChart for monthly vendor onboarding, and Donut PieChart for subscription distribution across Enterprise (35%), Pro (50%), and Free (15%) tiers.
- **Live Widgets**: Recent Payments table, Newly Onboarded Vendors list, and Audit Activity timeline.

### 5.3 Society Management Module (`/dashboard/societies`)
- **Directory Table**: Reusable `DataTable` displaying Society Name, Code (`SOC-GWH-01`), City, State, Postal Code, Vendor Count, Status Badge (`active`/`inactive`), and Onboarding Date.
- **Register & Edit Modal (`SocietyFormModal.tsx`)**: Form validated with `societySchema` (Zod) enforcing uppercase alphanumeric code rules.
- **Details Drawer (`SocietyDetailsDrawer.tsx`)**: Slide-over drawer displaying society specifications and associated local vendors.
- **Bulk Operations (`BulkActionsToolbar.tsx`)**: Floating toolbar enabling **Bulk Activate**, **Bulk Deactivate**, or **Bulk Delete** with instant optimistic UI updates via TanStack Query.

### 5.4 Vendor Management Module (`/dashboard/users`)
- **Merchant Registry**: Store Avatar, Store Name, Owner Name, Category, 15-digit GSTIN, Subscription Tier (`Free`, `Pro`, `Enterprise`), Status (`Active`, `Suspended`, `Pending Approval`), and Total Earnings.
- **GST Verification (`vendorSchema`)**: Enforces 15-digit Indian GSTIN regex (`/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/`).
- **Profile Drawer (`VendorProfileDrawer.tsx`)**: 4 tabbed panels:
  1. *Store Overview*: Earnings, owner contact, website, allocated society, subscription renewal date.
  2. *GST & Tax Details*: Verified GSTIN, Business Entity Type (LLP, Pvt Ltd, etc.).
  3. *Weekly Operating Hours*: Monday – Sunday store opening and closing schedule table.
  4. *Payment History*: Payout transaction log table.
- **Bulk Operations**: Bulk Activate, Bulk Suspend, or Bulk Delete selected vendors.

### 5.5 Subscription Management Module (`/dashboard/subscriptions`)
- **Telemetry & Donut Chart**: Active Subscriptions count, Expiring Soon count (≤ 7 days), Overdue count, Monthly Recurring Revenue (MRR: `$58,450`).
- **Subscription Directory Table**: Subscription ID (`SUB-801`), Vendor Name, Store, Plan Tier, Billing Cycle (`Monthly`/`Annual`), Price, Expiry Date & **Remaining Days Countdown** with Expiry Warning badges (`≤ 7 days`), Payment Status (`Paid`, `Pending`, `Overdue`), and Auto-Renew status.
- **Renew & Upgrade Modal (`RenewSubscriptionModal.tsx`)**: Select plan tiers, switch billing cycles, and toggle auto-renewal.
- **Cancel Subscription Modal (`CancelSubscriptionModal.tsx`)**: Requires cancellation reason input before terminating plan access.
- **Subscription Details Drawer**: PDF Invoice Download CTA and complete historical audit log table.

### 5.6 Payment & Payout Management Module (`/dashboard/payments`)
- **Revenue Dashboard Analytics**: 7-day processed daily volume Area Chart, Gateway distribution Donut Chart (`Stripe`, `Razorpay`, `Bank Transfer`, `DigiWallet`), Net Platform Revenue (5% commission: `$9,247.50`), and Gateway Success Rate (`98.4%`).
- **Transaction Ledger Table**: Transaction ID (`TXN-9001`), Store Name, Customer Email, Gross Amount, Platform Fee (`+5%`), Gateway Provider, Status (`Success`, `Pending`, `Failed`, `Refunded`), and Date.
- **Transaction Details Drawer**: Detailed financial breakdown (Gross, Platform Fee, Net Vendor Payout share).
- **Issue Refund Modal (`IssueRefundModal.tsx`)**: Process full or partial refunds via the dummy payment gateway with refund reason logging.
- **Document Downloads**: Trigger PDF Payment Receipts and Tax Invoices with toast notifications.

### 5.7 Reports & Executive Intelligence Module (`/dashboard/analytics`)
- **Timeframe Granularity Selector**: Toggle between **Daily View** (00:00 - 24:00), **Monthly View** (Jan - Jul), and **Yearly View** (2023 - 2026).
- **Multi-Format Data Export Bar**: One-click exports for **CSV**, **Excel**, and **PDF** report files.
- **6 Recharts Visualizations**: Revenue & Profit Area Chart, Orders Fulfilled vs Cancelled Bar Chart, Subscriptions Growth Trajectory Line Chart, Vendor Onboarding Bar Chart, Top Merchant Leaderboard, and Society Performance Bar Chart.

### 5.8 Notification Center Module (`/dashboard/notifications`)
- **5 Category Types**: `vendor_registration`, `subscription_expiry`, `payment_success`, `payment_failure`, `announcement`.
- **Header Popover Sync (`NotificationMenu.tsx`)**: Header navbar unread badge updates in real time (`4 new`).
- **Reusable `NotificationCard`**: Displays category icon, unread pulse dot, human-readable relative time ("Just now", "12 mins ago", "3 hours ago"), view details link, mark read button, and delete button.
- **Bulk Actions**: **Mark All Read** trigger button and optimistic state cache updates.

### 5.9 Audit Log & Security Trail Module (`/dashboard/security`)
- **Audit Log Table**: Audit Entry ID (`AUD-5001`), Administrator Name & Email, Action Badge (`VENDOR_SUSPENDED`, `REFUND_ISSUED`, `SOCIETY_CREATED`, `SUBSCRIPTION_RENEWED`, `SETTINGS_UPDATED`), Impacted Entity, Client IP Address, Browser / OS User Agent, and Timestamp.
- **Audit Log Details & State Diff Drawer (`AuditLogDetailsDrawer.tsx`)**: Side-by-side JSON code viewer displaying **Previous State** vs **New State** payload diffs.
- **Export Actions**: Export audit logs to CSV or PDF format.

### 5.10 Platform Settings & Configuration Module (`/dashboard/settings`)
Centralized platform configuration dashboard divided into 8 sub-module tab panels:
1. **Admin Profile**: Update administrator name, email, phone, designation, and avatar URL preview.
2. **Security & Change Password**: Password change form with strength checks.
3. **Email & SMTP Settings**: Transactional SMTP server parameters (Host, Port 587/465, Username, Sender Address, Sender Name, Encryption TLS/SSL) with **Send Test Email** CTA.
4. **Tax & GST Settings**: Platform GST percentage (18%), GSTIN registration number, HSN/SAC code, and auto-tax calculation toggle.
5. **Subscription Plans Config**: Pricing controls for Free ($0), Pro ($49/mo), and Enterprise ($199/mo) plans.
6. **System Parameters**: Platform Maintenance Mode toggle, Base Display Currency (USD, INR, EUR, GBP), and Session Inactivity Timeout (mins).
7. **Notification Preferences**: Toggles for Email, SMS, Push, and Security alerts.
8. **Branding & Logo Upload**: Brand title, tagline, primary color picker (`#224636`), and logo upload preview.

---

## 🧱 6. Reusable Components & SOLID Compliance

- **Single Responsibility Principle (SRP)**: API logic isolated in `BaseApiService` subclasses; UI views separated from custom hooks.
- **Open/Closed Principle (OCP)**: Generic `DataTable<TData>` accepts custom column definitions, cell renderers, and row actions without modifying internal table code.
- **Accessibility (a11y)**: All modals and drawers feature `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `Escape` key event listeners.

---

## 🛠️ 7. Developer & Build Guide

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Run Local Development Server
```bash
npm run dev
```

### Type Checking (Strict Zero Errors)
```bash
npx tsc --noEmit
```

### Production Build
```bash
npm run build
```

---

*Documentation generated for DigiLocal SaaS Enterprise Platform.*
