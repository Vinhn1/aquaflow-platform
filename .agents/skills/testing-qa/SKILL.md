---
name: testing-qa
description: Quality assurance and testing skill. Designs unit, integration, and E2E test suites with automated mock adapters and honest execution reporting.
---

# Testing and QA Skill

## Purpose
Design, implement, and maintain high-fidelity automated test suites to ensure system reliability and functional correctness.

## Test Pyramid Implementation
1. **Unit Testing**:
   - Focus: Pure domain logic, tariff calculators, schema validation, utility helpers.
   - Isolation: Fast execution, zero network/database I/O.
2. **Integration Testing**:
   - Focus: API controllers, database persistence layer, adapter behavior (Mock vs Real).
   - Environment: Ephemeral test database or automated mocks.
3. **End-to-End Testing**:
   - Focus: Critical customer journeys (Linking meter -> Viewing bill -> Generating QR -> Webhook confirmation).

## Execution & Reporting Rules
- Always run the actual test command before reporting results.
- If tests were not run, output explicitly: "Tests not run".
- Never weaken or delete test assertions to bypass failures.
