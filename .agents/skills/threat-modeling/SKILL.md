---
name: threat-modeling
description: Threat modeling skill. Applies STRIDE methodology and asset-based threat analysis to identify, assess, and mitigate security vulnerabilities.
---

# Threat Modeling Skill

## Purpose
Systematically discover, evaluate, and mitigate security threats across all system components, data flows, and trust boundaries before code implementation.

## STRIDE Evaluation Matrix
1. **Spoofing**: Can an attacker pretend to be another customer or counter staff? (Mitigation: JWT authentication, cryptographic signatures).
2. **Tampering**: Can payment amount, meter index, or invoice status be modified in transit? (Mitigation: Server-side validation, HMAC checksums, TLS).
3. **Repudiation**: Can a user deny paying or booking a ticket? (Mitigation: Audit logging, immutable payment event ledger).
4. **Information Disclosure**: Can customer PII, meter addresses, or unpaid bills leak? (Mitigation: IDOR checks, strict serialization, field masking).
5. **Denial of Service**: Can someone spam OTP requests, ticket generation, or invoice lookup? (Mitigation: Rate limiting, IP throttling, CAPTCHA).
6. **Elevation of Privilege**: Can a regular customer access administrative or counter calling APIs? (Mitigation: Role-Based Access Control - RBAC).
