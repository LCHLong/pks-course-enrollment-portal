# BỘ QUY TẮC THIẾT KẾ & XÂY DỰNG GIAO DIỆN (UI/UX DESIGN RULES)
## Dự án: PKS Course & Enrollment Portal

Tài liệu này xác lập các tiêu chuẩn giao diện, hệ thống thiết kế (Design System), nguyên tắc trải nghiệm người dùng (UX) và quy chuẩn viết mã Frontend bắt buộc áp dụng cho dự án **PKS Course & Enrollment Portal**.

---

## 1. NGUYÊN TẮC THIẾT KẾ CỐT LÕI (CORE PRINCIPLES)

1. **Ultra-Minimalist (Tối giản màu sắc tối đa - "Càng ít màu càng tốt"):**
   - Sử dụng bảng màu đơn sắc Grayscale (Neutral / Zinc: Trắng, Xám nhạt, Xám đậm, Đen).
   - Hạn chế tối đa việc lạm dụng màu sắc sặc sỡ. Màu sắc chỉ được dùng với mục đích báo hiệu trạng thái nghiệp vụ (Semantic status: Xanh lá cho Còn chỗ / Thành công, Đỏ cho Lỗi / Hết chỗ) với sắc thái tinh gọn, viền mảnh (outline/border) hoặc chấm trạng thái (dot indicator).
2. **Typography Hierarchy rõ ràng:**
   - Sử dụng font chữ tiêu chuẩn **Inter** hoặc **Geist Sans**.
   - Phân cấp kích thước và độ đậm (weight) hợp lý (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `font-normal`, `font-medium`, `font-semibold`, `font-bold`) để người dùng dễ quét thông tin mà không cần dùng nhiều màu.
3. **Phản hồi trạng thái tức thì (Instant State Feedback):**
   - Mọi tương tác bất đồng bộ (gọi API) bắt buộc phải có đủ 4 trạng thái: **Loading** (Skeleton / Spinner), **Empty** (khi danh sách trống), **Error** (thông báo lỗi thân thiện kèm nút thử lại), và **Success** (Toast thông báo).
   - Tuyệt đối không dùng hàm `alert()` mặc định của trình duyệt.
4. **Accessible & Responsive:**
   - Tối ưu hiển thị hoàn hảo trên Mobile ($< 640px$), Tablet ($640px - 1024px$) và Desktop ($> 1024px$).
   - Đảm bảo độ tương phản đọc được (WCAG AA), hỗ trợ focus state rõ ràng (`focus-visible:ring-2 focus-visible:ring-neutral-900`).

---

## 2. STACK CÔNG NGHỆ UI & THƯ VIỆN CHUẨN HÓA

- **Core Framework:** React.js (Vite hoặc Next.js App Router) + TypeScript.
- **Styling Engine:** Tailwind CSS (v3 / v4).
- **Component Library:** **shadcn/ui** (xây dựng trên nền tảng **Radix UI** primitives headless).
- **Icons:** **Lucide React** (kích thước chuẩn `size-4` hoặc `size-5`, nét mỏng `stroke-width={1.75}`).
- **Notification / Toast:** **Sonner** (vị trí: `top-right`, giao diện đơn sắc richColors hoặc neutral dark/light).
- **Animation / Transitions:** Tailwind CSS transitions (`transition-all duration-200 ease-in-out`), không lạm dụng hiệu ứng gây giật lag.

---

## 3. BẢNG MÀU ĐƠN SẮC & TOKEN QUY ƯỚC (COLOR PALETTE & TOKENS)

Hệ màu tối giản tuân theo thang màu `neutral` hoặc `zinc` của Tailwind CSS:

| Token UI | Class Tailwind | Mã màu Hex | Mục đích sử dụng |
| :--- | :--- | :--- | :--- |
| **Nền chính (Background)** | `bg-white` / `bg-neutral-50` | `#FFFFFF` / `#FAFAFA` | Nền trang, nền container bao quanh |
| **Nền Card / Thẻ** | `bg-white` | `#FFFFFF` | Nền thẻ khóa học, modal, form input |
| **Viền mỏng (Borders)** | `border-neutral-200` | `#E5E5E5` | Đường viền card, bảng biểu, thanh ngăn cách divider |
| **Chữ chính (Primary Text)** | `text-neutral-900` | `#171717` | Tiêu đề khóa học, giá tiền, nhãn label chính |
| **Chữ phụ (Secondary Text)** | `text-neutral-500` / `600` | `#737373` / `#525252` | Giảng viên, mô tả ngắn, ngày tạo, breadcrumb |
| **Nút bấm chính (Primary CTA)** | `bg-neutral-900 text-white` | `#171717` (Hover `#262626`) | Nút "Ghi danh", "Đăng ký", "Lưu thay đổi", "Thêm khóa học" |
| **Nút bấm phụ (Secondary / Outline)** | `border border-neutral-300 text-neutral-800` | `#FFFFFF` | Nút "Hủy", "Quay lại", "Xem chi tiết" |
| **Trạng thái: Còn chỗ** | `text-neutral-900 border-neutral-900` hoặc điểm nhấn `emerald-600` nhẹ | Tag mảnh / Dot xanh tinh tế | Biểu thị khóa học còn khả năng nhận học viên |
| **Trạng thái: Hết chỗ** | `bg-neutral-100 text-neutral-500 border-neutral-200` | Nền xám nhạt, chữ mờ | Vô hiệu hóa nút đăng ký, badge xám tinh gọn |
| **Trạng thái: Lỗi / Xóa (Danger)** | `text-red-600 border-red-200 hover:bg-red-50` | `#DC2626` | Nút xóa khóa học, thông báo lỗi xác thực |

---

## 4. KIẾN TRÚC BỐ CỤC (LAYOUT ARCHITECTURE)

Dự án tách biệt hoàn toàn 2 Layout phục vụ 2 vai trò người dùng:

### 4.1. Phân hệ Học viên (Student Portal Layout)
- **Top Navigation Bar:**
  - Cố định trên đầu trang (`sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-neutral-200`).
  - Bên trái: Logo "PKS Portal" (hoặc "PKS Education").
  - Ở giữa: Menu chuyển hướng (`Trang chủ / Danh mục`, `Khóa học của tôi`).
  - Bên phải:
    - Nếu chưa đăng nhập: Nút "Đăng nhập" (Ghost/Outline) & "Đăng ký" (Primary Black).
    - Nếu đã đăng nhập: Avatar tròn, Họ tên học viên, Dropdown Menu (Hồ sơ, Khóa học của tôi, Đăng xuất).
- **Body Container:**
  - Chiều rộng tối đa căn giữa chuẩn: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`.
- **Footer:**
  - Tối giản ở cuối trang: Thông tin bản quyền PKS, liên hệ hỗ trợ, viền ngăn cách `border-t border-neutral-200`.

### 4.2. Phân hệ Quản trị viên (Admin Dashboard Layout)
- **Collapsible Sidebar (Thanh điều hướng bên trái):**
  - Chiều rộng: `w-64` (mở rộng) hoặc `w-16` (thu gọn), viền phải `border-r border-neutral-200 bg-white`.
  - Header Sidebar: Logo PKS + Badge nhỏ `[Admin]`.
  - Danh sách Menu mục:
    - `Tổng quan (Dashboard)` (Icon `LayoutDashboard`)
    - `Quản lý khóa học (Courses)` (Icon `BookOpen`)
    - `Danh sách ghi danh (Enrollments)` (Icon `Users`)
    - `Cấu hình hệ thống (Settings)` (Icon `Settings`)
  - Footer Sidebar: Nút Thu gọn/Mở rộng Sidebar + Thông tin Admin đang đăng nhập + Nút Đăng xuất.
- **Top Bar (Thanh phía trên khu vực làm việc):**
  - Breadcrumb định vị vị trí hiện tại (ví dụ: `Trang chủ > Quản lý khóa học > Chỉnh sửa`).
  - Quick Search & Avatar Admin.
- **Main Content Area:**
  - Nền xám rất nhạt (`bg-neutral-50 min-h-screen p-6 sm:p-8`).

---

## 5. QUY CHUẨN HIỂN THỊ COURSE CARD (CATALOG THẺ KHÓA HỌC)

Theo yêu cầu mục **3.1.C** của đề bài, mỗi thẻ khóa học **bắt buộc phải hiển thị đầy đủ 8 thông tin**:

```
+-----------------------------------------------------------+
| [Category Badge]                             [Status Tag] |
|                                                           |
| Tên khóa học (Font Bold, tối đa 2 dòng)                   |
| Giảng viên: ThS. Nguyễn Văn A                             |
|                                                           |
| Mô tả ngắn về nội dung khóa học, kiến thức đạt được...    |
| (Tối đa 3 dòng line-clamp-3, text-neutral-500)            |
|                                                           |
| [==================== Tiến độ sĩ số ============] 18/20  |
|                                                           |
| Học phí: 1.500.000 ₫                     [ Nút Ghi danh ] |
+-----------------------------------------------------------+
```

### Chi tiết 8 trường hiển thị:
1. **Tên khóa học (`title`):** Font `text-lg font-semibold text-neutral-900`, giới hạn `line-clamp-2` để giữ chiều cao thẻ đồng đều.
2. **Danh mục (`category`):** Badge nhỏ đơn sắc viền mỏng (`text-xs font-medium px-2 py-0.5 rounded border border-neutral-200 text-neutral-600 bg-neutral-50`).
3. **Giảng viên (`instructor`):** Dòng chữ phụ kèm icon `User` nhỏ (`text-sm text-neutral-600 flex items-center gap-1.5`).
4. **Mô tả ngắn (`description`):** `text-sm text-neutral-500 line-clamp-3 leading-relaxed min-h-[4.5rem]`.
5. **Học phí (`price`):** Định dạng tiền tệ bắt buộc: `Intl.NumberFormat('vi-VN')` kèm ký hiệu `₫` (ví dụ: `1.500.000 ₫` hoặc `Miễn phí` nếu price = 0). Font `text-base font-bold text-neutral-900`.
6. **Sĩ số tối đa (`capacity`) & 7. Đã ghi danh (`enrolled_count`):**
   - Hiển thị văn bản: `Đã đăng ký: {enrolled_count}/{capacity} học viên`.
   - Kèm **Thanh tiến độ đơn sắc (Monochrome Progress Bar):** Chiều cao `h-1.5`, nền `bg-neutral-100`, thanh chạy `bg-neutral-900` (hoặc chuyển `bg-red-500` khi đã chạm 100%).
8. **Trạng thái (Còn chỗ / Hết chỗ):**
   - **Còn chỗ:** Badge `border border-neutral-900 text-neutral-900 font-medium text-xs px-2.5 py-0.5 rounded-full`.
   - **Hết chỗ:** Badge `bg-neutral-100 text-neutral-400 border border-neutral-200 text-xs px-2.5 py-0.5 rounded-full`.
   - **Nút hành động:**
     - Nếu còn chỗ: Nút `bg-neutral-900 text-white hover:bg-neutral-800` ("Ghi danh").
     - Nếu hết chỗ: Nút disabled `bg-neutral-200 text-neutral-400 cursor-not-allowed` ("Đã hết chỗ").

### Responsive Grid cho Catalog:
- Mobile ($< 640px$): `grid-cols-1 gap-4`.
- Tablet ($640px - 1024px$): `grid-cols-2 gap-6`.
- Desktop ($> 1024px$): `grid-cols-3 gap-6`.

---

## 6. QUY CHUẨN FORM & VALIDATION

1. **Input Fields:**
   - Chiều cao chuẩn `h-10 px-3 py-2 text-sm`.
   - Nền trắng `bg-white`, viền mảnh `border border-neutral-300 rounded-md`.
   - Khi focus: `focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent`.
   - Khi có lỗi validation: Viền đỏ `border-red-500 focus:ring-red-500`, thông báo lỗi bên dưới `text-xs text-red-600 mt-1`.
2. **Nút bấm Submit Form:**
   - Trong lúc gửi yêu cầu (`isSubmitting` / `isLoading`):
     - Vô hiệu hóa nút (`disabled`).
     - Hiển thị icon Spinner xoay đơn sắc (`Loader2` của Lucide animate-spin).
     - Thay đổi nhãn nút: ví dụ "Đang ghi danh...", "Đang lưu...".
     - Tuyệt đối không cho phép click đúp gửi duplicate requests.

---

## 7. QUY CHUẨN XỬ LÝ PHẢN HỒI GIAO DIỆN (INTERACTION FEEDBACK)

### 7.1. Loading State (Trạng thái tải dữ liệu)
- **Danh sách khóa học:** Dùng **Skeleton Card** có kích thước và bố cục tương đương Card thật (khối chữ nhật mờ `animate-pulse bg-neutral-200/70 rounded`). Không dùng 1 spinner trơ trọi giữa trang.
- **Bảng dữ liệu Admin (Table):** Hiển thị 5 hàng Skeleton giả lập hàng của table.

### 7.2. Empty State (Trạng thái danh sách trống)
- Khi tìm kiếm không ra kết quả hoặc chưa có dữ liệu:
  - Hiển thị icon tối giản `SearchX` hoặc `Inbox` kích thước `size-10 text-neutral-400`.
  - Tiêu đề: "Không tìm thấy khóa học phù hợp".
  - Mô tả phụ: "Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác".
  - Nút bấm phụ: "Xóa bộ lọc" (`variant="outline"`).

### 7.3. Error State (Trạng thái lỗi kết nối / API)
- Khung thông báo lỗi thân thiện: Icon cảnh báo `AlertCircle text-neutral-800`.
- Nội dung lỗi rõ ràng (không in trực tiếp JSON exception thô).
- Cung cấp nút bấm "Thử lại" (Retry action).

### 7.4. Toast Notifications (Sonner)
- Đặt tại góc trên bên phải (`position="top-right"`).
- Khi ghi danh thành công: Toast đen chữ trắng hoặc viền tối giản "Ghi danh thành công khóa học {title}".
- Khi ghi danh thất bại do hết chỗ: Toast báo lỗi rõ ràng "Khóa học đã hết chỗ tuyển sinh".
- Khi hành động cần thời gian: Dùng `toast.promise(promise, { loading: '...', success: '...', error: '...' })`.

### 7.5. Dialog / Modal xác nhận hành động nguy hiểm
- Xóa khóa học, Hủy ghi danh: Bắt buộc mở **AlertDialog** xác nhận:
  - Tiêu đề: "Bạn có chắc chắn muốn xóa khóa học này?"
  - Nội dung cảnh báo: "Hành động này không thể hoàn tác. Toàn bộ thông tin khóa học và lịch sử ghi danh liên quan sẽ bị ảnh hưởng."
  - 2 nút bấm: "Hủy" (Outline) và "Xác nhận xóa" (Nút màu đỏ `bg-red-600 text-white hover:bg-red-700`).

---

## 8. QUY CHUẨN ĐỊNH DẠNG DỮ LIỆU (FORMATTING CONVENTIONS)

1. **Thời gian & Ngày tháng:**
   - Múi giờ: `Asia/Ho_Chi_Minh` (GMT+7).
   - Định dạng hiển thị bắt buộc: `YYYY-MM-DD` (Ví dụ: `2026-11-05`).
   - Sử dụng thư viện nhẹ (như `date-fns` hoặc hàm format chuẩn Native JS).
2. **Tiền tệ (Currency):**
   - Viết hoa đơn vị hoặc ký hiệu chuẩn: `1.500.000 ₫`.
   - Code snippet chuẩn hóa:
     ```typescript
     export const formatCurrency = (amount: number): string => {
       if (amount === 0) return 'Miễn phí';
       return new Intl.NumberFormat('vi-VN', {
         style: 'currency',
         currency: 'VND',
       }).format(amount).replace('₫', '₫');
     };
     ```
3. **Cắt tỉa văn bản dài (Text Truncation):**
   - Tiêu đề: `line-clamp-2` (có kèm thuộc tính `title={course.title}` để khi hover vẫn xem được toàn văn).
   - Mô tả ngắn: `line-clamp-3`.

---

## 9. CHECKLIST KIỂM THỬ GIAO DIỆN TRƯỚC KHI BÀN GIAO (UI AUDIT CHECKLIST)

- [ ] Toàn bộ trang không xuất hiện màu sắc lòe loẹt, tuân thủ đúng tôn chỉ tối giản monochrome.
- [ ] Card khóa học có đủ 8 trường thông tin theo đúng yêu cầu đề bài.
- [ ] Không có bất kỳ lệnh `alert()` nào trong source code; 100% thông báo dùng Sonner Toast.
- [ ] Các nút bấm gọi API đều có loading spinner và bị disable khi đang submit.
- [ ] Responsive hoạt động mượt mà từ màn hình điện thoại 375px đến màn hình 2K.
- [ ] Có đầy đủ Skeleton khi tải dữ liệu, Empty State khi không có kết quả, Error State khi mất mạng.
- [ ] Chuyển đổi mượt mà và phân quyền chuẩn giữa Student Layout và Admin Sidebar Layout.
