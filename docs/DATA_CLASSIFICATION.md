# Data Classification Policy

This document defines the data sensitivity classification for AquaFlow Platform to ensure proper access controls, encryption, retention, and AI prompt protection.

---

## 1. PUBLIC
Data that can be freely disclosed to the general public without adverse impact on citizens or CAWACO.
- **Examples**:
  - Public news announcements and water safety articles.
  - Planned water maintenance and outage schedules.
  - Office locations, service counter opening hours, hotline numbers.
  - Standard water tariff rate tables.
- **Handling**:
  - No access restrictions.
  - Can be cached on public CDNs and search engines.

---

## 2. INTERNAL
Operational metadata and non-sensitive aggregated data used for platform maintenance.
- **Examples**:
  - System performance metrics, uptime health checks.
  - Aggregated queue wait time averages per branch.
  - Application error codes (without stack traces).
- **Handling**:
  - Accessible to authenticated staff and automated monitors.
  - Excluded from public search indexation.

---

## 3. CONFIDENTIAL / SENSITIVE (PII & Business Data)
Personally Identifiable Information (PII) and citizen utility records requiring strong protection.
- **Examples**:
  - Citizen Full Name, Phone Number, Zalo User ID.
  - Customer Code (Ma danh bo), Water Meter Serial Number.
  - Water consumption history and monthly billing details.
  - Customer complaint descriptions, incident photos, and GPS coordinates.
- **Handling**:
  - Strict RBAC and ownership authorization (IDOR protection).
  - Encrypted in transit (TLS 1.3) and at rest (AES-256).
  - Masked in application logs (e.g. `091****123`).
  - NEVER pasted into public AI prompts or untrusted third-party services.

---

## 4. SECRET
Cryptographic secrets, system credentials, and private keys.
- **Examples**:
  - Database connection strings and passwords.
  - JWT signing secrets.
  - Payment gateway API keys and HMAC webhook secrets.
  - Zalo Mini App Secret Key.
- **Handling**:
  - Stored strictly in environment variables / secure secret vaults.
  - NEVER committed to version control.
  - NEVER printed in logs, console output, or API error payloads.
