# Comprehensive Master Test Plan - AquaFlow Platform

---

## 1. Test Strategy & Scope
The testing strategy guarantees high stability for both prototype demonstration and production readiness through three distinct test tiers:

### Tier 1: Unit Testing
- **Target**: Pure calculation engines, tariff tiers, schema validation (Zod), date utilities, state machine transitions.
- **Coverage Goal**: >= 85% line coverage on domain services.

### Tier 2: Integration Testing
- **Target**: API routing, authentication middlewares, error envelope handlers, repository adapters (Mock vs Real).
- **Strategy**: Automated test execution using isolated in-memory or test database containers.

### Tier 3: End-to-End (E2E) Testing
- **Target**: Complete citizen workflows executed via automated test scripts.
- **Key Flows**:
  1. `E2E-01`: Zalo Login -> Link Meter Code -> View Unpaid Bill.
  2. `E2E-02`: Select Unpaid Bill -> Generate Dynamic VietQR -> Simulate Payment Webhook -> Verify Bill Status Transitions to PAID.
  3. `E2E-03`: Select Branch Office -> Book Digital Queue Ticket -> View Position in Queue -> Simulate Counter Call.
  4. `E2E-04`: Submit Water Leak Report with Image & GPS -> Verify Admin Receives Incident in Dashboard.

---

## 2. Quality Gate Criteria
A build passes the Quality Gate only if:
1. 100% of unit and integration tests pass.
2. Zero Critical or High security vulnerabilities detected.
3. Zero TypeScript compilation or linter errors.
