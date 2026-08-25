# Open Questions & Missing Domain Information

This document tracks unresolved domain questions and unknowns discovered during requirement analysis. The AI Agent must never guess answers to these questions; they must be answered through official confirmation.

## 1. Customer & Water Meter Binding
- **Q-CUST-01**: What exact format is used for CAWACO Customer Code (Ma danh bo)? (e.g. alphanumeric length, prefix conventions).
- **Q-CUST-02**: Can multiple Zalo accounts link to the same Customer Code simultaneously (e.g. family members paying for the same household)?
- **Q-CUST-03**: Does CAWACO have an existing SMS gateway or Zalo Notification Service (ZNS) template for OTP verification?

## 2. Invoicing & Water Tariffs
- **Q-INV-01**: What is the official progressive pricing tier structure for domestic vs business vs administrative water consumption in Ca Mau?
- **Q-INV-02**: Are environmental protection fees and VAT included in the bill total or itemized separately?
- **Q-INV-03**: Does CAWACO allow partial bill payments or must the total invoice amount be settled in full?

## 3. Payment Integration
- **Q-PAY-01**: Which payment intermediaries or banks does CAWACO officially integrate with? (e.g. VietinBank, Agribank, VNPay, MoMo, VietQR).
- **Q-PAY-02**: What is the reconciliation schedule (real-time webhook vs daily T+1 batch settlement file)?

## 4. Online Queue Management
- **Q-QUE-01**: How many physical transaction offices/branches does CAWACO operate, and how many service counters exist per branch?
- **Q-QUE-02**: What are the official operating hours for public counter services?
- **Q-QUE-03**: How does the physical calling screen at the office synchronize with digital queue numbers (WebSocket, MQTT, or polling)?

## 5. News, Outages & Map Data
- **Q-NEWS-01**: Are water outage announcements published by district/ward or by specific pipeline zones?
- **Q-MAP-01**: Does CAWACO maintain a GIS map of valve/pipeline networks or only public transaction offices and payment kiosks?
