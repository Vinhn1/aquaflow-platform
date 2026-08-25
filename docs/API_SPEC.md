# API Specification Contract - AquaFlow Platform

All endpoints are prefixed with `/api/v1` and use standard JSON response envelopes.

---

## 1. Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/zalo`: Authenticate via Zalo Mini App token.
  - Body: `{ "accessToken": string }`
  - Response: `{ "success": true, "data": { "token": string, "user": UserDto } }`
- `POST /api/v1/auth/phone/request-otp`: Request phone verification OTP.
- `POST /api/v1/auth/phone/verify-otp`: Complete phone verification.

---

## 2. Customer & Meter Linking (`/api/v1/customers`)
- `GET /api/v1/customers/me`: List all water meters linked to the authenticated user.
- `POST /api/v1/customers/link`: Link a new meter via Customer Code (`customerCode`) and verification detail.
- `DELETE /api/v1/customers/link/:id`: Unlink a water meter from the user profile.

---

## 3. Water Invoices & Bills (`/api/v1/invoices`)
- `GET /api/v1/invoices?customerCode=...`: Fetch list of invoices and consumption history.
- `GET /api/v1/invoices/:id`: Get detailed invoice line items and calculation breakdown.

---

## 4. Payment Gateway & QR (`/api/v1/payments`)
- `POST /api/v1/payments/generate-qr`: Generate a dynamic VietQR payload and image for an unpaid invoice.
  - Body: `{ "invoiceId": string, "method": "VIETQR" }`
  - Response: `{ "success": true, "data": { "qrCodeUrl": string, "paymentRef": string, "amount": number } }`
- `POST /api/v1/payments/webhook`: Server-to-server webhook endpoint for payment confirmation (HMAC verified).

---

## 5. Digital Queue (`/api/v1/queue`)
- `POST /api/v1/queue/tickets`: Book a digital queue ticket for a specific branch and service.
  - Body: `{ "branchId": string, "serviceType": string }`
  - Response: `{ "success": true, "data": { "ticketNumber": string, "estimatedWaitMinutes": number, "aheadCount": number } }`
- `GET /api/v1/queue/tickets/:id`: Query real-time queue ticket progress.
- `POST /api/v1/queue/tickets/:id/cancel`: Cancel an unserved ticket.

---

## 6. Complaints & Incident Reports (`/api/v1/complaints`)
- `POST /api/v1/complaints`: Submit a water leak or incident report with coordinates and photos.
- `GET /api/v1/complaints/my`: View history and resolution status of submitted complaints.

---

## 7. News, Outages & Branches (`/api/v1/news`, `/api/v1/branches`)
- `GET /api/v1/news`: List published news and planned water outage alerts.
- `GET /api/v1/branches`: List all physical transaction offices with coordinates and active counters.
