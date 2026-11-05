# Feature Specification: 006 - Admin Course Management (CRUD)

## 1. Overview & Business Context
- **Feature Name**: Admin Course Management (Quản Lý Khóa Học Dành Cho Quản Trị Viên)
- **Target Subsystem**: Admin Portal (`/admin/courses`)
- **Business Goal**: Cung cấp cho Quản trị viên (Admin/Staff) công cụ toàn diện để quản trị danh mục khóa học của PKS Education: tạo mới khóa học, cập nhật thông tin và điều chỉnh sĩ số với cơ chế bảo vệ bất biến (không được hạ sĩ số dưới số học viên đã đăng ký), chuyển đổi trạng thái hiển thị (Ẩn/Hiện), và xóa an toàn (chặn xóa cứng khóa học đã có học viên đăng ký nhằm chống mồ côi dữ liệu).
- **Target Users**: Quản trị viên hệ thống (Admin), Nhân viên đào tạo (Staff).
- **Security & Authorization Context**: Phân quyền RBAC nghiêm ngặt — chỉ tài khoản có `role === 'admin'` mới được cấp quyền truy cập giao diện và các endpoint API `/api/admin/courses*`. Học viên (`student`) hoặc Khách vãng lai (`guest`) bị từ chối với HTTP 403 Forbidden hoặc HTTP 401 Unauthorized.

---

## 2. Clarifications & Decisions

### Session 2026-11-05
- **Q1**: Khi Admin điều chỉnh giảm `capacity` của khóa học, quy tắc kiểm tra là gì?  
  **A**: Hệ thống bắt buộc thực thi quy tắc bất biến `new_capacity >= current_enrolled_count`. Nếu Admin nhập `new_capacity < current_enrolled_count`, hệ thống từ chối ngay lập tức tại cả Frontend (validation) và Backend (HTTP 400 `INVALID_CAPACITY`), thông báo rõ sĩ số tối thiểu cho phép là số lượng học viên đang ghi danh hiện tại.
- **Q2**: Khóa học đã có học viên đăng ký (`enrolled_count > 0`) có được phép xóa không?  
  **A**: Tuyệt đối **KHÔNG ĐƯỢC XÓA CỨNG** (Hard Delete) khóa học đã có học viên ghi danh. Nếu Admin thực hiện xóa, hệ thống chặn lại với lỗi HTTP 400/409 `COURSE_HAS_ENROLLMENTS` và hướng dẫn Admin chuyển trạng thái sang Ẩn (`is_active = false`) để học viên đã đăng ký vẫn giữ nguyên lịch sử đào tạo. Khóa học chỉ được phép xóa cứng khi `enrolled_count === 0` và không có bản ghi nào trong bảng `enrollments`.
- **Q3**: Khi một khóa học chuyển sang trạng thái Ẩn (`is_active = false`), phía Học viên nhìn thấy gì?  
  **A**: Khóa học ẩn sẽ hoàn toàn không xuất hiện trên Danh mục khóa học công khai (`GET /api/courses` và trang `/courses`). Tuy nhiên, những học viên đã đăng ký khóa học đó trước đây vẫn nhìn thấy khóa học trong trang "Khóa học của tôi" (`/my-courses`) để theo dõi tiến độ.
- **Q4**: Học phí `price = 0` được xử lý như thế nào trong form tạo/sửa khóa học?  
  **A**: Cho phép `price = 0` đại diện cho khóa học miễn phí (ví dụ các workshop cộng đồng hoặc khóa học trải nghiệm MOS của PKS). Giá trị hiển thị trên bảng quản trị và ngoài catalog là nhãn "Miễn phí". Hệ thống từ chối giá trị âm (`price < 0`).

---

## 3. User Scenarios & Acceptance Criteria

### User Story 1 - Xem danh sách khóa học quản trị & Bộ lọc (Priority: P1)
As an **Admin**,  
I want to **xem toàn bộ danh sách khóa học cùng các chỉ số chi tiết (tên, danh mục, giảng viên, học phí, sĩ số, số lượng đã đăng ký, trạng thái ẩn/hiện)**,  
So that **tôi có cái nhìn tổng quan về tình hình tuyển sinh và vận hành các khóa học của trung tâm**.

#### Acceptance Scenarios (Given-When-Then)
- **Scenario 1.1 (Happy Path - Hiển thị danh sách khóa học đầy đủ)**:
  - **Given**: Admin đã đăng nhập với tài khoản có `role === 'admin'` và đang ở trang `/admin/courses`.
  - **When**: Trang tải dữ liệu khóa học từ hệ thống.
  - **Then**: Bảng quản trị (`table-admin-courses`) hiển thị danh sách các khóa học với đầy đủ các cột: Tên khóa học, Danh mục, Giảng viên, Học phí (định dạng `\u00A0₫` hoặc "Miễn phí"), Sĩ số tối đa (`capacity`), Đã ghi danh (`enrolled_count`), Thanh tỷ lệ lấp đầy (progress bar), Trạng thái kích hoạt (Badge "Đang hoạt động" / "Đã ẩn"), và Cột Thao tác (Sửa, Xem học viên, Xóa/Ẩn).
- **Scenario 1.2 (Lọc & Tìm kiếm khóa học)**:
  - **Given**: Bảng quản trị có nhiều khóa học thuộc các danh mục khác nhau (Frontend, Backend, MOS...).
  - **When**: Admin nhập từ khóa vào ô tìm kiếm (`input-search-admin-courses`) hoặc chọn danh mục từ dropdown (`select-filter-admin-category`).
  - **Then**: Bảng lập tức lọc và chỉ hiển thị các khóa học thỏa mãn điều kiện tìm kiếm.
- **Scenario 1.3 (Empty State - Không có khóa học nào khớp)**:
  - **Given**: Admin tìm kiếm với từ khóa không tồn tại trong hệ thống.
  - **When**: Hệ thống trả về mảng rỗng `[]`.
  - **Then**: Hiển thị vùng Empty State (`state-empty-admin-courses`) với thông điệp "Không tìm thấy khóa học nào phù hợp" kèm nút "Xóa bộ lọc" (`btn-clear-admin-filter`).

---

### User Story 2 - Thêm mới khóa học với dữ liệu hợp lệ (Priority: P1)
As an **Admin**,  
I want to **thêm một khóa học mới vào hệ thống thông qua Modal Form**,  
So that **PKS Education có thể mở các lớp đào tạo mới cho học viên đăng ký**.

#### Acceptance Scenarios (Given-When-Then)
- **Scenario 2.1 (Happy Path - Tạo khóa học thành công)**:
  - **Given**: Admin đang ở trang `/admin/courses` và bấm nút "Thêm khóa học" (`btn-add-course`).
  - **When**: Modal Form (`modal-course-form`) mở ra, Admin điền đầy đủ và hợp lệ các trường:
    - Tiêu đề: "Lập trình React.js & TypeScript Chuyên Sâu"
    - Danh mục: "Frontend"
    - Giảng viên: "ThS. Nguyễn Văn A"
    - Mô tả: "Khóa học trang bị kiến thức React hiện đại và tối ưu hóa hiệu năng..."
    - Học phí: `3500000`
    - Sĩ số tối đa: `25`
    - Kích hoạt hiển thị: Checked (`is_active = true`)
    Và bấm nút "Lưu khóa học" (`btn-submit-course`).
  - **Then**: Nút chuyển sang trạng thái Loading (hiển thị spinner `Loader2` và disabled), hệ thống gửi yêu cầu tạo mới, lưu vào CSDL với `enrolled_count = 0`, đóng modal, kích hoạt Sonner Toast thành công "Tạo khóa học mới thành công!", và danh sách khóa học được cập nhật ngay lập tức.
- **Scenario 2.2 (Lỗi Validation đầu vào)**:
  - **Given**: Admin để trống tiêu đề, nhập `capacity = 0` hoặc nhập `price = -50000`.
  - **When**: Admin bấm nút "Lưu khóa học".
  - **Then**: Hệ thống không gửi request, hiển thị thông báo lỗi inline dưới từng ô nhập liệu vi phạm (`error-course-title`, `error-course-capacity`, `error-course-price`), focus vào ô lỗi đầu tiên.

---

### User Story 3 - Chỉnh sửa khóa học & Thực thi Bất biến Capacity (Priority: P1)
As an **Admin**,  
I want to **chỉnh sửa thông tin khóa học và điều chỉnh sĩ số tối đa**,  
So that **thông tin luôn chính xác nhưng tuyệt đối không vi phạm nguyên tắc sĩ số không được nhỏ hơn số học viên đã ghi danh thực tế**.

#### Acceptance Scenarios (Given-When-Then)
- **Scenario 3.1 (Happy Path - Cập nhật thông tin hợp lệ)**:
  - **Given**: Khóa học X đang có `capacity = 20` và `enrolled_count = 12`.
  - **When**: Admin mở form sửa (`btn-edit-course-[id]`), tăng `capacity` lên `25`, cập nhật mô tả, và bấm Lưu.
  - **Then**: Hệ thống cập nhật thành công, đóng modal, hiển thị Sonner Toast "Cập nhật khóa học thành công", và bảng dữ liệu hiển thị `12/25`.
- **Scenario 3.2 (Thực thi Invariant Capacity Failure - Bị chặn khi hạ sĩ số thấp hơn số học viên hiện tại)**:
  - **Given**: Khóa học X đang có `capacity = 20` và `enrolled_count = 15`.
  - **When**: Admin sửa `capacity` thành `10` (nhỏ hơn 15) và bấm Lưu.
  - **Then**: Frontend kiểm tra và cảnh báo ngay lập tức. Nếu gửi request lên Backend, API trả về HTTP 400 Bad Request với mã lỗi `INVALID_CAPACITY` và thông điệp: "Sĩ số tối đa không thể nhỏ hơn số học viên đã ghi danh hiện tại: 15". (Lưu ý: nếu nhập `capacity <= 0`, middleware Zod trả về HTTP 400 với mã lỗi `VALIDATION_ERROR`). Modal giữ nguyên dữ liệu, hiển thị banner lỗi, và không thực hiện lưu vào CSDL.
- **Scenario 3.3 (Cập nhật `capacity` bằng đúng `enrolled_count`)**:
  - **Given**: Khóa học X đang có `enrolled_count = 15`.
  - **When**: Admin điều chỉnh `capacity = 15` (khóa học trở thành đủ chỉ tiêu / Hết chỗ).
  - **Then**: Hệ thống chấp thuận cập nhật, lưu thành công, trạng thái khóa học ngoài catalog tự động chuyển thành "Hết chỗ".

---

### User Story 4 - Chuyển đổi trạng thái Ẩn/Hiện (Toggle Active Status) (Priority: P2)
As an **Admin**,  
I want to **bật/tắt trạng thái hiển thị của khóa học (`is_active`) trực tiếp từ danh sách**,  
So that **tôi có thể tạm dừng tuyển sinh khóa học mà không cần xóa dữ liệu**.

#### Acceptance Scenarios (Given-When-Then)
- **Scenario 4.1 (Happy Path - Tắt hiển thị / Ẩn khóa học)**:
  - **Given**: Khóa học đang ở trạng thái "Đang hoạt động" (`is_active = true`).
  - **When**: Admin bấm vào nút/switch chuyển đổi trạng thái (`btn-toggle-active-[id]`).
  - **Then**: Hệ thống gửi yêu cầu cập nhật, đổi `is_active = false`, badge đổi sang màu xám/vàng "Đã ẩn", Sonner Toast hiển thị "Đã ẩn khóa học khỏi danh mục tuyển sinh". Khóa học biến mất khỏi catalog công khai của học viên.
- **Scenario 4.2 (Kích hoạt lại khóa học)**:
  - **Given**: Khóa học đang ở trạng thái "Đã ẩn" (`is_active = false`).
  - **When**: Admin bấm kích hoạt lại.
  - **Then**: Khóa học chuyển sang `is_active = true`, hiển thị lại trên catalog công khai.

---

### User Story 5 - Xóa an toàn khóa học (Safe Course Deletion) (Priority: P1)
As an **Admin**,  
I want to **xóa các khóa học nhầm lẫn hoặc chưa có học viên đăng ký, đồng thời được bảo vệ ngăn chặn việc xóa các khóa học đã có học viên**,  
So that **dữ liệu lịch sử học tập và chứng nhận của học viên không bao giờ bị mất mát hay mồ côi**.

#### Acceptance Scenarios (Given-When-Then)
- **Scenario 5.1 (Happy Path - Xóa khóa học chưa có người ghi danh)**:
  - **Given**: Khóa học Y mới tạo nhầm, có `enrolled_count === 0` và 0 bản ghi enrollment.
  - **When**: Admin bấm nút Xóa (`btn-delete-course-[id]`), Modal xác nhận (`modal-confirm-delete`) hiện ra cảnh báo "Hành động này không thể hoàn tác", Admin bấm "Xác nhận xóa" (`btn-confirm-delete`).
  - **Then**: Backend xóa khóa học khỏi bảng `courses`, Sonner Toast thông báo "Đã xóa khóa học thành công", hàng khóa học biến mất khỏi bảng.
- **Scenario 5.2 (Safe Deletion Guard - Chặn xóa khóa học đã có học viên)**:
  - **Given**: Khóa học Z đang có `enrolled_count > 0` (ví dụ 5 học viên).
  - **When**: Admin bấm nút Xóa trên giao diện hoặc gửi request `DELETE /api/admin/courses/:id`.
  - **Then**: Hệ thống từ chối xóa cứng, Backend trả về HTTP 409 Conflict với mã lỗi `COURSE_HAS_ENROLLMENTS` và thông điệp: "Không thể xóa khóa học đã có học viên đăng ký. Vui lòng chuyển sang trạng thái Ẩn để tạm dừng". Giao diện hiển thị Alert Dialog giải thích lý do kèm gợi ý chuyển sang "Ẩn khóa học".

---

### User Story 6 - Bảo vệ RBAC & Ngăn chặn Học viên truy cập (Priority: P1)
As the **System Security Officer**,  
I want to **chặn hoàn toàn mọi truy cập của tài khoản `role === 'student'` và khách vãng lai vào giao diện và API quản trị**,  
So that **chỉ có nhân sự được ủy quyền mới có thể can thiệp dữ liệu đào tạo của PKS**.

#### Acceptance Scenarios (Given-When-Then)
- **Scenario 6.1 (Chặn API với role student)**:
  - **Given**: Người dùng đã đăng nhập với vai trò `role: student`.
  - **When**: Người dùng hoặc script gửi request đến bất kỳ API nào thuộc `/api/admin/courses*`.
  - **Then**: `roleMiddleware` chặn lại và phản hồi HTTP 403 Forbidden với mã `FORBIDDEN` ("Bạn không có quyền truy cập chức năng này").
- **Scenario 6.2 (Chặn giao diện phía Frontend)**:
  - **Given**: Học viên gõ trực tiếp URL `http://localhost:5173/admin/courses` trên trình duyệt.
  - **When**: Ứng dụng React xử lý Protected Route.
  - **Then**: Nhận diện `user.role !== 'admin'`, lập tức chuyển hướng về trang chủ `/`, hiển thị Sonner Toast cảnh báo: "Bạn không có quyền truy cập khu vực Quản trị".

---

## 4. Functional Requirements

- **FR-001**: Hệ thống MUST yêu cầu xác thực JWT và phân quyền `role === 'admin'` cho 100% các route và API quản lý khóa học (`/api/admin/courses*`).
- **FR-002**: Hệ thống MUST cung cấp danh sách đầy đủ các khóa học (bao gồm cả khóa học đang hoạt động `is_active = true` và khóa học ẩn `is_active = false`), sắp xếp theo ngày tạo mới nhất giảm dần.
- **FR-003**: Hệ thống MUST hỗ trợ tìm kiếm khóa học theo tiêu đề (`title`) không phân biệt chữ hoa chữ thường (case-insensitive) và lọc theo danh mục (`category`).
- **FR-004**: Form tạo mới khóa học MUST yêu cầu các trường bắt buộc: `title` (3-255 ký tự), `category` (1-100 ký tự), `instructor` (2-100 ký tự), `description` (tối thiểu 10 ký tự), `price` (số nguyên không âm $\ge 0$), `capacity` (số nguyên dương $> 0$).
- **FR-005**: Khi tạo khóa học thành công, giá trị ban đầu của `enrolled_count` MUST luôn bằng 0.
- **FR-006**: Khi chỉnh sửa khóa học, hệ thống MUST kiểm tra ràng buộc bất biến: `new_capacity >= current_enrolled_count`. Nếu vi phạm, MUST từ chối lưu và trả về HTTP 400 với mã lỗi `INVALID_CAPACITY`.
- **FR-007**: Hệ thống MUST hỗ trợ chuyển đổi trạng thái `is_active` giữa `true` và `false` nhanh chóng thông qua API `PATCH /api/admin/courses/:id/status` hoặc `PUT /api/admin/courses/:id`.
- **FR-008**: Hệ thống MUST ngăn chặn thao tác xóa cứng (Hard Delete) khóa học nếu `enrolled_count > 0` hoặc tồn tại bất kỳ bản ghi nào trong bảng `enrollments` liên kết với khóa học đó, trả về HTTP 409 `COURSE_HAS_ENROLLMENTS`.
- **FR-009**: Hệ thống MUST chỉ thực hiện xóa cứng khóa học khi `enrolled_count === 0` và không có liên kết ghi danh nào.
- **FR-010**: Mọi thông báo thao tác thành công hoặc lỗi trên giao diện MUST sử dụng Sonner Toast Notification. Hệ thống MUST NOT sử dụng hộp thoại mặc định `window.alert()` hoặc `window.confirm()`.
- **FR-011**: Các nút thao tác dạng Async (Tạo, Sửa, Xóa) MUST bị vô hiệu hóa (`disabled`) và hiển thị biểu tượng quay vòng `Loader2` trong suốt quá trình chờ phản hồi từ API để chống gửi request kép (double-submit).

---

## 5. Success Criteria & Non-Functional Requirements

- **SC-001**: Thời gian phản hồi của API danh sách khóa học quản trị (`GET /api/admin/courses`) không quá 300ms với quy mô 500 khóa học.
- **SC-002**: 100% các thao tác vi phạm ràng buộc `capacity < enrolled_count` đều bị chặn đồng bộ ở cả tầng giao diện (Client-side validation) và tầng máy chủ (Server-side validation).
- **SC-003**: 0% trường hợp mồ côi dữ liệu lịch sử ghi danh học viên do vô tình xóa khóa học.
- **SC-004**: 100% các phần tử tương tác trên màn hình quản lý khóa học đều đạt chuẩn Accessibility (WAI-ARIA) và có định danh `data-testid` phục vụ kiểm thử tự động E2E.
- **SC-005**: Giao diện tương thích hoàn hảo trên thiết bị di động và máy tính bảng: trên màn hình hẹp ($< 768\text{px}$), bảng danh sách hỗ trợ cuộn ngang mượt mà (`overflow-x-auto`) hoặc chuyển đổi sang dạng thẻ Card di động; chiều cao nút bấm đạt tối thiểu 44px.
- **SC-006**: Hỗ trợ đầy đủ chế độ Sáng / Tối (Dual Theme) tuân thủ bảng màu Deep Muted Semantics của PKS.

---

## 6. UI & Interaction Contract Dictionary

### 6.1. Interactive Elements Taxonomy

| Element Description | Semantic Tag / Role | Accessibility Label | `data-testid` | Interaction States |
|---|---|---|---|---|
| Nút "Thêm khóa học" | `<button>` / `role="button"` | `aria-label="Thêm khóa học mới"` | `btn-add-course` | Default, Hover, Focus, Active |
| Ô tìm kiếm khóa học | `<input type="search">` / `role="searchbox"` | `aria-label="Tìm kiếm khóa học theo tên"` | `input-search-admin-courses` | Default, Focus, Typing, Clear |
| Bộ lọc danh mục | `<select>` / `role="combobox"` | `aria-label="Lọc theo danh mục khóa học"` | `select-filter-admin-category` | Default, Focus, Dropdown Open |
| Bảng danh sách khóa học | `<table>` / `role="table"` | `aria-label="Bảng danh sách quản trị khóa học"` | `table-admin-courses` | Loaded, Loading Skeleton, Empty |
| Hàng khóa học trong bảng | `<tr>` / `role="row"` | `aria-label="Khóa học [Title]"` | `row-course-[id]` | Default, Hover |
| Nút "Sửa khóa học" | `<button>` / `role="button"` | `aria-label="Chỉnh sửa khóa học [Title]"` | `btn-edit-course-[id]` | Default, Hover, Focus |
| Nút "Xem học viên" | `<a>` / `role="link"` | `aria-label="Xem danh sách học viên đăng ký khóa học [Title]"` | `btn-view-enrollments-[id]` | Default, Hover, Focus |
| Nút bật/tắt kích hoạt | `<button>` / `role="switch"` | `aria-checked="true/false"`, `aria-label="Kích hoạt hoặc ẩn khóa học [Title]"` | `btn-toggle-active-[id]` | Active (Green), Inactive (Muted) |
| Nút "Xóa khóa học" | `<button>` / `role="button"` | `aria-label="Xóa khóa học [Title]"` | `btn-delete-course-[id]` | Default, Hover, Disabled (nếu có học viên) |
| Badge trạng thái kích hoạt | `<span>` / `role="status"` | `aria-label="Trạng thái hiển thị"` | `badge-course-status-[id]` | Emerald (Hoạt động) / Amber (Đã ẩn) |
| Thanh tiến độ sĩ số | `<div>` / `role="progressbar"` | `aria-valuenow="[enrolled]"`, `aria-valuemax="[capacity]"`, `aria-label="Tỷ lệ học viên đã ghi danh"` | `progress-capacity-[id]` | Emerald (<80%), Amber (80-99%), Crimson (100%) |
| Modal Form khóa học | `<div role="dialog">` | `aria-labelledby="modal-course-title"`, `aria-modal="true"` | `modal-course-form` | Open, Close, Submitting |
| Ô nhập Tiêu đề khóa học | `<input type="text">` | `<label htmlFor="course-title">Tiêu đề khóa học</label>` | `input-course-title` | Default, Focus, Error |
| Ô chọn/nhập Danh mục | `<input type="text">` | `<label htmlFor="course-category">Danh mục</label>` | `input-course-category` | Default, Focus, Error |
| Ô nhập Giảng viên | `<input type="text">` | `<label htmlFor="course-instructor">Giảng viên phụ trách</label>` | `input-course-instructor` | Default, Focus, Error |
| Ô nhập Mô tả khóa học | `<textarea>` | `<label htmlFor="course-description">Mô tả chi tiết</label>` | `input-course-description` | Default, Focus, Error |
| Ô nhập Học phí | `<input type="number">` | `<label htmlFor="course-price">Học phí (VND)</label>` | `input-course-price` | Default, Focus, Error |
| Ô nhập Sĩ số tối đa | `<input type="number">` | `<label htmlFor="course-capacity">Sĩ số tối đa</label>` | `input-course-capacity` | Default, Focus, Error |
| Checkbox hiển thị | `<input type="checkbox">` | `<label htmlFor="course-active">Hiển thị tuyển sinh</label>` | `checkbox-course-active` | Checked, Unchecked |
| Nút Lưu trên modal | `<button type="submit">` | `aria-label="Lưu thông tin khóa học"` | `btn-submit-course` | Default, Hover, Loading (Disabled + Spinner) |
| Nút Hủy trên modal | `<button type="button">` | `aria-label="Hủy thao tác và đóng cửa sổ"` | `btn-cancel-course` | Default, Hover |
| Lỗi inline Tiêu đề | `<p role="alert">` | `aria-live="polite"` | `error-course-title` | Visible on validation error |
| Lỗi inline Danh mục | `<p role="alert">` | `aria-live="polite"` | `error-course-category` | Visible on validation error |
| Lỗi inline Giảng viên | `<p role="alert">` | `aria-live="polite"` | `error-course-instructor` | Visible on validation error |
| Lỗi inline Mô tả | `<p role="alert">` | `aria-live="polite"` | `error-course-description` | Visible on validation error |
| Lỗi inline Học phí | `<p role="alert">` | `aria-live="polite"` | `error-course-price` | Visible on validation error |
| Lỗi inline Sĩ số | `<p role="alert">` | `aria-live="polite"` | `error-course-capacity` | Visible on validation error |
| Modal Xác nhận Xóa | `<div role="alertdialog">` | `aria-labelledby="dialog-delete-title"`, `aria-modal="true"` | `modal-confirm-delete` | Open, Close, Processing |
| Nút Xác nhận xóa | `<button>` | `aria-label="Xác nhận xóa khóa học vĩnh viễn"` | `btn-confirm-delete` | Danger Red, Hover, Loading |
| Nút Hủy xóa | `<button>` | `aria-label="Hủy xóa khóa học"` | `btn-cancel-delete` | Secondary, Hover |
| Nút Xóa bộ lọc | `<button>` | `aria-label="Xóa bộ lọc tìm kiếm khóa học"` | `btn-clear-admin-filter` | Secondary, Hover |
| Nút Thử lại khi lỗi | `<button>` | `aria-label="Thử tải lại danh sách khóa học"` | `btn-retry-admin-courses` | Outline, Hover |

---

### 6.2. Full 4-State UI Coverage

#### 1. Loading State (`state-loading-admin-courses`)
- Khi trang `/admin/courses` khởi tạo và đang gọi API `GET /api/admin/courses`:
  - Header bảng hiển thị cố định.
  - Vùng nội dung thân bảng hiển thị 5 hàng Skeleton (`animate-pulse`) tương ứng với các cột (Tiêu đề, Danh mục, Giảng viên, Giá, Sĩ số, Trạng thái, Thao tác).
  - Các nút Thêm khóa học và Tìm kiếm vẫn giữ nguyên cấu trúc nhưng ở trạng thái sẵn sàng, không gây giật màn hình (zero layout shift).

#### 2. Empty State (`state-empty-admin-courses`)
- Khi chưa có khóa học nào trong hệ thống hoặc không có kết quả phù hợp với bộ lọc:
  - Hiển thị khối trung tâm với icon `BookOpen` hoặc `SearchX` viền xám nhạt (`text-zinc-400 dark:text-zinc-600`).
  - Dòng tiêu đề: "Chưa có khóa học nào" hoặc "Không tìm thấy khóa học phù hợp".
  - Mô tả: "Hãy thử thay đổi từ khóa tìm kiếm hoặc bấm Thêm khóa học để tạo mới."
  - Nút hành động CTA: Nút "Thêm khóa học" (`btn-add-course`) nếu hệ thống trống, hoặc nút "Xóa bộ lọc" (`btn-clear-admin-filter`) nếu đang lọc.

#### 3. Error State with Retry (`state-error-admin-courses`)
- Khi API gặp sự cố (mất mạng, server 500):
  - Bảng dữ liệu được thay thế bằng thẻ thông báo lỗi (`bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-6`).
  - Icon cảnh báo `AlertTriangle` màu Deep Crimson (`text-red-600 dark:text-red-400`).
  - Dòng thông điệp rõ ràng: "Không thể tải danh sách khóa học. Vui lòng kiểm tra lại kết nối mạng hoặc liên hệ quản trị viên."
  - Nút "Thử lại" (`btn-retry-admin-courses`) kích hoạt lại hàm fetch dữ liệu mà không cần tải lại toàn bộ trang web.
  - Đồng thời kích hoạt Sonner Toast thông báo lỗi.

#### 4. Success State with Sonner Toast
- Thao tác thêm khóa học thành công: Sonner Toast xanh `toast.success("Tạo khóa học mới thành công!")`.
- Thao tác sửa khóa học thành công: Sonner Toast xanh `toast.success("Cập nhật khóa học thành công!")`.
- Thao tác đổi trạng thái thành công: Sonner Toast `toast.info("Đã cập nhật trạng thái hiển thị khóa học")`.
- Thao tác xóa khóa học thành công: Sonner Toast `toast.success("Đã xóa khóa học thành công!")`.
- Tuyệt đối không hiển thị popup mặc định `alert()`.

---

## 7. Key Entities & Domain Rules

### 7.1. Entity: Course (Khóa học Quản trị)
- **id**: Định danh duy nhất (UUID v4 string).
- **title**: Tiêu đề khóa học (String, 3 - 255 ký tự).
- **category**: Danh mục chuyên môn (String, ví dụ: "Frontend", "Backend", "Fullstack", "MOS").
- **instructor**: Giảng viên giảng dạy (String, 2 - 100 ký tự).
- **description**: Mô tả nội dung và lộ trình khóa học (Text).
- **price**: Học phí tính theo VND (Integer, $\ge 0$). Nếu bằng 0 xem như miễn phí.
- **capacity**: Sĩ số tối đa của lớp học (Integer, $> 0$).
- **enrolled_count**: Số lượng học viên đã ghi danh thành công (Integer, $\ge 0$).
- **is_active**: Cờ hiển thị tuyển sinh công khai (Boolean, mặc định `true`).
- **created_at**: Thời điểm tạo bản ghi.
- **updated_at**: Thời điểm cập nhật bản ghi gần nhất.

### 7.2. Domain Rules & Invariants
1. **Ràng buộc Sĩ số (Capacity Invariant)**:  
   $$\forall \text{course}: \text{capacity} \ge \text{enrolled\_count} \ge 0$$  
   Hệ thống nghiêm cấm mọi cập nhật đưa `capacity` xuống dưới `enrolled_count`.
2. **Ràng buộc Bảo toàn Ghi danh khi Xóa (Deletion Integrity Guard)**:  
   $$\text{enrolled\_count} > 0 \implies \text{Hard Delete Forbidden}$$  
   Chỉ cho phép xóa cứng khi $\text{enrolled\_count} = 0$. Khóa học có học viên chỉ được phép chuyển `is_active = false`.
3. **Ràng buộc Phân quyền (RBAC Invariant)**:  
   $$\text{User.role} = \text{'admin'} \iff \text{Permitted to access /api/admin/*}$$

---

## 8. Assumptions & Out-of-Scope (Non-Goals)

### Assumptions
- Quản trị viên sử dụng trình duyệt hiện đại (Chrome, Safari, Firefox, Edge) hỗ trợ CSS Grid và ES2022.
- Múi giờ quản trị chuẩn hóa theo `Asia/Ho_Chi_Minh` (UTC+7).
- Tiền tệ lưu trữ dạng số nguyên VND, không có phần thập phân.

### Out-of-Scope (Non-Goals)
- Không bao gồm tính năng xuất khẩu danh sách khóa học ra Excel/CSV (nằm ở giai đoạn mở rộng).
- Không bao gồm tính năng phân bổ nhiều giảng viên (co-instructors) cho một khóa học; mỗi khóa học hiện tại chỉ lưu chuỗi thông tin giảng viên chính.
- Không bao gồm tính năng tự động hoàn tiền khi hủy lớp (xử lý thủ công tại quầy PKS).
- Không xây dựng trình soạn thảo WYSIWYG phức tạp; trường mô tả hỗ trợ văn bản chuẩn hoặc Markdown cơ bản.
