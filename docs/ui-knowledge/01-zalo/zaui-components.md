# ZaUI Components Specification & Usage Guide

Nguồn tham khảo chuẩn thức từ Zalo Mini App UI (ZaUI Component library) dành cho dự án CAWACO Digital Water.

## 1. Danh mục Component Cốt Lõi (Core Components)

### Layout & Containers
- `App`: Component gốc bọc toàn bộ ứng dụng, quản lý theme và safe-area header.
- `Page`: Màn hình chứa nội dung cuộn (scrollable container), tự động tính toán padding với bottom navigation bar.
- `Box`: Khung chứa layout đa năng (flex, padding, margin, background).
- `Grid`: Lưới hiển thị các mục menu/tiện ích (2 cột, 3 cột, 4 cột).

### Navigation & Actions
- `Header`: Thanh tiêu đề trên cùng (title, back button, actions), tôn trọng khoảng an toàn camera/notch.
- `BottomNavigation`: Thanh điều hướng chân trang (Home, Invoices, Services, News, Profile).
- `Tabs`: Chuyển đổi giữa các phân mục nội dung trong cùng một màn hình (ví dụ: Tab "Gửi phản ánh" / Tab "Tiến độ phiếu").
- `Button`: Nút bấm với các biến thể: `primary` (màu nhận diện), `secondary`, `tertiary`, `danger`. Kích thước: `medium` (40px), `large` (48px - touch friendly).

### Data Input & Selection
- `Input`: Ô nhập văn bản (Mã danh bộ, số điện thoại, họ tên, nội dung phản ánh).
- `Select` / `Picker`: Hộp thoại chọn mục (chọn loại sự cố, chọn chi nhánh, chọn kỳ hóa đơn).
- `DatePicker` / `Calendar`: Chọn ngày hẹn giao dịch hoặc thời gian ghi chỉ số.

### Feedback, Overlay & States
- `Modal` / `Sheet`: Hộp thoại nổi hoặc Bottom Sheet trượt từ đáy màn hình lên (dùng cho thanh toán VietQR, chi tiết tin tức, Trợ lý ảo AI).
- `Snackbar` / `Toast`: Thông báo nổi góc dưới màn hình sau hành động (ví dụ: "Đã copy mã danh bộ").
- `Progress`: Thanh tiến độ (tiến độ hàng đợi bốc số, tiến độ xử lý sự cố).
- `Spinner` / `Skeleton`: Hiệu ứng tải trang trước khi có dữ liệu từ backend.

---

## 2. Nguyên tắc Tương thích ZaUI trong AquaFlow Platform

1. **Mapping Component**: Mọi thành phần UI tự xây dựng trong Mini App phải tương thích về cấu trúc và hành vi với ZaUI tương ứng.
2. **Safe-Area Insets**: Header luôn chừa khoảng an toàn đỉnh (`env(safe-area-inset-top)`), Bottom Bar luôn chừa khoảng an toàn đáy (`env(safe-area-inset-bottom)`).
3. **Touch Targets**: Chiều cao tối thiểu của tất cả các nút bấm hoặc vùng tương tác là `44px`.
