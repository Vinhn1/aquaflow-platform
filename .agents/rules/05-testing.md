# Testing Rules

## 1. Test Coverage Hierarchy
Every feature must have appropriate test coverage across three levels:
1. **Unit Tests**: Test business logic in isolation (services, utilities, calculation engines, validators). Fast, zero I/O.
2. **Integration Tests**: Test API controllers, database queries, and repository adapters (including Mock vs Real adapters).
3. **End-to-End (E2E) Tests**: Test critical customer user flows (Customer linking, invoice lookup, payment callback, online queue booking, incident complaint submission).

## 2. Critical Business Flows Requiring Mandatory Tests
- **Auth & Zalo Login**: Token verification, refresh, role validation.
- **Customer Linking**: Meter number binding, duplicate prevention.
- **Invoice & Bill Calculation**: Accurate amount aggregation, status transitions (UNPAID -> PROCESSING -> PAID).
- **Payment Verification**: Idempotent webhook handling, signature verification, fraud prevention.
- **Online Queue**: Ticket number generation, duplicate booking prevention, counter status transitions.
- **Complaint Management**: Submission validation, status workflow (SUBMITTED -> IN_PROGRESS -> RESOLVED).

## 3. Test Integrity & Anti-Cheating Policy
- NEVER delete or weaken existing test assertions to make a failing build pass.
- NEVER comment out failing tests to bypass CI/CD checks.
- If tests have not been executed, explicitly state: "Tests not run" in the status report. Never claim a test passed without running the command.

## 4. Test Isolation & Mocking
- Tests must not depend on external live networks or production databases.
- Integration tests must run against isolated test databases or automated test containers.
- External systems (CAWACO API, Payment Gateway, SMS) must be mocked using designated mock adapters during automated test runs.
