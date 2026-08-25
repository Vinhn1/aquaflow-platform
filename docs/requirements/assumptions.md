# Initial Assumptions for AquaFlow Platform (Updated with Verified Facts)

This document tracks technical, operational, and domain assumptions that require explicit confirmation from stakeholders before final production implementation.

## Category: Customer & Meter Identification
- **FACT (Verified)**: CAWACO uses "Ma khach hang" (Ma danh bo) as the primary identifier printed on paper bills and e-invoices.
- **ASM-CUST-001**: A citizen user on Zalo Mini App can link multiple customer codes (e.g. home, rental property, relatives).
- **ASM-CUST-002**: Customer linking in the prototype is verified via OTP or the latest invoice number.

## Category: Invoicing & Tariff Calculation
- **FACT (Verified)**: Water tariffs are regulated by Decision 13/2023/QD-UBND Ca Mau with distinct rates for TP. Ca Mau, Districts, Poor households, Administrative agencies, Production, and Commercial entities.
- **ASM-INV-001**: AquaFlow's tariff calculator will implement the official tiered rates from Decision 13/2023/QD-UBND.

## Category: Payment & Reconciliation
- **FACT (Verified)**: CAWACO officially supports Payoo, VNPay, MoMo, ZaloPay, VietQR, and banking apps.
- **ASM-PAY-001**: AquaFlow generates dynamic VietQR (NAPAS247 standard) encoding CAWACO bank account + Customer Code + exact invoice amount.

## Category: Online Queue (Boc so truc tuyen)
- **ASM-QUE-001**: Online queue booking serves at the main office (204 Quang Trung, P. Tan Thanh, TP. Ca Mau) and district branch counters for procedures: New meter installation, Contract transfer, Meter inspection, Complaint settlement.

## Category: Incident & Water Leak Reports
- **ASM-COM-001**: Citizen incident reports include GPS coordinates, description, attached photos, and contact phone.
- **ASM-COM-002**: Incident statuses follow the lifecycle: SUBMITTED -> RECEIVED -> DISPATCHED -> IN_PROGRESS -> RESOLVED -> REJECTED.
