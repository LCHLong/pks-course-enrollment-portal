# PKS Course & Enrollment Portal - Agent Guidelines

Tài liệu này thiết lập các nguyên tắc và chỉ dẫn dành cho AI Agents khi làm việc trên repository này.

## 1. Quy chuẩn Giao diện & Frontend (UI/UX)
- Xem chi tiết tại: [`.agents/rules/ui-rules.md`](.agents/rules/ui-rules.md)
- Design System: Pure Minimalist Grayscale phối Deep Muted Semantics (Xanh ngọc thẫm, Đỏ rượu, Vàng hổ phách sẫm).
- Hỗ trợ song song **Dark Mode** & **Light Mode** với `darkMode: 'class'` của Tailwind CSS.
- **Mobile-first:** Vùng chạm tối thiểu 44px (`h-11`), font size input $\ge 16px$ chống iOS auto-zoom, bảng dữ liệu responsive.
- **Học phí (`price`):** Bắt buộc dùng `whitespace-nowrap shrink-0` và non-breaking space `\u00A0₫` để ký hiệu `₫` không bao giờ bị rớt dòng.
- Tham khảo Design Tokens và preview tại: [`docs/design-system/`](docs/design-system/)

## 2. Quy chuẩn Nghiệp vụ & Backend
- Xem chi tiết tại: [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md)
- RBAC nghiêm ngặt giữa Student và Admin.
- Xử lý Concurrency & Race condition khi đăng ký suất cuối cùng (Database Transaction, Row Locking `SELECT FOR UPDATE`, hoặc Atomic Update).
