# Mẫu Thiết Kế Dashboard & Thẻ Tiện Ích Bento Grid CAWACO

Tài liệu quy định chi tiết về cách thiết kế bố cục Trang chủ (Dashboard), Thẻ tiện ích dạng Bento Grid, Biểu đồ và Carousel.

## 1. Bố cục Bento Grid 6 Tiện ích Trọng tâm
Lưới 6 tiện ích được thiết kế theo tỷ lệ $2 \times 3$ hoặc $3 \times 2$, tối ưu cho ngón tay cái:

| Tiện ích | Tên hiển thị | Tông màu nền | Hành động khi chạm |
| :--- | :--- | :--- | :--- |
| **1** | Tra cứu Tiền nước | Xanh lam (`#eff6ff` / `#2563eb`) | Chuyển sang Tab Hóa đơn, tự động tra cứu danh bộ hiện tại |
| **2** | Bốc số Trực tuyến | Xanh ngọc (`#ecfeff` / `#0891b2`) | Mở Modal lấy số thứ tự tại quầy 204 Quang Trung |
| **3** | Phản ánh & Báo sự cố | Hổ phách (`#fffbeb` / `#d97706`) | Mở Bottom Sheet gửi phản ánh kèm GPS hoặc tra cứu tiến độ |
| **4** | Trợ lý ảo AI CAWACO | Tím chàm (`#eef2ff` / `#4f46e5`) | Mở Chatbot tư vấn giá nước QĐ 13/2023, tra cứu nợ, chỉ đường |
| **5** | Ghi chỉ số Tự đọc | Xanh lá (`#f0fdf4` / `#16a34a`) | Mở form chụp ảnh đồng hồ nước & nhập chỉ số kỳ mới |
| **6** | Đăng ký Lắp mới | Tím sen (`#faf5ff` / `#9333ea`) | Mở quy trình đăng ký lắp mới đồng hồ nước 3 bước |

## 2. Banner Carousel (Trượt Ảnh Tự Động)
- **Tần suất trượt tự động**: $4.2\text{ giây}$.
- **Tạm dừng khi chạm**: Khi người dùng chạm hoặc kéo vuốt trên màn hình, dừng auto-play để người dùng đọc thông tin.
- **Chỉ báo (Dots Indicator)**: Chấm tròn mở rộng thành dạng con thoi/viên thuốc (pill) khi kích hoạt (`width: 18px`, `background: #0056b3`).
- **Thẻ nội dung**:
  1. *Thanh toán QR Siêu Tốc*: Giảm 100% phí thanh toán qua VietQR.
  2. *Bốc Số Hàng Đợi Điện Tử*: Không phải chờ đợi tại 204 Quang Trung.
  3. *Tiết Kiệm Nước - Bảo Vệ Tương Lai*: Chung tay bảo vệ nguồn nước sạch bán đảo Cà Mau.
  4. *Tiếp Nhận & Xử Lý Sự Cố 24/7*: Báo bể ống, nước yếu xử lý trong 2 giờ.

## 3. Biểu đồ Tiêu thụ Nước 6 Tháng
- Hiển thị lượng m³ tiêu thụ từ tháng gần nhất lùi về trước.
- Có nhãn phân biệt tháng hiện tại với màu xanh chủ đạo.
- Thể hiện tổng tiền ước tính hoặc xu hướng tăng/giảm so với tháng trước (+5%, -3%).
