---
name: api-design
description: API design skill. Designs RESTful API contracts, standardized response envelopes, error structures, and schema validation.
---

# API Design Skill

## Purpose
Design predictable, secure, and developer-friendly RESTful API contracts that adhere to strict envelope standards and validation layers.

## Standards & Patterns
1. **URI Hierarchy**: Resource-oriented naming using lowercase plural nouns (`/api/v1/customers/:id/invoices`).
2. **Response Envelope**:
   - Success: `{ success: true, data: T, meta?: Meta }`
   - Error: `{ success: false, error: { code: string, message: string, details?: any[] } }`
3. **Contract First & Schema Validation**:
   - Define request schemas (Body, Query, Params, Headers) using Zod or OpenAPI before writing controller code.
   - Enforce type inference directly from validation schemas into handler parameters.
4. **Error Handling**: Use explicit, domain-specific error codes (`CUSTOMER_NOT_FOUND`, `INVOICE_ALREADY_PAID`, `QUEUE_LIMIT_EXCEEDED`).
