---
name: architecture
description: Software architecture skill. Guides Hexagonal, Clean Architecture, and Modular Monolith system designs with strict boundary isolation and adapter interfaces.
---

# Software Architecture Skill

## Purpose
Design modular, decoupled, and maintainable software architectures with explicit ports and adapters for external integrations.

## Core Architectural Patterns
1. **Ports and Adapters (Hexagonal Architecture)**:
   - Primary Ports (Inbound): Controllers, API Handlers, CLI Commands.
   - Core Domain: Business logic, domain models, value objects, domain events.
   - Secondary Ports (Outbound): Repository interfaces, payment gateway ports, notification ports.
   - Adapters (Outbound implementations): Postgres Repository, Mock Adapter, External REST Adapter.
2. **Anti-Coupling Principle**:
   - UI layers must not import or interact with storage engines or infrastructure drivers directly.
   - All data exchange occurs via typed DTOs and API contracts.
3. **Decisions Records**:
   - Capture every structural architectural choice in `docs/adr/ADR-XXX-<name>.md`.
