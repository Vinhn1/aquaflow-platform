# Database Rules

## 1. Source of Truth & Technology
- Relational Database (PostgreSQL) is the primary Source of Truth for internal application data.
- Database access and migrations are managed via migration scripts and type-safe ORM.
- Manual changes to database schemas in staging/production are strictly prohibited.

## 2. Naming Conventions
- Tables: `snake_case` in plural form (e.g. `customers`, `invoices`, `queue_tickets`, `complaints`).
- Columns in SQL: `snake_case` (e.g. `customer_id`, `created_at`, `water_meter_code`).
- Entity Fields in TypeScript: `camelCase` mapped explicitly to database column names.
- Foreign Keys: `<singular_table_name>_id` (e.g. `customer_id`, `invoice_id`).
- Indexes: `idx_<table_name>_<column_names>` (e.g. `idx_invoices_customer_id_status`).

## 3. Data Integrity & Constraints
- Always define explicit Foreign Key constraints to maintain relational integrity.
- Use Unique constraints on natural keys (e.g. `customer_code`, `meter_serial_number`, `ticket_number`).
- Add appropriate single-column and composite indexes for high-frequency filter and join conditions.

## 4. Soft Delete & Immutability
- Business-critical entities must use Soft Delete (`deleted_at` timestamp or explicit lifecycle status) to preserve audit trails.
- Specifically applies to:
  - `invoices`
  - `payments`
  - `complaints`
  - `audit_logs`
- Payment and transaction records are immutable; corrections must be recorded as reversal or adjustment records.

## 5. Migration Lifecycle
- Any schema change must follow the strict lifecycle:
  `Schema definition -> Generated Migration Script -> Local Test -> Review -> Execution`.
- Migrations must be backward compatible to avoid locking or breaking live services.
