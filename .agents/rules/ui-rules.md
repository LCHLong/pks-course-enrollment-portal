---
description: Quy chuẩn bắt buộc về thiết kế giao diện (UI/UX) cho dự án PKS Course & Enrollment Portal
globs: "**/*.{tsx,jsx,css,html}"
trigger: always_on
---

# UI & Frontend Rules for PKS Course & Enrollment Portal (Dual Theme & Mobile Responsive)

Khi tạo mới hoặc chỉnh sửa bất kỳ thành phần giao diện nào trong dự án, Agent bắt buộc phải tuân thủ nghiêm ngặt các quy tắc sau:

## 1. Hỗ trợ Song song Dark Mode & Light Mode
- Triển khai theo chuẩn `darkMode: 'class'` của Tailwind CSS với `next-themes`.
- Luôn viết kèm class `dark:` cho mọi component (ví dụ: `bg-white dark:bg-zinc-900`, `text-zinc-900 dark:text-zinc-100`, `border-zinc-200 dark:border-zinc-800`).
- Có nút chuyển đổi Theme (Theme Toggle ☀️ / 🌙) trên thanh Header hoặc Sidebar.

## 2. Màu sắc Trầm Sâu, Không Chói (Deep Muted Semantics)
- Không dùng màu neon sáng chói. Dùng các tông màu đậm, trầm:
  - **Còn chỗ:** Deep Emerald (Light `text-[#065F46] border-[#047857] bg-[#ECFDF5]` | Dark `text-[#34D399] border-[#065F46] bg-[#064E3B33]`).
  - **Hết chỗ:** Deep Crimson (Light `text-[#991B1B] border-[#B91C1C] bg-[#FEF2F2]` | Dark `text-[#F87171] border-[#991B1B] bg-[#7F1D1D33]`).
  - **Chờ duyệt:** Deep Amber (Light `text-[#92400E] border-[#B45309] bg-[#FFFBEB]` | Dark `text-[#FBBF24] border-[#92400E] bg-[#78350F33]`).

## 3. Quy chuẩn Mobile-First Responsive
- **Vùng chạm tối thiểu 44px:** Mọi button và link trên mobile phải có chiều cao tối thiểu `h-11` hoặc `min-h-[44px]` (theo chuẩn Apple HIG / WCAG).
- **Ngăn iOS Safari auto-zoom:** Mọi thẻ `<input>`, `<select>`, `<textarea>` trên mobile phải có font size tối thiểu `text-base` ($\ge 16px$).
- **Mobile Menu:** Màn hình $< 768px$ dùng Hamburger menu kết hợp **Sheet Drawer** (trượt từ phải sang).
- **Grid khóa học:** Mobile 1 cột (`grid-cols-1 gap-4`), Tablet 2 cột (`grid-cols-2 gap-5`), Desktop 3 cột (`grid-cols-3 gap-6`).
- **Table Admin:** Dùng `overflow-x-auto` hoặc chuyển sang Mobile Card View trên điện thoại.

## 4. Course Card (Đủ 8 trường thông tin bắt buộc)
Mỗi thẻ khóa học phải hiển thị đủ:
1. Tên khóa học (`title`)
2. Danh mục (`category`)
3. Giảng viên (`instructor`)
4. Mô tả ngắn (`description`)
5. Học phí (`price`) - Bắt buộc dùng `whitespace-nowrap shrink-0` và non-breaking space `\u00A0₫` để ký hiệu `₫` không bao giờ bị rớt dòng trên màn hình hẹp (ví dụ `1.850.000\u00A0₫` hoặc `Miễn phí`).
6. Sĩ số tối đa (`capacity`)
7. Đã ghi danh (`enrolled_count`) - Kèm thanh tiến độ (Progress Bar)
8. Trạng thái: "Còn chỗ" hoặc "Hết chỗ". Hết chỗ nút bấm chuyển sang `disabled`.

## 5. Tương tác & Phản hồi
- **Tuyệt đối KHÔNG dùng `alert()` mặc định.**
- Dùng **Sonner Toast** có hỗ trợ tự động theme sáng/tối.
- Đầy đủ Skeleton khi loading, Empty State khi trống, Error State kèm nút thử lại.
- Nút submit form phải bị `disabled` và hiện spinner `Loader2` khi đang gọi API.
