# Bộ Design Tokens Nhận Diện Thương Hiệu CAWACO

Bộ Design Tokens được sử dụng xuyên suốt toàn bộ ứng dụng Zalo Mini App và cổng Quản trị CAWACO Digital Water.

## 1. Bảng Màu Thương Hiệu (Brand Palette)

### Màu Chính (Primary & Brand Accents)
- `--cawaco-primary`: `#0056b3` (Xanh dương đậm truyền thống ngành nước Cà Mau)
- `--cawaco-primary-dark`: `#004085` (Màu nhấn khi active / hover nút bấm)
- `--cawaco-primary-light`: `#e6f0fa` (Nền nhạt cho badge, chip thông tin)
- `--cawaco-cyan`: `#00a8cc` (Xanh ngọc sông nước đồng bằng Cà Mau)
- `--cawaco-cyan-light`: `#e0f7fa` (Nền thẻ bốc số trực tuyến)

### Màu Chức Năng (Semantic / Functional Colors)
- `--cawaco-success`: `#10b981` (Thanh toán thành công, chỉ số bình thường)
- `--cawaco-warning`: `#f59e0b` (Cảnh báo sự cố, hóa đơn sắp đến hạn)
- `--cawaco-danger`: `#ef4444` (Khóa đồng hồ, lỗi kết nối, quá hạn)
- `--cawaco-indigo`: `#6366f1` (Trợ lý ảo AI CAWACO)
- `--cawaco-purple`: `#8b5cf6` (Đăng ký dịch vụ lắp mới)

### Màu Trung Tính & Bề Mặt (Neutral & Surface Colors)
- `--cawaco-bg`: `#f8fafc` (Màu nền tổng thể ứng dụng)
- `--cawaco-surface`: `#ffffff` (Nền thẻ card, modal, bottom sheet)
- `--cawaco-surface-subtle`: `#f1f5f9` (Nền input, thanh progress)
- `--cawaco-text-title`: `#0f172a` (Tiêu đề chính, số tiền lớn, độ tương phản cao)
- `--cawaco-text-body`: `#334155` (Văn bản nội dung thông thường)
- `--cawaco-text-muted`: `#64748b` (Nhãn phụ, thời gian, chú thích nhỏ)
- `--cawaco-border`: `#e2e8f0` (Đường viền ngăn cách card)

---

## 2. Hệ Thống Typography
- **Font Family**: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Cỡ chữ (Font Sizes)**:
  - `Display / Huge`: `24px` (Độ đậm 700 - Dùng cho số tiền nợ, số thứ tự quầy)
  - `Title 1`: `18px` (Độ đậm 700 - Tiêu đề màn hình chính)
  - `Title 2`: `16px` (Độ đậm 600 - Tiêu đề thẻ card, tên tiện ích)
  - `Body`: `14px` (Độ đậm 400/500 - Nội dung chi tiết, nhãn form)
  - `Caption`: `12px` (Độ đậm 400 - Thời gian, chú thích, số hợp đồng)
  - `Micro`: `10px` (Độ đậm 600 - Badge thông báo, tag phân loại)

---

## 3. Khoảng Cách & Bo Góc (Spacing & Radius Grid)
- **Hệ thống Spacing (Grid 4px)**:
  - `space-xs`: `4px`
  - `space-sm`: `8px`
  - `space-md`: `12px`
  - `space-lg`: `16px` (Khoảng cách lề màn hình di động chuẩn)
  - `space-xl`: `20px`
  - `space-2xl`: `24px`
- **Hệ thống Bo góc (Border Radius)**:
  - `radius-sm`: `8px` (Input, badge, nút nhỏ)
  - `radius-md`: `12px` (Thẻ tiện ích Bento, thẻ tin tức)
  - `radius-lg`: `16px` (Thẻ hóa đơn, thẻ biểu đồ, hộp thoại)
  - `radius-xl`: `20px` (Banner slide, Bottom sheet)
  - `radius-full`: `9999px` (Pill button, avatar)

---

## 4. Bóng Đổ & Nổi Khối (Elevation Shadows)
- `--shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- `--shadow-card`: `0 2px 8px -2px rgba(15, 23, 42, 0.08), 0 1px 4px -1px rgba(15, 23, 42, 0.04)`
- `--shadow-elevated`: `0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)`
- `--shadow-modal`: `0 25px 50px -12px rgba(0, 0, 0, 0.25)`
