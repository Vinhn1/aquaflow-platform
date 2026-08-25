# Requirements Traceability Matrix

This matrix connects high-level requirements to normalized use cases, architectural components, API contracts, implementation files, and test suites.

| Req ID | Requirement Name | Status | Use Case Ref | Architectural Component & Port | API Contract | Implementation | Test Suite |
|---|---|---|---|---|---|---|---|
| REQ-AUTH-01 | Zalo Mini App Citizen Authentication | DESIGNED | UC-AUTH-01 | `AuthService`, `ZaloOAuthAdapter` | `/api/v1/auth/zalo` | Pending Phase 6 | Pending Phase 7 |
| REQ-CUST-01 | Link Customer Water Meter (Ma danh bo) | DESIGNED | UC-CUST-01 | `CustomerService`, `ICustomerPort` | `/api/v1/customers/link` | Pending Phase 6 | Pending Phase 7 |
| REQ-BILL-01 | Lookup Water Bills & Official Tariff Calculation | DESIGNED | UC-BILL-01 | `BillingService`, `IInvoicePort` | `/api/v1/invoices` | Pending Phase 6 | Pending Phase 7 |
| REQ-PAY-01 | Generate Dynamic VietQR & Webhook Settlement | DESIGNED | UC-PAY-01 | `PaymentService`, `IPaymentPort` | `/api/v1/payments/generate-qr` | Pending Phase 6 | Pending Phase 7 |
| REQ-QUE-01 | Online Digital Queue Booking & Real-time Call | DESIGNED | UC-QUE-01 | `QueueEngine`, `IQueuePort` | `/api/v1/queue/tickets` | Pending Phase 6 | Pending Phase 7 |
| REQ-COMP-01 | Submit Water Leak / Incident Report | DESIGNED | UC-COMP-01 | `ComplaintService`, `IComplaintPort` | `/api/v1/complaints` | Pending Phase 6 | Pending Phase 7 |
| REQ-NEWS-01 | View Water Utility News & Outages | DESIGNED | UC-NEWS-01 | `NewsService`, `INewsPort` | `/api/v1/news` | Pending Phase 6 | Pending Phase 7 |
| REQ-MAP-01 | View Transaction Offices & Payment Points Map | DESIGNED | UC-MAP-01 | `BranchService`, `IBranchPort` | `/api/v1/branches` | Pending Phase 6 | Pending Phase 7 |
