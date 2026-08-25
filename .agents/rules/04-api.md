# API Rules

## 1. RESTful Design & Resource Naming
- Resource endpoints must use nouns in plural form: `/api/v1/customers`, `/api/v1/invoices`, `/api/v1/queue-tickets`.
- Use standard HTTP methods:
  - `GET`: Retrieve resources (idempotent, safe).
  - `POST`: Create new resources.
  - `PUT`: Full replacement of resource.
  - `PATCH`: Partial update of resource.
  - `DELETE`: Remove / archive resource.

## 2. Standardized Response Envelope
All API responses must strictly follow the standard JSON envelope structure.

### Success Response:
```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

### Error Response:
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested invoice could not be found.",
    "details": []
  }
}
```

## 3. HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure or malformed payload.
- `401 Unauthorized`: Missing or invalid authentication token.
- `403 Forbidden`: Authenticated, but lacking permission (ownership/role check failed).
- `404 Not Found`: Resource does not exist.
- `409 Conflict`: Business state conflict (e.g. ticket already processed, customer code exists).
- `422 Unprocessable Entity`: Semantic domain validation error.
- `429 Too Many Requests`: Rate limit exceeded.
- `500 Internal Server Error`: Unexpected runtime failure (never expose stack traces).

## 4. Input Validation & Sanitization
- All request parameters (body, query, headers, path params) must be validated via schema validation (Zod) before reaching domain services.
- Invalid requests must return `400 Bad Request` with structured field-level error messages.

## 5. Versioning & Deprecation
- All public endpoints must be versioned under `/api/v1/...`.
- Breaking changes require creating a new API version (`/api/v2/...`).
