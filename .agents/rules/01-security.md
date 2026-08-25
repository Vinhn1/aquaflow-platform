# Security Rules

## 1. Secrets & Credentials Management
- NEVER hardcode API keys, database passwords, JWT secrets, private keys, or tokens in source code.
- NEVER commit `.env` or sensitive credential files to Git.
- NEVER expose credentials, tokens, or hashes in log outputs or error messages.
- Always load configuration from validated environment variables.

## 2. Authentication & Session Management
- Every protected endpoint must verify the caller identity via JWT or session tokens.
- Support token expiration, rotation, and revocation where required.
- Do not trust client-supplied user identifiers in request headers without cryptographic verification.

## 3. Authorization & IDOR (Insecure Direct Object References)
- Every resource retrieval or mutation (e.g. view invoice, update customer info, check queue status, pay bill) must verify that the requesting user owns the resource or has explicit role permission.
- Never rely on frontend routing or UI hiding for authorization.

## 4. Input Validation & Injection Protection
- Validate all incoming data (body, query parameters, path variables, headers, and file payloads) using schema validation.
- Prevent SQL injection by using parameterized queries and ORM query builders. Raw SQL is prohibited unless formally justified in an ADR.
- Sanitize any user-generated content before rendering to prevent Cross-Site Scripting (XSS).

## 5. File Upload Security
- Strictly validate uploaded files for:
  - Whitelisted MIME types (e.g. image/jpeg, image/png, application/pdf).
  - Magic byte signatures (not just file extension).
  - Maximum allowed file size.
- Store files with randomly generated UUID filenames; never use user-supplied file names directly on disk or storage.

## 6. Payment & Webhook Security
- Never mark an invoice or payment as successful based solely on client-side requests or frontend callbacks.
- Payment status transitions require server-to-server webhook verification with cryptographic signature validation (HMAC/checksum) and idempotent processing.

## 7. Logging & Data Leakage
- Never log passwords, tokens, full credit card/banking credentials, or sensitive Personal Identifiable Information (PII) like Citizen IDs or raw phone numbers.
- In production, error responses returned to clients must never contain internal stack traces, database schema details, or server paths.
