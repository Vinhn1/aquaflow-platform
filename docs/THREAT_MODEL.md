# Threat Model & Security Mitigations

This document identifies security risks, potential attack vectors, impact assessments, and corresponding mitigation strategies for AquaFlow Platform.

---

## 1. Top 10 Security Threats & Mitigations

### 1. Insecure Direct Object References (IDOR)
- **Threat**: An attacker changes the invoice ID or customer ID in API requests to view another citizen's bill or meter consumption.
- **Impact**: Severe privacy violation and PII data leakage.
- **Mitigation**: Domain service enforces ownership checks: `SELECT * FROM invoices WHERE id = :id AND customer_id IN (SELECT customer_id FROM user_meters WHERE user_id = :authenticated_user_id)`.

### 2. Fake Payment Callbacks & Webhook Tampering
- **Threat**: An attacker sends forged webhook notifications to mark unpaid bills as PAID.
- **Impact**: Financial loss and unpaid water accounts.
- **Mitigation**: Validate HMAC-SHA256 signatures on all payment webhooks using a secret key; process webhooks idempotently with transaction references.

### 3. Account Takeover & OTP Abuse
- **Threat**: Automated brute-force attacks against phone verification OTPs or SMS flooding.
- **Impact**: Identity theft and telecommunication SMS cost inflation.
- **Mitigation**: Limit OTP requests to 1 per 60 seconds; maximum 5 verification attempts per code; expire OTP after 3 minutes.

### 4. Malicious File Upload in Incident Reporting
- **Threat**: Attackers upload executable scripts or webshells disguised as leak incident photos.
- **Impact**: Remote code execution or cross-site scripting on the server/admin dashboard.
- **Mitigation**: Validate magic byte headers; enforce image whitelist (JPEG, PNG, WEBP); re-encode images; save under random UUIDs with no execution permissions.

### 5. SQL & NoSQL Injection
- **Threat**: Crafting malicious payload in search, customer lookup, or filter queries.
- **Impact**: Full database compromise or data destruction.
- **Mitigation**: Strictly use parameterized queries and ORM query builders; forbid raw SQL string concatenation.

### 6. Cross-Site Scripting (XSS)
- **Threat**: Injecting malicious HTML/JS into complaint descriptions or news comment fields.
- **Impact**: Session hijacking of admin staff viewing complaints in the dashboard.
- **Mitigation**: HTML sanitization on the backend; CSP (Content Security Policy) headers on web apps; escape all rendered text.

### 7. Denial of Service (DoS) / Resource Exhaustion
- **Threat**: High-concurrency automated requests on queue booking, bill lookup, or report submission.
- **Impact**: Service unavailability during peak bill payment hours.
- **Mitigation**: Rate limiting per IP and per authenticated user (e.g. 60 requests/minute for general APIs, 5/minute for queue booking).

### 8. Sensitive Data Exposure in Logs
- **Threat**: Application log aggregators storing full customer tokens, passwords, or PII.
- **Impact**: Credential theft from internal log analysis tools.
- **Mitigation**: Custom logger masking middleware stripping authorization headers, citizen IDs, and raw phone numbers.

### 9. Privilege Escalation in Admin Dashboard
- **Threat**: A regular citizen user invoking counter-calling or branch administration endpoints.
- **Impact**: Disruption of physical queue counters and unauthorized data modification.
- **Mitigation**: Role-Based Access Control (RBAC) middleware verifying roles (`CITIZEN`, `COUNTER_STAFF`, `BRANCH_MANAGER`, `SUPER_ADMIN`).

### 10. Replay Attacks on Queue Tickets
- **Threat**: Reusing expired or previously served ticket numbers to jump queues at physical branches.
- **Impact**: Customer dissatisfaction and physical counter disorder.
- **Mitigation**: Cryptographic QR code verification on ticket check-in with one-time use tokens and short validity windows.
