# AquaFlow Platform

> Digital Water Customer Service Platform (Target Prototype: CAWACO - Cong ty Co phan Cap nuoc Ca Mau)

AquaFlow Platform la nen tang cong nghe ho tro dich vu khach hang nganh nuoc, duoc thiet ke theo kien truc Hexagonal / Modular Monolith voi kha nang tich hop da kenh (Zalo Mini App, Web Portal, Admin Dashboard). Du an ap dung phuong phap Controlled Vibe Coding va Enterprise Engineering Governance nham dam bao tinh bao mat, kha nang mo rong va kha nang kiem thu cao.

---

## 1. Kien truc Tong the

He thong ap dung chat che cac nguyen tac kien truc:
- **Anti-Coupling Rule**: Client (Mini App, Admin) khong bao gio ket noi truc tiep toi co so du lieu. Moi truy van di qua API Layer -> Domain Service -> Repository / Adapter -> Storage.
- **Hexagonal Adapter Architecture**: Toan bo giao tiep voi he thong ben ngoai (He thong Core CAWACO, Cong thanh toan, Nen tang Zalo) deu duoc dong goi qua Interface Adapter, san sang chuyen doi giua Mock Provider va Real Provider ma khong anh huong toi Frontend hay Business Logic.

---

## 2. Cau truc Du an

```text
aquaflow-platform/
├── .agents/                    # Quan tri AI Agent, Rules va Skills
│   ├── rules/                  # 9 Quy chuan ky thuat va an toan
│   └── skills/                 # 12 Skills chuyen mon cho Agent
├── docs/                       # Tai lieu dac ta kien truc, nghiep vu va an toan
│   ├── requirements/           # Quan tri yeu cau (raw, normalized, traceability)
│   └── adr/                    # Nhat ky quyet dinh kien truc (ADRs)
├── apps/                       # Cac ung dung (Mini App, Admin, API)
│   ├── mini-app/
│   ├── admin/
│   └── api/
├── packages/                   # Cac thu vien dung chung (types, validation, shared, config)
│   ├── shared/
│   ├── types/
│   ├── validation/
│   └── config/
└── tests/                      # Kiem thu tu dong (E2E)
```

---

## 3. Quy trinh Quan tri AI Agent

Moi thay doi trong ma nguon phai tuan thu quy trinh nghiem ngat:
```text
Requirement -> Evidence Check -> Business Analysis -> Acceptance Criteria 
  -> Architecture -> Implementation Plan -> USER APPROVAL -> Implementation 
  -> Tests -> Security Review -> Code Review -> Documentation -> Quality Gate -> Commit
```

Agent phai tuan thu bo 9 Rules tai `.agents/rules/` va danh muc trang thai tich hop tai `docs/MOCK_INTEGRATIONS.md`.

---

## 4. Huong dan Thiet lap Moi truong

### Yeu cau he thong:
- Node.js >= 20.x
- Package manager: pnpm >= 9.x
- Docker & Docker Compose (cho moi truong Database PostgreSQL noi bo)

### Khoi dong:
```powershell
# Sao chep file cau hinh
cp .env.example .env

# Cai dat dependencies
pnpm install
```
