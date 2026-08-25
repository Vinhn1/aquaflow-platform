---
name: cawaco-business-analysis
description: Business analysis skill for CAWACO Digital Water domain. Converts unstructured user input into formal actors, use cases, business rules, and acceptance criteria.
---

# CAWACO Business Analysis Skill

## Purpose
Convert raw, fragmented business requests from water utility stakeholders into structured, disambiguated engineering requirements without hallucinating missing domain logic.

## Analysis Process Flow
```text
Raw Requirement
  -> Actor Identification
  -> Capability Mapping
  -> Detailed Use Case Specification
  -> Invariant & Business Rules Extraction
  -> Unknowns & Assumptions Identification
  -> Acceptance Criteria (Given-When-Then)
```

## Disambiguation Checklist for Water Utility Features
When analyzing any feature, systematically evaluate:
1. **Actors & Roles**: Who initiates the action? (Customer, Counter Staff, Field Worker, Admin, System Job).
2. **Branch & Location Context**: Does this apply to specific branch offices or enterprise-wide?
3. **Meter & Customer Identification**: What unique identifier is required? (Customer Code / Ma danh bo, Meter Serial Number, Contract Number).
4. **Tariff & Calculation Rules**: Does this involve water volume, sanitation fee, VAT, or customer category (Residential, Commercial, Industrial)?
5. **State Transitions**: What is the lifecycle of the entity? (e.g. Ticket: ISSUED -> CALLED -> SERVING -> COMPLETED -> CANCELLED -> EXPIRED).
6. **Edge Cases**: Network disconnection, duplicate requests, expired tickets, invalid meter codes.

## Output Contract
When executing business analysis, produce:
- **Actors**: Primary and secondary actors.
- **Pre-conditions**: Required system state before execution.
- **Main Flow**: Step-by-step nominal interaction.
- **Alternative & Exception Flows**: Error handling and cancellation paths.
- **Business Rules**: Invariants and validation rules.
- **Unknown Questions**: Specific list of questions added to `docs/requirements/open-questions.md`.
- **Acceptance Criteria**: Formatted as Given / When / Then statements.
