# 09 - Quy Tắc Kỹ Thuật UI & Zalo Mini App Design System

## 1. Nguồn Tri Thức & Thứ Tự Ưu Tiên
Khi phát triển hoặc sửa đổi bất kỳ giao diện nào trong `apps/mini-app` hoặc `apps/admin`:
1. **ZaUI / Zalo Mini App Standards**: Tuân thủ chuẩn tương thích nền tảng Zalo.
2. **CAWACO Design Tokens**: Sử dụng biến CSS token trong `docs/ui-knowledge/04-design-system/tokens.md`.
3. **Mẫu Thực Chiến**: Tham khảo `docs/ui-knowledge/02-github/official-patterns.md`.

## 2. Chuẩn 4 Trạng Thái Giao Diện (Bắt Buộc)
Mọi màn hình hoặc thành phần nhận dữ liệu từ API đều phải xử lý đầy đủ 4 trạng thái:
- **Loading State**: Sử dụng hiệu ứng Skeleton Shimmer mô phỏng layout thật.
- **Success State**: Hiển thị dữ liệu chính xác, phân cấp thị giác rõ ràng, có nút hành động (CTA).
- **Empty State**: Khi không có bản ghi nào, hiển thị icon SVG trung tính + thông báo dễ hiểu + nút hành động thay thế.
- **Error State**: Khi xảy ra lỗi mạng hoặc API fail, hiển thị thông báo lỗi bằng tiếng Việt + nút "Thử lại" (Retry).

## 3. Quy Chuẩn Di Động (Mobile UX)
- Thiết kế ưu tiên độ rộng `375px` (Mobile-first), không phát sinh thanh cuộn ngang (`overflow-x: hidden`).
- Kích thước vùng chạm (Touch target) cho nút bấm và vùng tương tác tối thiểu `44px`.
- Bottom Navigation bar cố định ở đáy và luôn có khoảng đệm an toàn (`padding-bottom: 80px`).

## 4. Tuyệt Đối Không Dùng Emoji (Zero Emoji Rule)
- Tuyệt đối KHÔNG tự ý chèn emoji Unicode (như 🚀, ✨, 🎉, 💧, 📢...) vào mã nguồn, UI text, comment hay commit message.
- Bắt buộc dùng biểu tượng vector SVG hoặc thư viện icon chuyên dụng.
- Sử dụng đúng thông tin đơn vị: Công ty Cổ phần Cấp nước Cà Mau (CAWACO), Trụ sở: Số 204 đường Quang Trung, Khóm 26, Phường Tân Thành, TP. Cà Mau.
