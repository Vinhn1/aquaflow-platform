---
name: database
description: Database architecture and design skill. Designs relational schemas, indexes, migrations, and enforces data integrity and soft delete patterns.
---

# Database Architecture Skill

## Purpose
Design high-performance, normalized, and secure relational database schemas, migrations, and query patterns.

## Design Principles
1. **Schema Normalization & Constraints**:
   - Design schemas to 3NF where appropriate.
   - Enforce foreign keys, check constraints, and unique indexes to prevent orphaned or invalid state.
2. **Performance & Indexing Strategy**:
   - Index all foreign key columns and common query filter/sort paths.
   - Use composite indexes matching query predicate order (`(customer_id, status, created_at DESC)`).
3. **Migration Lifecycle**:
   - Every database change must be managed through version-controlled migration files.
   - Migrations must be idempotent and non-destructive for zero-downtime updates.
4. **Auditability & Soft Deletion**:
   - Include `created_at`, `updated_at`, and `deleted_at` fields on business entities.
