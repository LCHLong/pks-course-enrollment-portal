---
description: Quy chuẩn bắt buộc về thiết kế giao diện (UI/UX) cho dự án PKS Course & Enrollment Portal
globs: ["**/*.tsx", "**/*.jsx", "**/*.css", "**/*.html"]
---

# UI & Frontend Rules for PKS Course & Enrollment Portal

Khi tạo mới hoặc chỉnh sửa bất kỳ thành phần giao diện nào trong dự án, Agent bắt buộc phải tuân thủ nghiêm ngặt các quy tắc sau:

## 1. Phong cách thiết kế (Design Philosophy)
- **Ultra-Minimalist (Càng ít màu càng tốt):** Sử dụng hệ màu Grayscale/Monochrome (Black, White, Neutral/Zinc `neutral-100` đến `neutral-900`).
- **Không dùng màu sắc sặc sỡ:** Tuyệt đối không dùng gradient màu mè hay các tông màu lòe loẹt. Màu sắc chỉ được dùng tối giản cho trạng thái nghiệp vụ (semantic) bằng border mỏng hoặc chấm nhỏ.
- **Thư viện UI chuẩn:** Sử dụng **Tailwind CSS**, **shadcn/ui** (dựa trên Radix UI), và icon **Lucide React**.

## 2. Bố cục (Layout)
- **Phân hệ Học viên (Student):**
  - Top Navigation Bar (Header cố định, viền mỏng `border-b border-neutral-200 bg-white/95 backdrop-blur`).
  - Container căn giữa chuẩn `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
  - Footer tối giản.
- **Phân hệ Quản trị viên (Admin):**
  - Collapsible Sidebar (`border-r border-neutral-200 bg-white`) chứa logo, badge `[Admin]`, danh sách điều hướng.
  - Topbar có Breadcrumb và Profile menu.

## 3. Course Card (Thẻ khóa học)
Mỗi thẻ khóa học trong danh mục **bắt buộc phải hiển thị đầy đủ 8 trường thông tin**:
1. Tên khóa học (`title`) - `font-semibold text-neutral-900 line-clamp-2`
2. Danh mục (`category`) - Badge đơn sắc viền mỏng
3. Giảng viên (`instructor`) - Kèm icon `User` nhỏ
4. Mô tả ngắn (`description`) - `line-clamp-3 text-neutral-500`
5. Học phí (`price`) - Định dạng `Intl.NumberFormat('vi-VN')` kèm `₫` (ví dụ `1.500.000 ₫` hoặc `Miễn phí`)
6. Sĩ số tối đa (`capacity`)
7. Số lượng đã ghi danh (`enrolled_count`) - Kèm thanh tiến độ đơn sắc (Monochrome Progress Bar)
8. Trạng thái: **"Còn chỗ"** (nếu `enrolled_count < capacity`) hoặc **"Hết chỗ"** (nếu `enrolled_count >= capacity`)
- **Nút hành động:** Nếu hết chỗ, nút bấm phải bị `disabled` và chuyển sang trạng thái xám mờ ("Đã hết chỗ").

## 4. Trạng thái phản hồi & Tương tác (Feedback States)
- **Tuyệt đối KHÔNG dùng `alert()` mặc định của trình duyệt.**
- Sử dụng **Sonner** cho Toast notification (đặt ở góc trên bên phải `position="top-right"`).
- **Loading State:** Sử dụng **Skeleton** components (`animate-pulse bg-neutral-200/70`) có kích thước tương đồng với Card hoặc Table rows khi đang tải dữ liệu.
- **Empty State:** Hiển thị icon xám (`SearchX`/`Inbox`), thông điệp rõ ràng và nút bấm hỗ trợ xóa bộ lọc.
- **Error State:** Hiển thị thông báo thân thiện và nút "Thử lại".
- **Form Submit:** Nút submit bắt buộc phải `disabled` khi `isSubmitting` / `isLoading` và hiển thị spinner xoay (`Loader2` animate-spin).
- **Xác nhận hành động nguy hiểm:** Dùng `AlertDialog` (shadcn/ui) để xác nhận khi xóa hoặc hủy.

## 5. Định dạng dữ liệu (Formatting)
- **Thời gian:** Múi giờ `Asia/Ho_Chi_Minh`, định dạng ngày bắt buộc là `YYYY-MM-DD`.
- **Tiền tệ:** Định dạng số có dấu chấm phân cách hàng nghìn và ký hiệu `₫` phía sau (`1.500.000 ₫`).
- **Typography:** Font **Inter** hoặc **Geist Sans**.
