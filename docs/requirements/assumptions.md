# Initial assumptions for AquaFlow Platform (Target Prototype: CAWACO)

This document tracks technical, operational, and domain assumptions that require explicit confirmation from stakeholders before final production implementation.

## Category: Customer & Contract Management
- **ASM-CUST-001**: A single citizen/user (identified by phone number / Zalo ID) may manage multiple water meters (e.g. primary residence, parents' home, rental property).
- **ASM-CUST-002**: Customer Code (Ma danh bo) is the primary unique identifier used across water bills and payment reconciliation.
- **ASM-CUST-003**: Customer linking is verified through an OTP sent to the registered phone number or via the latest bill code.

## Category: Invoicing & Payment
- **ASM-PAY-001**: CAWACO water bills are generated on a monthly cycle per branch route.
- **ASM-PAY-002**: VietQR / Bank Transfer dynamic QR codes encode the bill code, customer code, and exact amount in standard EMVCo format.
- **ASM-PAY-003**: Payment confirmation from payment gateways or banks will be received asynchronously via Webhook.

## Category: Online Queue (Boc so truc tuyen)
- **ASM-QUE-001**: Online queue booking generates a digital ticket valid only for the selected transaction office and service type on the booking day.
- **ASM-QUE-002**: A customer can hold at most 1 active unserved ticket per service category per day.
- **ASM-QUE-003**: If a customer does not check in or misses 3 callings at the counter, the ticket transitions to EXPIRED/MISSED status.

## Category: Incident & Water Leak Reports (Phan anh su co)
- **ASM-COM-001**: Citizen incident reports include GPS coordinates, description, attached photos, and contact phone.
- **ASM-COM-002**: Incident statuses follow the lifecycle: SUBMITTED -> RECEIVED -> DISPATCHED -> IN_PROGRESS -> RESOLVED -> REJECTED.
