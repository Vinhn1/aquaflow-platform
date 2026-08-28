# Mẫu Thực Chiến Từ Các Kho Mã Nguồn Zalo Mini App Chính Thức

Đúc kết cấu trúc tổ chức và best practices từ các repository mẫu chính thức của Zalo (`Zalo-MiniApp/zaui-shop`, `zaui-market`, `zaui-restaurant`).

## 1. Cấu trúc Thư mục Chuẩn (Project Architecture)
```
apps/mini-app/
├── src/
│   ├── assets/           # SVG icons, logo CAWACO, splash art
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Button, Input, Modal, BottomSheet, Skeleton, EmptyState
│   │   ├── home/         # HeaderBar, BannerCarousel, BentoGrid, WaterConsumptionChart
│   │   ├── invoice/      # InvoiceCard, VietQRModal, PaymentHistory
│   │   ├── queue/        # TicketCard, CounterStatus, ProcedurePicker
│   │   └── complaint/    # TicketForm, TicketTimeline, IncidentCategorySelect
│   ├── constants/        # Design tokens, procedure codes, pricing brackets (QĐ 13/2023)
│   ├── hooks/            # Custom hooks (useInvoice, useQueue, useTicket)
│   ├── pages/            # Màn hình chính (Home, Invoices, Services, News, Profile)
│   ├── services/         # API clients gọi tới AquaFlow Backend (/api/v1/...)
│   ├── styles/           # CSS tokens, theme variables, animations
│   ├── types/            # TypeScript interfaces
│   ├── main.ts           # Entry point
│   └── style.css         # Core stylesheet
```

## 2. Quản lý Luồng Dữ liệu (Data Flow Best Practices)
1. **Separation of Concerns**: Tách biệt hoàn toàn tầng gọi API (`services/`) với tầng hiển thị Component (`components/`).
2. **State Management**:
   - Local UI State (tab active, modal open/close, form input validation).
   - Global App State (Mã danh bộ đang chọn, thông tin người dùng, danh sách thông báo chưa đọc).
3. **Caching & Offline Capability**:
   - Cache dữ liệu hóa đơn và lịch sử bốc số gần nhất vào `localStorage` / `zalo.setStorage` để hiển thị ngay tức thì khi mất mạng.

## 3. Quy chuẩn Thành phần Tương tác (Interaction Patterns)
- **Modal / Bottom Sheet**:
  - Có nút đóng rõ ràng ở góc trên bên phải.
  - Hỗ trợ vuốt xuống hoặc chạm vùng nền (backdrop click) để đóng.
  - Khóa cuộn trang nền (`overflow: hidden` trên body) khi modal mở.
- **Form Submission**:
  - Vô hiệu hóa nút gửi (`disabled`) và hiển thị trạng thái đang xử lý khi người dùng bấm gửi để tránh gửi trùng (double-submit).
