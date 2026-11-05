# BỘ QUY TẮC THIẾT KẾ & XÂY DỰNG GIAO DIỆN (UI/UX DESIGN RULES)
## Dự án: PKS Course & Enrollment Portal (Dual Theme & Mobile Responsive)

Tài liệu này xác lập các tiêu chuẩn giao diện, hệ thống thiết kế (Design System), nguyên tắc trải nghiệm người dùng (UX) và quy chuẩn viết mã Frontend bắt buộc áp dụng cho dự án **PKS Course & Enrollment Portal**.

---

## 1. NGUYÊN TẮC THIẾT KẾ CỐT LÕI (CORE PRINCIPLES)

1. **Hỗ trợ Song song 2 Chế độ Theme Sáng / Tối (Light & Dark Mode):**
   - Triển khai theo chuẩn `darkMode: 'class'` của Tailwind CSS kết hợp thư viện `next-themes` (hoặc React context custom hook `useTheme`).
   - Tự động phát hiện cấu hình hệ điều hành của người dùng (`prefers-color-scheme`) và lưu lựa chọn vào `localStorage`.
   - Cung cấp nút chuyển đổi Theme (Theme Toggle Icon: Mặt trời ☀️ / Mặt trăng 🌙) trên thanh Header / Sidebar.
2. **Bảng màu Tối giản phối Màu Ngữ nghĩa Trầm Sâu (Deep Muted Semantics):**
   - **Nền tảng:** Sử dụng hệ màu Grayscale/Zinc trung tính, tinh tế, không chói lóa.
   - **Màu trạng thái nghiệp vụ (Semantic Colors):** Sử dụng các tông màu **đậm, trầm, đầm mắt** (deep & muted), tuyệt đối không dùng màu neon hoặc màu sáng chói:
     - **Còn chỗ / Thành công:** Xanh ngọc đậm (Deep Emerald: Light `#065F46`, Dark `#34D399`).
     - **Hết chỗ / Xóa / Lỗi:** Đỏ rượu thẫm (Deep Crimson/Wine: Light `#991B1B`, Dark `#F87171`).
     - **Chờ duyệt (Pending):** Vàng hổ phách sẫm (Deep Amber/Ochre: Light `#92400E`, Dark `#FBBF24`).
3. **Quy chuẩn Mobile-First Responsive toàn diện:**
   - Mọi trang màn hình đều phải hiển thị và thao tác hoàn hảo trên các kích thước màn hình từ điện thoại nhỏ ($375px$) đến màn hình lớn ($2K$).
   - Nút bấm và vùng chạm trên Mobile bắt buộc đạt chuẩn kích thước tối thiểu **44px** (Apple HIG & WCAG).
   - Ô nhập liệu form trên mobile bắt buộc có font size $\ge 16px$ (`text-base`) để ngăn Safari trên iOS tự động zoom màn hình.
4. **Phản hồi trạng thái tức thì (Instant State Feedback):**
   - Đầy đủ 4 trạng thái: **Loading** (Skeleton), **Empty** (danh sách trống), **Error** (thông báo lỗi thân thiện + nút thử lại), **Success** (Sonner Toast).
   - **Tuyệt đối KHÔNG dùng `alert()` mặc định.**

---

## 2. STACK CÔNG NGHỆ UI & THƯ VIỆN CHUẨN HÓA

- **Core Framework:** React.js (Vite hoặc Next.js) + TypeScript.
- **Styling Engine:** Tailwind CSS (v3 / v4) với `darkMode: 'class'`.
- **Theme Manager:** `next-themes` (hoặc context provider `useTheme`).
- **Component Library:** **shadcn/ui** (xây dựng trên nền tảng **Radix UI** primitives).
- **Icons:** **Lucide React** (kích thước chuẩn `size-4` hoặc `size-5`, nét mỏng `stroke-width={1.75}`).
- **Notification / Toast:** **Sonner** (vị trí: `top-right`, hỗ trợ theme dark/light tự động theo hệ thống).

---

## 3. BẢNG MÀU CHUẨN HÓA (LIGHT & DARK TOKENS)

| Thành phần UI | Light Mode | Dark Mode | Ý nghĩa sử dụng |
| :--- | :--- | :--- | :--- |
| **Nền trang (Page Background)** | `bg-[#FAFAFA]` | `bg-[#09090B]` (Zinc 950) | Nền tổng thể toàn bộ trang web |
| **Nền Card / Input / Modal** | `bg-white` | `bg-[#18181B]` (Zinc 900) | Nền thẻ khóa học, hộp thoại, form |
| **Viền mỏng (Borders)** | `border-[#E4E4E7]` (Zinc 200) | `border-[#27272A]` (Zinc 800) | Đường viền card, bảng biểu, divider |
| **Chữ chính (Primary Text)** | `text-[#18181B]` (Zinc 900) | `text-[#FAFAFA]` (Zinc 50) | Tiêu đề khóa học, học phí, nhãn chính |
| **Chữ phụ (Secondary Text)** | `text-[#71717A]` (Zinc 500) | `text-[#A1A1AA]` (Zinc 400) | Giảng viên, mô tả ngắn, ngày tạo |
| **Nút bấm chính (CTA)** | `bg-[#18181B] text-white` | `bg-[#FAFAFA] text-[#18181B]` | Nút "Ghi danh", "Đăng ký", "Lưu" |
| **Nút bấm phụ (Secondary)** | `border border-zinc-200 bg-white` | `border border-zinc-800 bg-zinc-900` | Nút "Hủy", "Quay lại", "Xem chi tiết" |
| **Nút vô hiệu (Disabled)** | `bg-zinc-100 text-zinc-400` | `bg-zinc-800 text-zinc-600` | Khi khóa học hết chỗ hoặc đang submit |
| **Trạng thái: Còn chỗ (Deep Emerald)** | Chữ `#065F46`, Viền `#047857`, Nền `#ECFDF5` | Chữ `#34D399`, Viền `#065F46`, Nền `#064E3B33` | Biểu thị khóa học còn khả năng nhận học viên |
| **Trạng thái: Hết chỗ (Deep Crimson)** | Chữ `#991B1B`, Viền `#B91C1C`, Nền `#FEF2F2` | Chữ `#F87171`, Viền `#991B1B`, Nền `#7F1D1D33` | Khóa học đã đủ sĩ số tối đa |
| **Trạng thái: Chờ duyệt (Deep Amber)** | Chữ `#92400E`, Viền `#B45309`, Nền `#FFFBEB` | Chữ `#FBBF24`, Viền `#92400E`, Nền `#78350F33` | Trạng thái ghi danh Pending |

---

## 4. QUY CHUẨN THIẾT KẾ RESPONSIVE CHO PHIÊN BẢN MOBILE

### 4.1. Breakpoints chuẩn Tailwind
- **Mobile:** $< 640px$ (`default`).
- **Tablet:** $640px - 1023px$ (`sm:` và `md:`).
- **Desktop:** $\ge 1024px$ (`lg:` và `xl:`).

### 4.2. Vùng chạm cảm ứng & Nút bấm Mobile (Touch Targets)
- Chiều cao nút bấm trên mobile bắt buộc tối thiểu **44px** (`min-h-[44px]` hoặc `h-11`) để người dùng ngón tay cái dễ bấm chính xác, không bấm nhầm nút lân cận.
- Khoảng cách giữa các nút bấm liền kề (ví dụ: nút Sửa và Xóa trong bảng Admin) tối thiểu `gap-2` hoặc `gap-3` (8px - 12px).

### 4.3. Ngăn ngừa lỗi phóng to tự động trên iOS Safari (Input Zoom Prevention)
- **Quy tắc quan trọng:** Mọi thẻ `<input>`, `<select>`, `<textarea>` trên mobile phải có font-size tối thiểu **16px** (`text-base sm:text-sm`).
- Nếu đặt font-size nhỏ hơn 16px (ví dụ `text-xs` hoặc `text-sm`), iOS Safari sẽ tự động phóng to toàn màn hình khi người dùng bấm vào ô nhập liệu, gây vỡ giao diện.

### 4.4. Menu điều hướng trên Mobile (Navigation Drawer)
- Trên Desktop ($\ge 768px$): Hiển thị Navigation Bar dạng thanh ngang với logo, menu mục và nút đăng nhập/avatar.
- Trên Mobile ($< 768px$):
  - Ẩn menu dạng ngang, thay thế bằng nút icon **Hamburger** (`Menu` icon của Lucide).
  - Khi bấm: Mở ra **Sheet Drawer** (shadcn/ui Sheet) trượt êm ái từ cạnh phải màn hình, chứa:
    - Danh sách liên kết điều hướng (Trang chủ, Khóa học của tôi).
    - Nút chuyển đổi Theme (Dark/Light toggle).
    - Thông tin tài khoản & nút Đăng xuất.

### 4.5. Lưới hiển thị danh mục khóa học (Course Catalog Grid)
- **Mobile ($< 640px$):** `grid-cols-1 gap-4 px-4`. Mỗi hàng chỉ hiển thị 1 Card, padding trong card `p-4 sm:p-5`.
- **Tablet ($640px - 1023px$):** `grid-cols-2 gap-5 px-6`.
- **Desktop ($\ge 1024px$):** `grid-cols-3 gap-6 max-w-7xl mx-auto px-8`.

### 4.6. Bảng dữ liệu Admin trên Mobile (Responsive Table)
- Bảng danh sách ghi danh học viên (`Enrollment Tracking`):
  - Bọc bảng trong container cuộn ngang: `<div class="overflow-x-auto -mx-4 sm:mx-0">`.
  - Cột Họ tên & Email có thể ghim cố định bên trái (sticky column) hoặc chuyển sang dạng **Mobile Card View** (mỗi học viên hiển thị thành 1 thẻ nhỏ trên mobile thay vì bảng ngang quá dài).

---

## 5. QUY CHUẨN HIỂN THỊ COURSE CARD (ĐỦ 8 THÔNG TIN BẮT BUỘC)

Mỗi thẻ khóa học bắt buộc hiển thị đủ 8 trường thông tin:
1. **Tên khóa học (`title`):** Font `text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2`.
2. **Danh mục (`category`):** Badge nhỏ viền mỏng (`text-xs font-medium px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50`).
3. **Giảng viên (`instructor`):** Dòng chữ phụ (`text-xs text-zinc-500 dark:text-zinc-400`).
4. **Mô tả ngắn (`description`):** `text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed`.
5. **Học phí (`price`):** 
   - **Quy tắc chống rớt dòng bắt buộc:** Dùng `whitespace-nowrap shrink-0` hoặc ký tự khoảng trắng không ngắt dòng `&nbsp;₫` / `\u00A0₫`. Tuyệt đối **không được để ký hiệu `₫` bị rớt xuống dòng thứ 2** trên mobile khi cạnh nút bấm.
   - Code snippet chuẩn hóa:
     ```typescript
     export const formatCurrency = (amount: number): string => {
       if (amount === 0) return 'Miễn phí';
       // Dùng \u00A0 (non-breaking space) để số tiền và ký hiệu ₫ luôn dính liền trên 1 dòng
       return `${new Intl.NumberFormat('vi-VN').format(amount)}\u00A0₫`;
     };
     ```
   - Class styling: `text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap shrink-0`.
6. **Sĩ số tối đa (`capacity`) & 7. Đã ghi danh (`enrolled_count`):**
   - Hiển thị văn bản: `14 / 20 học viên`.
   - **Thanh tiến độ (Progress Bar):** Chiều cao `h-1.5`, nền `bg-zinc-100 dark:bg-zinc-800`, thanh chạy `bg-zinc-900 dark:bg-zinc-100`.
8. **Trạng thái (Còn chỗ / Hết chỗ):**
   - **Còn chỗ:** Badge xanh ngọc đậm dịu mắt (`text-[#065F46] dark:text-[#34D399] border border-[#047857] dark:border-[#065F46] bg-[#ECFDF5] dark:bg-[#064E3B33] text-xs font-medium px-2.5 py-0.5 rounded-full`).
   - **Hết chỗ:** Badge đỏ thẫm trầm (`text-[#991B1B] dark:text-[#F87171] border border-[#B91C1C] dark:border-[#991B1B] bg-[#FEF2F2] dark:bg-[#7F1D1D33] text-xs font-medium px-2.5 py-0.5 rounded-full`).
   - **Nút hành động:**
     - Nếu còn chỗ: Nút `h-11 sm:h-9 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-xs sm:text-sm rounded-lg`.
     - Nếu hết chỗ: Nút disabled `h-11 sm:h-9 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed`.

---

## 6. PHẢN HỒI GIAO DIỆN & THÔNG BÁO

- **Sonner Toast:** Tự động đồng bộ theme Dark/Light (`<Toaster theme={theme} position="top-right" />`).
- **Loading State:** Skeleton Card mờ (`animate-pulse bg-zinc-200/70 dark:bg-zinc-800/70 rounded-xl`).
- **Empty State:** Icon đơn sắc, thông báo rõ ràng, nút xóa bộ lọc.
- **AlertDialog:** Modal xác nhận hành động xóa/hủy, tối ưu hiển thị vừa khít màn hình mobile mà không bị tràn viền.
