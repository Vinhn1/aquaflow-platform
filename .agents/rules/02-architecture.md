# Architecture Rules

## 1. Anti-Coupling Principle
- Client applications (Zalo Mini App, Web Portal, Admin Dashboard) must NEVER connect directly to the database or internal cache.
- Strict unidirectional dependency flow:
  `Client (UI) -> API Layer (Controllers) -> Domain Services -> Repositories / Adapters -> Database / External APIs`.

## 2. Hexagonal / Adapter Pattern for External Integrations
- All external dependencies (CAWACO Core Billing System, Bank/VietQR Gateway, SMS/ZNS Service, Zalo OAuth) must be abstracted behind Domain Interfaces (Ports).
- Provide two concrete implementations (Adapters) for each interface:
  - `MockAdapter`: In-memory or simulated provider for development, testing, and demo without real APIs.
  - `RealAdapter`: Production provider calling official external APIs.
- Switching between Mock and Real must be dynamically controlled via environment variables (e.g. `MOCK_CAWACO_API=true`).
- Business logic in domain services must never know whether data comes from Mock or Real providers.

## 3. Modular Monolith Boundaries
- Codebase is organized into cohesive business domains:
  - `Customer` (Customer profile, water meter binding, contract information)
  - `Billing` (Water meter readings, monthly invoices, payment history)
  - `Payment` (QR generation, transaction verification, webhook handling)
  - `Queue` (Online ticket booking, counter calling, queue notifications)
  - `Complaint` (Incident reporting, water leak reports, resolution tracking)
  - `News` (Utility notices, water outage alerts, news articles)
  - `Branch` (Offices, transaction points, water network maps)
- Cross-domain calls must go through public domain service contracts, not private internal functions or direct table mutations.

## 4. State Management & Idempotency
- Critical mutations (payments, queue ticket issuing, complaint submission) must be idempotent using idempotency keys or unique transaction references.
- Domain services must remain stateless. Distributed state is persisted in database or Redis.
