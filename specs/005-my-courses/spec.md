# Feature Specification: 005 - Student My Courses Portal

**Feature Branch**: `005-my-courses`  
**Created**: 2026-11-05  
**Status**: Ready for Implementation  
**Target Subsystem**: Student Portal / Personal Dashboard  
**Input**: Requirements from `docs/REQUIREMENTS.md §3.1.F`, `ND_PV_FULLSTACK.pdf p.2`, and `UI_RULES.md`

---

## 1. Overview & Business Context

### 1.1. Feature Summary
The **Student My Courses Portal** provides learners with a centralized, secure personal dashboard displaying all courses they have registered for. It details the course title, instructor, category, registration date (formatted as `YYYY-MM-DD` in `Asia/Ho_Chi_Minh` timezone), and current enrollment status. It guarantees airtight Insecure Direct Object Reference (IDOR) prevention, provides responsive dual-mode layout (card grid on mobile, structured table/cards on desktop), and offers a frictionless empty state with navigation back to the course catalog.

### 1.2. Business Goals
- **Personalized Learning Tracking**: Give students immediate visibility into their confirmed registrations and enrollment history.
- **Strict IDOR Prevention & Privacy**: Ensure students can strictly and exclusively access their own registration records. No student can query, inspect, or deduce the enrollment data of any other student.
- **Clear Status Visibility**: Present enrollment lifecycle statuses (`enrolled`, `pending`, `cancelled`) using accessible WAI-ARIA tokens and Deep Muted Semantics (Emerald, Amber, Crimson).
- **Graceful Empty State Onboarding**: Guide newly registered students who have zero enrollments toward active courses via a clear, welcoming call-to-action (CTA).

### 1.3. Target Personas
- **Student (Authenticated)**: Accesses `/my-courses` to track registered courses, check status, and navigate to course details.
- **Guest (Unauthenticated)**: Attempts to access `/my-courses` and is redirected to `/login?returnUrl=/my-courses`.

---

## 2. Clarifications & Architectural Decisions

### Session 2026-11-05
- **Q1: How does the system eliminate Insecure Direct Object References (IDOR)?**  
  → **Decision**: The endpoint `GET /api/student/my-courses` accepts **zero** user identity parameters from the client (no `userId` in query strings, path params, or request headers). The server strictly extracts `userId` from the cryptographically verified JWT payload stored in `req.user.id` by `authenticateJWT`.
- **Q2: What timezone and date format must be applied to registration dates?**  
  → **Decision**: Stored internally as UTC timestamps in PostgreSQL; serialized and displayed on the client formatted as `YYYY-MM-DD` within the `Asia/Ho_Chi_Minh` (UTC+7) timezone using `formatDate`.
- **Q3: What statuses can an enrollment exhibit and how are they visually represented?**  
  → **Decision**:
  - `enrolled` (or `confirmed`): Deep Emerald badge with text `"Đã ghi danh"`.
  - `pending`: Deep Amber badge with text `"Chờ duyệt"`.
  - `cancelled`: Deep Crimson badge with text `"Đã hủy"`.
- **Q4: What happens when a student has not enrolled in any courses yet?**  
  → **Decision**: Render a dedicated Empty State component featuring an educational book/graduation cap icon, heading `"Chưa có khóa học nào"`, supporting copy `"Bạn chưa đăng ký khóa học nào. Hãy khám phá danh mục để bắt đầu học tập ngay hôm nay!"`, and a primary CTA button `"Khám phá khóa học"` linking to `/`.

---

## 3. User Scenarios & Acceptance Criteria

### User Story 1 - View Registered Courses (Priority: P1) 🎯 MVP

As an authenticated student,  
I want to navigate to "Khóa học của tôi" (`/my-courses`),  
So that I can see the list of all courses I have registered for, including their title, instructor, registration date, and status.

#### Why this priority
This is the primary user journey of the personal dashboard. It fulfills the core student requirement to track their academic commitments.

#### Independent Test
Log in as `student@pks.edu.vn` (pre-seeded with 1 enrolled course), navigate to `/my-courses`, and verify that the enrolled course appears with its title, instructor name, registration date in `YYYY-MM-DD` format, and Deep Emerald status badge `"Đã ghi danh"`.

#### Acceptance Scenarios
- **Scenario 1.1 (View Enrolled Courses Happy Path)**:
  - **Given**: An authenticated student has at least 1 confirmed enrollment.
  - **When**: The student navigates to `/my-courses`.
  - **Then**:
    1. A skeleton loading state is briefly shown while data is fetched.
    2. The page renders a list/grid of enrolled courses with `data-testid="list-my-courses"`.
    3. Each course item displays:
       - Course Title (`data-testid="course-title-[id]"`)
       - Category (`data-testid="course-category-[id]"`)
       - Instructor (`data-testid="course-instructor-[id]"`)
       - Registration Date formatted `YYYY-MM-DD` (`data-testid="course-reg-date-[id]"`)
       - Status Badge (`data-testid="badge-enrollment-status-[id]"`) with Deep Emerald styling
       - Action Button `"Xem chi tiết"` (`data-testid="btn-view-course-[id]"`) navigating to `/courses/:id`.

---

### User Story 2 - Strict IDOR Prevention & Access Isolation (Priority: P1)

As a security-conscious student and system administrator,  
I want the platform to enforce absolute user data isolation,  
So that no user can view or access another student's enrolled courses through URL tampering or header injection.

#### Why this priority
IDOR vulnerabilities violate user privacy, confidentiality, and data protection standards. Preventing IDOR is an explicit grading criterion in `REQUIREMENTS.md`.

#### Independent Test
Authenticate as Student A (`student@pks.edu.vn`), attempt to inject query parameters (e.g. `?userId=student-b-uuid` or `?user_id=...`) to `GET /api/student/my-courses`, and verify that only Student A's courses are returned. Verify that an unauthenticated request returns HTTP 401 Unauthorized.

#### Acceptance Scenarios
- **Scenario 2.1 (IDOR Immunity on Parameter Tampering)**:
  - **Given**: Student A is authenticated with JWT token for Student A.
  - **When**: Student A issues `GET /api/student/my-courses?userId=OTHER_STUDENT_ID` or includes `{ "userId": "OTHER_STUDENT_ID" }`.
  - **Then**: The backend ignores any client-supplied user identifiers, derives `userId` solely from `req.user.id`, and returns only Student A's records.

- **Scenario 2.2 (Guest Access Blocked)**:
  - **Given**: An unauthenticated user attempts to call `GET /api/student/my-courses`.
  - **When**: The request lacks an `Authorization: Bearer <token>` header.
  - **Then**: The server returns HTTP 401 Unauthorized with `{ success: false, error: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập để xem khóa học của bạn" } }`. The frontend redirects the user to `/login?returnUrl=/my-courses`.

---

### User Story 3 - Empty State for New Students (Priority: P2)

As a newly registered student with zero enrolled courses,  
I want to see a friendly empty state with an easy way to browse available courses,  
So that I feel welcomed and know exactly where to go to start learning.

#### Why this priority
Prevents blank-screen confusion for first-time users and drives course discovery.

#### Independent Test
Log in as `tran.thi.b@pks.edu.vn` (seeded with 0 enrollments), navigate to `/my-courses`, and verify the Empty State component renders with heading, description, and "Khám phá khóa học" CTA button.

#### Acceptance Scenarios
- **Scenario 3.1 (Empty State Display & Navigation)**:
  - **Given**: The authenticated student has 0 active enrollments.
  - **When**: The student visits `/my-courses`.
  - **Then**:
    1. The UI displays `data-testid="state-empty-my-courses"`.
    2. A friendly icon (e.g. `BookOpen` or `GraduationCap`) is centered.
    3. The heading reads `"Bạn chưa đăng ký khóa học nào"`.
    4. The description reads `"Hãy khám phá danh mục khóa học của PKS và bắt đầu hành trình nâng cao kỹ năng ngay hôm nay!"`.
    5. A primary button `data-testid="btn-explore-courses"` with text `"Khám phá khóa học"` is displayed.
    6. Clicking `"Khám phá khóa học"` navigates the user to `/` (Course Catalog).

---

### User Story 4 - Responsive Mobile Ergonomics & Theme Semantics (Priority: P2)

As a mobile or desktop student using light or dark theme,  
I want the "Khóa học của tôi" interface to adapt smoothly to my screen size and theme preferences,  
So that I can comfortably inspect my registrations anywhere, anytime.

#### Why this priority
Ensures full compliance with the PKS Design System (`UI_RULES.md`) across all device viewports.

#### Acceptance Scenarios
- **Scenario 4.1 (Mobile Viewport Adaptation)**:
  - **Given**: The student views `/my-courses` on a mobile device ($< 640\text{px}$).
  - **When**: The page loads.
  - **Then**:
    1. Courses are rendered as stacked card items rather than an overflowing table.
    2. All interactive elements have touch height $\ge 44\text{px}$ (`h-11`).
    3. Status badges maintain full legibility with non-wrapping labels.

- **Scenario 4.2 (Theme Switching)**:
  - **Given**: The student toggles between Light Mode and Dark Mode.
  - **When**: The theme changes.
  - **Then**:
    1. Status badge text and borders transition seamlessly between light and dark palette tokens without contrast drop.
    2. Card backgrounds adapt to Zinc grayscale (`bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800`).

---

## 4. Functional Requirements

- **FR-001**: The system MUST expose an authenticated endpoint `GET /api/student/my-courses` guarded by `authenticateJWT` and `requireRole('student')`.
- **FR-002**: The system MUST extract the student's unique identifier exclusively from the decoded JWT payload (`req.user.id`).
- **FR-003**: The system MUST ignore and sanitize any client-supplied `user_id` or `userId` parameters present in query strings, URL paths, or request bodies.
- **FR-004**: The system MUST query the `Enrollment` table joining the `Course` table for all records matching `user_id = req.user.id`.
- **FR-005**: The query MUST order enrollment records by `created_at DESC` (most recent registrations first).
- **FR-006**: The backend MUST serialize each enrollment record with:
  - `id` (Enrollment UUID)
  - `course_id` (Course UUID)
  - `course_title` (Course Title)
  - `course_category` (Course Category)
  - `course_instructor` (Instructor Name)
  - `course_price` (Price in VND)
  - `status` (`enrolled` | `pending` | `cancelled`)
  - `registration_date` (ISO UTC timestamp and pre-formatted `YYYY-MM-DD` in `Asia/Ho_Chi_Minh`)
- **FR-007**: The system MUST return a uniform JSON success envelope:
  `{ "success": true, "data": [...], "message": "Lấy danh sách khóa học thành công" }`.
- **FR-008**: The frontend MUST display a skeleton loading state (`data-testid="state-loading"`) while the API call is pending.
- **FR-009**: The frontend MUST display a dedicated empty state (`data-testid="state-empty-my-courses"`) when `data.length === 0`.
- **FR-010**: The frontend MUST display an error state (`data-testid="state-error-my-courses"`) with a retry button (`data-testid="btn-retry-my-courses"`) and Sonner error toast if the network or server fails.
- **FR-011**: The frontend MUST format dates strictly as `YYYY-MM-DD` according to the `Asia/Ho_Chi_Minh` timezone.
- **FR-012**: The frontend MUST render status badges using Deep Muted Semantics:
  - `enrolled`: Deep Emerald
  - `pending`: Deep Amber
  - `cancelled`: Deep Crimson
- **FR-013**: The frontend MUST provide a navigation button on each card (`data-testid="btn-view-course-[id]"`) directing the student to `/courses/:id`.
- **FR-014**: The frontend MUST strictly prohibit native browser dialogs (`window.alert()`).

---

## 5. Success Criteria & Non-Functional Requirements

- **SC-001**: 100% IDOR isolation: Zero instances where Student A can view Student B's enrollment records under any parameter tampering.
- **SC-002**: Page load time (FCP) for `/my-courses` is $\le 600\text{ms}$ on standard broadband connections.
- **SC-003**: 100% of interactive elements define semantic tags, ARIA labels, and `data-testid` attributes adhering to the UI Contract Dictionary.
- **SC-004**: 100% of mobile touch targets measure $\ge 44\text{px}$ in height.
- **SC-005**: 100% of dates render strictly in `YYYY-MM-DD` format corresponding to the `Asia/Ho_Chi_Minh` timezone.

---

## 6. UI & Interaction Contract Dictionary

### 6.1. Interactive Element Dictionary

| Element Description | Semantic Tag / Role | Accessibility Label | `data-testid` | Interaction States |
|---|---|---|---|---|
| My Courses Page Container | `<main>` / `role="main"` | `aria-label="Khóa học của tôi"` | `page-my-courses` | Loaded |
| Enrolled Courses List | `<section>` / `role="region"` | `aria-label="Danh sách khóa học đã đăng ký"` | `list-my-courses` | Default |
| Enrolled Course Card | `<article>` / `role="article"` | `aria-labelledby="course-title-[id]"` | `card-my-course-[id]` | Default, Hover, Focus |
| Course Title Heading | `<h3>` / `role="heading"` | None (semantic text) | `course-title-[id]` | Default |
| Course Category Badge | `<span>` / `role="status"` | `aria-label="Danh mục [category]"` | `course-category-[id]` | Default |
| Course Instructor Info | `<p>` / `role="text"` | `aria-label="Giảng viên: [instructor]"` | `course-instructor-[id]` | Default |
| Registration Date | `<time>` / `role="time"` | `aria-label="Ngày đăng ký: [date]"` | `course-reg-date-[id]` | Default |
| Enrollment Status Badge | `<span>` / `role="status"` | `aria-label="Trạng thái ghi danh: [status]"` | `badge-enrollment-status-[id]` | Deep Emerald / Amber / Crimson |
| View Course Details Button | `<a>` / `role="link"` | `aria-label="Xem chi tiết khóa học [title]"` | `btn-view-course-[id]` | Default, Hover, Focus, Active |
| Empty State Container | `<section>` / `role="status"` | `aria-label="Chưa có khóa học nào"` | `state-empty-my-courses` | Default |
| Explore Courses CTA Button | `<a>` / `role="link"` | `aria-label="Khám phá danh mục khóa học"` | `btn-explore-courses` | Default, Hover, Focus |
| Loading Skeleton Container | `<div role="status">` | `aria-label="Đang tải danh sách khóa học"` | `state-loading-my-courses` | Pulse animation (`animate-pulse`) |
| Error State Container | `<div role="alert">` | `aria-label="Lỗi tải danh sách khóa học"` | `state-error-my-courses` | Default |
| Retry Button | `<button>` / `role="button"` | `aria-label="Thử tải lại danh sách khóa học"` | `btn-retry-my-courses` | Default, Hover, Focus, Active |

### 6.2. UI State Matrix

| State | Trigger Condition | Visual Representation & Copy | ARIA & Accessibility |
|---|---|---|---|
| **Loading** | Initial page mount / data fetch | Grid of 3 skeleton cards with pulsating zinc rectangles. | `aria-busy="true"`, `role="status"` |
| **Empty** | `data.length === 0` | Centered layout: `BookOpen` icon, `"Bạn chưa đăng ký khóa học nào"`, supporting text, Zinc-900 CTA button `"Khám phá khóa học"`. | `role="status"`, `aria-live="polite"` |
| **Success** | `data.length > 0` | Responsive card grid displaying course info, `YYYY-MM-DD` date, status badge, and `"Xem chi tiết"` button. | `role="region"`, `aria-label="Danh sách khóa học đã đăng ký"` |
| **Error** | API failure / network error | Centered alert container: Alert icon, error message, and `"Thử lại"` button. Sonner error toast displayed. | `role="alert"`, `aria-live="assertive"` |

### 6.3. Deep Muted Semantics Tokens for Status Badges
- **Đã ghi danh (`enrolled` / `confirmed`)**:
  - Light: `text-[#065F46] bg-[#ECFDF5] border-[#047857]`
  - Dark: `text-[#34D399] bg-[#064E3B33] border-[#065F46]`
- **Chờ duyệt (`pending`)**:
  - Light: `text-[#92400E] bg-[#FFFBEB] border-[#B45309]`
  - Dark: `text-[#FBBF24] bg-[#78350F33] border-[#92400E]`
- **Đã hủy (`cancelled`)**:
  - Light: `text-[#991B1B] bg-[#FEF2F2] border-[#B91C1C]`
  - Dark: `text-[#F87171] bg-[#7F1D1D33] border-[#991B1B]`

---

## 7. Key Entities & Domain Rules

### 7.1. Enrollment Entity
- `id` (UUID): Unique enrollment record ID.
- `user_id` (UUID): Student ID (owner of this enrollment).
- `course_id` (UUID): Registered course ID.
- `status`: `enrolled` | `confirmed` | `cancelled` | `pending`.
- `created_at`: Registration timestamp.

### 7.2. Invariants
1. **IDOR Invariant**:
   $$\forall e \in \text{Results}(\text{GET /api/student/my-courses}): e.\text{user\_id} = \text{jwt}.\text{user\_id}$$
2. **Date Format Invariant**:
   $$\text{DisplayedDate} = \text{formatDate}(e.\text{created\_at}, \text{"Asia/Ho\_Chi\_Minh"}) \iff \text{Pattern: } \text{YYYY-MM-DD}$$
3. **Ordering Invariant**:
   $$\text{Results are sorted by } e.\text{created\_at DESC}$$

---

## 8. Edge Cases & Error Handling

| Case ID | Scenario | Input / Precondition | System Behavior & Response |
|---|---|---|---|
| **EC-101** | Student has zero enrollments | Authenticated student with 0 records in `enrollments` | API returns HTTP 200 with `{ success: true, data: [] }`. Frontend displays `state-empty-my-courses` with CTA button. |
| **EC-102** | User attempts IDOR parameter tampering | Request contains `?userId=victim-id` or body `{ userId: victim-id }` | Server ignores query/body params, extracts ID from JWT, returns only authenticated user's records. |
| **EC-103** | Guest accesses `/my-courses` | Request missing `Authorization` header | Server returns HTTP 401 `UNAUTHORIZED`. Frontend intercepts and redirects to `/login?returnUrl=/my-courses`. |
| **EC-104** | Admin role accesses student my-courses | Authenticated user has `role: admin` | Server returns HTTP 403 `FORBIDDEN`. Frontend redirects admin to `/admin/courses`. |
| **EC-105** | Registered course is later deactivated | An enrolled course has `is_active = false` | The course STILL appears in the student's My Courses history with an `"Đã tạm dừng"` or standard badge, maintaining academic record continuity. |
| **EC-106** | Network drops while loading page | Client disconnects before response completes | Frontend catches network failure, renders `state-error-my-courses`, and triggers Sonner error toast with retry button. |

---

## 9. Assumptions & Out-of-Scope (Non-Goals)

### Assumptions
- Student accounts are authenticated via standard JWT stored in `localStorage` or session memory.
- All courses linked to enrollment records exist in PostgreSQL (foreign key referential integrity).

### Out-of-Scope (Non-Goals)
- Self-service enrollment cancellation by student from My Courses page (handled via academic admin request or separate cancellation feature).
- Downloading certificate of completion or invoice PDF (post-MVP feature).
