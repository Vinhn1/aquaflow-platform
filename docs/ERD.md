# Entity Relationship Diagram (ERD) - AquaFlow Platform

---

## 1. Domain Entities & Schema Design

```text
  ┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
  │      users       │           │   user_meters    │           │    customers     │
  ├──────────────────┤           ├──────────────────┤           ├──────────────────┤
  │ id (PK)          │1         *│ id (PK)          │*         1│ id (PK)          │
  │ phone            ├───────────┤ user_id (FK)     │           │ customer_code (UQ)│
  │ zalo_id (UQ)     │           │ customer_id (FK) ├───────────┤ full_name        │
  │ full_name        │           │ is_default       │           │ address          │
  │ role             │           │ label            │           │ meter_serial     │
  │ created_at       │           │ created_at       │           │ tariff_group     │
  └──────────────────┘           └──────────────────┘           └────────┬─────────┘
                                                                         │
                                                                         │ 1
                                                                         │
                                                                         │ *
  ┌──────────────────┐           ┌──────────────────┐           ┌────────┴─────────┐
  │  queue_tickets   │           │     payments     │           │     invoices     │
  ├──────────────────┤           ├──────────────────┤           ├──────────────────┤
  │ id (PK)          │           │ id (PK)          │*         1│ id (PK)          │
  │ ticket_number    │           │ invoice_id (FK)  ├───────────┤ customer_id (FK) │
  │ branch_id (FK)   │           │ transaction_ref  │           │ bill_period      │
  │ service_type     │           │ amount           │           │ previous_index   │
  │ user_id (FK)     │           │ payment_method   │           │ current_index    │
  │ status           │           │ status           │           │ consumption_m3   │
  │ counter_id       │           │ paid_at          │           │ total_amount     │
  │ created_at       │           │ created_at       │           │ status           │
  └──────────────────┘           └──────────────────┘           └──────────────────┘

  ┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
  │    complaints    │           │     branches     │           │      news        │
  ├──────────────────┤           ├──────────────────┤           ├──────────────────┤
  │ id (PK)          │           │ id (PK)          │           │ id (PK)          │
  │ user_id (FK)     │           │ code (UQ)        │           │ title            │
  │ category         │           │ name             │           │ slug (UQ)        │
  │ description      │           │ address          │           │ summary          │
  │ latitude         │           │ latitude         │           │ content          │
  │ longitude        │           │ longitude        │           │ category         │
  │ images (JSON)    │           │ phone            │           │ is_outage_alert  │
  │ status           │           │ is_active        │           │ published_at     │
  │ created_at       │           │ created_at       │           │ created_at       │
  └──────────────────┘           └──────────────────┘           └──────────────────┘
```
