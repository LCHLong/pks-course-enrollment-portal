# Feature Specification: 007 - Admin Enrollment Tracking & Management

## 1. Overview & Business Context
- **Feature Name**: Admin Enrollment Tracking & Management (Theo Dõi & Quản Lý Ghi Danh Dành Cho Quản Trị Viên)
- **Target Subsystem**: Admin Portal (`/admin/enrollments` hoặc `/admin/courses/:id/enrollments`)
- **Business Goal**: Cung cấp cho Quản trị viên và Bộ phận Đào tạo khả năng theo dõi chi tiết danh sách học viên đã ghi danh theo từng khóa học cụ thể, kiểm tra thông tin liên lạc (họ tên, email), ngày đăng ký chuẩn hóa theo múi giờ Việt Nam (`Asia/Ho_Chi_Minh`), và quản lý vòng đời trạng thái ghi danh (`enrolled`, `confirmed`, `cancelled`, `pending`). Đặc biệt, hệ thống đảm bảo tính toàn vẹn dữ liệu thông qua cơ chế đồng bộ hóa bộ đếm sĩ số nguyên tử (Atomic Counter Synchronization): việc hủy ghi danh sẽ tự động giảm số lượng học viên của lớp, và việc kích hoạt lại học viên sẽ kiểm tra sức chứa để ngăn chặn tuyệt đối tình trạng vượt quá sĩ số (overbooking).
- **Target Users**: Quản trị viên hệ thống (Admin), Cán bộ phụ trách tuyển sinh & giáo vụ (Staff/Registrar).
- **Security & Authorization Context**: Phân quyền RBAC — chỉ người dùng có `role === 'admin'` mới được truy cập các endpoint `/api/admin/courses/:id/enrollments` và `/api/admin/enrollments/:id/status`. Học viên và khách vãng lai bị chặn với HTTP 403 Forbidden hoặc HTTP 401 Unauthorized.

---

## 2. Clarifications & Decisions

### Session 2026-11-05
- **Q1**: Các trạng thái ghi danh trong hệ thống gồm những giá trị nào và ý nghĩa của chúng là gì?  
  **A**: Theo thiết kế dữ liệu, các trạng thái gồm:
  - `enrolled`: Học viên đã ghi danh trực tuyến từ cổng Portal (mặc định ban đầu).
  - `confirmed`: Học viên đã được giáo vụ kiểm tra, xác nhận đóng học phí hoặc hoàn tất thủ tục nhập học chính thức.
  - `cancelled`: Học viên yêu cầu hủy ghi danh hoặc bị hủy do không hoàn tất học phí.
  - `pending`: Trạng thái chờ xử lý hoặc chờ xếp lớp bổ sung.
- **Q2**: Khi Admin chuyển trạng thái từ `enrolled` hoặc `confirmed` sang `cancelled`, sĩ số lớp học (`enrolled_count`) thay đổi như thế nào?  
  **A**: Hệ thống bắt buộc thực hiện **Atomic Decrement** (`enrolled_count = enrolled_count - 1`) trên bản ghi khóa học tương ứng. Thao tác này giải phóng 1 chỗ trống cho khóa học để học viên khác có thể tiếp tục đăng ký ngoài catalog.
- **Q3**: Nếu một học viên trước đó bị `cancelled`, nay Admin muốn đổi trạng thái lại thành `confirmed` hoặc `enrolled`, điều kiện kiểm tra là gì?  
  **A**: Hệ thống bắt buộc phải kiểm tra sức chứa hiện tại của khóa học trước khi cập nhật. Nếu `enrolled_count >= capacity` (khóa học đã đủ sĩ số từ các học viên khác), hệ thống **TỪ CHỐI** kích hoạt lại với lỗi HTTP 409 `CAPACITY_FULL` ("Khóa học đã đủ sĩ số tối đa, không thể kích hoạt lại học viên này"). Nếu còn chỗ, hệ thống thực hiện đồng thời đổi trạng thái và **Atomic Increment** (`enrolled_count = enrolled_count + 1`).
- **Q4**: Định dạng ngày tháng ghi danh bắt buộc hiển thị như thế nào?  
  **A**: Theo yêu cầu từ `REQUIREMENTS.md` và `ND_PV_FULLSTACK.pdf`, ngày đăng ký của học viên phải được chuẩn hóa theo múi giờ `Asia/Ho_Chi_Minh` (UTC+7) và hiển thị theo định dạng `YYYY-MM-DD` (ví dụ: `2026-11-05`).

---

## 3. User Scenarios & Acceptance Criteria

### User Story 1 - Xem danh sách học viên theo khóa học (Priority: P1)
As an **Admin / Giáo vụ**,  
I want to **chọn một khóa học bất kỳ để xem danh sách toàn bộ học viên đã đăng ký kèm thông tin liên lạc và ngày ghi danh**,  
So that **tôi có danh sách điểm danh, quản lý sĩ số và liên hệ với học viên chuẩn bị khai giảng**.

#### Acceptance Scenarios (Given-When-Then)
- **Scenario 1.1 (Happy Path - Xem danh sách học viên của một khóa học)**:
  - **Given**: Admin truy cập trang Quản lý ghi danh (`/admin/enrollments`) và chọn khóa học "Lập Trình Web Fullstack Chuyên Nghiệp" từ dropdown (`select-course-enrollment`).
  - **When**: Hệ thống tải danh sách ghi danh từ API `GET /api/admin/courses/:id/enrollments`.
  - **Then**: Bảng danh sách (`table-enrollments`) hiển thị đầy đủ các thông tin:
    - Họ và tên học viên (`name`)
    - Địa chỉ email học viên (`email`)
    - Tên khóa học (`title`)
    - Ngày ghi danh định dạng chuẩn `YYYY-MM-DD` theo múi giờ `Asia/Ho_Chi_Minh`
    - Trạng thái ghi danh hiển thị qua Status Badge tương ứng
    - Cột thao tác duyệt/hủy trạng thái (`select-enrollment-status-[id]`).
- **Scenario 1.2 (Xem danh sách khóa học chưa có ai đăng ký - Empty State)**:
  - **Given**: Khóa học mới tạo có `enrolled_count === 0`.
  - **When**: Admin chọn khóa học này để xem danh sách.
  - **Then**: Giao diện hiển thị vùng Empty State (`state-empty-enrollments`) với icon minh họa `Users` và thông điệp: "Khóa học này hiện chưa có học viên nào ghi danh."
- **Scenario 1.3 (Điều hướng trực tiếp từ Bảng Quản trị Khóa học)**:
  - **Given**: Admin đang ở trang `/admin/courses`.
  - **When**: Bấm vào nút "Xem học viên" (`btn-view-enrollments-[id]`) tại một hàng khóa học.
  - **Then**: Hệ thống điều hướng sang trang `/admin/enrollments?courseId=[id]` và tự động chọn sẵn khóa học đó, tải danh sách học viên ngay lập tức.

---

### User Story 2 - Phê duyệt trạng thái ghi danh (`confirmed`) (Priority: P1)
As an **Admin / Giáo vụ**,  
I want to **xác nhận trạng thái `confirmed` cho học viên đã hoàn tất thủ tục nhập học**,  
So that **hồ sơ tuyển sinh được hoàn thiện và khóa học ghi nhận chính thức học viên đó**.

#### Acceptance Scenarios (Given-When-Then)
- **Scenario 2.1 (Happy Path - Chuyển trạng thái sang `confirmed`)**:
  - **Given**: Học viên A đang ở trạng thái `enrolled` hoặc `pending`.
  - **When**: Admin chọn đổi trạng thái sang `confirmed` trong dropdown thao tác (`select-enrollment-status-[id]`).
  - **Then**: Hệ thống gửi yêu cầu cập nhật lên backend, đổi trạng thái thành `confirmed`, badge trạng thái chuyển sang màu Deep Emerald ("Đã xác nhận"), hiển thị Sonner Toast thành công "Cập nhật trạng thái ghi danh thành công!", và số lượng `enrolled_count` giữ nguyên vì học viên vốn đã được tính vào sĩ số.

---

### User Story 3 - Hủy ghi danh & Đồng bộ giảm sĩ số nguyên tử (Priority: P1)
As an **Admin / Giáo vụ**,  
I want to **hủy ghi danh của học viên (`cancelled`) khi học viên xin rút hồ sơ hoặc không đóng học phí**,  
So that **sĩ số lớp học được giải phóng chính xác và chỗ trống tự động mở lại cho học viên khác**.

#### Acceptance Scenarios (Given-When-Then)
- **Scenario 3.1 (Happy Path - Hủy ghi danh và giải phóng 1 suất học)**:
  - **Given**: Khóa học X có `capacity = 20` và `enrolled_count = 20` (đang "Hết chỗ"). Học viên B trong danh sách có trạng thái `enrolled`.
  - **When**: Admin chọn chuyển trạng thái của Học viên B sang `cancelled`.
  - **Then**:
    - Backend thực thi Transaction nguyên tử: cập nhật trạng thái bản ghi `enrollment.status = 'cancelled'`, đồng thời thực thi `enrolled_count = enrolled_count - 1`.
    - Kết quả: `enrolled_count` của khóa học giảm xuống còn 19.
    - Badge của học viên đổi sang màu Deep Crimson ("Đã hủy").
    - Sonner Toast thông báo: "Đã hủy ghi danh học viên và giải phóng 1 chỗ trống".
    - Ngoài trang chủ catalog, khóa học X tự động chuyển từ trạng thái "Hết chỗ" sang "Còn chỗ" (19/20).

---

### User Story 4 - Kích hoạt lại ghi danh & Kiểm tra sức chứa (Priority: P1)
As an **Admin / Giáo vụ**,  
I want to **kích hoạt lại một ghi danh đã bị hủy trước đó**,  
So that **học viên có thể tiếp tục tham gia nếu lớp học vẫn còn chỗ trống mà không làm tràn sĩ số lớp**.

#### Acceptance Scenarios (Given-When-Then)
- **Scenario 4.1 (Happy Path - Kích hoạt lại khi lớp học còn chỗ)**:
  - **Given**: Khóa học X có `enrolled_count = 18` và `capacity = 20` (còn 2 chỗ). Học viên C có trạng thái `cancelled`.
  - **When**: Admin đổi trạng thái của Học viên C sang `confirmed` (hoặc `enrolled`).
  - **Then**: Backend kiểm tra thấy `enrolled_count < capacity`, thực thi Transaction cập nhật trạng thái và tăng `enrolled_count` lên 19, Sonner Toast thông báo "Kích hoạt lại học viên thành công!".
- **Scenario 4.2 (Capacity Check Guard - Chặn kích hoạt lại khi lớp học đã đầy)**:
  - **Given**: Khóa học X có `enrolled_count = 20` và `capacity = 20` (đã đủ chỉ tiêu do học viên khác đăng ký lấp đầy chỗ trống). Học viên C có trạng thái `cancelled`.
  - **When**: Admin cố gắng chọn đổi trạng thái của Học viên C sang `confirmed` hoặc `enrolled`.
  - **Then**:
    - Backend kiểm tra điều kiện sức chứa, phát hiện lớp đã đầy, lập tức từ chối cập nhật và trả về HTTP 409 Conflict với mã lỗi `CAPACITY_FULL` và thông điệp: "Khóa học đã đủ sĩ số tối đa (20/20). Không thể kích hoạt lại học viên này trừ khi tăng sĩ số khóa học."
    - Giao diện phục hồi trạng thái dropdown về `cancelled`, hiển thị Sonner Toast báo lỗi đỏ, và không có thay đổi nào được lưu vào CSDL.

---

### User Story 5 - Tìm kiếm & Lọc học viên trong khóa học (Priority: P2)
As an **Admin**,  
I want to **tìm kiếm học viên theo tên hoặc email và lọc theo trạng thái trong danh sách ghi danh**,  
So that **tôi nhanh chóng tra cứu và xử lý hồ sơ của một học viên cụ thể trong lớp học có đông học viên**.

#### Acceptance Scenarios (Given-When-Then)
- **Scenario 5.1 (Tìm kiếm theo tên hoặc email)**:
  - **Given**: Bảng ghi danh đang hiển thị danh sách học viên của lớp học.
  - **When**: Admin nhập "nguyen.van.a" hoặc "Nguyễn Văn" vào ô tìm kiếm (`input-search-enrollments`).
  - **Then**: Bảng lập tức lọc và chỉ hiển thị các dòng khớp với từ khóa tìm kiếm.
- **Scenario 5.2 (Lọc theo trạng thái)**:
  - **Given**: Danh sách có học viên ở các trạng thái khác nhau (`enrolled`, `confirmed`, `cancelled`).
  - **When**: Admin chọn lọc "Đã hủy" từ dropdown (`select-filter-enrollment-status`).
  - **Then**: Bảng chỉ hiển thị danh sách các học viên đã bị hủy ghi danh.

---

## 4. Functional Requirements

- **FR-001**: Hệ thống MUST yêu cầu xác thực JWT và phân quyền `role === 'admin'` cho toàn bộ các route và API quản lý ghi danh (`/api/admin/courses/:id/enrollments`, `/api/admin/enrollments/:id/status`).
- **FR-002**: Hệ thống MUST cung cấp API `GET /api/admin/courses/:id/enrollments` trả về danh sách học viên đã ghi danh theo từng khóa học cụ thể, kèm thông tin người dùng (`name`, `email`), tiêu đề khóa học (`title`), ngày đăng ký (`registration_date` hoặc `created_at`), và trạng thái (`status`).
- **FR-003**: Hệ thống MUST chuẩn hóa ngày đăng ký theo múi giờ `Asia/Ho_Chi_Minh` (UTC+7) và định dạng hiển thị `YYYY-MM-DD`.
- **FR-004**: Hệ thống MUST hỗ trợ cập nhật trạng thái ghi danh qua API `PUT /api/admin/enrollments/:id/status` với các giá trị hợp lệ: `enrolled`, `confirmed`, `cancelled`, `pending`.
- **FR-005**: Khi chuyển trạng thái từ trạng thái tích cực (`enrolled`, `confirmed`) sang trạng thái hủy (`cancelled`), hệ thống MUST thực thi thao tác giảm sĩ số `enrolled_count` của khóa học đi 1 một cách nguyên tử trong cùng một Database Transaction.
- **FR-006**: Khi chuyển trạng thái từ hủy (`cancelled`) sang trạng thái tích cực (`enrolled`, `confirmed`), hệ thống MUST kiểm tra điều kiện sĩ số `enrolled_count < capacity`. Nếu `enrolled_count >= capacity`, hệ thống MUST từ chối và trả về HTTP 409 với mã lỗi `CAPACITY_FULL`.
- **FR-007**: Nếu còn chỗ khi kích hoạt lại, hệ thống MUST thực thi thao tác tăng `enrolled_count` đi 1 một cách nguyên tử cùng với việc cập nhật trạng thái.
- **FR-008**: Chuyển đổi giữa `enrolled` và `confirmed` (cả hai đều là trạng thái học tập tích cực) MUST NOT thay đổi giá trị của `enrolled_count`.
- **FR-009**: Mọi thông báo kết quả (thành công hoặc lỗi) trên giao diện MUST sử dụng Sonner Toast Notification; MUST NOT dùng hộp thoại `alert()`.
- **FR-010**: Dropdown thay đổi trạng thái MUST hiển thị spinner hoặc bị vô hiệu hóa (`disabled`) trong lúc request đang gửi lên máy chủ để chống gửi nhiều yêu cầu liên tiếp.

---

## 5. Success Criteria & Non-Functional Requirements

- **SC-001**: Đảm bảo 100% tính nhất quán dữ liệu giữa số lượng bản ghi trạng thái tích cực trong bảng `Enrollments` và trường `enrolled_count` của bảng `Courses` thông qua Database Transaction.
- **SC-002**: Tuyệt đối không để xảy ra tình trạng overbooking (`enrolled_count > capacity`) khi Admin kích hoạt lại các học viên đã bị hủy.
- **SC-003**: Thời gian phản hồi của API danh sách ghi danh theo khóa học không vượt quá 250ms cho lớp học có tối đa 100 học viên.
- **SC-004**: 100% các phần tử tương tác trên trang theo dõi ghi danh đều tuân thủ UI Contract: có Semantic Role, Accessibility Label (`aria-label`, `<label htmlFor>`), và `data-testid`.
- **SC-005**: Hỗ trợ giao diện phản hồi tốt trên màn hình hẹp di động ($< 768\text{px}$) với bảng cuộn ngang hoặc hiển thị dạng thẻ card học viên, các vùng chạm đạt chiều cao $\ge 44\text{px}$.

---

## 6. UI & Interaction Contract Dictionary

### 6.1. Interactive Elements Taxonomy

| Element Description | Semantic Tag / Role | Accessibility Label | `data-testid` | Interaction States |
|---|---|---|---|---|
| Dropdown chọn khóa học | `<select>` / `role="combobox"` | `aria-label="Chọn khóa học để xem danh sách ghi danh"` | `select-course-enrollment` | Default, Focus, Open |
| Ô tìm kiếm học viên | `<input type="search">` / `role="searchbox"` | `aria-label="Tìm kiếm học viên theo tên hoặc email"` | `input-search-enrollments` | Default, Focus, Typing, Clear |
| Bộ lọc trạng thái ghi danh | `<select>` / `role="combobox"` | `aria-label="Lọc theo trạng thái ghi danh"` | `select-filter-enrollment-status` | Default, Focus, Open |
| Bảng danh sách ghi danh | `<table>` / `role="table"` | `aria-label="Bảng danh sách học viên ghi danh"` | `table-enrollments` | Loaded, Loading Skeleton, Empty |
| Hàng học viên ghi danh | `<tr>` / `role="row"` | `aria-label="Học viên [Student Name]"` | `row-enrollment-[id]` | Default, Hover |
| Dropdown chuyển trạng thái | `<select>` / `role="combobox"` | `aria-label="Thay đổi trạng thái ghi danh cho học viên [Student Name]"` | `select-enrollment-status-[id]` | Default, Focus, Processing (Disabled) |
| Badge trạng thái ghi danh | `<span>` / `role="status"` | `aria-label="Trạng thái [Status Name]"` | `badge-enrollment-status-[id]` | Deep Emerald / Amber / Crimson |
| Thẻ thông tin tóm tắt sĩ số | `<div>` / `role="region"` | `aria-label="Thống kê sĩ số khóa học"` | `card-enrollment-stats` | Default (Total, Enrolled, Remaining) |
| Nút Xóa bộ lọc ghi danh | `<button>` / `role="button"` | `aria-label="Xóa bộ lọc tìm kiếm học viên"` | `btn-clear-enrollment-filter` | Secondary, Hover |
| Nút Thử lại khi lỗi tải danh sách | `<button>` / `role="button"` | `aria-label="Thử tải lại danh sách ghi danh"` | `btn-retry-enrollments` | Outline, Hover |

---

### 6.2. Status Badge Theme Token Mapping

- **Đã ghi danh (`enrolled`)**:
  - Light mode: `text-[#065F46] border-[#047857] bg-[#ECFDF5]`
  - Dark mode: `text-[#34D399] border-[#065F46] bg-[#064E3B33]`
  - Nhãn hiển thị: "Đã ghi danh"
- **Đã xác nhận (`confirmed`)**:
  - Light mode: `text-[#065F46] border-[#047857] bg-[#ECFDF5]`
  - Dark mode: `text-[#34D399] border-[#065F46] bg-[#064E3B33]`
  - Nhãn hiển thị: "Đã xác nhận"
- **Chờ duyệt (`pending`)**:
  - Light mode: `text-[#92400E] border-[#B45309] bg-[#FFFBEB]`
  - Dark mode: `text-[#FBBF24] border-[#92400E] bg-[#78350F33]`
  - Nhãn hiển thị: "Chờ xử lý"
- **Đã hủy (`cancelled`)**:
  - Light mode: `text-[#991B1B] border-[#B91C1C] bg-[#FEF2F2]`
  - Dark mode: `text-[#F87171] border-[#991B1B] bg-[#7F1D1D33]`
  - Nhãn hiển thị: "Đã hủy"

---

### 6.3. Full 4-State UI Coverage

#### 1. Loading State (`state-loading-enrollments`)
- Khi đang fetch danh sách học viên từ API:
  - Header bảng giữ cố định.
  - Vùng dữ liệu hiển thị 5 hàng Skeleton pulse hiệu ứng shimmer (`animate-pulse`).
  - Thẻ thống kê sĩ số hiển thị các hộp placeholder xám.

#### 2. Empty State (`state-empty-enrollments`)
- Khi khóa học được chọn chưa có học viên đăng ký hoặc bộ lọc không tìm thấy kết quả:
  - Icon `Users` hoặc `UserX` kích thước lớn viền xám (`text-zinc-400 dark:text-zinc-600`).
  - Tiêu đề: "Chưa có học viên nào đăng ký khóa học này" (hoặc "Không tìm thấy học viên phù hợp").
  - Mô tả: "Khi học viên ghi danh từ cổng Portal, danh sách sẽ tự động xuất hiện tại đây."
  - Nút hành động: "Xóa bộ lọc" nếu đang áp dụng tìm kiếm.

#### 3. Error State with Retry (`state-error-enrollments`)
- Khi API gặp lỗi kết nối (HTTP 500 hoặc mất mạng):
  - Khung thông báo lỗi đỏ nhạt: `bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-6`.
  - Icon `AlertCircle` màu Deep Crimson.
  - Tiêu đề: "Không thể tải danh sách học viên ghi danh".
  - Nút "Thử lại" (`btn-retry-enrollments`) để gọi lại API.
  - Sonner Toast thông báo lỗi xuất hiện ở góc màn hình.

#### 4. Success State with Sonner Toast
- Cập nhật trạng thái thành công:
  - Sonner Toast thông báo: `toast.success("Cập nhật trạng thái ghi danh thành công!")`.
  - Thẻ thống kê sĩ số lập tức cập nhật lại số liệu phản ánh sĩ số mới.
  - Tuyệt đối không dùng `alert()`.

---

## 7. Key Entities & Domain Rules

### 7.1. Entity: Enrollment (Quản lý Ghi danh)
- **id**: UUID v4 chuỗi duy nhất.
- **user_id**: Khóa ngoại liên kết bảng `Users`.
- **course_id**: Khóa ngoại liên kết bảng `Courses`.
- **status**: Trạng thái ghi danh (`enrolled`, `confirmed`, `cancelled`, `pending`).
- **created_at**: Thời điểm ghi danh (dùng để trích xuất `registration_date` theo định dạng `YYYY-MM-DD`).
- **updated_at**: Thời điểm cập nhật trạng thái gần nhất.
- **Unique Constraint**: `@@unique([user_id, course_id])`.

### 7.2. State Transition Matrix & Counter Synchronization Rules

*Quy tắc chuẩn hóa*: Mọi trạng thái hoạt động (`enrolled`, `confirmed`, `pending`) đều được tính là giữ chỗ (seat-holding) trong `enrolled_count`. Khi chuyển sang `cancelled`, giải phóng 1 suất. Khi kích hoạt lại từ `cancelled` sang bất kỳ trạng thái giữ chỗ nào, phải kiểm tra sĩ số nguyên tử và tăng 1. Chuyển đổi giữa các trạng thái giữ chỗ không làm thay đổi `enrolled_count`.

| Trạng thái cũ (Old) | Trạng thái mới (New) | Điều kiện kiểm tra (Condition) | Thay đổi `enrolled_count` | Kết quả nếu vi phạm |
|---|---|---|---|---|
| `enrolled` / `confirmed` / `pending` | `cancelled` | Không | **- 1** (Atomic Decrement) | Thành công, giải phóng 1 suất |
| `cancelled` | `enrolled` / `confirmed` / `pending` | `enrolled_count < capacity` (Atomic SQL check) | **+ 1** (Atomic Conditional Update) | Thất bại: HTTP 409 `CAPACITY_FULL` nếu lớp đã đầy |
| `pending` | `confirmed` / `enrolled` | Cùng thuộc nhóm giữ chỗ (Seat-holding) | Không đổi (**0**) | Thành công |
| `enrolled` / `confirmed` | `pending` | Cùng thuộc nhóm giữ chỗ (Seat-holding) | Không đổi (**0**) | Thành công |
| `enrolled` | `confirmed` | Cùng thuộc nhóm giữ chỗ (Seat-holding) | Không đổi (**0**) | Thành công |
| `confirmed` | `enrolled` | Cùng thuộc nhóm giữ chỗ (Seat-holding) | Không đổi (**0**) | Thành công |

---

## 8. Assumptions & Out-of-Scope (Non-Goals)

### Assumptions
- Mọi học viên trong danh sách đều có tài khoản hợp lệ trong bảng `users` với `role: student`.
- Ngày ghi danh hiển thị luôn lấy theo múi giờ `Asia/Ho_Chi_Minh`.

### Out-of-Scope (Non-Goals)
- Không bao gồm tính năng gửi email tự động (SendGrid/Mailgun) thông báo khi Admin đổi trạng thái (thuộc giai đoạn tiếp theo).
- Không bao gồm tính năng chuyển đổi học viên giữa hai khóa học khác nhau trong cùng một thao tác (phải hủy khóa cũ và đăng ký khóa mới).
- Không bao gồm tính năng nhập hàng loạt học viên từ file Excel (Bulk Import).
