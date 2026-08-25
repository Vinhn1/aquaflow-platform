# Requirements Traceability Matrix

This matrix connects high-level requirements to normalized use cases, architectural components, API contracts, implementation files, and test suites.

| Req ID | Requirement Name | Status | Use Case Ref | Architectural Component & Port | API Contract & Schema | Implementation | Test Suite |
|---|---|---|---|---|---|---|---|
| REQ-AUTH-01 | Zalo Mini App Citizen Authentication | CONTRACT_READY | UC-AUTH-01 | `AuthService`, `ZaloOAuthAdapter` | `POST /api/v1/auth/zalo` (`ZaloAuthRequestSchema`) | Pending Phase 6 | Pending Phase 7 |
| REQ-CUST-01 | Link Customer Water Meter (Ma danh bo) | CONTRACT_READY | UC-CUST-01 | `CustomerService`, `ICustomerPort` | `POST /api/v1/customers/link` (`LinkCustomerMeterSchema`) | Pending Phase 6 | Pending Phase 7 |
| REQ-BILL-01 | Lookup Water Bills & Official Tariff Calculation | CONTRACT_READY | UC-BILL-01 | `BillingService`, `IInvoicePort` | `GET /api/v1/invoices` (`GetInvoicesQuerySchema`) | Pending Phase 6 | Pending Phase 7 |
| REQ-PAY-01 | Generate Dynamic VietQR & Webhook Settlement | CONTRACT_READY | UC-PAY-01 | `PaymentService`, `IPaymentPort` | `POST /api/v1/payments/generate-qr` (`GeneratePaymentQrSchema`) | Pending Phase 6 | Pending Phase 7 |
| REQ-QUE-01 | Online Digital Queue Booking & Real-time Call | CONTRACT_READY | UC-QUE-01 | `QueueEngine`, `IQueuePort` | `POST /api/v1/queue/tickets` (`BookQueueTicketSchema`) | Pending Phase 6 | Pending Phase 7 |
| REQ-COMP-01 | Submit Water Leak / Incident Report | CONTRACT_READY | UC-COMP-01 | `ComplaintService`, `IComplaintPort` | `POST /api/v1/complaints` (`CreateComplaintSchema`) | Pending Phase 6 | Pending Phase 7 |
| REQ-NEWS-01 | View Water Utility News & Outages | CONTRACT_READY | UC-NEWS-01 | `NewsService`, `INewsPort` | `GET /api/v1/news` (`GetNewsQuerySchema`) | Pending Phase 6 | Pending Phase 7 |
| REQ-MAP-01 | View Transaction Offices & Payment Points Map | CONTRACT_READY | UC-MAP-01 | `BranchService`, `IBranchPort` | `GET /api/v1/branches` (`BranchDto`) | Pending Phase 6 | Pending Phase 7 |
