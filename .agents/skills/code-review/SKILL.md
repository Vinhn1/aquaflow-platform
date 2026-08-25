---
name: code-review
description: Code review skill. Multi-dimensional code review covering correctness, readability, architectural boundaries, security vulnerabilities, and test coverage.
---

# Code Review Skill

## Purpose
Perform thorough, multi-axis technical code review on pull requests and implementation changes before merging into main branches.

## Review Dimensions
1. **Functional Correctness**: Does the code satisfy the Acceptance Criteria without side effects?
2. **Architecture & Boundaries**: Does the code adhere to the Anti-Coupling rule and Adapter pattern?
3. **Security**: Are there IDOR, injection, auth bypass, or secret leakage risks?
4. **Code Cleanliness & Readability**: Are naming conventions, TypeScript types, and formatting clean and idiomatic?
5. **Test Completeness**: Are there corresponding unit/integration tests covering both happy and error paths?
6. **Documentation**: Are related API docs, ADRs, or PRDs updated?
