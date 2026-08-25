---
name: cawaco-security-review
description: Security review and vulnerability audit skill for AquaFlow platform. Audits authentication, authorization, IDOR, input validation, payment callbacks, and sensitive data protection.
---

# CAWACO Security Review Skill

## Purpose
Perform independent, rigorous security verification of all code changes before they pass the Quality Gate.

## Security Audit Checklist
1. **Authentication & Session**:
   - Are protected endpoints guarded with JWT/session middlewares?
   - Is token expiration and validation properly enforced?
2. **Authorization & IDOR**:
   - Does every database query filter by authenticated `userId` / `customer_id`?
   - Can a user modify or access another user's invoice, meter, or ticket by guessing IDs?
3. **Input Validation**:
   - Are all payload parameters, query strings, and path variables validated with schema definitions?
   - Is dangerous HTML/JS stripped or escaped to prevent XSS?
4. **Database & SQL Injection**:
   - Are all database queries parameterized?
   - Are raw SQL strings strictly prohibited or sanitized?
5. **File Upload Security**:
   - Are file uploads checked for magic bytes, MIME types, and size limits?
   - Are files saved under random UUID filenames?
6. **Payment & Webhook Callbacks**:
   - Is the webhook signature cryptographically verified?
   - Is payment processing idempotent against duplicate webhooks?
7. **Secrets & Data Leakage**:
   - Are there hardcoded API keys, tokens, or passwords?
   - Are sensitive fields (phone, citizen ID, password) excluded from logs and error payloads?

## Output Report Contract
For every audit, produce:
- **Audit Summary**: Scope of reviewed files.
- **Identified Vulnerabilities**: Categorized by severity (CRITICAL, HIGH, MEDIUM, LOW).
- **Remediation Steps**: Exact code recommendations for fixes.
- **Verdict**: PASS (Ready to merge) or FAIL (Blocked until fixes applied).
