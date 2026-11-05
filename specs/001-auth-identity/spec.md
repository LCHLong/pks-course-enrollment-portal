# Feature Specification: 001-auth-identity

**Feature Branch**: `001-auth-identity`  
**Created**: 2026-11-05  
**Status**: Approved  
**Target Subsystem**: Shared Core / Authentication & Identity  
**Input**: REQUIREMENTS.md §3.1.A-B, §5 (API 1, 2, 3), ND_PV_FULLSTACK.pdf p.1, 4

---

## 1. Overview & Business Context

### 1.1. Business Problem & Goal
In the PKS Course & Enrollment Portal, secure identity management is the foundational entry point for both Students and Administrators. Without a secure, role-delineated authentication mechanism:
- Students cannot enroll in courses, access their personalized learning dashboard ("Khóa học của tôi"), or maintain persistent session state.
- Administrators cannot be cryptographically segregated from students, posing critical privilege escalation and security risks.

The goal of this feature is to deliver an enterprise-grade, accessible, mobile-first Authentication & Identity subsystem encompassing registration, login, logout, and session restoration (`/api/auth/me`), backed by standard bcrypt password hashing (salt rounds $\ge 10$), signed JSON Web Tokens (HS256 with explicit `expiresIn`), role-based access assignment (`student` default, `admin`), and uniform error handling.

### 1.2. Target Users
- **Guest / Prospective Student**: Can register an account or log in with existing credentials.
- **Enrolled Student**: Can log in, maintain session across page reloads, view authentication status, and log out.
- **Portal Administrator**: Can log in with privileged credentials to access administrative operations.

---

## 2. Clarifications & Decisions

### Session 2026-11-05
- **Q1: What is the default role assigned upon self-registration?**  
  *Decision*: Self-registration through the public portal always assigns `role: student`. Privileged `admin` accounts cannot be registered publicly; they are provisioned exclusively via database seed or administrative tooling.
- **Q2: How is session persistence maintained across page reloads (F5)?**  
  *Decision*: The client stores the JWT in `localStorage` under key `pks_token`. Upon initial app bootstrap, an authentication initialization effect dispatches a verification request to `GET /api/auth/me`. If valid, user context is re-hydrated; if invalid or expired, `localStorage` is cleared and the user transitions gracefully to Guest state.
- **Q3: What happens when an unauthenticated user attempts to enroll in a course?**  
  *Decision*: The portal redirects the user to `/login?returnUrl=/courses/:id`. After successful authentication, the system automatically redirects the user back to the target course details page specified by `returnUrl`.
- **Q4: How should error messages be exposed on login failure?**  
  *Decision*: To protect against account enumeration attacks, login failure for non-existent emails or incorrect passwords MUST return identical HTTP 401 responses with code `INVALID_CREDENTIALS` and generic message "Email hoặc mật khẩu không chính xác".
- **Q5: Are browser native dialogs (`alert()`, `confirm()`) permitted?**  
  *Decision*: Strictly prohibited by UI Rules. All user feedback must use Sonner Toast notifications (`toast.success()`, `toast.error()`).

---

## 3. User Scenarios & Acceptance Criteria

### User Story 1 — Student Account Registration (Priority: P1 🎯 MVP)
As a prospective student,  
I want to register a new account using my full name, email address, and a secure password,  
So that I can log into the portal and enroll in courses.

#### Why this priority
Without registration, new students cannot enter the platform or consume any personalized features.

#### Independent Test
Can be fully tested by submitting valid registration details on `/register`, verifying database record creation with role `student` and bcrypt hash $\ge 10$, and verifying rejection of duplicate or malformed emails.

#### Acceptance Scenarios
- **Scenario 1.1 (Happy Path Registration)**:
  - **Given** a guest on the registration page (`/register`).
  - **When** the user fills in valid Full Name ("Nguyễn Văn A"), a unique Email ("nguyen.van.a@example.com"), a password meeting security criteria ("Pks@2026!"), confirms password, and clicks "Đăng ký".
  - **Then** the submit button displays a loading spinner and becomes disabled;
  - **And** the server creates a new user record with `role: "student"` and a salted bcrypt hash;
  - **And** the server responds with HTTP 201 Created and JSON envelope `{ success: true, data: { id, name, email, role }, message: "Đăng ký tài khoản thành công" }`;
  - **And** the frontend displays a Sonner success toast "Đăng ký tài khoản thành công! Vui lòng đăng nhập." and redirects to `/login`.
- **Scenario 1.2 (Duplicate Email Conflict)**:
  - **Given** a guest attempting to register with an email already present in the database ("student@pks.edu.vn").
  - **When** the user submits the registration form.
  - **Then** the server rejects the request with HTTP 409 Conflict and JSON `{ success: false, error: { code: "EMAIL_ALREADY_EXISTS", message: "Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập." } }`;
  - **And** the frontend highlights the email field with a crimson error border, displays inline error text, and emits a Sonner error toast;
  - **And** the form inputs remain populated without loss of user input (except password fields).
- **Scenario 1.3 (Validation Failures - Short Password & Mismatch)**:
  - **Given** a user enters a password shorter than 6 characters or unmatched confirmation password.
  - **When** the user clicks "Đăng ký" or blurs the input fields.
  - **Then** frontend client validation displays immediate inline errors: "Mật khẩu phải chứa ít nhất 6 ký tự" or "Mật khẩu xác nhận không khớp";
  - **And** no network request is dispatched until all client validation rules pass.

---

### User Story 2 — User Authentication & JWT Issuance (Priority: P1 🎯 MVP)
As a registered student or administrator,  
I want to log in using my registered email and password,  
So that I receive an authenticated session token to access restricted portal features.

#### Why this priority
Authentication unlocks course enrollment for students and access to the administrative console for administrators.

#### Independent Test
Can be fully tested by sending valid credentials to `POST /api/auth/login`, verifying receipt of a signed JWT containing payload `{ id, email, role }` with explicit `expiresIn`, and verifying rejection of invalid credentials with HTTP 401.

#### Acceptance Scenarios
- **Scenario 2.1 (Successful Student Login)**:
  - **Given** a registered user on `/login`.
  - **When** the user enters valid credentials ("student@pks.edu.vn" / "Student@123456") and clicks "Đăng nhập".
  - **Then** the submit button enters loading state with spinner;
  - **And** the server validates the password against the stored bcrypt hash;
  - **And** the server responds with HTTP 200 OK and `{ success: true, data: { token: "<jwt>", user: { id, name, email, role: "student" } }, message: "Đăng nhập thành công" }`;
  - **And** the client stores the token in `localStorage`, updates global auth state;
  - **And** the client displays Sonner toast "Chào mừng bạn quay trở lại, [Tên]!" and navigates to `/` (or `returnUrl` if present).
- **Scenario 2.2 (Successful Admin Login & Redirection)**:
  - **Given** an administrator on `/login`.
  - **When** the user enters valid admin credentials ("admin@pks.edu.vn" / "Admin@123456") and clicks "Đăng nhập".
  - **Then** the client receives `role: "admin"`, persists the token, displays Sonner toast "Đăng nhập quản trị viên thành công", and redirects to `/admin/courses`.
- **Scenario 2.3 (Invalid Credentials Handling)**:
  - **Given** a user entering an incorrect password or non-existent email on `/login`.
  - **When** the form is submitted.
  - **Then** the server responds with HTTP 401 Unauthorized and `{ success: false, error: { code: "INVALID_CREDENTIALS", message: "Email hoặc mật khẩu không chính xác." } }`;
  - **And** the client displays Sonner error toast "Email hoặc mật khẩu không chính xác" and inline error alert with `role="alert"`;
  - **And** the password input is cleared and focused.
- **Scenario 2.4 (ReturnUrl Deep-link Preservation)**:
  - **Given** an unauthenticated user attempting to enroll from `/courses/c-123`, redirected to `/login?returnUrl=/courses/c-123`.
  - **When** the user successfully logs in.
  - **Then** the frontend navigates immediately back to `/courses/c-123`.

---

### User Story 3 — Current Session Hydration & Verification (`/api/auth/me`) (Priority: P2)
As a returning user with an existing session,  
I want the application to automatically verify and hydrate my profile on page load,  
So that I do not have to re-enter my credentials every time I refresh the page.

#### Why this priority
Critical for seamless user experience and preventing session drops on page refresh or browser restart.

#### Independent Test
Can be tested by placing a valid JWT in client storage, refreshing the browser, and verifying that `GET /api/auth/me` returns HTTP 200 with user profile and sets the Header UI to authenticated state.

#### Acceptance Scenarios
- **Scenario 3.1 (Session Restoration Success)**:
  - **Given** a client with a valid, non-expired token in `localStorage`.
  - **When** the page loads or refreshes.
  - **Then** the frontend displays a brief header loading skeleton;
  - **And** dispatches `GET /api/auth/me` with header `Authorization: Bearer <token>`;
  - **And** the server responds with HTTP 200 OK and `{ success: true, data: { id, name, email, role, created_at }, message: "Lấy thông tin người dùng thành công" }`;
  - **And** the header displays the user's name, role badge (`student` or `admin`), and logout button.
- **Scenario 3.2 (Expired or Tampered Token Handling)**:
  - **Given** a client with an expired or tampered token.
  - **When** `GET /api/auth/me` is invoked.
  - **Then** the server responds with HTTP 401 Unauthorized (`code: "TOKEN_EXPIRED"` or `"UNAUTHORIZED"`);
  - **And** the client removes the invalid token from `localStorage`, resets user state to `null`, and renders the guest navigation header.

---

### User Story 4 — User Logout & Session Teardown (Priority: P2)
As an authenticated user,  
I want to log out from the portal,  
So that my private account and enrollment data cannot be accessed by subsequent users of the device.

#### Why this priority
Essential security hygiene for public or shared computers.

#### Independent Test
Can be tested by clicking "Đăng xuất" in the header, verifying token removal from `localStorage`, resetting auth state, and verifying that restricted routes redirect to `/login`.

#### Acceptance Scenarios
- **Scenario 4.1 (Logout Flow)**:
  - **Given** an authenticated student or admin.
  - **When** the user clicks the "Đăng xuất" button (`data-testid="btn-header-logout"` in header or `data-testid="btn-mobile-logout"` in mobile drawer).
  - **Then** `localStorage.removeItem('pks_token')` is executed;
  - **And** the global auth context resets `user` to `null` and `isAuthenticated` to `false`;
  - **And** the frontend displays Sonner toast "Đã đăng xuất tài khoản thành công.";
  - **And** the user is redirected to the home catalog page (`/`).

---

## 4. Edge Cases & Error Handling

| # | Edge Case / Scenario | Trigger Condition | System Behavior & Error Code | User Feedback |
|---|----------------------|-------------------|------------------------------|---------------|
| E01 | Registration with existing email (case variant) | User registers with `Student@Pks.edu.vn` when `student@pks.edu.vn` exists | Server lowercases email before query. Uniqueness check fails. HTTP 409 `EMAIL_ALREADY_EXISTS`. | Inline red error below email field + Sonner error toast. Form retains entered name. |
| E02 | Weak password submission | Password `< 6` characters or all spaces | Client form validation blocks submit. Server Zod schema rejects with HTTP 400 `VALIDATION_ERROR`. | Inline helper: "Mật khẩu phải chứa ít nhất 6 ký tự". |
| E03 | Password confirmation mismatch | `password !== confirmPassword` | Form validation blocks dispatch. | Inline helper: "Mật khẩu xác nhận không khớp". |
| E04 | Malformed email string | User enters `invalid-email`, `@domain`, `user@` | HTML5 email validation + Zod `z.string().email()` rejects with HTTP 400. | Inline helper: "Định dạng email không hợp lệ". |
| E05 | Login with non-existent email | Email does not exist in `users` table | Server performs constant-time comparison or uniform response. HTTP 401 `INVALID_CREDENTIALS`. | Generic toast & alert: "Email hoặc mật khẩu không chính xác." Never reveal email absence. |
| E06 | Login with wrong password | Email exists, bcrypt hash mismatch | Server rejects with HTTP 401 `INVALID_CREDENTIALS`. | Generic toast & alert: "Email hoặc mật khẩu không chính xác." Password field cleared. |
| E07 | Rapid double-click on submit | User spam-clicks "Đăng ký" or "Đăng nhập" | Button is disabled immediately upon first click; loading spinner displayed. Duplicate requests prevented. | Visual spinner in button; subsequent clicks ignored. |
| E08 | Token expiration during active session | User returns after token `expiresIn` has elapsed | Next API call returns HTTP 401 `TOKEN_EXPIRED`. Interceptor catches 401, clears storage, redirects to `/login`. | Toast: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." |
| E09 | Backend server unreachable / network drop | Backend server is down or network disconnects | Fetch catches network error / timeout. | Sonner error toast: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau." Submit button re-enabled. |
| E10 | Malicious `returnUrl` (Open Redirect) | User visits `/login?returnUrl=https://attacker.com` | Client sanitizes `returnUrl` to ensure it starts with `/` and not `//` or external protocol. | Redirects safely to `/` if external or malformed URL detected. |

---

## 5. Functional Requirements

- **FR-001**: System MUST provide a public user registration endpoint (`POST /api/auth/register`) accepting `name`, `email`, and `password`.
- **FR-002**: System MUST validate that `email` is a valid RFC 5322 format and normalize it to lowercase prior to database persistence.
- **FR-003**: System MUST verify that `email` does not already exist in the database, returning HTTP 409 Conflict with code `EMAIL_ALREADY_EXISTS` upon collision.
- **FR-004**: System MUST hash user passwords using `bcrypt` (or `bcryptjs`) with a salt work factor of $\ge 10$ before saving to the database.
- **FR-005**: System MUST assign the default role `student` to all newly registered users. Public registration MUST NOT allow specifying `role: admin`.
- **FR-006**: System MUST provide a public login endpoint (`POST /api/auth/login`) accepting `email` and `password`.
- **FR-007**: System MUST verify provided passwords against the stored bcrypt hash in constant time and return HTTP 401 with code `INVALID_CREDENTIALS` upon mismatch or non-existent user.
- **FR-008**: System MUST generate a signed JWT upon successful login signed with `process.env.JWT_SECRET` using algorithm HS256, containing claims `{ id, email, role }` and an explicit expiration lifetime (`expiresIn: '1d'`).
- **FR-009**: System MUST never return the `password_hash` column in any API response body (`select: { password_hash: false }`).
- **FR-010**: System MUST provide a protected `/api/auth/me` endpoint that validates the Bearer JWT and returns the current user profile `{ id, name, email, role, created_at }`.
- **FR-011**: System MUST return HTTP 401 with code `UNAUTHORIZED` or `TOKEN_EXPIRED` when `/api/auth/me` is invoked without a token or with an expired/invalid token.
- **FR-012**: Client MUST persist the JWT token in `localStorage` and automatically attach it to all authenticated outgoing requests via header `Authorization: Bearer <token>`.
- **FR-013**: Client MUST provide an unauthenticated guest view with accessible navigation links to `/login` and `/register`.
- **FR-014**: Client MUST provide an authenticated view displaying the user's name, role badge, profile link, and a logout button.
- **FR-015**: Client MUST support deep-link redirect preservation via query parameter `returnUrl` on `/login`.
- **FR-016**: Client MUST handle all user feedback through Sonner Toast notifications and inline error summaries, strictly prohibiting native browser `alert()` and `confirm()` calls.

---

## 6. Success Criteria & Non-Functional Requirements

### 6.1. Measurable Outcomes
- **SC-001**: User registration completes in $< 1.5$ seconds under standard local development conditions.
- **SC-002**: Password hashing computation enforces minimum bcrypt salt factor 10 without exceeding 250ms latency.
- **SC-003**: 100% of interactive elements on `/register`, `/login`, and navigation header pass automated accessibility checks with zero missing labels.
- **SC-004**: Zero credential leakage: Security audit confirms `password_hash` is 100% absent from all JSON responses.
- **SC-005**: 100% of form inputs comply with mobile touch guidelines: height $\ge 44\text{px}$ (`h-11`) and font size $\ge 16\text{px}$ to prevent iOS Safari auto-zooming.
- **SC-006**: Dual theme fidelity: Both Light and Dark themes provide verified contrast ratios $\ge 4.5:1$ across all text, inputs, and buttons.

---

## 7. UI & Interaction Contract Dictionary

All interactive elements across the authentication views MUST strictly comply with this taxonomy:

| Element Description | Semantic Tag / Role | Accessibility Label | `data-testid` | Interaction States | Notes |
|---|---|---|---|---|---|
| **Register: Name Input** | `<input type="text">` / `textbox` | `<label htmlFor="reg-name">Họ và tên</label>` | `input-register-name` | Default, Focus, Error, Disabled | Min length 2 chars |
| **Register: Email Input** | `<input type="email">` / `textbox` | `<label htmlFor="reg-email">Email</label>` | `input-register-email` | Default, Focus, Error, Disabled | Lowercase auto-trim |
| **Register: Password Input** | `<input type="password">` / `textbox` | `<label htmlFor="reg-pass">Mật khẩu</label>` | `input-register-password` | Default, Focus, Error, Disabled | Min 6 chars |
| **Register: Confirm Password** | `<input type="password">` / `textbox` | `<label htmlFor="reg-conf">Xác nhận mật khẩu</label>` | `input-register-confirm-password` | Default, Focus, Error, Disabled | Must match password |
| **Register: Submit Button** | `<button type="submit">` / `button` | `aria-label="Đăng ký tài khoản"` | `btn-register-submit` | Default, Hover, Focus, Loading, Disabled | Displays `Loader2` spinner when loading |
| **Register: Link to Login** | `<a>` / `link` | `aria-label="Đã có tài khoản? Đăng nhập ngay"` | `link-register-to-login` | Default, Hover, Focus | Navigates to `/login` |
| **Login: Email Input** | `<input type="email">` / `textbox` | `<label htmlFor="login-email">Email</label>` | `input-login-email` | Default, Focus, Error, Disabled | Auto-focus on page load |
| **Login: Password Input** | `<input type="password">` / `textbox` | `<label htmlFor="login-pass">Mật khẩu</label>` | `input-login-password` | Default, Focus, Error, Disabled | Clear on 401 error |
| **Login: Submit Button** | `<button type="submit">` / `button` | `aria-label="Đăng nhập vào hệ thống"` | `btn-login-submit` | Default, Hover, Focus, Loading, Disabled | Disabled during async submit |
| **Login: Link to Register** | `<a>` / `link` | `aria-label="Chưa có tài khoản? Đăng ký ngay"` | `link-login-to-register` | Default, Hover, Focus | Navigates to `/register` |
| **Login: Error Alert Banner** | `<div>` / `alert` | `aria-live="assertive"` | `alert-login-error` | Visible on error, Hidden otherwise | Renders server error message |
| **Header: Login Button** | `<a>` or `<button>` / `link` | `aria-label="Đăng nhập"` | `btn-header-login` | Default, Hover, Focus | Navigates to `/login` |
| **Header: Register Button** | `<a>` or `<button>` / `link` | `aria-label="Đăng ký"` | `btn-header-register` | Default, Hover, Focus | Navigates to `/register` |
| **Header: User Name Badge** | `<span>` / `status` | `aria-label="Tài khoản đang đăng nhập: [Name]"` | `badge-user-name` | Static text | Displays current user name |
| **Header: Role Badge** | `<span>` / `status` | `aria-label="Vai trò: [Role]"` | `badge-user-role` | Deep Emerald (student) / Deep Amber (admin) | Semantic dual theme tokens |
| **Header: Profile Link** | `<a>` / `link` | `aria-label="Xem trang cá nhân"` | `link-header-profile` | Default, Hover, Focus | Navigates to `/profile` |
| **Header: Logout Button** | `<button>` / `button` | `aria-label="Đăng xuất khỏi tài khoản"` | `btn-header-logout` | Default, Hover, Focus, Active | Triggers session teardown |
| **Mobile Drawer: Logout Button** | `<button>` / `button` | `aria-label="Đăng xuất khỏi tài khoản trên di động"` | `btn-mobile-logout` | Default, Hover, Focus, Active | Inside mobile menu drawer |
| **Auth Error Retry Button** | `<button>` / `button` | `aria-label="Thử lại thao tác xác thực"` | `btn-auth-retry` | Default, Hover, Focus | Rendered on auth bootstrap failure |

---

## 8. UI State Matrix

### 8.1. Loading State
- **Form Submitting**: Submit buttons (`btn-register-submit`, `btn-login-submit`) disable pointer events, apply `opacity-70 cursor-not-allowed`, and render an animated `Loader2` spinner icon next to "Đang xử lý...".
- **Header Auth Hydration**: While `/api/auth/me` is resolving, the header right area renders a subtle pulsing skeleton (`h-9 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse`).

### 8.2. Empty State
- **Auth Forms**: When visited, all fields initialize empty with accessible placeholders (`nguyen.van.a@example.com`, `••••••••`). No stale credentials remain if previously logged out.

### 8.3. Error State
- **Inline Validation Errors**: Displayed directly below each field with text `text-sm text-red-600 dark:text-red-400` and attribute `role="alert"`. Input border turns crimson `border-red-500 focus:ring-red-500`.
- **Server Error Toast**: Sonner toast renders at bottom-right (or top-center on mobile) with descriptive Vietnamese message.
- **Server Error Alert**: Visible banner above form fields with `data-testid="alert-login-error"`.

### 8.4. Success State
- **Registration Success**: Green Sonner toast "Đăng ký tài khoản thành công! Vui lòng đăng nhập." with 2.5s duration; redirects smoothly to `/login`.
- **Login Success**: Green Sonner toast "Đăng nhập thành công!"; immediately redirects to `/` or target `returnUrl`.
- **Logout Success**: Neutral/Green Sonner toast "Đã đăng xuất tài khoản thành công."

---

## 9. Key Entities & Domain Rules

### 9.1. User Entity (Domain representation)
- **ID**: Globally unique identifier (UUID v4 string).
- **Name**: Non-empty Unicode string, 2 to 100 characters.
- **Email**: Normalized unique string, RFC 5322 compliant, max 255 characters. Unique across entire system.
- **Password Hash**: Secure one-way bcrypt digest (cost $\ge 10$). Never exposed via API.
- **Role**: Enumeration `student` or `admin`.
- **Created At / Updated At**: UTC timestamps, presented in Vietnam timezone `Asia/Ho_Chi_Minh` (`YYYY-MM-DD`).

### 9.2. Invariants & Business Constraints
1. **Uniqueness Invariant**: Exactly zero duplicate emails are permissible in the system:
   $$\forall u_1, u_2 \in \text{Users}: u_1.\text{email} = u_2.\text{email} \implies u_1.\text{id} = u_2.\text{id}$$
2. **Hash Security Invariant**: Plaintext passwords MUST NEVER be persisted to disk, logged to console, or returned over the wire:
   $$\forall u \in \text{Users}: u.\text{password\_hash} \neq \text{plaintext\_password} \land \text{Cost}(u.\text{password\_hash}) \ge 10$$
3. **Role Boundary Invariant**: Public registration MUST ONLY generate users with `role: "student"`. Elevation to `admin` role can only occur via internal database seeding or authenticated administrator provisioning.
4. **Token Expiration Invariant**: All issued JWT tokens MUST declare an expiration timestamp (`exp`) not exceeding 7 days from issuance (`iat`).

---

## 10. Assumptions & Out-of-Scope (Non-Goals)

### Assumptions
- Client browser supports modern ECMAScript standards and `localStorage`.
- Internet connection is active during registration and login requests.
- System clocks across web client and backend servers are synchronized via NTP.

### Out-of-Scope (Non-Goals)
- Third-party OAuth 2.0 / SSO (Google, Facebook, GitHub login) is not in scope for v1.
- Two-Factor Authentication (2FA / TOTP / SMS OTP) is not in scope for v1.
- Automated email verification / magic link activation is not required (accounts are immediately active upon registration).
- Self-service "Forgot Password" via email reset token is out-of-scope; password reset is handled via user profile while authenticated.
