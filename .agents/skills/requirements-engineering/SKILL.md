---
name: requirements-engineering
description: Requirements engineering skill. Discovers, extracts, normalizes, and maintains traceability for functional and non-functional requirements.
---

# Requirements Engineering Skill

## Purpose
Systematically transform stakeholder requests into unambiguous, verifiable requirement specifications and maintain traceability across the system lifecycle.

## Requirements Pipeline
```text
1. Ingestion: Capture raw input verbatim into docs/requirements/raw/.
2. Disambiguation: Extract atomic functional requirements (REQ-XXX) and non-functional requirements (NFR-XXX).
3. Normalization: Structure requirements into docs/requirements/normalized/ with actors, preconditions, flows, and invariants.
4. Gap Analysis: Identify missing information and log in docs/requirements/open-questions.md.
5. Traceability: Register requirement mappings in docs/requirements/requirements-traceability.md.
```

## Traceability Format
Each requirement must trace through:
- `REQ_ID`: Unique requirement identifier (e.g. `REQ-CUST-001`).
- `USE_CASE`: Target use case document.
- `ARCHITECTURE`: Target module or component.
- `API_ENDPOINT`: Target API contract.
- `TEST_ID`: Corresponding test suite.
