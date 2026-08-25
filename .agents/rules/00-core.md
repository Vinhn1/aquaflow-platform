# CAWACO Engineering Core Rules

## Project Scope
AquaFlow is a personal prototype for a water utility customer-service platform targeting the business domain of CAWACO (Cong ty Co phan Cap nuoc Ca Mau). It is NOT the official production system of CAWACO.

## Anti-Hallucination & Evidence Policy
- Never invent business rules (water tariff formulas, bill calculation formulas, customer tiers, queue policies).
- Never invent external API behavior or endpoints for CAWACO, banks, or Zalo.
- Never assume external system integrations exist unless proven by official documentation or sample data.
- Categorize every piece of information into:
  - FACT: Verified from official documentation or actual business input.
  - ASSUMPTION: Proposed technical hypothesis needing explicit user confirmation.
  - UNKNOWN: Missing information, must be recorded in docs/requirements/open-questions.md.
  - DECISION: Accepted architectural decisions recorded in ADRs.

## Change Policy
Before making any non-trivial or architectural changes:
1. Explain the problem clearly.
2. Explain the proposed solution and design.
3. Detail alternatives considered and trade-offs.
4. Assess the blast radius and impact on existing modules.
5. Wait for explicit user approval before writing code.

## Coding Standards
- TypeScript strict mode enabled across all apps and packages.
- No unnecessary `any` type casting; use strict schemas and interfaces.
- Validate all external inputs at the system boundary using schema validators (e.g. Zod).
- Keep functions small, pure where possible, and single-responsibility.
- Follow explicit dependency injection and interface-driven design.
- No emoji characters in code, comments, commit messages, or UI text unless explicitly requested by user.

## Security & Integrity Overrides
Security and correctness always override convenience. Never bypass:
- Authentication guards.
- Authorization and ownership checks (IDOR protection).
- Input validation.
- Rate limiting.
- Audit logging for financial, queue, or personal data.
