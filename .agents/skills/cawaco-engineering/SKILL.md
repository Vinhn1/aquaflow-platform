---
name: cawaco-engineering
description: Master engineering workflow skill for AquaFlow platform. Enforces step-by-step development from evidence check and architecture design to testing and quality gate approval.
---

# CAWACO Master Engineering Skill

## Mission
Ensure all code produced for AquaFlow Platform is robust, modular, test-covered, secure, and compliant with the Hexagonal Adapter architecture.

## Master Engineering Workflow
```text
1. Requirement Ingestion
     ↓
2. Evidence Check (Classify as FACT, ASSUMPTION, UNKNOWN, or DECISION)
     ↓
3. Business Analysis & Acceptance Criteria Definition
     ↓
4. Architectural & Adapter Boundary Design
     ↓
5. Implementation Plan Creation
     ↓
6. USER APPROVAL (Mandatory Gate)
     ↓
7. Implementation (Domain, Ports, Adapters, Controllers)
     ↓
8. Automated Tests (Unit, Integration, E2E)
     ↓
9. Security & Code Review (Threat check, IDOR, Injection, Linting)
     ↓
10. Documentation Update (Traceability matrix, API Spec, PRD)
     ↓
11. Quality Gate PASS / FAIL
     ↓
12. Commit to Git
```

## Mandatory Development Rules
- **Anti-Coupling**: Never bypass the API layer from UI components.
- **Adapter First**: When integrating external systems, always code to an Interface and build the Mock Adapter first.
- **Traceability**: Link every implementation PR to an ID in `docs/requirements/requirements-traceability.md`.
- **Zero Hallucination**: If a field or API is unknown, do not fabricate it; use mock placeholders clearly annotated.
- **Honest Test Reporting**: If tests were not executed, declare "Tests not run".
