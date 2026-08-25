# Product Requirements Document (PRD) - AquaFlow Platform

**Version**: 0.1.0 (Draft Baseline)
**Target Prototype**: CAWACO (Cong ty Co phan Cap nuoc Ca Mau)

---

## 1. Executive Summary
AquaFlow Platform is a comprehensive digital customer service ecosystem tailored for water utilities. It connects citizens and water consumers directly to utility services via Zalo Mini App and Web Portals, while providing operational dashboards for utility branch staff and administrators.

---

## 2. Target User Personas
1. **Water Consumer (Citizen)**:
   - Needs to view monthly water consumption, lookup unpaid water bills, pay instantly via VietQR, receive water outage notices, book digital queue tickets, and report water leaks.
2. **Counter Service Staff**:
   - Manages queue tickets at physical branch offices, calls next numbers, serves customer requests, and updates ticket statuses.
3. **Field & Incident Response Worker**:
   - Receives citizen leak/incident reports, inspects physical locations with GPS, and updates maintenance progress.
4. **Utility Administrator**:
   - Manages news announcements, oversees branch counter configurations, views revenue analytics, and manages platform users.

---

## 3. Core Functional Capabilities
- **Module 1: Authentication & Citizen Profile**: One-click Zalo Mini App login, phone verification, and multiple water meter linking (Ma danh bo).
- **Module 2: Water Billing & Consumption**: Monthly bill lookup, historical volume bar charts, and itemized fee breakdown.
- **Module 3: QR Bill Payment**: Dynamic VietQR generation adhering to NAPAS247 standards with automated reconciliation.
- **Module 4: Digital Queue (Boc so online)**: Select branch, pick service counter, obtain digital queue ticket with real-time remaining queue countdown.
- **Module 5: Water Incident & Leak Reporting**: Geolocation-enabled photo submission, description, and status tracking.
- **Module 6: Utility Announcements & Outages**: Real-time broadcast of planned maintenance, water quality tests, and rate updates.
- **Module 7: Office & Payment Kiosk Locator**: Interactive map displaying all CAWACO customer transaction points.
