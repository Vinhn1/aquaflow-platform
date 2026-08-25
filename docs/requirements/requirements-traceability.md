# Requirements Traceability Matrix

This matrix connects high-level requirements to normalized use cases, architectural components, API contracts, implementation files, and test suites.

| Req ID | Requirement Name | Status | Use Case Ref | Architectural Component & Port | API Contract & Schema | UI Screen / App | Implementation | Test Suite |
|---|---|---|---|---|---|---|---|---|
| REQ-AUTH-01 | Zalo Mini App Citizen Authentication | VERIFIED | UC-AUTH-01 | `AuthService`, `ZaloOAuthAdapter` | `POST /api/v1/auth/zalo` | `apps/mini-app` (Header & Tab 4) | `apps/api/src/services/AuthService.ts` | `apps/api/test/Integration.test.ts` |
| REQ-CUST-01 | Link Customer Water Meter (Ma danh bo) | VERIFIED | UC-CUST-01 | `CustomerService`, `ICustomerPort` | `POST /api/v1/customers/link` | `apps/mini-app` (Tab 4 & Switch Meter Modal) | `apps/api/src/services/CustomerService.ts` | `apps/api/test/CustomerService.test.ts` |
| REQ-BILL-01 | Lookup Water Bills & Official Tariff Calculation | VERIFIED | UC-BILL-01 | `BillingService`, `IInvoicePort` | `GET /api/v1/invoices` | `apps/mini-app` (Tab 1 & Invoice Detail Modal) | `apps/api/src/services/TariffCalculator.ts` | `apps/api/test/TariffCalculator.test.ts` |
| REQ-PAY-01 | Generate Dynamic VietQR & Webhook Settlement | VERIFIED | UC-PAY-01 | `PaymentService`, `IPaymentPort` | `POST /api/v1/payments/generate-qr` | `apps/mini-app` (VietQR Dynamic Modal) | `apps/api/src/services/PaymentService.ts` | `apps/api/test/PaymentService.test.ts` |
| REQ-QUE-01 | Online Digital Queue Booking & Real-time Call | VERIFIED | UC-QUE-01 | `QueueEngine`, `IQueuePort` | `POST /api/v1/queue/tickets` | `apps/mini-app` (Queue Modal) & `apps/admin` (Counter Screen) | `apps/api/src/services/QueueEngine.ts` | `apps/api/test/QueueEngine.test.ts` |
| REQ-COMP-01 | Submit Water Leak / Incident Report | VERIFIED | UC-COMP-01 | `ComplaintService`, `IComplaintPort` | `POST /api/v1/complaints` | `apps/mini-app` (Complaint Modal) & `apps/admin` (Map Screen) | `apps/api/src/services/ComplaintService.ts` | `apps/api/test/Integration.test.ts` |
| REQ-NEWS-01 | View Water Utility News & Outages | VERIFIED | UC-NEWS-01 | `NewsService`, `INewsPort` | `GET /api/v1/news` | `apps/mini-app` (Tab 2 News & Outage Alerts) | `apps/api/src/routes/news.routes.ts` | `apps/api/test/Integration.test.ts` |
| REQ-MAP-01 | View Transaction Offices & Payment Points Map | VERIFIED | UC-MAP-01 | `BranchService`, `IBranchPort` | `GET /api/v1/branches` | `apps/mini-app` (Tab 3 Interactive Map) | `apps/api/src/routes/branch.routes.ts` | `apps/api/test/Integration.test.ts` |
