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

## 2. Layer Responsibilities
1. **Clients**: Pure UI layer built with modern web/mini-app frameworks. Zero business logic or direct database connections.
2. **Inbound Adapters**: Translates HTTP requests to typed Domain Command/Query objects after validating headers and payload schemas.
3. **Core Domain**: Enforces water utility business invariants, tariff calculation logic, queue state machines, and incident progression workflows.
4. **Outbound Adapters**: Implements persistence and external communications. Cleanly separates internal database operations from third-party vendor APIs.
