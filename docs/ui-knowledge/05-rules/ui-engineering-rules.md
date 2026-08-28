# Bộ Quy Tắc Kỹ Thuật UI (UI Engineering Rules)

Tất cả các thành viên phát triển và AI coding agent bắt buộc phải tuân thủ nghiêm ngặt các quy tắc kỹ thuật sau khi viết mã giao diện cho dự án.

## 1. Thứ Tự Ưu Tiên Ra Quyết Định (Decision Hierarchy)
1. **Tài liệu & Chuẩn ZaUI / Zalo Mini App SDK**: Quyết định tính khả thi và tương thích nền tảng.
2. **CAWACO Design System & Design Tokens**: Quyết định bộ quy chuẩn màu sắc, phông chữ, khoảng cách.
3. **Mẫu Thực Chiến GitHub (Zalo official repos)**: Quyết định kiến trúc component và tổ chức mã nguồn.
4. **Mẫu Trải Nghiệm Hiện Đại (Curated Patterns)**: Quyết định micro-interactions, layout bento grid.

## 2. Quy Tắc Về Thành Phần Giao Diện (Component Rules)
- **Tái sử dụng (Reusability)**: Tận dụng các component và class đã định nghĩa sẵn trong hệ thống trước khi tạo mới.
- **Không Hardcode**: Không viết mã màu trực tiếp (ví dụ: `#0056b3`) trong CSS rải rác mà phải dùng biến CSS `--cawaco-primary`.
- **Đủ 4 Trạng thái**: Bất kỳ màn hình hay khối dữ liệu nào gọi API đều phải có:
  1. `Loading` (Skeleton Shimmer)
  2. `Success` (Dữ liệu hoàn chỉnh)
  3. `Empty` (Ghi chú thân thiện + gợi ý hành động khi mảng rỗng)
  4. `Error` (Thông báo lỗi bằng tiếng Việt + Nút "Thử lại")

## 3. Quy Tắc Di Động & Trải Nghiệm (Mobile UX Rules)
- **Chuẩn 375px First**: Kiểm thử giao diện luôn bắt đầu từ bề rộng 375px.
- **Vùng Chạm (Touch Target) $\ge 44\text{px}$**: Mọi nút bấm, icon button, tab navigation, danh sách mục chọn phải có chiều cao tối thiểu 44px để tránh người dùng bấm nhầm.
- **Không Tràn Ngang**: Mọi layout phải co giãn vừa vặn trong màn hình di động, cấm tuyệt đối phát sinh thanh cuộn ngang ngoài ý muốn (`overflow-x: hidden`).
- **Thanh Điều Hướng Luôn Sẵn Sàng**: Bottom Navigation bar phải luôn nổi trên cùng và không bị che khuất bởi nội dung cuộn bên dưới (`padding-bottom: 80px`).

## 4. Quy Tắc Biểu Tượng & Văn Bản (Visual & Typography Rules)
- **Không Sử Dụng Emoji (Zero Unicode Emoji Rule)**:
  - Cấm tự ý chèn emoji (các ký tự biểu cảm như bóng nước, ngôi sao, tên lửa...) vào mã nguồn, nhãn nút, tiêu đề, commit message hoặc giao diện người dùng.
  - Sử dụng biểu tượng hình học SVG / Lucide vector đồng nhất, sắc nét và chuyên nghiệp.
- **Văn Phong Hành Chính Công Chuyên Nghiệp**: Sử dụng tiếng Việt chuẩn mực, tôn trọng, rõ ràng (ví dụ: "Mã danh bộ", "Kỳ hóa đơn", "Trụ sở: Số 204 đường Quang Trung, Phường Tân Thành, TP. Cà Mau").
