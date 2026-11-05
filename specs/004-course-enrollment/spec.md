# Feature Specification: 004 - Course Enrollment Engine

**Feature Branch**: `004-course-enrollment`  
**Created**: 2026-11-05  
**Status**: Ready for Implementation  
**Target Subsystem**: Student Portal / Core Enrollment Engine  
**Input**: Requirements from `docs/REQUIREMENTS.md §3.1.E`, `ND_PV_FULLSTACK.pdf p.2`, and `UI_RULES.md`

---

## 1. Overview & Business Context

### 1.1. Feature Summary
The **Course Enrollment Engine** provides the transactional core of the PKS Course & Enrollment Portal. It enables authenticated students to register for active courses, enforces capacity boundaries, strictly prevents overbooking under high-concurrency race conditions, rejects duplicate enrollments, and provides instantaneous visual feedback via accessible UI components and non-intrusive Sonner toast notifications.

### 1.2. Business Goals
- **Fair Seat Allocation**: Guarantee that when multiple students concurrently attempt to enroll in the last remaining seat (`enrolled_count = capacity - 1`), exactly one student succeeds, and all other contenders are gracefully informed that the course has reached full capacity.
- **Data Integrity & Consistency**: Enforce strict invariants where `enrolled_count` always equals the exact count of active enrollments in the database, bounded strictly by $0 \le \text{enrolled\_count} \le \text{capacity}$.
- **Duplicate Prevention**: Prevent students from submitting redundant enrollment records for the same course.
- **Accessible & Responsive UX**: Provide seamless mobile-first ergonomics (touch targets $\ge 44\text{px}$), accessible WAI-ARIA states, and anti-spam submission handling.

### 1.3. Target Personas
- **Student (Authenticated)**: Browses course details or catalog, initiates registration, receives instant status feedback, and views confirmed registration.
- **Guest (Unauthenticated)**: Attempts to enroll and is guided to authenticate via `/login` with an automatic return flow (`returnUrl`).

---

## 2. Clarifications & Architectural Decisions

### Session 2026-11-05
- **Q1: How should the system handle a guest clicking "Ghi danh"?**  
  → **Decision**: Guests must not trigger the enrollment transaction. The client intercepts the click, saves the intended course destination as `returnUrl=/courses/:id`, and redirects the user to `/login?returnUrl=/courses/:id`. After successful login, the portal redirects back to the course page.
- **Q2: What is the initial status of a newly created enrollment?**  
  → **Decision**: When a student enrolls directly, the status is set to `enrolled` (or `confirmed`). In the PKS schema enum (`enrolled`, `cancelled`, `pending`), the initial state is `enrolled`.
- **Q3: What HTTP status code and error model must be returned for race condition rejections?**  
  → **Decision**: HTTP `409 Conflict` with error code `CAPACITY_FULL` and human-friendly Vietnamese message `"Khóa học đã đủ sĩ số tối đa"`.
- **Q4: What HTTP status code must be returned for duplicate enrollment?**  
  → **Decision**: HTTP `409 Conflict` with error code `ALREADY_ENROLLED` and message `"Bạn đã đăng ký khóa học này rồi"`.
- **Q5: Can an inactive or hidden course (`is_active = false`) be enrolled in?**  
  → **Decision**: No. Attempting to enroll in an inactive course must be rejected with HTTP `400 Bad Request` (`COURSE_INACTIVE`, `"Khóa học hiện không mở đăng ký"`).

---

## 3. User Scenarios & Acceptance Criteria

### User Story 1 - Authenticated Student Course Enrollment (Priority: P1) 🎯 MVP

As an authenticated student,  
I want to click the "Ghi danh" button on a course page or catalog card,  
So that I can secure a confirmed seat in the course and expand my professional knowledge.

#### Why this priority
This is the central transaction of the entire platform. Without the enrollment capability, the portal cannot fulfill its primary educational mission.

#### Independent Test
Log in as a student with zero enrollments, navigate to an active course with open seats, click "Ghi danh", observe Sonner success toast, verify button changes to "Đã ghi danh" (disabled), and verify database counter increment.

#### Acceptance Scenarios
- **Scenario 1.1 (Successful Enrollment Happy Path)**:
  - **Given**: An authenticated student is viewing an active course where `enrolled_count < capacity` and the student has not yet enrolled.
  - **When**: The student clicks the button with `data-testid="btn-enroll-[courseId]"`.
  - **Then**: 
    1. The button enters loading state (`aria-busy="true"`, disabled, showing `Loader2` spinner).
    2. An enrollment record is created with status `enrolled`.
    3. The course's `enrolled_count` is incremented by 1.
    4. A Sonner toast appears with `data-testid="toast-notification"` displaying `"Ghi danh khóa học thành công!"`.
    5. The button text updates to `"Đã ghi danh"`, and remains disabled (`aria-disabled="true"`).
    6. The capacity progress bar updates its width and `aria-valuenow`.

- **Scenario 1.2 (Submitting Enrollment with Anti-Spam Lock)**:
  - **Given**: The student has clicked "Ghi danh".
  - **When**: The network request is in flight (taking 300ms–1500ms).
  - **Then**: The button is immediately disabled to prevent double clicks, clicks on the button during this interval emit zero additional HTTP requests, and the visual spinner remains active.

---

### User Story 2 - Concurrency & Overbooking Elimination (Priority: P1)

As a system administrator and prospective student,  
I want the system to handle concurrent enrollment requests atomically,  
So that when $N$ users compete for the final remaining seat, exactly 1 succeeds and $N - 1$ receive a clear capacity error without exceeding maximum capacity.

#### Why this priority
Eliminating overbooking race conditions is an absolute mandate of `REQUIREMENTS.md` and `ND_PV_FULLSTACK.pdf`. Overbooking degrades educational quality and creates logistical and legal disputes.

#### Independent Test
Execute a benchmark test sending 10 simultaneous asynchronous enrollment requests for a course with only 1 remaining seat (`capacity - enrolled_count = 1`). Verify that exactly 1 request returns HTTP 201 Created and the remaining 9 return HTTP 409 Conflict (`CAPACITY_FULL`), while `enrolled_count` exactly equals `capacity`.

#### Acceptance Scenarios
- **Scenario 2.1 (Concurrent Last-Seat Race Condition)**:
  - **Given**: Course `C` has `capacity = 30` and `enrolled_count = 29`. Two authenticated students (Student A and Student B) click "Ghi danh" simultaneously.
  - **When**: Both enrollment requests hit the backend engine within the same millisecond.
  - **Then**:
    1. The backend executes an atomic transaction/lock.
    2. Exactly one student (e.g., Student A) receives HTTP 201 Created with `{ success: true, message: "Ghi danh khóa học thành công!" }`.
    3. The other student (Student B) receives HTTP 409 Conflict with `{ success: false, error: { code: "CAPACITY_FULL", message: "Khóa học đã đủ sĩ số tối đa" } }`.
    4. Course `C` maintains `enrolled_count = 30`.
    5. Student B's browser displays a Sonner error toast: `"Khóa học đã đủ sĩ số tối đa"`.
    6. Student B's course card updates its status badge to Deep Crimson `"Hết chỗ"`.

---

### User Story 3 - Duplicate Enrollment Prevention (Priority: P2)

As an authenticated student,  
I want the portal to clearly indicate if I have already enrolled in a course and reject duplicate attempts,  
So that I do not accidentally register multiple times or consume seats intended for other learners.

#### Why this priority
Protects seat availability and ensures clear user state without cluttering student rosters.

#### Independent Test
Enroll in a course, refresh the browser, verify the button renders `"Đã ghi danh"` (disabled), or attempt to invoke the enrollment endpoint directly via API, verifying HTTP 409 `ALREADY_ENROLLED`.

#### Acceptance Scenarios
- **Scenario 3.1 (UI Indication of Prior Enrollment)**:
  - **Given**: A student has previously enrolled in course `C`.
  - **When**: The student visits the course catalog or details page for course `C`.
  - **Then**: The button with `data-testid="btn-enroll-[courseId]"` is rendered disabled with label `"Đã ghi danh"` and class `cursor-not-allowed bg-zinc-100 dark:bg-zinc-800 text-zinc-400`.

- **Scenario 3.2 (Direct API Duplicate Rejection)**:
  - **Given**: A student is already registered for course `C`.
  - **When**: The student sends a direct `POST /api/courses/C/enroll` request with their JWT.
  - **Then**: The server returns HTTP 409 Conflict with `{ "success": false, "error": { "code": "ALREADY_ENROLLED", "message": "Bạn đã đăng ký khóa học này rồi" } }`.

---

### User Story 4 - Unauthenticated Guest Enrollment Interception (Priority: P2)

As a guest visitor,  
I want to click "Ghi danh" on an exciting course and be smoothly guided through login,  
So that I can authenticate and automatically return to finalize my enrollment without losing my place.

#### Why this priority
Reduces bounce rates and ensures smooth user onboarding.

#### Independent Test
Clear local storage/cookies, click "Ghi danh" on course `C`, verify URL transitions to `/login?returnUrl=/courses/C`, log in with valid credentials, verify redirect back to `/courses/C`.

#### Acceptance Scenarios
- **Scenario 4.1 (Guest Redirect Flow)**:
  - **Given**: A user is browsing without an active JWT session (`isGuest = true`).
  - **When**: The user clicks the button with `data-testid="btn-enroll-[courseId]"`.
  - **Then**:
    1. The client intercepts the event before dispatching an enrollment API call.
    2. The application navigates to `/login?returnUrl=/courses/[courseId]`.
    3. A Sonner toast informs the user: `"Vui lòng đăng nhập để ghi danh khóa học"`.

---

### User Story 5 - Course Full State & Boundary Enforcement (Priority: P3)

As a prospective student,  
I want to immediately see when a course has reached its maximum capacity,  
So that I do not waste time attempting to register for a closed cohort.

#### Why this priority
Ensures transparency and avoids user frustration.

#### Acceptance Scenarios
- **Scenario 5.1 (Visual Status of Full Course)**:
  - **Given**: A course has `enrolled_count >= capacity`.
  - **When**: Any user (Student or Guest) views the course card or details.
  - **Then**:
    1. The status badge `badge-status-[courseId]` renders with Deep Crimson semantics (`text-[#991B1B] dark:text-[#F87171] bg-[#FEF2F2] dark:bg-[#7F1D1D33] border-[#B91C1C] dark:border-[#991B1B]`) and text `"Hết chỗ"`.
    2. The button `btn-enroll-[courseId]` is disabled with label `"Hết chỗ"`.
    3. The capacity progress bar renders at 100% fill with Deep Crimson color.

---

## 4. Functional Requirements

- **FR-001**: The system MUST authenticate every enrollment request via Bearer JWT and verify the user holds the `student` role.
- **FR-002**: The system MUST reject enrollment requests lacking a valid Bearer token with HTTP `401 Unauthorized` (`UNAUTHORIZED`).
- **FR-003**: The system MUST reject enrollment requests from users with `role: admin` attempting student registration with HTTP `403 Forbidden` (`FORBIDDEN`).
- **FR-004**: The system MUST verify that the target course exists in the database. If not found, it MUST return HTTP `404 Not Found` (`COURSE_NOT_FOUND`).
- **FR-005**: The system MUST verify that the course is active (`is_active = true`). If inactive, it MUST return HTTP `400 Bad Request` (`COURSE_INACTIVE`).
- **FR-006**: The system MUST enforce single enrollment per user per course via both database uniqueness constraint `UNIQUE(user_id, course_id)` and application-level verification.
- **FR-007**: When duplicate enrollment is detected, the system MUST return HTTP `409 Conflict` (`ALREADY_ENROLLED`, `"Bạn đã đăng ký khóa học này rồi"`).
- **FR-008**: The system MUST execute the capacity check and seat increment inside an atomic database transaction or conditional atomic update:
  $$\text{UPDATE courses SET enrolled\_count = enrolled\_count + 1 WHERE id = :course\_id AND enrolled\_count < capacity}$$
- **FR-009**: If the atomic update affects 0 rows because `enrolled_count >= capacity`, the system MUST abort the transaction and return HTTP `409 Conflict` (`CAPACITY_FULL`, `"Khóa học đã đủ sĩ số tối đa"`).
- **FR-010**: Upon successful atomic increment, the system MUST insert an `Enrollment` record with `user_id`, `course_id`, `status: 'enrolled'`, and `registration_date` set to current UTC timestamp.
- **FR-011**: The system MUST return a uniform JSON success envelope upon enrollment containing the created enrollment record and updated course seat counts.
- **FR-012**: The frontend MUST disable the submit button and display a `Loader2` spinner immediately upon click to prevent double submission.
- **FR-013**: The frontend MUST display a Sonner success toast upon successful enrollment and transition the button to `"Đã ghi danh"` (disabled).
- **FR-014**: The frontend MUST display a Sonner error toast when an error occurs (`CAPACITY_FULL`, `ALREADY_ENROLLED`, or network failure) and restore button interactivity where appropriate.
- **FR-015**: The frontend MUST strictly prohibit native browser dialogs (`window.alert()`, `window.confirm()`).

---

## 5. Success Criteria & Non-Functional Requirements

- **SC-001**: 100% of concurrent race condition benchmark requests for the last seat produce zero overbooking violations ($enrolled\_count \le capacity$ always holds).
- **SC-002**: End-to-end enrollment transaction latency (P95) MUST be $\le 350\text{ms}$ under standard network conditions.
- **SC-003**: 100% of interactive UI elements MUST satisfy the UI Contract Dictionary with deterministic `data-testid`, WAI-ARIA semantic roles, and accessibility labels.
- **SC-004**: 100% of mobile touch targets for enrollment actions MUST measure $\ge 44\text{px} \times 44\text{px}$ (`h-11`).
- **SC-005**: 100% of feedback notifications MUST be delivered via Sonner toasts; zero native browser alerts.
- **SC-006**: Zero data desynchronization between the `enrolled_count` field in `courses` and the count of confirmed rows in `enrollments`.

---

## 6. UI & Interaction Contract Dictionary

### 6.1. Interactive Element Dictionary

| Element Description | Semantic Tag / Role | Accessibility Label | `data-testid` | Interaction States |
|---|---|---|---|---|
| Enroll Button (Active) | `<button>` / `role="button"` | `aria-label="Ghi danh khóa học [Title]"` | `btn-enroll-[id]` | Default, Hover, Focus, Active, Disabled |
| Enroll Action / Submit Button (Details Page) | `<button>` / `role="button"` | `aria-label="Xác nhận ghi danh khóa học"` | `btn-enroll-action` / `btn-enroll-submit` | Default, Hover, Loading (Spinner), Disabled |
| Enrolled State Button | `<button>` / `role="button"` | `aria-label="Bạn đã ghi danh khóa học này"` | `btn-enroll-disabled-[id]` | Disabled (`cursor-not-allowed`) |
| Course Full State Button | `<button>` / `role="button"` | `aria-label="Khóa học đã hết chỗ"` | `btn-enroll-full-[id]` | Disabled (`cursor-not-allowed`) |
| Capacity Progress Bar | `<div>` / `role="progressbar"` | `aria-label="Tiến độ sĩ số: [enrolled]/[capacity] học viên"` | `progress-capacity-[id]` | Dynamic width `0%` to `100%`, smooth transition |
| Status Badge (Còn chỗ) | `<span>` / `role="status"` | `aria-label="Trạng thái còn chỗ"` | `badge-status-[id]` | Deep Emerald Semantics |
| Status Badge (Hết chỗ) | `<span>` / `role="status"` | `aria-label="Trạng thái hết chỗ"` | `badge-status-[id]` | Deep Crimson Semantics |
| Sonner Toast Notification | `<div role="status">` | `aria-live="polite"` | `toast-enrollment-notification` | Success, Error, Info |
| Loading Skeleton Card | `<div role="status">` | `aria-label="Đang tải thông tin khóa học"` | `state-loading-enrollment` | Pulse animation (`animate-pulse`) |
| Error State Retry Button | `<button>` / `role="button"` | `aria-label="Thử lại thao tác ghi danh"` | `btn-enroll-retry` | Default, Hover, Focus |

### 6.2. UI State Matrix

| State | Visual Trigger | UI Representation & Copy | ARIA & Accessibility |
|---|---|---|---|
| **Default / Open** | `enrolled_count < capacity` && not enrolled | Primary button: Zinc-900 (Dark: Zinc-100), text: `"Ghi danh"`. Deep Emerald badge: `"Còn chỗ"`. | `aria-disabled="false"`, `aria-busy="false"` |
| **Loading / In-Flight** | Student clicks "Ghi danh" | Button disabled, text: `"Đang xử lý..."`, icon: `Loader2` spinning (`animate-spin`). | `aria-busy="true"`, `aria-disabled="true"` |
| **Enrolled / Duplicate** | User has already enrolled | Button disabled: Zinc-100 (Dark: Zinc-800), text: Zinc-400 `"Đã ghi danh"`. Check icon displayed. | `aria-disabled="true"`, `aria-label="Bạn đã ghi danh khóa học này"` |
| **Full / Overbooked** | `enrolled_count >= capacity` | Button disabled: Zinc-100 (Dark: Zinc-800), text: Zinc-400 `"Hết chỗ"`. Deep Crimson badge: `"Hết chỗ"`. | `aria-disabled="true"`, `aria-label="Khóa học đã hết chỗ"` |
| **Error / Conflict** | 409 Conflict / Network error | Sonner error toast appears at top/bottom right. Button resets to active with retry option. | `role="alert"`, `aria-live="assertive"` |
| **Success / Confirmed** | 201 Created from backend | Sonner success toast: `"Ghi danh khóa học thành công!"`. Button switches to `"Đã ghi danh"` (disabled). | `role="status"`, `aria-live="polite"` |

### 6.3. Dual Theme & Deep Muted Tokens
- **Còn chỗ (Available)**:
  - Light mode: `text-[#065F46] bg-[#ECFDF5] border-[#047857]`
  - Dark mode: `text-[#34D399] bg-[#064E3B33] border-[#065F46]`
- **Hết chỗ (Full)**:
  - Light mode: `text-[#991B1B] bg-[#FEF2F2] border-[#B91C1C]`
  - Dark mode: `text-[#F87171] bg-[#7F1D1D33] border-[#991B1B]`
- **Progress Bar**:
  - Open: `bg-emerald-500 dark:bg-emerald-400`
  - Full (100%): `bg-rose-500 dark:bg-rose-400`

---

## 7. Key Entities & Domain Rules

### 7.1. Course Entity
- `id` (UUID): Unique course identifier.
- `title` (String): Course name.
- `capacity` (Integer $> 0$): Maximum allowed students.
- `enrolled_count` (Integer $\ge 0$): Currently confirmed students.
- `is_active` (Boolean): Enrollment availability flag.

### 7.2. Enrollment Entity
- `id` (UUID): Unique enrollment record identifier.
- `user_id` (UUID): Reference to enrolled student (`User`).
- `course_id` (UUID): Reference to course (`Course`).
- `status` (`enrolled` | `confirmed` | `cancelled` | `pending`): Current enrollment lifecycle state. Default: `enrolled`.
- `created_at` (DateTime): Registration timestamp (stored in UTC, formatted in `Asia/Ho_Chi_Minh`).

### 7.3. Core Invariants
1. **Capacity Invariant**:
   $$\forall c \in \text{Courses}: 0 \le c.\text{enrolled\_count} \le c.\text{capacity}$$
2. **Uniqueness Invariant**:
   $$\forall u \in \text{Users}, \forall c \in \text{Courses}: \text{Count}(\text{Enrollments}(u, c, \text{active})) \le 1$$
3. **Referential Invariant**:
   $$c.\text{enrolled\_count} = \text{Count}(\{e \in \text{Enrollments} \mid e.\text{course\_id} = c.\text{id} \land e.\text{status} = \text{'enrolled'}\})$$

---

## 8. Edge Cases & Error Handling

| Case ID | Scenario | Input / Precondition | System Behavior & Response |
|---|---|---|---|
| **EC-001** | Race condition on last seat | Course has 1 seat left; 5 concurrent requests hit API | Exactly 1 request succeeds (HTTP 201); 4 requests fail with HTTP 409 `CAPACITY_FULL`. No overbooking. |
| **EC-002** | Duplicate enrollment attempt | Student A already enrolled in Course X; submits again | Server detects duplicate via unique index; returns HTTP 409 `ALREADY_ENROLLED`. |
| **EC-003** | Course inactive | Course has `is_active = false` | Server returns HTTP 400 Bad Request (`COURSE_INACTIVE`, `"Khóa học hiện không mở đăng ký"`). |
| **EC-004** | Rapid double-click on UI | Student clicks "Ghi danh" twice in 50ms | Button immediately disables on first click; second click is blocked by DOM `disabled` state. |
| **EC-005** | Guest clicks enroll | Unauthenticated user clicks "Ghi danh" | App redirects to `/login?returnUrl=/courses/:id` with toast notification. |
| **EC-006** | Student token expires mid-action | JWT expires while viewing page, then user clicks enroll | Server returns HTTP 401 `UNAUTHORIZED`. Client clears stale token, displays toast, and redirects to login. |
| **EC-007** | Network failure during transaction | Server or client connection drops during fetch | Client catches error, shows Sonner error toast: `"Không thể kết nối đến máy chủ. Vui lòng thử lại."`, re-enables button. |
| **EC-008** | Non-existent course ID | Malformed or random UUID in URL | Server returns HTTP 404 `COURSE_NOT_FOUND`. Client displays 404 page. |

---

## 9. Assumptions & Out-of-Scope (Non-Goals)

### Assumptions
- Students already possess a valid user account with role `student`.
- Database supports ACID transactions and row locking (PostgreSQL 15+ on Supabase Cloud).
- Currency is VND (`₫`) and courses can have `price = 0` (free of charge).

### Out-of-Scope (Non-Goals)
- Online payment gateway integration (Stripe, VNPay, MoMo) is not required for the current PKS evaluation scope; tuition fees are recorded for display and direct enrollment.
- Waitlist management for full courses is out of scope for v1.
- Self-cancellation by students from the catalog page (handled in My Courses or Admin tracking).
