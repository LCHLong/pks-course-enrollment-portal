# Tasks: 002-course-catalog

**Feature Name**: Course Catalog (Danh mục Khóa học)  
**Input**: Specification documents from `/specs/002-course-catalog/spec.md` and `/specs/002-course-catalog/plan.md`  
**Target Repository**: `/Users/macbookpro/Documents/Work/Prepare/PKS/pks-course-enrollment-portal`

---

## Execution Summary

- **Total Tasks**: 26
- **User Stories Covered**:
  - `[US1]` (P1 - MVP): Browse Course Catalog with Mandatory 8-Field Cards
  - `[US2]` (P1): Search Courses by Title & Instructor
  - `[US3]` (P2): Filter Courses by Category
  - `[US4]` (P2): Catalog Pagination & Page Navigation
  - `[US5]` (P3): 4-State UI Coverage & Responsive Ergonomics
- **MVP Scope**: Phases 1 through 3 (`[US1]` Course Browsing with 8-Field Cards)

---

## Phase 1: Setup & Environment

**Purpose**: Initialize directory structures, API types, and route definitions.

- [ ] T001 Define TypeScript DTOs for `Course`, `PaginationMeta`, and `CourseCatalogResponse` in `client/src/types/course.ts`
- [ ] T002 [P] Define API response envelope types (`ApiResponse<T>`, `ApiError`) in `server/src/types/api.types.ts`
- [ ] T003 Create course router file and register route at `/api/courses` in `server/src/routes/course.routes.ts` and `server/src/routes/index.ts`

---

## Phase 2: Foundational Prerequisites

**Purpose**: Core backend service and API endpoint logic required by all catalog user stories.

- [ ] T004 Implement Zod schema `courseQuerySchema` validating `search`, `category`, `page` (min 1, default 1), and `limit` (min 1, max 50, default 9) in `server/src/validators/course.validator.ts`
- [ ] T005 Implement `CourseService.getCatalog` with Prisma queries filtering `is_active: true`, counting total records, and executing paginated fetch in `server/src/services/course.service.ts`
- [ ] T006 Implement `CourseController.getCatalog` returning HTTP 200 with uniform JSON envelope `{ success, data, message }` in `server/src/controllers/course.controller.ts`
- [ ] T007 Implement frontend API client `courseService.getCourses` handling search, category, page, and limit parameters in `client/src/services/courseService.ts`

---

## Phase 3: User Story 1 — Browse Course Catalog with Mandatory 8-Field Cards (Priority: P1) 🎯 MVP

**Goal**: Deliver a responsive catalog rendering courses in cards exposing all 8 mandatory fields with non-breaking currency `\u00A0₫` and Deep Muted status badges.  
**Independent Test**: Load `/` or `/courses`; verify each card renders title, category, instructor, description (line-clamp-3), price (`formatCurrency`), capacity, enrolled count with progress bar, and status badge ("Còn chỗ" / "Đã hết chỗ").

- [ ] T008 [P] [US1] Create CourseCard component using semantic `<article>` tag, `aria-labelledby`, and `data-testid="card-course-[id]"` in `client/src/components/course/CourseCard.tsx`
- [ ] T009 [P] [US1] Implement 8 mandatory fields inside `CourseCard.tsx`: title, category badge, instructor, description with `line-clamp-3`, tuition fee with `formatCurrency`, capacity, enrolled count, and status badge in `client/src/components/course/CourseCard.tsx`
- [ ] T010 [US1] Implement accessible capacity progress bar with `role="progressbar"`, `aria-valuenow`, `aria-valuemax`, and `data-testid="progress-capacity-[id]"` in `client/src/components/course/CourseCard.tsx`
- [ ] T011 [US1] Implement Deep Muted Semantics badges: Deep Emerald (`#065F46`/`#34D399`) for "Còn chỗ" and Deep Crimson (`#991B1B`/`#F87171`) for "Đã hết chỗ" in `client/src/components/course/CourseCard.tsx`
- [ ] T012 [US1] Synchronize full course button state: disable button with label "Đã hết chỗ" when `enrolled_count >= capacity` in `client/src/components/course/CourseCard.tsx`
- [ ] T013 [US1] Create CourseGrid container component with responsive grid classes (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`) in `client/src/components/course/CourseGrid.tsx`
- [ ] T014 [US1] Wire `useCourses` hook and `CourseGrid` into `client/src/pages/CatalogPage.tsx` and mount route `/` in `client/src/App.tsx`

---

## Phase 4: User Story 2 — Search Courses by Title & Instructor (Priority: P1)

**Goal**: Provide a debounced search bar allowing users to filter courses by keyword.  
**Independent Test**: Enter `"React"` into `data-testid="input-search-catalog"`; verify only courses matching "React" in title or instructor are displayed.

- [ ] T015 [P] [US2] Extend `CourseService.getCatalog` in `server/src/services/course.service.ts` to perform case-insensitive substring search matching on `title` OR `instructor` using Prisma `contains` and `mode: 'insensitive'`
- [ ] T016 [US2] Create `CourseSearchFilter` component with search input (`data-testid="input-search-catalog"`), clear button (`data-testid="btn-clear-search"`), and 300ms debounce in `client/src/components/course/CourseSearchFilter.tsx`
- [ ] T017 [US2] Wire search state in `useCourses.ts` and reset page to 1 upon search query change in `client/src/hooks/useCourses.ts`

---

## Phase 5: User Story 3 — Filter Courses by Category (Priority: P2)

**Goal**: Provide category filtering so users can browse courses by domain.  
**Independent Test**: Select category `"Tin học văn phòng"`; verify catalog updates to display only MOS courses.

- [ ] T018 [P] [US3] Implement `CourseService.getCategories` endpoint `GET /api/courses/categories` returning distinct active categories in `server/src/services/course.service.ts` and `server/src/controllers/course.controller.ts`
- [ ] T019 [US3] Integrate category select dropdown (`data-testid="select-filter-category"`) into `CourseSearchFilter.tsx` with "Tất cả danh mục" reset option in `client/src/components/course/CourseSearchFilter.tsx`
- [ ] T020 [US3] Connect category filter selection to `useCourses.ts` with automatic page reset to 1 in `client/src/hooks/useCourses.ts`

---

## Phase 6: User Story 4 — Catalog Pagination & Page Navigation (Priority: P2)

**Goal**: Implement accessible pagination controls with page numbers, prev/next buttons, and disabled boundary controls.  
**Independent Test**: Navigate to Page 2; verify items 10-18 load, prev button activates, and current page button is marked `aria-current="page"`.

- [ ] T021 [P] [US4] Create `CoursePagination` component with prev button (`data-testid="btn-pagination-prev"`), next button (`data-testid="btn-pagination-next"`), and page number buttons (`data-testid="btn-page-[num]"`) in `client/src/components/course/CoursePagination.tsx`
- [ ] T022 [US4] Connect pagination state and scroll-to-top behavior upon page change in `client/src/pages/CatalogPage.tsx` and `client/src/hooks/useCourses.ts`

---

## Phase 7: User Story 5 — 4-State UI Coverage & Responsive Ergonomics (Priority: P3)

**Goal**: Implement comprehensive 4-state UI handling (loading skeleton, empty state, error state with retry) and enforce mobile touch ergonomics.  
**Independent Test**: Throttle network to Slow 3G to inspect skeletons; shut off server to inspect error state and click retry; verify $\ge 44\text{px}$ touch targets on $375\text{px}$ screen.

- [ ] T023 [P] [US5] Implement `CourseCardSkeleton` component rendering 9 animated shimmer cards with matching dimensions in `client/src/components/course/CourseCardSkeleton.tsx`
- [ ] T024 [P] [US5] Implement reusable `EmptyState` component with friendly illustration, message, and "Xóa bộ lọc" CTA button (`data-testid="btn-clear-filter"`) in `client/src/components/common/EmptyState.tsx`
- [ ] T025 [P] [US5] Implement reusable `ErrorState` component with alert icon, error message, and "Thử lại" retry button (`data-testid="btn-retry-catalog"`) in `client/src/components/common/ErrorState.tsx`

---

## Final Phase: Polish & Cross-Cutting Verification

**Purpose**: System-wide contract validation, accessibility audit, theme contrast, and mobile compliance.

- [ ] T026 Audit touch target sizes ($\ge 44\text{px}$ / `h-11`) and input font size ($\ge 16\text{px}$ / `text-base sm:text-sm`) on mobile viewport ($375\text{px}$) across all catalog components in `client/src/pages/CatalogPage.tsx`
- [ ] T027 Verify non-breaking space `\u00A0₫` formatting and `price = 0` ("Miễn phí") rendering in `client/src/utils/formatCurrency.ts`
- [ ] T028 Validate WCAG 2.1 AA color contrast for Deep Emerald and Deep Crimson badges in both Light and Dark themes in `client/src/components/course/CourseCard.tsx`
- [ ] T029 Export and verify Postman collection covering `GET /api/courses` (happy path, search, filter, pagination, 400 validation error) in `docs/postman_collection.json`

---

## Dependencies & Execution Graph

```text
Phase 1 (Setup: T001-T003)
   │
   ▼
Phase 2 (Foundational: T004-T007)
   │
   ├──▶ Phase 3 (US1 - MVP 8-Field Cards: T008-T014) 🎯 MVP Checkpoint
   │       │
   │       ├──▶ Phase 4 (US2 - Search: T015-T017)
   │       │
   │       ├──▶ Phase 5 (US3 - Category Filter: T018-T020)
   │       │
   │       └──▶ Phase 6 (US4 - Pagination: T021-T022)
   │
   └──▶ Phase 7 (US5 - 4-State UI & Skeletons: T023-T025)
           │
           ▼
Final Phase (Polish, A11y, Mobile 44px, Postman: T026-T029)
```
