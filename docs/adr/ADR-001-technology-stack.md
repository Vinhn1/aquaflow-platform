# ADR-001: Core Technology Stack Selection

- **Status**: ACCEPTED
- **Date**: 2026-08-26
- **Deciders**: Engineering Lead, Architecture Review

## Context & Problem Statement
AquaFlow Platform is an enterprise prototype designed for water utility customer service (CAWACO domain). It requires a modern, maintainable, type-safe stack capable of serving both Zalo Mini App mobile clients, web-based admin dashboards, and robust backend APIs with mock-to-real adapter transitions.

## Decision
1. **Language & Runtime**: TypeScript strict mode on Node.js (v20+ LTS).
2. **Backend API Framework**: Fast, lightweight TypeScript HTTP framework (Express/Fastify/Hono) with Zod validation.
3. **Database**: PostgreSQL for relational ACID consistency and structured schema migration.
4. **Client Applications**: React / Zalo Mini App SDK for mobile citizen interface, modern React for Admin Dashboard.
5. **Monorepo Management**: pnpm workspaces for clean package sharing (`types`, `shared`, `validation`).

## Consequences
- **Positive**: Strict type safety across frontend and backend; high team productivity; standard tooling; easy containerization.
- **Negative**: Requires rigorous schema synchronization between database and TypeScript models.
