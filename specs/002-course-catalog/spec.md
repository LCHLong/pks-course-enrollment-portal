# Feature Specification: 002-course-catalog

**Feature Name**: Course Catalog (Danh mục Khóa học)  
**Target Subsystems**: Student Portal & Public Guest Interface  
**Status**: Approved Specification  
**Version**: 1.0.0  
**Author**: worker_catalog_details  
**Reference Standards**: `ba-spec`, `speckit-specify`, `docs/REQUIREMENTS.md §3.1.C`, `ND_PV_FULLSTACK.pdf p.1`, `docs/design-system/UI_RULES.md`

---

## 1. Overview & Business Context

### 1.1. Business Purpose
The Course Catalog is the primary discovery engine of the PKS Course & Enrollment Portal. It enables prospective students and registered users to explore available IT Co-op and International MOS Certification training programs. The catalog presents all vital course attributes upfront to empower informed decision-making while showcasing real-time seat availability to drive prompt enrollment.

### 1.2. Target Users
- **Guest (Chưa đăng nhập)**: Visitors browsing the portal to evaluate course curriculums, instructors, pricing, and current enrollment capacity.
- **Student (Học viên đã đăng nhập)**: Authenticated learners looking to find new courses and quickly trigger enrollment.
- **Admin / Staff**: Verifying public visibility and accurate real-time capacity counters across all published courses.

---

## 2. Clarifications & Architectural Decisions

### Session 2026-11-05
- **Q1: How should course tuition be formatted when `price = 0`?**  
  *Decision*: The helper `formatCurrency(0)` MUST output the string `"Miễn phí"` instead of `"0 ₫"`. For any positive value, it MUST use a non-breaking space before the currency symbol (`\u00A0₫`) with CSS `whitespace-nowrap shrink-0` to guarantee that the `₫` symbol never drops to a second line on narrow mobile viewports.
- **Q2: Should draft or inactive courses (`is_active = false`) appear in the public catalog?**  
  *Decision*: No. The public endpoint `GET /api/courses` MUST strictly filter out courses where `is_active === false`. Inactive courses are strictly restricted to the Admin management view (`/api/admin/courses`).
- **Q3: What pagination strategy should be implemented?**  
  *Decision*: Standard offset-based pagination with query parameters `page` (default 1) and `limit` (default 9). A limit of 9 perfectly accommodates 1-column mobile grids, 2-column tablet grids, and 3-column desktop grids ($3 \times 3$). The response envelope includes a `pagination` metadata object (`page`, `limit`, `total`, `totalPages`).
- **Q4: How should search query matching behave?**  
  *Decision*: Case-insensitive and accent-insensitive substring matching against the course `title` and `instructor`. Client inputs MUST debounce requests by 300ms to eliminate redundant API pressure.
- **Q5: What are the exact color semantics for seat availability badges?**  
  *Decision*: Dual Theme Deep Muted Semantics:
  - "Còn chỗ": Deep Emerald (Light text `#065F46`, Dark text `#34D399`, Light bg `#ECFDF5`, Dark bg `#064E3B33`).
  - "Hết chỗ": Deep Crimson (Light text `#991B1B`, Dark text `#F87171`, Light bg `#FEF2F2`, Dark bg `#7F1D1D33`).

---

## 3. User Scenarios & Prioritized User Stories

### User Story 1 — Browse Course Catalog with Mandatory 8-Field Cards (Priority: P1) 🎯 MVP

As a prospective student or guest visitor,  
I want to view a responsive grid of published courses displaying all key metrics,  
So that I can evaluate training programs, instructors, pricing, and seat availability at a glance.

#### Why this priority:
This is the foundational user journey of the portal. Without an accurate, transparent catalog displaying complete course information, users cannot discover courses or proceed to enrollment.

#### Independent Test:
Can be verified by loading `/` or `/courses` on any device without logging in. The system renders a grid of courses where each card strictly exposes all 8 mandatory fields.

#### Acceptance Scenarios:
- **Scenario 1.1 (Happy Path - Rendering All 8 Mandatory Fields)**:
  - **Given** published courses exist in the database with active status (`is_active = true`).
  - **When** the user accesses the Course Catalog view.
  - **Then** each course card MUST display exactly 8 fields:
    1. Tên khóa học (`title`)
    2. Danh mục (`category`)
    3. Giảng viên (`instructor`)
    4. Mô tả ngắn (`description` with `line-clamp-3`)
    5. Học phí (`price` formatted with `\u00A0₫` or `"Miễn phí"`)
    6. Sĩ số tối đa (`capacity`)
    7. Số học viên đã ghi danh (`enrolled_count`) with visual Progress Bar
    8. Trạng thái còn chỗ: `"Còn chỗ"` (Deep Emerald) or `"Hết chỗ"` (Deep Crimson).
- **Scenario 1.2 (Visual Capacity Progress Bar Calculation)**:
  - **Given** a course with `capacity = 20` and `enrolled_count = 14`.
  - **When** the card renders in the catalog.
  - **Then** the progress bar element displays with width `70%`, `aria-valuenow="14"`, `aria-valuemax="20"`, and `role="progressbar"`.
- **Scenario 1.3 (Synchronized Button State for Full Courses)**:
  - **Given** a course has reached full capacity (`enrolled_count >= capacity`, e.g., 25/25).
  - **When** the card renders.
  - **Then** the status badge displays `"Hết chỗ"` with Deep Crimson styling, and the "Ghi danh" action button is disabled (`disabled={true}`, cursor not allowed, label `"Đã hết chỗ"`).
- **Scenario 1.4 (Free Course Price Display)**:
  - **Given** a course has `price = 0`.
  - **When** the card renders.
  - **Then** the tuition element displays `"Miễn phí"` instead of `"0 ₫"`.

---

### User Story 2 — Search Courses by Title & Instructor (Priority: P1)

As a learner seeking specific technology skills,  
I want to search for courses by entering keywords into a search bar,  
So that I can instantly locate relevant training courses without browsing the full list.

#### Why this priority:
High-intent users know exactly what skill they need (e.g. "React", "Node", "Excel"). Search is an essential P1 discoverability mechanism.

#### Independent Test:
Can be tested by typing `"React"` into the search input. The catalog updates to display only courses whose title or instructor contains the term.

#### Acceptance Scenarios:
- **Scenario 2.1 (Instant Filtered Search)**:
  - **Given** the user is on the Course Catalog page.
  - **When** the user enters `"Fullstack"` into `data-testid="input-search-catalog"`.
  - **Then** after a 300ms debounce, the system queries `GET /api/courses?search=Fullstack` and renders only matching courses.
- **Scenario 2.2 (Clear Search Input)**:
  - **Given** a search filter is currently applied.
  - **When** the user clicks the clear button or clears the search textbox.
  - **Then** the search parameter is removed from the query, and the catalog restores the full unfiltered course list.
- **Scenario 2.3 (Search with No Results)**:
  - **Given** no published courses match the query term `"Blockchain"`.
  - **When** the search executes.
  - **Then** the catalog displays the Empty State (`data-testid="state-catalog-empty"`) with friendly message `"Không tìm thấy khóa học nào phù hợp"` and a `"Xóa bộ lọc"` CTA button.

---

### User Story 3 — Filter Courses by Category (Priority: P2)

As a student interested in a specific domain (e.g., Lập trình Web or Tin học văn phòng),  
I want to filter courses by category tabs or dropdown,  
So that I can narrow down the catalog to my specific area of interest.

#### Why this priority:
Category filtering provides structured taxonomy navigation, allowing users to browse related offerings without typing keywords.

#### Independent Test:
Can be tested by selecting category `"Lập trình Web"`. Only courses belonging to that category are displayed.

#### Acceptance Scenarios:
- **Scenario 3.1 (Single Category Filter)**:
  - **Given** courses across multiple categories ("Lập trình Web", "Tin học văn phòng", "Cơ sở dữ liệu") exist.
  - **When** the user selects category `"Tin học văn phòng"` in `data-testid="select-filter-category"`.
  - **Then** the URL updates to `?category=Tin+học+văn+phòng`, and only MOS Excel/Word courses are rendered.
- **Scenario 3.2 (Combined Search and Category Filter)**:
  - **Given** category `"Lập trình Web"` is selected.
  - **When** the user types `"React"` in the search input.
  - **Then** the system sends `GET /api/courses?category=Lập+trình+Web&search=React`, returning intersection results.
- **Scenario 3.3 (Reset Category to All)**:
  - **Given** a category filter is active.
  - **When** the user selects `"Tất cả danh mục"`.
  - **Then** the category query parameter is cleared, and courses across all categories are displayed.

---

### User Story 4 — Catalog Pagination & Page Navigation (Priority: P2)

As a user browsing a catalog with numerous courses,  
I want clear pagination controls with page numbers and Next/Previous buttons,  
So that I can smoothly navigate through large datasets with predictable performance.

#### Why this priority:
Ensures high client performance and clean visual hierarchy when the course repository scales beyond 9 items.

#### Independent Test:
Can be tested by clicking page 2 in the pagination bar; the catalog loads items 10-18 and scrolls to the top of the grid.

#### Acceptance Scenarios:
- **Scenario 4.1 (Navigate to Next Page)**:
  - **Given** there are 15 total published courses and `limit = 9` (Page 1 shows 9 courses).
  - **When** the user clicks the "Trang sau" button (`data-testid="btn-pagination-next"`).
  - **Then** the view transitions to Page 2, rendering the remaining 6 courses, and updates the URL to `?page=2`.
- **Scenario 4.2 (Boundary Controls Disabling)**:
  - **Given** the user is on Page 1.
  - **When** viewing the pagination bar.
  - **Then** the "Trang trước" button (`data-testid="btn-pagination-prev"`) is disabled (`aria-disabled="true"`).
  - **When** the user reaches Page 2 (last page), the "Trang sau" button is disabled.
- **Scenario 4.3 (Filter Reset on Search/Category Change)**:
  - **Given** the user is on `page=3`.
  - **When** the user changes the search keyword or category filter.
  - **Then** the pagination automatically resets to `page=1`.

---

### User Story 5 — 4-State UI Coverage & Responsive Ergonomics (Priority: P3)

As a mobile or desktop user on variable network conditions,  
I want transparent loading skeletons, resilient error recovery, and touch-optimized controls,  
So that the portal remains responsive, accessible, and pleasant to use without layout shifts.

#### Why this priority:
Prevents white screens, eliminates layout shift (CLS), ensures mobile accessibility ($\ge 44\text{px}$ touch targets), and handles offline or server errors gracefully.

#### Independent Test:
Can be tested by throttling network to Slow 3G (shows 9-card skeleton), turning off backend server (shows error state with retry), and inspecting touch target heights on mobile viewport ($375\text{px}$).

#### Acceptance Scenarios:
- **Scenario 5.1 (Loading Skeleton State)**:
  - **Given** a catalog query is pending.
  - **When** data has not yet arrived from `/api/courses`.
  - **Then** the catalog renders a grid of 9 skeleton placeholder cards (`data-testid="state-catalog-loading"`), preserving exact card height and preventing layout jumps.
- **Scenario 5.2 (Error State with Retry)**:
  - **Given** the backend server returns an HTTP 500 or network fails.
  - **When** the catalog query fails.
  - **Then** the UI displays `data-testid="state-catalog-error"` with message `"Không thể tải danh sách khóa học"`, Sonner error toast, and a `"Thử lại"` button (`data-testid="btn-retry-catalog"`).
  - **When** the user clicks `"Thử lại"`, the query re-executes.
- **Scenario 5.3 (Mobile Touch Targets & Font Sizes)**:
  - **Given** a viewport width of $375\text{px}$ (iPhone SE / Safari).
  - **When** inspecting interactive elements.
  - **Then** every button (Enroll, Search, Pagination, Clear) has height $\ge 44\text{px}$ (`min-h-[44px]` or `h-11`).
  - **And** the search input font size is $\ge 16\text{px}$ (`text-base sm:text-sm`) to prevent iOS Safari auto-zoom.

---

## 4. Functional Requirements

- **FR-001**: System MUST provide a public endpoint `GET /api/courses` returning published courses (`is_active: true`) with pagination metadata.
- **FR-002**: System MUST render each course card with all 8 mandatory fields: Title, Category, Instructor, Description, Price, Capacity, Enrolled Count, and Status Badge.
- **FR-003**: System MUST format tuition fee using non-breaking space `\u00A0₫` with `whitespace-nowrap shrink-0`.
- **FR-004**: System MUST format tuition fee of 0 as `"Miễn phí"`.
- **FR-005**: System MUST truncate descriptions beyond 3 lines using CSS `line-clamp-3`.
- **FR-006**: System MUST render an accessible progress bar displaying the exact ratio `(enrolled_count / capacity) * 100%` clamped to 100%.
- **FR-007**: System MUST render `"Còn chỗ"` badge with Deep Emerald styling when `enrolled_count < capacity`.
- **FR-008**: System MUST render `"Hết chỗ"` badge with Deep Crimson styling and disable the enroll button when `enrolled_count >= capacity`.
- **FR-009**: System MUST support case-insensitive substring search matching against `title` and `instructor`.
- **FR-010**: System MUST support filtering by exact `category`.
- **FR-011**: System MUST implement pagination with parameters `page` (default 1) and `limit` (default 9).
- **FR-012**: System MUST reset pagination to `page=1` whenever search or category filters change.
- **FR-013**: System MUST provide 4-state UI coverage: Loading Skeleton (`state-catalog-loading`), Empty State (`state-catalog-empty`), Error State (`state-catalog-error`), and Success State.
- **FR-014**: System MUST NOT use browser native `alert()` or `confirm()`; all feedback MUST use Sonner toast notifications.
- **FR-015**: System MUST enforce minimum $44\text{px}$ touch targets for all interactive elements on mobile devices.
- **FR-016**: System MUST maintain full visual harmony in both Light and Dark themes via `darkMode: 'class'`.

---

## 5. Success Criteria & Non-Functional Requirements

- **SC-001**: Catalog initial paint with cached data renders in under $1.0\text{s}$ on standard 4G connections.
- **SC-002**: 100% of interactive elements adhere to WAI-ARIA standards and have explicit `data-testid` attributes.
- **SC-003**: Zero layout shift (Cumulative Layout Shift $< 0.1$) between loading skeleton and populated course cards.
- **SC-004**: Zero currency symbol line-break bugs across all screen widths from $320\text{px}$ to $4K$.
- **SC-005**: Color contrast ratio for Deep Muted Semantics badges exceeds WCAG 2.1 AA requirement ($\ge 4.5:1$).
- **SC-006**: 100% of courses with `enrolled_count >= capacity` correctly disable their enroll action.

---

## 6. UI & Interaction Contract Dictionary

| Element Description | Semantic Tag | ARIA Role | Accessibility Label | `data-testid` | Interaction States |
|---|---|---|---|---|---|
| Course Catalog Container | `<section>` | `region` | `aria-label="Danh mục khóa học PKS"` | `catalog-container` | Static container |
| Search Input | `<input>` | `searchbox` | `aria-label="Tìm kiếm khóa học theo tên hoặc giảng viên"` | `input-search-catalog` | Default, Focus, Typing, Disabled |
| Search Clear Button | `<button>` | `button` | `aria-label="Xóa từ khóa tìm kiếm"` | `btn-clear-search` | Visible only when input has text |
| Category Filter Dropdown | `<select>` | `combobox` | `aria-label="Lọc khóa học theo danh mục"` | `select-filter-category` | Default, Focus, Option Selected |
| Reset All Filters CTA | `<button>` | `button` | `aria-label="Xóa tất cả bộ lọc tìm kiếm"` | `btn-clear-filter` | Default, Hover, Active |
| Course Card Container | `<article>` | `article` | `aria-labelledby="course-title-[id]"` | `card-course-[id]` | Hover (shadow/border), Focus-visible |
| Course Title Heading | `<h3>` | `heading` | `id="course-title-[id]"` | `course-title-[id]` | Line clamp 2, hover highlight |
| Course Detail Link | `<a>` | `link` | `aria-label="Xem chi tiết khóa học [title]"` | `link-course-detail-[id]` | Default, Focus-visible, Active |
| Category Badge | `<span>` | `none` | `aria-label="Danh mục: [category]"` | `badge-category-[id]` | Static pill badge |
| Status Badge (Còn chỗ) | `<span>` | `status` | `aria-label="Trạng thái: Còn chỗ"` | `badge-status-[id]` | Deep Emerald styling |
| Status Badge (Hết chỗ) | `<span>` | `status` | `aria-label="Trạng thái: Đã hết chỗ"` | `badge-status-[id]` | Deep Crimson styling |
| Capacity Progress Bar | `<div>` | `progressbar` | `aria-label="Tỷ lệ lấp đầy sĩ số"` | `progress-capacity-[id]` | `aria-valuenow`, `aria-valuemax` |
| Tuition Fee Display | `<span>` | `text` | `aria-label="Học phí: [amount]"` | `course-price-[id]` | Non-breaking `\u00A0₫` or "Miễn phí" |
| Quick Enroll Button | `<button>` | `button` | `aria-label="Ghi danh khóa học [title]"` | `btn-enroll-[id]` | Default, Hover, Loading |
| Enrolled State Button | `<button>` | `button` | `aria-label="Bạn đã ghi danh khóa học này"` | `btn-enroll-disabled-[id]` | Disabled (`cursor-not-allowed`) |
| Course Full State Button | `<button>` | `button` | `aria-label="Khóa học đã hết chỗ"` | `btn-enroll-full-[id]` | Disabled (`cursor-not-allowed`) |
| Pagination Previous Button | `<button>` | `button` | `aria-label="Chuyển đến trang trước"` | `btn-pagination-prev` | Default, Hover, Disabled on page 1 |
| Pagination Next Button | `<button>` | `button` | `aria-label="Chuyển đến trang tiếp theo"` | `btn-pagination-next` | Default, Hover, Disabled on last page |
| Pagination Page Button | `<button>` | `button` | `aria-label="Trang [pageNumber]"` | `btn-page-[pageNumber]` | Active page marked `aria-current="page"` |
| Loading Skeleton Grid | `<div>` | `status` | `aria-label="Đang tải danh sách khóa học"` | `state-catalog-loading` | Shimmer animated cards |
| Empty State Container | `<div>` | `status` | `aria-label="Không có khóa học nào"` | `state-catalog-empty` | Graphic, explanation, Reset CTA |
| Error State Container | `<div>` | `alert` | `aria-label="Lỗi tải danh mục khóa học"` | `state-catalog-error` | Error message + Retry CTA |
| Error Retry Button | `<button>` | `button` | `aria-label="Thử tải lại danh mục"` | `btn-retry-catalog` | Default, Hover, Active |

### 6.1. UI State Matrix

```text
+-----------------------------------------------------------------------------------------+
|                                    COURSE CATALOG VIEW                                  |
+-----------------------------------------------------------------------------------------+
| [Search Input: input-search-catalog]       [Category Filter: select-filter-category]   |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  STATE 1: LOADING                                                                       |
|  - 9 Skeleton Cards with animated shimmer pulse (state-catalog-loading)                 |
|  - Preserves exact aspect ratio and dimensions of CourseCard                            |
|                                                                                         |
|  STATE 2: SUCCESS                                                                       |
|  - 3-column desktop grid / 2-column tablet / 1-column mobile                            |
|  - Each card: [Category Badge] [Status Badge: Còn chỗ / Hết chỗ]                       |
|               [Course Title - line-clamp-2]                                             |
|               [Instructor]                                                              |
|               [Description - line-clamp-3]                                              |
|               [Sĩ số: enrolled_count / capacity + Progress Bar]                         |
|               [Học phí: xx.xxx\u00A0₫] [Button: Ghi danh / Đã hết chỗ]                  |
|                                                                                         |
|  STATE 3: EMPTY                                                                         |
|  - Icon: SearchX / BookOpen                                                             |
|  - Title: "Không tìm thấy khóa học nào phù hợp"                                         |
|  - Subtext: "Vui lòng thử từ khóa tìm kiếm khác hoặc xóa bộ lọc danh mục"               |
|  - Button: "Xóa bộ lọc" (btn-clear-filter)                                              |
|                                                                                         |
|  STATE 4: ERROR                                                                         |
|  - Icon: AlertTriangle                                                                  |
|  - Title: "Không thể kết nối đến máy chủ"                                               |
|  - Subtext: "Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau ít phút."           |
|  - Button: "Thử lại" (btn-retry-catalog)                                                |
|  - Toast: Sonner error notification with detailed message                               |
+-----------------------------------------------------------------------------------------+
| [Pagination: btn-pagination-prev | Page 1 | Page 2 | btn-pagination-next]               |
+-----------------------------------------------------------------------------------------+
```

---

## 7. Key Entities & Domain Rules

### 7.1. Course Entity
- **Attributes**:
  - `id`: Unique identifier (UUID).
  - `title`: Course name (string, min 3, max 255 chars).
  - `category`: Technology subject area (string, e.g. "Lập trình Web", "Tin học văn phòng").
  - `instructor`: Full name of primary instructor (string).
  - `description`: Detailed course synopsis and outcomes (string).
  - `price`: Tuition fee in VND (integer $\ge 0$).
  - `capacity`: Maximum allowed student capacity (integer $> 0$).
  - `enrolled_count`: Real-time count of confirmed enrolled students (integer $\ge 0$, $\le capacity$).
  - `is_active`: Visibility flag (boolean). Only `true` are published to catalog.
  - `created_at` / `updated_at`: Audit timestamps.

### 7.2. Domain Invariants
1. **Public Visibility Invariant**: A course MUST NOT be exposed in `/api/courses` unless `is_active === true`.
2. **Capacity Bounded Invariant**: $0 \le \text{enrolled\_count} \le \text{capacity}$.
3. **Availability State Invariant**:
   $$\text{Status} = \begin{cases} \text{"Còn chỗ"} & \text{if } \text{enrolled\_count} < \text{capacity} \\ \text{"Hết chỗ"} & \text{if } \text{enrolled\_count} \ge \text{capacity} \end{cases}$$
4. **Action Button Synchronization**: When Status is `"Hết chỗ"`, the corresponding Enroll button MUST be disabled with `cursor-not-allowed`.

---

## 8. Edge Cases & Error Handling

| # | Edge Case Scenario | System Behavior & UX Response |
|---|---|---|
| E01 | User enters special characters or SQL injection patterns into search bar (e.g., `'; DROP TABLE;`) | Search query is safely parameterized via Prisma query generator; no SQL injection possible; system renders Empty State if no matches. |
| E02 | User enters search string with leading/trailing spaces (e.g. `"  React  "`) | Input is trimmed prior to API transmission; search matches `"React"`. |
| E03 | Combined search and category returns 0 courses | Empty state renders with clear text indicating which category and keyword yielded zero results; "Xóa bộ lọc" button resets both parameters. |
| E04 | Course tuition fee is 0 | Price tag renders string `"Miễn phí"` in bold text; badge formatting remains identical. |
| E05 | Screen width is very narrow ($320\text{px}$) | Price text utilizes `whitespace-nowrap shrink-0` and `\u00A0₫`; currency symbol never breaks onto a lone second line. |
| E06 | User manually edits URL to invalid page number (e.g., `?page=-1` or `?page=9999`) | Backend validates `page` param with Zod: negative values default to `page=1`; pages exceeding `totalPages` return empty course array and metadata `totalPages`. Frontend displays friendly empty view. |
| E07 | Server database is unreachable (HTTP 500) | Frontend catches query rejection, renders `state-catalog-error`, fires a Sonner error toast, and prevents blank screen / crash. |
| E08 | Real-time seat fills up while user is viewing catalog | If user clicks "Ghi danh", enrollment service verifies fresh DB capacity; if full, returns HTTP 409 `CAPACITY_FULL`, fires toast, and card status flips to `"Hết chỗ"`. |
| E09 | Category has long accented Vietnamese name | Category badge applies `truncate max-w-[120px]` with `title` tooltip so badge never breaks card layout. |
| E10 | Mobile user taps fast across pagination buttons | Pagination buttons apply `disabled` state during active fetching to prevent duplicate concurrent network queries. |

---

## 9. Assumptions & Out-of-Scope (Non-Goals)

### Assumptions
- The database contains pre-seeded categories and courses for initial rendering.
- All pricing is in Vietnamese Dong (VND); multi-currency conversion is not required.
- Courses are active throughout the academic cycle; real-time automatic schedule expiration is handled in future phases.

### Out-of-Scope (Non-Goals)
- Public user ratings and reviews (not in current PKS assessment scope).
- Live WebSocket auto-refresh of catalog cards (fresh fetch on navigation and retry is sufficient).
- Multi-filter facet selections (e.g., selecting 3 categories simultaneously). Single category filter satisfies all project requirements.
- Cart checkout with payment gateway (VNPAY/Momo); enrollment is handled via the direct one-click enrollment flow in Feature 004.
