# Hướng Dẫn & Giới Hạn Kỹ Thuật Zalo Mini App

Tài liệu này tổng hợp các tiêu chuẩn thiết kế và kỹ thuật tối ưu hóa hiệu năng khi xây dựng Mini App trên nền tảng Zalo.

## 1. Giới hạn Thiết bị & Hiệu năng (Performance Constraints)
- **Kích thước màn hình cơ sở**: Thiết kế ưu tiên chuẩn `375px` (iPhone SE / Thiết bị Android phổ thông), co giãn linh hoạt đến `430px+`.
- **Dung lượng gói tải (Bundle Size)**: Giữ bundle khởi tạo nhẹ nhất có thể để thời gian First Meaningful Paint (FMP) < 1.5 giây.
- **Tối ưu hình ảnh & Asset**: Sử dụng định dạng SVG cho biểu tượng, WebP/AVIF cho hình ảnh thực tế, nén tối ưu dưới 100KB mỗi banner.

## 2. Trải nghiệm người dùng Mobile-First (Mobile UX Standards)
- **Ngón tay cái (Thumb-friendly navigation)**:
  - Đặt các nút hành động chính (CTA - Call To Action) ở nửa dưới màn hình hoặc dạng Bottom Sheet.
  - Vùng chạm (Touch Target) tối thiểu: $44 \times 44\text{ px}$.
- **Thanh điều hướng dưới (Bottom Navigation)**:
  - Cố định ở đáy màn hình, luôn hiển thị rõ 5 mục chính: Trang chủ, Hóa đơn, Tiện ích/Dịch vụ, Truyền thông, Cá nhân.
  - Có visual active indicator rõ ràng (màu xanh dương đậm `#0056b3` và chấm tròn active).
- **Tránh lỗi thao tác cảm ứng**:
  - Hỗ trợ cử chỉ vuốt (Touch Swipe) mượt mà cho Banner Carousel và Bottom Sheet.
  - Chặn tràn ngang (Horizontal Overflow) bằng thuộc tính `overflow-x: hidden;` trên container chính.

## 3. Quyền riêng tư & Tích hợp SDK Zalo
- **Đăng nhập 1 chạm**: Sử dụng Zalo ID để tự động liên kết tài khoản công dân với mã danh bộ khách hàng CAWACO.
- **Vị trí GPS**: Khi người dân bấm "Phản ánh & Báo sự cố", gọi quyền định vị để tự động điền tọa độ hiện trường.
- **Thông báo Zalo ZNS / OA**: Gửi thông báo tự động khi hóa đơn phát hành hoặc khi phiếu phản ánh được xử lý hoàn tất.
