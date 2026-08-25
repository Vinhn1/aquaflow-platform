# Normalized Use Cases - AquaFlow Platform (Target Prototype: CAWACO)

---

## UC-AUTH-01: Citizen Authentication via Zalo Mini App
- **Actor**: Citizen (Water Consumer).
- **Pre-conditions**: Citizen opens the Zalo Mini App on mobile.
- **Main Flow**:
  1. Citizen grants profile & phone permission on Zalo Mini App.
  2. Frontend sends Zalo access token to `POST /api/v1/auth/zalo`.
  3. Backend verifies token with Zalo OAuth API (or Mock Zalo Provider).
  4. System returns JWT Session Token with Citizen Role.
- **Business Rules**:
  - Phone number is validated according to Vietnamese format (`03/05/07/08/09 + 8 digits`).
  - Session token is valid for 7 days with refresh mechanism.
- **Acceptance Criteria**:
  - *Given* a valid Zalo user token, *When* authenticating, *Then* return JWT token and load citizen profile within 500ms.

---

## UC-CUST-01: Multi-Meter Customer Code Binding
- **Actor**: Authenticated Citizen.
- **Pre-conditions**: Citizen logged in via Zalo Mini App.
- **Main Flow**:
  1. Citizen enters CAWACO Customer Code (Ma danh bo, e.g. `CM102938`) and sets a label (e.g. "Nha rieng").
  2. System checks `ICustomerPort` (Mock/Real Adapter) to verify meter existence and owner name.
  3. System records the binding in `user_meters` table.
- **Business Rules**:
  - A citizen can bind up to 10 water meter codes.
  - Multiple family members can link the same customer code to receive notifications.
- **Acceptance Criteria**:
  - *Given* a valid customer code, *When* linking, *Then* meter address and current owner name are returned and saved.

---

## UC-BILL-01: Monthly Bill Lookup & Official Tariff Calculation
- **Actor**: Authenticated Citizen.
- **Pre-conditions**: Customer code linked.
- **Main Flow**:
  1. Citizen selects a linked water meter.
  2. System fetches unpaid and historical invoices via `IInvoicePort`.
  3. System displays line-item breakdown: Water volume (m3), Base price (tiered per QĐ 13/2023), VAT (5%), Environmental protection fee (10%), Total amount payable.
- **Business Rules**:
  - Progressive tariff tiers for TP. Ca Mau:
    - Tier 1 (1 - 10 m3): 6,600 VND/m3
    - Tier 2 (11 - 20 m3): 8,100 VND/m3
    - Tier 3 (21 - 30 m3): 9,600 VND/m3
    - Tier 4 (> 30 m3): 11,500 VND/m3
  - VAT = 5% of base water amount.
  - Environmental protection fee = 10% of base water amount (before VAT).
  - Total = Base + VAT + Env Fee.
- **Acceptance Criteria**:
  - *Given* consumption of 25 m3 in TP. Ca Mau, *Then* calculation must strictly match:
    - Tier 1 (10 x 6,600) + Tier 2 (10 x 8,100) + Tier 3 (5 x 9,600) = 66,000 + 81,000 + 48,000 = 195,000 VND.
    - VAT 5% = 9,750 VND.
    - Env fee 10% = 19,500 VND.
    - Total = 224,250 VND.

---

## UC-PAY-01: Dynamic VietQR Payment & Webhook Settlement
- **Actor**: Authenticated Citizen, Payment Gateway/Bank.
- **Pre-conditions**: Unpaid invoice exists.
- **Main Flow**:
  1. Citizen clicks "Thanh toan ngay" for invoice `INV-2026-08-01`.
  2. Backend calls `IPaymentPort` to generate a dynamic NAPAS247 VietQR containing CAWACO bank account, customer code, invoice reference, and exact total amount.
  3. Citizen scans QR via banking app or transfers directly.
  4. Payment Gateway dispatches webhook to `POST /api/v1/payments/webhook`.
  5. System validates HMAC-SHA256 signature, updates invoice status to `PAID`, and logs audit trail.
- **Business Rules**:
  - Webhook must be idempotent (duplicate webhook requests do not double-settle).
  - Partial payments are rejected unless explicitly configured.
- **Acceptance Criteria**:
  - *Given* a valid webhook with correct HMAC, *When* processed, *Then* invoice status changes to PAID and push notification is sent to citizen within 2s.

---

## UC-QUE-01: Smart Queue Booking at CAWACO Branches
- **Actor**: Authenticated Citizen, Counter Service Staff.
- **Pre-conditions**: Citizen needs in-person service at 204 Quang Trung branch.
- **Main Flow**:
  1. Citizen selects Branch: "Trụ sở chính - 204 Quang Trung, P. Tân Thành, TP. Cà Mau".
  2. Citizen selects Service Category:
     - *Dich vu 1: Dang ky lap dat moi dong ho nuoc*
     - *Dich vu 2: Thu tien nuoc & Tra cuu hoa don*
     - *Dich vu 3: Sang ten / Doi thong tin hop dong*
     - *Dich vu 4: Khieu nai & Kiem dinh dong ho nuoc*
  3. System generates ticket number (e.g. `A-105`), records estimated wait time, and remaining people ahead.
  4. At branch counter, staff clicks "Goi so tiep theo".
  5. System updates ticket to `SERVING` and notifies citizen via app.
- **Business Rules**:
  - Maximum 1 active unserved ticket per citizen per service category per day.
  - Ticket auto-cancels if not checked in within 30 minutes of counter call.
- **Acceptance Criteria**:
  - *Given* an active booking, *Then* citizen can monitor live queue counter status in real-time.

---

## UC-COMP-01: Water Leak & Incident Reporting
- **Actor**: Citizen.
- **Main Flow**:
  1. Citizen selects incident type: "Be duong ong / Ro ri nuoc", "Nuoc duc", "Nuoc yeu", "Hu hong dong ho".
  2. Citizen attaches GPS location and up to 3 photos.
  3. System saves complaint with status `SUBMITTED`.
  4. Admin / Field staff dispatches team and updates status: `IN_PROGRESS` -> `RESOLVED`.
- **Acceptance Criteria**:
  - *Given* a photo and GPS coordinates, *When* submitted, *Then* complaint reference code is generated and visible on citizen tracking tab.
