# Documentation Rules

## 1. Documentation as Single Source of Truth
- Technical documentation is not an afterthought; it is an active engineering artifact.
- Whenever an API contract, architecture pattern, database schema, or business rule changes, the corresponding documentation in `docs/` must be updated simultaneously.

## 2. Requirements Traceability
- Every implemented feature must maintain a trace link in `docs/requirements/requirements-traceability.md`:
  `Requirement ID -> Normalized Use Case -> Architectural Component -> API Endpoint -> Test Suite`.
- Never introduce undocumented API endpoints or hidden features.

## 3. Architectural Decision Records (ADR)
- Any significant architectural, structural, or technological decision must be captured in `docs/adr/ADR-XXX-<title>.md`.
- Format of ADR:
  - **Status**: Proposed / Accepted / Deprecated / Superseded.
  - **Context**: Problem statement, constraints, requirements.
  - **Decision**: The selected solution and rationale.
  - **Consequences**: Positive and negative trade-offs, impact on other components.

## 4. Markdown Standards
- Maintain clean, standard Markdown with proper headings hierarchy.
- Use clickable file links with `file:///` format for referenced code and config files.
- No emoji characters in documentation unless explicitly requested by the user.
