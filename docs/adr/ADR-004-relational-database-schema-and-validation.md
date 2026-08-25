# ADR-004: Relational Database Schema & Validation Layer Architecture

- **Status**: ACCEPTED
- **Date**: 2026-08-26
- **Deciders**: Engineering Lead, Architecture Team

## Context & Problem Statement
To secure the platform against SQL injection, data corruption, IDOR, and malformed inputs, AquaFlow requires:
1. A strongly typed relational schema for PostgreSQL.
2. A strict runtime validation layer using Zod for 100% of request inputs.

## Decision
1. **Schema Design**: Implemented in `packages/types/prisma/schema.prisma` with 9 models: `User`, `Customer`, `UserMeter`, `Invoice`, `Payment`, `QueueTicket`, `Complaint`, `News`, `Branch`.
2. **Data Integrity**: Enforced via composite indexes (`[customerId, status]`, `[branchId, status]`, `[userId, status]`), unique natural keys, and soft delete (`deletedAt`).
3. **Input Validation**: Implemented via Zod in `packages/validation/src/` ensuring all controller inputs are parsed and typed before touching domain services.

## Consequences
- **Positive**: Type safety from database to API controllers; strict input filtering prevents malicious payloads.
- **Negative**: Requires maintaining Zod schemas alongside TypeScript DTOs.
