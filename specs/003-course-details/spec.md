# Feature Specification: 003-course-details

**Feature Name**: Course Details View & Authentication Redirect (Chi tiết Khóa học & Chuyển hướng Xác thực)  
**Target Subsystems**: Student Portal & Public Guest Interface  
**Status**: Approved Specification  
**Version**: 1.0.0  
**Author**: worker_catalog_details  
**Reference Standards**: `ba-spec`, `speckit-specify`, `docs/REQUIREMENTS.md §3.1.D`, `ND_PV_FULLSTACK.pdf p.2`, `docs/design-system/UI_RULES.md`

---

## 1. Overview & Business Context

### 1.1. Business Purpose
The Course Details page (`/courses/:id`) provides the comprehensive, authoritative view of an individual training program. It presents exhaustive syllabus details, instructor credentials, prerequisites, real-time enrollment capacity, and pricing. Most importantly, it acts as the primary conversion funnel: facilitating instant enrollment for logged-in students, and orchestrating a seamless authentication redirect flow (`/login?returnUrl=/courses/:id`) for guest visitors.

### 1.2. Target Users
- **Guest (Chưa đăng nhập)**: Evaluating course suitability, curriculum depth, and instructor expertise before deciding to register.
- **Student (Học viên đã đăng nhập)**: Reviewing course details and triggering instant enrollment if seats remain available.
- **Enrolled Student (Đã ghi danh)**: Reviewing syllabus and course schedule details for a course they are already attending.
- **Admin / Staff**: Verifying how course details, capacity progress, and pricing appear to public visitors.

---

## 2. Clarifications & Architectural Decisions

### Session 2026-11-05
- **Q1: What happens when an unauthenticated guest clicks the "Ghi danh" button?**  
  *Decision*: The portal MUST preserve the current course URL and redirect the guest to `/login?returnUrl=/courses/:id`. Upon successful login (or after completing registration), the authentication handler MUST inspect `returnUrl` and seamlessly return the student back to `/courses/:id` so they can proceed with enrollment without losing context.
- **Q2: How should the system handle invalid course IDs or courses with `is_active = false`?**  
  *Decision*: The backend endpoint `GET /api/courses/:id` MUST return HTTP 404 with error code `COURSE_NOT_FOUND`. The frontend MUST render a dedicated 404 Empty State view with an informative message (`"Khóa học không tồn tại hoặc đã bị ẩn"`) and a clear CTA button `"Quay lại danh mục"` directing to `/`.
- **Q3: How does the Action Button adapt to different user and capacity states?**  
  *Decision*: The action button dynamically adapts its label, styling, and interactivity based on 4 mutually exclusive states:
  1. *Guest (Unauthenticated)*: Label `"Đăng nhập để ghi danh"`, active, Deep Emerald outline/solid, clicking navigates to `/login?returnUrl=/courses/:id`.
  2. *Student (Available & Not Enrolled)*: Label `"Ghi danh ngay"`, active, Deep Emerald styling, clicking executes enrollment.
  3. *Student (Already Enrolled)*: Label `"Đã ghi danh"`, disabled (`disabled={true}`), neutral Zinc styling with checkmark icon.
  4. *Course Full (`enrolled_count >= capacity`)*: Label `"Đã hết chỗ"`, disabled (`disabled={true}`), Deep Crimson styling with alert circle icon.
- **Q4: How should course tuition and progress be formatted?**  
  *Decision*: Same as catalog: tuition uses non-breaking space `\u00A0₫` with `whitespace-nowrap shrink-0` (or `"Miễn phí"` when `price = 0`). Capacity progress bar uses ARIA `role="progressbar"` with `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="capacity"`.
- **Q5: How should mobile viewports be optimized for enrollment?**  
  *Decision*: On mobile viewports ($<640\text{px}$), the action box anchors as a sticky bottom bar or full-width container with minimum height $\ge 44\text{px}$ (`h-11`) ensuring immediate access without excessive scrolling.

---

## 3. User Scenarios & Prioritized User Stories

### User Story 1 — Detailed Course View & Syllabus Inspection (Priority: P1) 🎯 MVP

As a student or guest visitor,  
I want to view the full details of a course including syllabus, instructor background, schedule, and pricing,  
So that I can thoroughly assess whether the training program meets my professional goals.

#### Why this priority:
The detail view is the core decision-making surface. Users require deep curriculum information before committing to an IT Co-op or MOS certification course.

#### Independent Test:
Navigate directly to `/courses/:id` for an active course. The system renders the breadcrumbs, course title, category badge, instructor card, detailed description/syllabus, and action card with price and capacity metrics.

#### Acceptance Scenarios:
- **Scenario 1.1 (Happy Path - Rendering Complete Course Details)**:
  - **Given** an active course exists in the database with ID `c1a2b3c4`.
  - **When** the user accesses `/courses/c1a2b3c4`.
  - **Then** the page renders:
    1. Breadcrumb navigation: `Trang chủ > [Category] > [Title]`.
    2. Course Title heading (`<h1>`).
    3. Category badge with domain pill.
    4. Instructor profile card (Name, role, background).
    5. Comprehensive description and syllabus breakdown.
    6. Action Card displaying tuition (`formatCurrency`), capacity ratio (`enrolled_count / capacity`), progress bar, and status badge.
- **Scenario 1.2 (Free Course Pricing)**:
  - **Given** the course has `price = 0`.
  - **When** the detail page renders.
  - **Then** the tuition element displays `"Miễn phí"` in bold text.
- **Scenario 1.3 (Progress Bar Accuracy)**:
  - **Given** a course has `enrolled_count = 14` and `capacity = 20`.
  - **When** viewing the capacity section.
  - **Then** the progress bar displays `width: 70%`, `aria-valuenow="14"`, and `aria-valuemax="20"`.

---

### User Story 2 — Unauthenticated Guest Redirection to Login with `returnUrl` (Priority: P1)

As an unauthenticated guest visitor,  
I want clicking the "Ghi danh" button to smoothly redirect me to login while preserving my target course,  
So that after authenticating, I am immediately returned to the exact course page to complete enrollment.

#### Why this priority:
Prevents conversion drop-off. Forcing users to search for the course again after login causes severe user friction.

#### Independent Test:
Open an incognito browser window, navigate to `/courses/:id`, click the enroll button; verify the browser URL becomes `/login?returnUrl=/courses/:id`. Complete login; verify the browser redirects back to `/courses/:id`.

#### Acceptance Scenarios:
- **Scenario 2.1 (Redirect to Login with Return Parameter)**:
  - **Given** a user is browsing `/courses/c1a2b3c4` without an active session (Guest).
  - **When** the user clicks `data-testid="btn-enroll-action"`.
  - **Then** the application navigates to `/login?returnUrl=%2Fcourses%2Fc1a2b3c4`.
- **Scenario 2.2 (Post-Login Return to Course)**:
  - **Given** the user was redirected to `/login?returnUrl=/courses/c1a2b3c4`.
  - **When** the user enters valid credentials and submits the login form.
  - **Then** the authentication handler redirects the user directly to `/courses/c1a2b3c4` with authenticated state active.
- **Scenario 2.3 (Post-Registration Return to Course)**:
  - **Given** the user clicks "Đăng ký ngay" from the login page while `returnUrl` is present.
  - **When** the registration succeeds and logs in.
  - **Then** the user is returned to `/courses/c1a2b3c4`.

---

### User Story 3 — Real-Time Capacity & Dynamic Action Button State (Priority: P2)

As an authenticated student,  
I want the action button to clearly reflect my current relationship with the course (Enrolled, Available, Full),  
So that I cannot submit duplicate enrollments or enroll in overbooked courses.

#### Why this priority:
Enforces business invariants on the UI level: prevents duplicate enrollments and overbooking before API submission.

#### Independent Test:
Log in as a student already enrolled in course X; verify the button says "Đã ghi danh" and is disabled. Log in as a student not enrolled in course Y (which is full); verify the button says "Đã hết chỗ" and is disabled.

#### Acceptance Scenarios:
- **Scenario 3.1 (Student Not Enrolled & Seats Available)**:
  - **Given** the student is authenticated and has NOT enrolled in course X (`is_enrolled = false`), and `enrolled_count < capacity`.
  - **When** viewing the course details.
  - **Then** the action button is enabled with label `"Ghi danh ngay"` and Deep Emerald styling.
- **Scenario 3.2 (Student Already Enrolled)**:
  - **Given** the student has an active enrollment record for course X (`is_enrolled = true`).
  - **When** viewing the course details.
  - **Then** the action button is disabled (`disabled={true}`, label `"Đã ghi danh"`, Zinc muted styling) with helper text `"Bạn đã tham gia khóa học này"`.
- **Scenario 3.3 (Course Reaches Capacity)**:
  - **Given** the course has `enrolled_count >= capacity` (e.g., 25/25).
  - **When** viewing the course details.
  - **Then** the status badge displays `"Đã hết chỗ"` (Deep Crimson), the action button is disabled with label `"Đã hết chỗ"`, and helper text indicates `"Khóa học đã đủ sĩ số tối đa"`.

---

### User Story 4 — Course 404 Not Found & Error Recovery Flow (Priority: P2)

As a user entering an obsolete or non-existent course link,  
I want a clear, friendly 404 Not Found page with a direct link back to the catalog,  
So that I am not stranded on a broken or blank page.

#### Why this priority:
Protects application resilience against broken bookmarks, stale search engine results, or hidden courses.

#### Independent Test:
Navigate to `/courses/00000000-0000-0000-0000-000000000000`; verify the 404 empty state renders with the "Quay lại danh mục" button.

#### Acceptance Scenarios:
- **Scenario 4.1 (Non-Existent Course ID)**:
  - **Given** course ID `"invalid-uuid"` does not exist in the database.
  - **When** the user accesses `/courses/invalid-uuid`.
  - **Then** the backend returns HTTP 404 `COURSE_NOT_FOUND`.
  - **And** the frontend displays `data-testid="state-detail-404"` with message `"Không tìm thấy khóa học này hoặc khóa học đã bị ẩn"`.
- **Scenario 4.2 (Return to Catalog CTA)**:
  - **Given** the user is on the 404 Not Found view.
  - **When** the user clicks `data-testid="btn-back-catalog"`.
  - **Then** the application navigates back to `/` (Course Catalog).
- **Scenario 4.3 (Server / Network Error with Retry)**:
  - **Given** the backend is unreachable or returns HTTP 500.
  - **When** accessing the course page.
  - **Then** the frontend displays `data-testid="state-detail-error"` with a `"Thử lại"` button (`data-testid="btn-retry-detail"`).

---

## 4. Functional Requirements

- **FR-001**: System MUST provide a public endpoint `GET /api/courses/:id` returning complete course details.
- **FR-002**: System MUST return HTTP 404 `COURSE_NOT_FOUND` if the course does not exist or has `is_active === false`.
- **FR-003**: System MUST inspect optional `Authorization: Bearer <token>` in `GET /api/courses/:id` to compute `is_enrolled: boolean` for the requesting student.
- **FR-004**: System MUST render breadcrumb navigation linking back to the catalog and category.
- **FR-005**: System MUST render full course title, category, instructor name and profile information.
- **FR-006**: System MUST render comprehensive course description and syllabus outline.
- **FR-007**: System MUST render tuition fee formatted with non-breaking space `\u00A0₫` with `whitespace-nowrap shrink-0`.
- **FR-008**: System MUST render tuition fee of 0 as `"Miễn phí"`.
- **FR-009**: System MUST render capacity progress bar with `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax`.
- **FR-010**: System MUST render seat availability status badge ("Còn chỗ" in Deep Emerald vs "Đã hết chỗ" in Deep Crimson).
- **FR-011**: System MUST redirect unauthenticated guest users clicking the enroll button to `/login?returnUrl=/courses/:id`.
- **FR-012**: System MUST disable the action button with label `"Đã ghi danh"` if the authenticated student is already enrolled.
- **FR-013**: System MUST disable the action button with label `"Đã hết chỗ"` if `enrolled_count >= capacity`.
- **FR-014**: System MUST provide a dedicated 404 Not Found state with `"Quay lại danh mục"` CTA button when a course is missing.
- **FR-015**: System MUST provide a loading skeleton (`state-detail-loading`) matching the full header, description, and action card layout.
- **FR-016**: System MUST enforce minimum $44\text{px}$ touch target height for the action button on mobile devices.
- **FR-017**: System MUST NOT use browser native `alert()`; all errors and notifications MUST use Sonner toast.

---

## 5. Success Criteria & Non-Functional Requirements

- **SC-001**: Course details render in under $800\text{ms}$ on standard broadband and 4G connections.
- **SC-002**: 100% of unauthenticated enrollment clicks successfully redirect to `/login` with valid `returnUrl` query parameter.
- **SC-003**: 100% of invalid or inactive course IDs gracefully render the 404 view with zero unhandled exceptions or blank screens.
- **SC-004**: 100% of interactive elements feature standard WAI-ARIA roles, accessible labels, and deterministic `data-testid` attributes.
- **SC-005**: WCAG 2.1 AA compliant color contrast across both Light and Dark themes for all badge, progress, and button elements.

---

## 6. UI & Interaction Contract Dictionary

| Element Description | Semantic Tag | ARIA Role | Accessibility Label | `data-testid` | Interaction States |
|---|---|---|---|---|---|
| Course Detail Page View | `<main>` | `main` | `aria-label="Chi tiết khóa học"` | `course-detail-view` | Page root container |
| Breadcrumb Navigation | `<nav>` | `navigation` | `aria-label="Đường dẫn điều hướng"` | `breadcrumb-nav` | Breadcrumb links container |
| Breadcrumb Catalog Link | `<a>` | `link` | `aria-label="Quay lại danh mục khóa học"` | `breadcrumb-catalog` | Default, Hover, Focus |
| Course Title Heading | `<h1>` | `heading` | `id="course-detail-title"` | `course-detail-title` | Display heading |
| Course Category Badge | `<span>` | `none` | `aria-label="Danh mục: [category]"` | `course-detail-category` | Static pill badge |
| Instructor Profile Card | `<section>` | `region` | `aria-label="Thông tin giảng viên"` | `course-detail-instructor` | Profile photo, name, bio |
| Course Description Section | `<section>` | `region` | `aria-label="Mô tả khóa học"` | `course-detail-description` | Rich text description |
| Course Syllabus Section | `<section>` | `region` | `aria-label="Nội dung chương trình học"` | `course-detail-syllabus` | Module list / Curriculum |
| Action Card Container | `<aside>` | `complementary` | `aria-label="Thông tin đăng ký và học phí"` | `course-detail-action-card` | Sticky desktop sidebar / Mobile card |
| Detail Tuition Fee | `<span>` | `text` | `aria-label="Học phí khóa học"` | `course-detail-price` | `\u00A0₫` or "Miễn phí" |
| Status Badge (Còn/Hết chỗ) | `<span>` | `status` | `aria-label="Trạng thái còn chỗ"` | `badge-status-detail` | Deep Emerald / Deep Crimson |
| Detail Capacity Progress | `<div>` | `progressbar` | `aria-label="Tiến độ sĩ số khóa học"` | `progress-capacity-detail` | `aria-valuenow`, `aria-valuemax` |
| Primary Action Button | `<button>` | `button` | `aria-label="Ghi danh tham gia khóa học"` | `btn-enroll-action` / `btn-enroll-submit` | Active, Hover, Disabled, Loading |
| Detail Loading Skeleton | `<div>` | `status` | `aria-label="Đang tải chi tiết khóa học"` | `state-detail-loading` | Multi-panel shimmer skeleton |
| 404 Not Found Container | `<div>` | `status` | `aria-label="Không tìm thấy khóa học"` | `state-detail-404` | Graphic + 404 message |
| Return to Catalog CTA | `<a>` / `<button>` | `link` | `aria-label="Quay lại danh sách khóa học"` | `btn-back-catalog` | Default, Hover, Active |
| Detail Error Container | `<div>` | `alert` | `aria-label="Lỗi tải chi tiết khóa học"` | `state-detail-error` | Alert icon + message |
| Detail Retry Button | `<button>` | `button` | `aria-label="Thử tải lại thông tin khóa học"` | `btn-retry-detail` | Default, Hover, Active |

### 6.1. UI State Matrix

```text
+-----------------------------------------------------------------------------------------+
|                                    COURSE DETAIL VIEW                                   |
+-----------------------------------------------------------------------------------------+
| [Breadcrumb: Trang chủ > Lập trình Web > Node.js & React]                               |
|                                                                                         |
|  LEFT COLUMN (Main Content):                       RIGHT COLUMN (Action Card / Sidebar):|
|  +----------------------------------------------+  +----------------------------------+ |
|  | [Category Badge: Lập trình Web]             |  | [Học phí: 3.500.000\u00A0₫]      | |
|  | <h1>Lập Trình Web Fullstack...</h1>          |  | [Trạng thái: Còn chỗ / Hết chỗ]  | |
|  |                                              |  | [Sĩ số: 14 / 20 học viên]        | |
|  | [Instructor Card: Giảng viên Nguyễn Văn A]   |  | [Progress Bar: 70%]              | |
|  |                                              |  |                                  | |
|  | [Mô tả chi tiết khóa học: description]       |  | [BUTTON: btn-enroll-action]      | |
|  | - Mục tiêu đào tạo                           |  | - Guest: "Đăng nhập để ghi danh" | |
|  | - Dự án thực chiến Co-op IT                  |  | - Student: "Ghi danh ngay"       | |
|  |                                              |  | - Enrolled: "Đã ghi danh" (dis)  | |
|  | [Chương trình học: Syllabus Breakdown]       |  | - Full: "Đã hết chỗ" (dis)       | |
|  | - Module 1: TypeScript & Modern JavaScript   |  +----------------------------------+ |
|  | - Module 2: Backend Architecture & Express   |                                       |
|  | - Module 3: React 18, Tailwind & Fullstack   |                                       |
|  +----------------------------------------------+                                       |
+-----------------------------------------------------------------------------------------+
|  STATE 2: LOADING (state-detail-loading)                                                |
|  - Shimmer header banner, title skeleton, paragraph skeletons, sidebar skeleton        |
+-----------------------------------------------------------------------------------------+
|  STATE 3: 404 NOT FOUND (state-detail-404)                                              |
|  - Illustration: FileQuestion                                                           |
|  - Title: "Không tìm thấy khóa học"                                                     |
|  - Subtext: "Khóa học bạn đang tìm kiếm không tồn tại hoặc đã tạm dừng tuyển sinh."     |
|  - CTA Button: "Quay lại danh mục khóa học" (btn-back-catalog) -> navigates to /        |
+-----------------------------------------------------------------------------------------+
|  STATE 4: ERROR (state-detail-error)                                                    |
|  - Illustration: AlertTriangle                                                          |
|  - Title: "Lỗi tải dữ liệu khóa học"                                                    |
|  - CTA Button: "Thử lại" (btn-retry-detail)                                             |
+-----------------------------------------------------------------------------------------+
```

---

## 7. Key Entities & Domain Rules

### 7.1. Course Detail Entity
- `id`: Unique identifier (UUID).
- `title`: Complete course name.
- `category`: Subject area.
- `instructor`: Lead instructor name.
- `description`: Complete course syllabus and prerequisites.
- `price`: Tuition fee in VND (integer $\ge 0$).
- `capacity`: Maximum student threshold ($> 0$).
- `enrolled_count`: Confirmed student count ($\ge 0$).
- `is_active`: Public visibility flag (must be `true`).
- `is_enrolled`: Optional contextual flag (boolean, computed if authenticated).

### 7.2. Authentication Redirection Rules
1. If user session is absent (`token === null`), the Enroll button MUST route to:
   $$\text{URL} = \text{/login?returnUrl=} + \text{encodeURIComponent}(/courses/:id)$$
2. The login page reads `returnUrl` from `useSearchParams()`.
3. Upon successful credential verification, login navigates to `returnUrl` (defaulting to `/` if missing).

---

## 8. Edge Cases & Error Handling

| # | Edge Case Scenario | System Behavior & UX Response |
|---|---|---|
| E01 | Course ID parameter is not a valid UUID (e.g. `/courses/abc-123`) | Backend validates param format; returns HTTP 400 `INVALID_COURSE_ID` or HTTP 404 `COURSE_NOT_FOUND`. Frontend displays 404 state. |
| E02 | Course exists in database but `is_active = false` | Endpoint returns HTTP 404 `COURSE_NOT_FOUND` to prevent non-admins from viewing hidden draft courses. |
| E03 | Student clicks Enroll; the last seat is claimed concurrently by another student | Enrollment endpoint returns HTTP 409 `CAPACITY_FULL`. Detail page shows Sonner error toast, refreshes course data, and button turns to disabled `"Đã hết chỗ"`. |
| E04 | Student has already enrolled in this course | Endpoint returns `is_enrolled: true`. Action button displays `"Đã ghi danh"`, disabled, preventing duplicate clicks. |
| E05 | User tampers with `returnUrl` to external domain (e.g. `/login?returnUrl=https://evil.com`) | Open redirect protection: Auth redirect handler strictly verifies `returnUrl` starts with `/` and contains no protocol/hostname. |
| E06 | Admin user views the course details page | Action button displays label `"Chế độ Quản trị"` or `"Chỉnh sửa khóa học"`, linking to `/admin/courses` to edit the course. |
| E07 | Network drops while viewing course details | User sees Sonner offline alert; if page is refreshed without network, `state-detail-error` displays with `"Thử lại"` button. |
| E08 | Mobile viewport ($375\text{px}$) with sticky action bar | Action button maintains $\ge 44\text{px}$ touch height and does not overlap page footer content (adds `pb-20` on mobile body). |

---

## 9. Assumptions & Out-of-Scope (Non-Goals)

### Assumptions
- Course syllabus and curriculum modules are stored within the `description` field (or structured markdown sections) in the current schema.
- Guest users can view all active course details without needing to register first.

### Out-of-Scope (Non-Goals)
- Video preview player / streaming lectures (not in PKS assessment scope).
- Downloadable PDF syllabus broshure generator.
- Course discussion / comment threads.
