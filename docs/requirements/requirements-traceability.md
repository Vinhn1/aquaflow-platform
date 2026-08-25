# Requirements Traceability Matrix

This matrix connects high-level requirements to normalized use cases, architectural components, API contracts, implementation files, and test suites.

| Req ID | Requirement Name | Status | Use Case Ref | Architectural Component & Port | API Contract & Schema | UI Screen / App | Implementation | Test Suite |
|---|---|---|---|---|---|---|---|---|
| REQ-AUTH-01 | Zalo Mini App Citizen Authentication | IMPLEMENTED_MOCK | UC-AUTH-01 | `AuthService`, `ZaloOAuthAdapter` | `POST /api/v1/auth/zalo` | `apps/mini-app` (Header & Tab 4) | `apps/api/src/services/AuthService.ts` | Pending Phase 7 |
| REQ-CUST-01 | Link Customer Water Meter (Ma danh bo) | IMPLEMENTED_MOCK | UC-CUST-01 | `CustomerService`, `ICustomerPort` | `POST /api/v1/customers/link` | `apps/mini-app` (Tab 4 & Switch Meter Modal) | `apps/api/src/services/CustomerService.ts` | Pending Phase 7 |
| REQ-BILL-01 | Lookup Water Bills & Official Tariff Calculation | IMPLEMENTED_MOCK | UC-BILL-01 | `BillingService`, `IInvoicePort` | `GET /api/v1/invoices` | `apps/mini-app` (Tab 1 & Invoice Detail Modal) | `apps/api/src/services/TariffCalculator.ts` | Pending Phase 7 |
| REQ-PAY-01 | Generate Dynamic VietQR & Webhook Settlement | IMPLEMENTED_MOCK | UC-PAY-01 | `PaymentService`, `IPaymentPort` | `POST /api/v1/payments/generate-qr` | `apps/mini-app` (VietQR Dynamic Modal) | `apps/api/src/services/PaymentService.ts` | Pending Phase 7 |
| REQ-QUE-01 | Online Digital Queue Booking & Real-time Call | IMPLEMENTED_MOCK | UC-QUE-01 | `QueueEngine`, `IQueuePort` | `POST /api/v1/queue/tickets` | `apps/mini-app` (Queue Modal) & `apps/admin` (Counter Screen) | `apps/api/src/services/QueueEngine.ts` | Pending Phase 7 |
| REQ-COMP-01 | Submit Water Leak / Incident Report | IMPLEMENTED_MOCK | UC-COMP-01 | `ComplaintService`, `IComplaintPort` | `POST /api/v1/complaints` | `apps/mini-app` (Complaint Modal) & `apps/admin` (Map Screen) | `apps/api/src/services/ComplaintService.ts` | Pending Phase 7 |
| REQ-NEWS-01 | View Water Utility News & Outages | IMPLEMENTED_MOCK | UC-NEWS-01 | `NewsService`, `INewsPort` | `GET /api/v1/news` | `apps/mini-app` (Tab 2 News & Outage Alerts) | `apps/api/src/routes/news.routes.ts` | Pending Phase 7 |
| REQ-MAP-01 | View Transaction Offices & Payment Points Map | IMPLEMENTED_MOCK | UC-MAP-01 | `BranchService`, `IBranchPort` | `GET /api/v1/branches` | `apps/mini-app` (Tab 3 Interactive Map) | `apps/api/src/routes/branch.routes.ts` | Pending Phase 7 |
