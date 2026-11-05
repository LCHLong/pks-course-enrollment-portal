# Feature Specification: 008-user-profile

**Feature Branch**: `008-user-profile`  
**Created**: 2026-11-05  
**Status**: Approved  
**Target Subsystem**: Shared Core / User Management & Security  
**Input**: REQUIREMENTS.md §3.1, §5 (API 3, 10), ND_PV_FULLSTACK.pdf p.1-3, UI_RULES.md

---

## 1. Overview & Business Context

### 1.1. Business Problem & Goal
In educational and administrative portals, users require the ability to inspect their personal account information, verify their assigned authorization privileges, keep their display information current, and securely rotate their credentials. 

Without a dedicated, accessible User Profile interface:
- Users cannot verify which role (`student` or `admin`) their session is authenticated under.
- Students cannot update their display name for accurate course completion certificates and instructor communications.
- Users cannot change their password if they suspect credential leakage or wish to update an initial default password, introducing security vulnerabilities.

The goal of this feature is to deliver an accessible, mobile-first User Profile management suite (`/profile`) that enables students and administrators to view their profile metadata, inspect their role badge with Deep Muted Semantics, update their display name, and securely change their password through mandatory current password verification backed by `bcrypt` (salt rounds $\ge 10$).

### 1.2. Target Users
- **Student**: Views registration date and role, updates display name, changes password.
- **Administrator**: Views administrative status, updates display name, rotates administrator credentials.

---

## 2. Clarifications & Decisions

### Session 2026-11-05
- **Q1: Can users modify their registered email address from the profile page?**  
  *Decision*: No. In v1, the email address serves as the primary unique identity anchor and is strictly read-only. Modifying email requires administrative intervention or a future email-verification flow to prevent account takeover.
- **Q2: Can users alter their assigned role (e.g. self-elevate to admin)?**  
  *Decision*: Strictly prohibited. The `role` field is immutable via user profile APIs. Any payload attempting to pass `role: 'admin'` is either stripped by Zod schemas or rejected with HTTP 403.
- **Q3: What password validation rules apply when changing passwords?**  
  *Decision*: 
  1. The user must provide their valid `currentPassword`.
  2. The `newPassword` must be at least 6 characters.
  3. The `newPassword` must NOT be identical to the `currentPassword`.
  4. The `confirmNewPassword` must match `newPassword` exactly.
- **Q4: How should notifications and errors be communicated?**  
  *Decision*: Strictly through Sonner toast notifications and accessible inline field validation alerts (`role="alert"`). Browser `alert()` and `confirm()` are strictly forbidden.
- **Q5: What happens if an unauthenticated user visits `/profile` directly?**  
  *Decision*: The route is protected by `ProtectedRoute`. Unauthenticated visitors are redirected to `/login?returnUrl=/profile`.

---

## 3. User Scenarios & Acceptance Criteria

### User Story 1 — View Personal Account Details & Role Badge (Priority: P1 🎯 MVP)
As an authenticated student or administrator,  
I want to view my profile information, including my full name, email, registration date, and role badge,  
So that I can verify my account status and system permissions.

#### Why this priority
Provides immediate situational awareness and transparency regarding account standing and authorization level.

#### Independent Test
Can be tested by navigating to `/profile` as an authenticated user and verifying that profile data, formatted registration date (`YYYY-MM-DD`), and the appropriate role badge are displayed.

#### Acceptance Scenarios
- **Scenario 1.1 (Student Profile View)**:
  - **Given** an authenticated student logged in as "student@pks.edu.vn".
  - **When** the user visits `/profile`.
  - **Then** the page displays a loading skeleton while fetching profile data;
  - **And** upon load, renders the user's Full Name ("Học Viên Mẫu"), Email ("student@pks.edu.vn"), formatted Registration Date (e.g., "2026-11-05");
  - **And** renders a role badge with text "Học viên" styled in Deep Emerald (`text-[#065F46] bg-[#ECFDF5]` light / `text-[#34D399] bg-[#064E3B33]` dark) with `data-testid="badge-profile-role"`.
- **Scenario 1.2 (Administrator Profile View)**:
  - **Given** an authenticated administrator logged in as "admin@pks.edu.vn".
  - **When** the user visits `/profile`.
  - **Then** the page renders the role badge with text "Quản trị viên" styled in Deep Amber (`text-[#92400E] bg-[#FFFBEB]` light / `text-[#FBBF24] bg-[#78350F33]` dark) with `data-testid="badge-profile-role"`.

---

### User Story 2 — Update Display Name (Priority: P1 🎯 MVP)
As an authenticated user,  
I want to edit and save my display name,  
So that my records, course enrollments, and communications reflect my correct name.

#### Why this priority
Ensures user identity accuracy across the portal and on course completion certificates.

#### Independent Test
Can be tested by updating the name field on `/profile`, clicking "Lưu thay đổi", and verifying database record update and header greeting refresh without page reload.

#### Acceptance Scenarios
- **Scenario 2.1 (Successful Name Update)**:
  - **Given** an authenticated user on `/profile`.
  - **When** the user edits the name input field (`data-testid="input-profile-name"`) from "Nguyễn Văn A" to "Nguyễn Văn An" and clicks "Lưu thay đổi" (`data-testid="btn-update-name"`).
  - **Then** the button shows a loading spinner and becomes disabled;
  - **And** dispatches `PUT /api/user/profile` with body `{ "name": "Nguyễn Văn An" }`;
  - **And** server responds with HTTP 200 OK and `{ success: true, data: { ... }, message: "Cập nhật thông tin thành công" }`;
  - **And** the frontend displays Sonner toast "Cập nhật họ tên thành công!";
  - **And** the global auth context updates, refreshing the header name badge (`data-testid="badge-user-name"`).
- **Scenario 2.2 (Validation Failure - Blank or Short Name)**:
  - **Given** a user clearing the name input or entering a single character.
  - **When** the user attempts to submit.
  - **Then** the client displays an inline validation error: "Họ và tên phải có ít nhất 2 ký tự";
  - **And** no network request is sent.

---

### User Story 3 — Change Password with Current Password Verification (Priority: P2)
As an authenticated user,  
I want to update my account password by verifying my current password,  
So that I can maintain account security and prevent unauthorized access.

#### Why this priority
Essential self-service credential lifecycle management.

#### Independent Test
Can be tested by submitting a password change form with valid current password and new password, verifying that subsequent login requires the new password and rejects the old password.

#### Acceptance Scenarios
- **Scenario 3.1 (Successful Password Change)**:
  - **Given** an authenticated student on the password change section of `/profile`.
  - **When** the user inputs valid Current Password ("Student@123456"), a New Password ("NewPassword@2026"), matching Confirm Password ("NewPassword@2026"), and clicks "Đổi mật khẩu" (`data-testid="btn-change-password"`).
  - **Then** the submit button enters disabled loading state;
  - **And** the server validates the current password against stored bcrypt hash, hashes the new password with bcrypt salt $\ge 10$, and updates the user record;
  - **And** the server responds with HTTP 200 OK and `{ success: true, data: null, message: "Đổi mật khẩu thành công" }`;
  - **And** the frontend emits a Sonner success toast "Đổi mật khẩu thành công!";
  - **And** all three password inputs are immediately cleared.
- **Scenario 3.2 (Incorrect Current Password)**:
  - **Given** a user entering an incorrect current password.
  - **When** the user submits the form.
  - **Then** the server responds with HTTP 400 Bad Request and `{ success: false, error: { code: "INVALID_CURRENT_PASSWORD", message: "Mật khẩu hiện tại không chính xác" } }`;
  - **And** the frontend displays Sonner error toast "Mật khẩu hiện tại không chính xác";
  - **And** the current password field is highlighted with crimson border and focused.
- **Scenario 3.3 (New Password Identical to Current Password)**:
  - **Given** a user entering a new password identical to their current password.
  - **When** the user submits the form.
  - **Then** client or server validation rejects with HTTP 400 Bad Request (`code: "PASSWORD_UNCHANGED"`, message: "Mật khẩu mới không được trùng với mật khẩu hiện tại");
  - **And** the frontend displays inline validation error.
- **Scenario 3.4 (Password Confirmation Mismatch)**:
  - **Given** mismatched `newPassword` and `confirmNewPassword`.
  - **When** the user clicks submit.
  - **Then** client validation immediately flags "Mật khẩu xác nhận không khớp";
  - **And** no network call is dispatched.

---

## 4. Edge Cases & Error Handling

| # | Edge Case / Scenario | Trigger Condition | System Behavior & Error Code | User Feedback |
|---|----------------------|-------------------|------------------------------|---------------|
| E01 | Attempt to change read-only email | User inspects DOM and removes `disabled`/`readonly` attribute on email input | Backend ignores `email` field in update payload or rejects with HTTP 400. | Email field remains disabled with visual lock icon. |
| E02 | Attempt to self-elevate role | Malicious user sends `PUT /api/user/profile` with `{ role: 'admin' }` | Zod schema strictly strips or rejects unexpected fields. Role remains unchanged in database. | System returns 200 with unchanged role or 400. |
| E03 | Password change during concurrent session expiry | Token expires while user is typing on profile page | Server returns HTTP 401 `TOKEN_EXPIRED`. Client redirects to `/login?returnUrl=/profile`. | Sonner toast: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." |
| E04 | Name containing excessive whitespace | User enters `"   Nguyễn   Văn   A   "` | Service applies `.trim().replace(/\s+/g, ' ')` before persistence. | Persists clean normalized name `"Nguyễn Văn A"`. |
| E05 | Rapid spam clicks on "Đổi mật khẩu" | User clicks button 5 times within 1 second | Button is disabled immediately on first click with spinner `Loader2`. | Subsequent clicks disabled until request completes. |
| E06 | Server failure during password update | Database transaction error or connection timeout | Server rolls back and responds with HTTP 500 `INTERNAL_SERVER_ERROR`. | Sonner toast: "Không thể đổi mật khẩu lúc này. Vui lòng thử lại sau." |

---

## 5. Functional Requirements

- **FR-001**: System MUST provide a protected profile endpoint (`GET /api/user/profile` or `GET /api/auth/me`) requiring valid Bearer JWT.
- **FR-002**: System MUST return profile data including `id`, `name`, `email`, `role`, and `created_at` in the uniform JSON envelope.
- **FR-003**: System MUST provide a protected update profile endpoint (`PUT /api/user/profile`) allowing users to update their `name`.
- **FR-004**: System MUST validate that `name` is between 2 and 100 characters and reject empty or whitespace-only strings with HTTP 400 `VALIDATION_ERROR`.
- **FR-005**: System MUST ensure that `email` and `role` cannot be modified via `PUT /api/user/profile`.
- **FR-006**: System MUST provide a protected change password endpoint (`PUT /api/user/change-password`) requiring `currentPassword` and `newPassword`.
- **FR-007**: System MUST verify `currentPassword` using `bcrypt.compare` against the stored `password_hash`, returning HTTP 400 with code `INVALID_CURRENT_PASSWORD` upon failure.
- **FR-008**: System MUST validate that `newPassword` contains at least 6 characters.
- **FR-009**: System MUST hash the `newPassword` using `bcrypt` (or `bcryptjs`) with salt rounds $\ge 10$ before updating the database.
- **FR-010**: System MUST clear all password input fields upon successful password update.
- **FR-011**: Client MUST provide an accessible `/profile` page containing separate, clear sections for Account Overview, Edit Profile, and Change Password.
- **FR-012**: Client MUST display role badges adhering to Deep Muted Semantics: Deep Emerald for `student`, Deep Amber for `admin`.
- **FR-013**: Client MUST format `created_at` timestamp as `YYYY-MM-DD` in timezone `Asia/Ho_Chi_Minh`.
- **FR-014**: Client MUST display all user feedback via Sonner toast notifications and inline alerts, strictly prohibiting native `alert()`.
- **FR-015**: Client MUST guard `/profile` with `ProtectedRoute`, redirecting unauthenticated users to `/login?returnUrl=/profile`.

---

## 6. Success Criteria & Non-Functional Requirements

### 6.1. Measurable Outcomes
- **SC-001**: Profile information loads and renders in $< 800\text{ms}$ on standard connections.
- **SC-002**: Password change execution completes in $< 400\text{ms}$, including bcrypt hashing and database update.
- **SC-003**: 100% of interactive elements on the Profile page have explicit `data-testid`, semantic roles, and accessibility labels.
- **SC-004**: Mobile ergonomics: All buttons have minimum height $\ge 44\text{px}$ (`h-11`) and form inputs have font size $\ge 16\text{px}$.
- **SC-005**: Zero privilege escalation: Automated tests verify that attempting to pass `role: 'admin'` in profile updates is 100% ineffective.

---

## 7. UI & Interaction Contract Dictionary

| Element Description | Semantic Tag / Role | Accessibility Label | `data-testid` | Interaction States | Notes |
|---|---|---|---|---|---|
| **Profile Card Container** | `<section>` / `region` | `aria-label="Thông tin tài khoản cá nhân"` | `card-user-profile` | Default | Main profile card wrapper |
| **User Role Badge** | `<span>` / `status` | `aria-label="Vai trò người dùng: [Role]"` | `badge-profile-role` | Deep Emerald (student) / Deep Amber (admin) | Visual semantic pill badge |
| **Email Display Field** | `<input type="email">` / `textbox` | `<label htmlFor="prof-email">Email tài khoản</label>` | `input-profile-email` | Disabled / Readonly | Displays email with lock icon |
| **Registration Date Display** | `<p>` or `<span>` / `status` | `aria-label="Ngày tham gia hệ thống"` | `text-user-created-at` | Static text | Format `YYYY-MM-DD` |
| **Name Input Field** | `<input type="text">` / `textbox` | `<label htmlFor="prof-name">Họ và tên hiển thị</label>` | `input-profile-name` | Default, Focus, Error, Disabled | Editable display name |
| **Update Name Submit Button** | `<button type="submit">` / `button` | `aria-label="Lưu thay đổi họ tên"` | `btn-update-name` | Default, Hover, Focus, Loading, Disabled | Spinner when loading |
| **Password Section Card** | `<section>` / `region` | `aria-label="Đổi mật khẩu bảo mật"` | `card-change-password` | Default | Password rotation section |
| **Current Password Input** | `<input type="password">` / `textbox` | `<label htmlFor="cur-pass">Mật khẩu hiện tại</label>` | `input-current-password` | Default, Focus, Error, Disabled | Required for verification |
| **New Password Input** | `<input type="password">` / `textbox` | `<label htmlFor="new-pass">Mật khẩu mới</label>` | `input-new-password` | Default, Focus, Error, Disabled | Min 6 characters |
| **Confirm Password Input** | `<input type="password">` / `textbox` | `<label htmlFor="conf-pass">Xác nhận mật khẩu mới</label>` | `input-confirm-new-password` | Default, Focus, Error, Disabled | Must match new password |
| **Change Password Submit Button** | `<button type="submit">` / `button` | `aria-label="Xác nhận đổi mật khẩu"` | `btn-change-password` | Default, Hover, Focus, Loading, Disabled | Spinner when loading |
| **Profile Error Banner** | `<div>` / `alert` | `aria-live="assertive"` | `alert-profile-error` | Visible on error, Hidden otherwise | Renders error details |
| **Profile Retry Button** | `<button>` / `button` | `aria-label="Thử tải lại thông tin cá nhân"` | `btn-profile-retry` | Default, Hover, Focus | Rendered on fetch failure |

---

## 8. UI State Matrix

### 8.1. Loading State
- **Initial Profile Fetch**: The page renders an accessible skeleton (`data-testid="skeleton-profile"`) with placeholder blocks for avatar, name, email, and password form.
- **Update Name Submitting**: `btn-update-name` disables pointer events, renders `Loader2` spinner, text "Đang lưu...".
- **Change Password Submitting**: `btn-change-password` disables pointer events, renders `Loader2` spinner, text "Đang xử lý...".

### 8.2. Empty State
- If for any reason profile metadata returns null, an empty state container (`data-testid="state-profile-empty"`) renders with message "Không thể tìm thấy thông tin tài khoản" and a button to re-authenticate.

### 8.3. Error State
- **Inline Validation Errors**: Crimson text (`text-sm text-red-600 dark:text-red-400`) below inputs with `role="alert"`.
- **Server Error Toast**: Sonner toast at bottom-right with clear Vietnamese error message.
- **Profile Fetch Error**: Full-card error state with `data-testid="alert-profile-error"` and `btn-profile-retry`.

### 8.4. Success State
- **Name Updated**: Green Sonner toast "Cập nhật họ tên thành công!". Header user name updates reactively.
- **Password Changed**: Green Sonner toast "Đổi mật khẩu thành công!". Password input fields cleared immediately.

---

## 9. Key Entities & Domain Rules

### 9.1. User Profile Attributes
- **Email**: Permanent unique account identifier. Read-only in profile context.
- **Role**: Authorization level (`student` | `admin`). Immutable via profile endpoint.
- **Display Name**: Modifiable string, length 2 to 100 characters.
- **Password Hash**: Updated only via `change-password` flow after successful `bcrypt.compare` with current password.

### 9.2. Invariants & Business Constraints
1. **Password Salt Invariant**: Any new password hash produced during password rotation MUST use bcrypt with cost factor $\ge 10$:
   $$\text{Cost}(\text{new\_password\_hash}) \ge 10$$
2. **Current Password Verification Invariant**:
   $$\text{UpdatePassword}(u, \text{newPass}) \iff \text{BcryptVerify}(\text{currentPass}, u.\text{password\_hash}) = \text{true}$$
3. **Privilege Boundary Invariant**:
   $$\text{PUT /api/user/profile} \implies u.\text{role}_{\text{after}} = u.\text{role}_{\text{before}}$$
4. **Date Format Standard**: All dates displayed MUST format according to `YYYY-MM-DD` in `Asia/Ho_Chi_Minh` timezone.

---

## 10. Assumptions & Out-of-Scope (Non-Goals)

### Assumptions
- User possesses their current password to authenticate changes.
- Client maintains an active, non-expired JWT Bearer token while accessing the profile page.

### Out-of-Scope (Non-Goals)
- Email address change / migration is not in scope for v1.
- Avatar image file upload to S3 / cloud storage is out of scope (uses initials / gravatar / placeholder).
- Deletion / self-termination of user account is out of scope for v1.
