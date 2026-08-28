# Chuẩn 4 Trạng Thái Giao Diện (UI State Lifecycle Standard)

Mọi màn hình, danh sách và thành phần gọi dữ liệu API trong CAWACO Zalo Mini App bắt buộc phải hỗ trợ đầy đủ 4 trạng thái sau:

```
                  ┌──────────────┐
                  │ 1. LOADING   │  Skeleton Shimmer / Spinner
                  └──────┬───────┘
                         │ (API Response)
         ┌───────────────┼───────────────┐
         │ (Data > 0)    │ (Data == 0)   │ (Network/API Error)
         ▼               ▼               ▼
  ┌──────────────┐┌──────────────┐┌──────────────┐
  │ 2. SUCCESS   ││ 3. EMPTY     ││ 4. ERROR     │
  │ Data Rendered││ Helpful Note ││ Retry Button │
  └──────────────┘└──────────────┘└──────────────┘
```

---

## 1. Trạng Thái Loading (Loading State)
- **Quy tắc**: Không sử dụng màn hình trắng hoặc giật cục. Bắt buộc dùng **Skeleton Shimmer** mô phỏng kích thước và bố cục của nội dung sắp xuất hiện.
- **Thời gian áp dụng**: Mọi tác vụ gọi API > 200ms.
- **Hiệu ứng**: Gradient chuyển màu tuyến tính từ `#f1f5f9` sang `#e2e8f0` chạy lặp lại trong 1.5s.

## 2. Trạng Thái Thành Công (Success / Data Rendered)
- **Quy tắc**: Hiển thị dữ liệu chính xác, phân cấp thị giác rõ ràng (tiêu đề đậm, nhãn phụ màu xám nhạt, con số quan trọng làm nổi bật).
- **Hành vi**: Tích hợp các nút bấm thao tác nhanh (Copy mã, Thanh toán ngay, Chia sẻ hóa đơn, Gọi tổng đài).

## 3. Trạng Thái Rỗng (Empty State)
- **Quy tắc**: Khi một danh sách không có dữ liệu (ví dụ: Không có hóa đơn chưa thanh toán, Không có phiếu phản ánh nào đang chờ, Lịch sử giao dịch trống).
- **Cấu trúc bắt buộc**:
  1. Icon minh họa SVG mang tính trung tính/tích cực (ví dụ: icon hộp thư rỗng, icon dấu tick hoàn thành).
  2. Dòng tiêu đề thông báo ngắn gọn (ví dụ: "Không có hóa đơn chưa thanh toán").
  3. Dòng mô tả chi tiết (ví dụ: "Tuyệt vời! Danh bộ 0012345678 đã thanh toán đầy đủ tất cả các kỳ tiền nước.").
  4. Nút hành động thay thế (Action button) nếu có (ví dụ: "Xem lịch sử kỳ trước" hoặc "Tra cứu danh bộ khác").

## 4. Trạng Thái Lỗi & Khôi Phục (Error & Recovery State)
- **Quy tắc**: Khi mất kết nối internet, API trả về mã lỗi 4xx/5xx hoặc lỗi xác thực Zalo ID.
- **Cấu trúc bắt buộc**:
  1. Thẻ thông báo màu đỏ nhạt (`#fef2f2`, viền `#fecaca`, text `#dc2626`).
  2. Thông điệp lỗi bằng tiếng Việt dễ hiểu cho người dân (KHÔNG hiển thị mã lỗi kỹ thuật thuần túy như `ERR_CONNECTION_REFUSED`).
  3. Nút **"Thử lại" (Retry)** kích thước tối thiểu 44px để gọi lại hàm tải dữ liệu mà không cần tải lại toàn bộ app.
