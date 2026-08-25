# API Specification Contract - AquaFlow Platform

All endpoints are versioned under `/api/v1` and strictly follow the standardized JSON response envelope.

---

## Standard Response Format

### Success Envelope
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

### Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CUSTOMER_CODE",
    "message": "Customer code CM102938 not found in CAWACO registry.",
    "details": []
  }
}
```

---

## 1. Authentication (`/api/v1/auth`)

### `POST /api/v1/auth/zalo`
- **Description**: Authenticate citizen via Zalo Mini App access token.
- **Request Body**:
  ```json
  { "accessToken": "zalo_access_token_string" }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "token": "jwt_session_token",
      "user": {
        "id": "uuid",
        "phone": "0912345678",
        "fullName": "Nguyen Van A",
        "role": "CITIZEN"
      }
    }
  }
  ```

---

## 2. Customer & Meter Linking (`/api/v1/customers`)

### `GET /api/v1/customers/me`
- **Description**: List all water meters linked to the authenticated user.
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "customerCode": "CM102938",
        "fullName": "NGUYEN VAN A",
        "address": "204 Quang Trung, P. Tan Thanh, TP. Ca Mau",
        "meterSerialNumber": "MTR-88291",
        "tariffGroup": "DOMESTIC_TP",
        "label": "Nha rieng",
        "isDefault": true
      }
    ]
  }
  ```

### `POST /api/v1/customers/link`
- **Description**: Link a new meter via Customer Code.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "customerCode": "CM102938",
    "label": "Nha bo me"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "customerCode": "CM102938",
      "fullName": "NGUYEN VAN B",
      "address": "Phuong 5, TP. Ca Mau",
      "label": "Nha bo me"
    }
  }
  ```

---

## 3. Water Invoices & Billing (`/api/v1/invoices`)

### `GET /api/v1/invoices`
- **Description**: Query unpaid and historical invoices for a customer code.
- **Query Params**: `customerCode=CM102938&status=UNPAID&page=1&pageSize=10`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid-invoice",
        "invoiceCode": "INV-2026-08-001",
        "customerCode": "CM102938",
        "period": "2026-08",
        "previousIndex": 120,
        "currentIndex": 145,
        "consumptionM3": 25,
        "baseAmount": 195000,
        "vatAmount": 9750,
        "environmentalFeeAmount": 19500,
        "totalAmount": 224250,
        "status": "UNPAID",
        "dueDate": "2026-09-05T00:00:00.000Z",
        "breakdown": [
          { "tierNumber": 1, "fromM3": 1, "toM3": 10, "volumeM3": 10, "unitPrice": 6600, "amount": 66000 },
          { "tierNumber": 2, "fromM3": 11, "toM3": 20, "volumeM3": 10, "unitPrice": 8100, "amount": 81000 },
          { "tierNumber": 3, "fromM3": 21, "toM3": 30, "volumeM3": 5, "unitPrice": 9600, "amount": 48000 }
        ]
      }
    ],
    "meta": { "page": 1, "pageSize": 10, "total": 1 }
  }
  ```

---

## 4. Payment Gateway & VietQR (`/api/v1/payments`)

### `POST /api/v1/payments/generate-qr`
- **Description**: Generate dynamic NAPAS247 VietQR image and payload for an unpaid invoice.
- **Request Body**:
  ```json
  {
    "invoiceId": "uuid-invoice",
    "paymentMethod": "VIETQR"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "qrCodeUrl": "https://api.vietqr.io/image/...",
      "qrPayload": "00020101021238...",
      "paymentRef": "PAY-CM-102938-202608",
      "bankAccount": "0290123456789",
      "bankCode": "ICB",
      "accountHolder": "CTY CP CAP NUOC CA MAU",
      "amount": 224250,
      "expiresAt": "2026-08-26T01:30:00.000Z"
    }
  }
  ```

### `POST /api/v1/payments/webhook`
- **Description**: Server-to-server webhook callback from payment gateway / bank.
- **Headers**: `X-Signature: hmac_sha256_hash`
- **Request Body**:
  ```json
  {
    "paymentRef": "PAY-CM-102938-202608",
    "invoiceId": "uuid-invoice",
    "amount": 224250,
    "bankTransactionId": "TXN-998822",
    "transactionTime": "2026-08-26T00:40:00.000Z",
    "signature": "hmac_sha256_hash"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "status": "SETTLED",
      "settledAt": "2026-08-26T00:40:01.000Z"
    }
  }
  ```

---

## 5. Digital Queue (`/api/v1/queue`)

### `POST /api/v1/queue/tickets`
- **Description**: Book a digital queue ticket at a branch office.
- **Request Body**:
  ```json
  {
    "branchId": "uuid-branch-204-quang-trung",
    "serviceType": "NEW_METER_REGISTRATION",
    "customerName": "Nguyen Van A"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-ticket",
      "ticketNumber": "A-105",
      "branchName": "Trụ sở chính - 204 Quang Trung",
      "serviceType": "NEW_METER_REGISTRATION",
      "status": "WAITING",
      "positionInQueue": 3,
      "estimatedWaitMinutes": 15,
      "issuedAt": "2026-08-26T00:42:00.000Z"
    }
  }
  ```

---

## 6. Complaints & Water Leak Reports (`/api/v1/complaints`)

### `POST /api/v1/complaints`
- **Description**: Submit citizen report for burst pipe or water quality issue.
- **Request Body**:
  ```json
  {
    "category": "PIPE_BURST_LEAK",
    "description": "Bể đường ống nhánh trước nhà số 204 Quang Trung, nước tràn mặt đường",
    "latitude": 9.1768,
    "longitude": 105.1502,
    "addressText": "204 Quang Trung, P. Tan Thanh, TP. Ca Mau",
    "images": ["https://storage.aquaflow.vn/complaints/img1.jpg"]
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-complaint",
      "status": "SUBMITTED",
      "createdAt": "2026-08-26T00:43:00.000Z"
    }
  }
  ```
