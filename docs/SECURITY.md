# Security Policy & Operational Guidelines - AquaFlow Platform

---

## 1. Core Principles
- **Defense in Depth**: Security controls are implemented across multiple layers: Network, API Gateway, Application Service, and Database.
- **Zero Trust**: No internal or external client is implicitly trusted; all requests undergo token validation and authorization.
- **Least Privilege**: Users and administrative roles are granted the minimum necessary permissions.

---

## 2. Cryptographic Standards
- In-transit encryption: Strict HTTPS / TLS 1.3.
- Password hashing: Argon2id or bcrypt (work factor >= 12).
- Session & JWT tokens: Signed with HMAC-SHA256 (minimum 256-bit secret key).
- Webhook signatures: HMAC-SHA256 with timestamp verification to prevent replay attacks.

---

## 3. Vulnerability Reporting & Remediation
- Security issues must be categorized according to the Threat Model (`docs/THREAT_MODEL.md`).
- Any High or Critical vulnerability blocks the CI/CD deployment pipeline until fixed and verified by `cawaco-security-review`.
