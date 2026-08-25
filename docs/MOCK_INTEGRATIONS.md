# Mock Integrations & External System Boundary Matrix

This document defines the integration status for every functional domain in AquaFlow Platform, distinguishing between features managed natively (REAL), simulated features (MOCK), and pending external systems (UNKNOWN).

---

## Integration Status Matrix

| Domain / Feature | Status | Description & Strategy | Adapter Implementation |
|---|---|---|---|
| **News & Announcements (Trang tin)** | **REAL** | Fully managed within AquaFlow internal database and admin portal. | `InternalNewsRepository` |
| **Incident Reports (Phan anh su co)** | **REAL** | Citizens submit reports, photos, and GPS; admin handles workflows natively. | `InternalComplaintRepository` |
| **Branch & Office Map (Ban do chi nhanh)** | **REAL** | Branch office locations, counters, and coordinates managed internally. | `InternalBranchRepository` |
| **Account Management (Tai khoan / Auth)** | **REAL** | JWT-based authentication for Zalo Mini App users and staff. | `InternalAuthService` |
| **Digital Queue Booking (Boc so online)** | **MOCK / Internal** | Internal queue ticket generation and simulated counter calling engine. | `MockQueueEngineAdapter` |
| **Customer Meter Binding (Khach hang & Hop dong)** | **MOCK** | Simulated customer profiles and meter associations for prototype testing. | `MockCustomerRepository` |
| **Water Invoices & Readings (Hoa don & Chi so)** | **MOCK** | Simulated monthly bills, historical water volumes, and tariffs. | `MockInvoiceRepository` |
| **Payment QR & Webhook (Thanh toan QR)** | **MOCK** | Generates real-looking VietQR images; simulated bank webhook triggers payment completion. | `MockPaymentGatewayAdapter` |
| **CAWACO Core ERP / Billing API** | **UNKNOWN** | Official CAWACO back-office API is not yet available; abstracted behind `ICawacoCorePort`. | `CawacoCoreAdapter (Pending)` |

---

## Architectural Adapter Design
Every MOCK component must implement a typed interface so that replacing it with a REAL external integration requires zero changes to domain services or frontend clients:

```typescript
// Example Port Interface:
export interface ICustomerPort {
  findByCustomerCode(customerCode: string): Promise<CustomerDto | null>;
  verifyMeterOwnership(customerCode: string, meterNumber: string): Promise<boolean>;
}

// In Development / Prototype Mode:
export class MockCustomerAdapter implements ICustomerPort {
  // Returns deterministic simulated water customer data
}

// When Official CAWACO API Becomes Available:
export class CawacoRestCustomerAdapter implements ICustomerPort {
  // Makes authenticated HTTP calls to CAWACO Core System
}
```
