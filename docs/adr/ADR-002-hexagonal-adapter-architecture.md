# ADR-002: Hexagonal Adapter Pattern for External Boundaries

- **Status**: ACCEPTED
- **Date**: 2026-08-26
- **Deciders**: Engineering Lead, Architecture Review

## Context & Problem Statement
The target water company (CAWACO) currently does not provide public REST APIs, real database access, or direct payment gateway credentials for development. However, the system must be architected so that it functions fully in prototype mode today, and can seamlessly connect to live enterprise systems tomorrow without rewriting core business services or UI components.

## Decision
Adopt the Hexagonal Architecture (Ports and Adapters) for all external integrations:
1. Define typed TypeScript interfaces (Ports) in the domain layer (e.g. `ICustomerPort`, `IInvoicePort`, `IPaymentGatewayPort`).
2. Provide two implementations for each port:
   - `MockAdapter`: Provides realistic, deterministic mock responses for local development, demos, and automated CI tests.
   - `RealAdapter`: Connects to live CAWACO APIs or third-party webhooks when production endpoints are available.
3. Switch implementations dynamically via environment configuration (`MOCK_CAWACO_API=true`).

## Consequences
- **Positive**: Complete decoupling between UI, domain logic, and external vendors; zero friction when transitioning from prototype to production.
- **Negative**: Requires maintaining port interfaces and mock adapters alongside real adapters.
