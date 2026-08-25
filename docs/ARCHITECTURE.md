# Architecture Specification - AquaFlow Platform

---

## 1. High-Level Architecture (Hexagonal / Ports & Adapters)

```text
       ┌────────────────────────────────────────────────────────┐
       │                     Clients Layer                      │
       │  ┌──────────────────────┐    ┌──────────────────────┐  │
       │  │    Zalo Mini App     │    │   Admin Dashboard    │  │
       │  └──────────┬───────────┘    └──────────┬───────────┘  │
       └─────────────┼───────────────────────────┼──────────────┘
                     │ HTTPS / WSS               │ HTTPS / WSS
                     ▼                           ▼
       ┌────────────────────────────────────────────────────────┐
       │                Inbound Adapters (API)                  │
       │  ┌──────────────────────┐    ┌──────────────────────┐  │
       │  │   Auth Middleware    │    │  Validation (Zod)    │  │
       │  └──────────┬───────────┘    └──────────┬───────────┘  │
       │             │                           │              │
       │             ▼                           ▼              │
       │  ┌──────────────────────────────────────────────────┐  │
       │  │                REST Controllers                  │  │
       │  └──────────────────────────┬───────────────────────┘  │
       └─────────────────────────────┼──────────────────────────┘
                                     │
                                     ▼
       ┌────────────────────────────────────────────────────────┐
       │                    Core Domain Layer                   │
       │  ┌──────────────────────────────────────────────────┐  │
       │  │                 Domain Services                  │  │
       │  │ (BillingService, QueueEngine, ComplaintWorkflow) │  │
       │  └──────────────────────────┬───────────────────────┘  │
       │                             │                          │
       │                             ▼                          │
       │  ┌──────────────────────────────────────────────────┐  │
       │  │                  Domain Ports                    │  │
       │  │ (ICustomerPort, IInvoicePort, IPaymentPort, etc) │  │
       │  └──────────────────────────┬───────────────────────┘  │
       └─────────────────────────────┼──────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
       ┌─────────────────────────┐       ┌─────────────────────────┐
       │    Internal Adapters    │       │    External Adapters    │
       │ ┌─────────────────────┐ │       │ ┌─────────────────────┐ │
       │ │ Postgres Repository │ │       │ │ Mock Customer Repos │ │
       │ └─────────────────────┘ │       │ ├─────────────────────┤ │
       │ ┌─────────────────────┐ │       │ │ Mock VietQR Gateway │ │
       │ │ Redis Cache/Queue   │ │       │ ├─────────────────────┤ │
       │ └─────────────────────┘ │       │ │ CAWACO Core Port    │ │
       │ ┌─────────────────────┐ │       │ └─────────────────────┘ │
       │ │ S3 File Storage     │ │       │                         │
       │ └─────────────────────┘ │       │                         │
       └─────────────────────────┘       └─────────────────────────┘
```

---

## 2. Sequence Diagrams for Critical User Flows

### Flow 1: Citizen Login & Customer Meter Binding
```text
Citizen (Zalo App)       API Controller        Auth Service      Customer Service     ICustomerPort (Mock/Real)      Postgres DB
       │                       │                     │                   │                        │                       │
       │─── 1. Login (Token) ─>│                     │                   │                        │                       │
       │                       │─── 2. Verify ──────>│                   │                        │                       │
       │                       │<── 3. JWT Token ────│                   │                        │                       │
       │<── 4. Token Response ─│                     │                   │                        │                       │
       │                                                                 │                        │                       │
       │─── 5. Link Meter (Code: CM102938, Label) ──────────────────────>│                        │                       │
       │                                                                 │─── 6. Verify Meter ───>│                       │
       │                                                                 │<── 7. Customer DTO ────│                       │
       │                                                                 │─── 8. Save Binding ───────────────────────────>│
       │<── 9. Success (Linked Meter Details) ───────────────────────────│                                                │
```

---

### Flow 2: Monthly Bill Lookup & Dynamic VietQR Generation
```text
Citizen (Zalo App)       API Controller       Billing Service     IInvoicePort (Mock/Real)    IPaymentPort (VietQR)
       │                       │                     │                        │                         │
       │─── 1. Get Invoices ──>│                     │                        │                         │
       │                       │─── 2. Fetch Bills ─>│                        │                         │
       │                       │                     │─── 3. Query Active ───>│                         │
       │                       │                     │<── 4. Raw Consumption ─│                         │
       │                       │                     │ (Calculates Tiers,     │                         │
       │                       │                     │  VAT 5%, Env Fee 10%)  │                         │
       │<── 5. Invoice Breakdown List ───────────────│                        │                         │
       │                                                                                                │
       │─── 6. Click "Thanh toán ngay" (Invoice ID: INV-01) ───────────────────────────────────────────>│
       │                                                                                                │── 7. Generate VietQR
       │<── 8. Return VietQR Image URL + NAPAS Payload ─────────────────────────────────────────────────│
```

---

### Flow 3: Payment Webhook Settlement (Idempotent & HMAC Verified)
```text
Bank / Payoo Webhook       API Controller       Payment Service       Postgres DB       INotificationPort (ZNS)
       │                         │                     │                   │                       │
       │─── 1. POST Webhook ────>│                     │                   │                       │
       │    (Payload + HMAC)     │── 2. Validate HMAC ─>│                   │                       │
       │                         │                     │── 3. Check Status>│                       │
       │                         │                     │ (If already PAID, │                       │
       │                         │                     │  return 200 OK)   │                       │
       │                         │                     │── 4. Update PAID ─>│                       │
       │                         │                     │── 5. Log Audit ───>│                       │
       │                         │                     │── 6. Push Notification ──────────────────>│
       │<── 7. 200 OK (Processed)│                     │                                           │
```

---

### Flow 4: Online Smart Queue Booking & Real-time Counter Call
```text
Citizen (Zalo App)       API Controller        Queue Engine        Redis / Queue DB        Counter Staff Portal
       │                       │                     │                     │                        │
       │─── 1. Book Ticket ───>│                     │                     │                        │
       │    (Branch, Service)  │── 2. Create Ticket ─>                     │                        │
       │                       │                     │── 3. Atomic Incr ──>│                        │
       │<── 4. Ticket #A-105 (Wait: 15m, Ahead: 3) ──│                     │                        │
       │                       │                     │                     │                        │
       │                       │                     │                     │<── 5. "Gọi số tiếp" ───│
       │                       │                     │<── 6. Call Next ────│                        │
       │                       │                     │── 7. Update SERVING>│                        │
       │<── 8. WebSocket Notification: "Đến lượt quầy 2" ──────────────────│                        │
```
