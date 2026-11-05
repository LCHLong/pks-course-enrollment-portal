# Tasks: 003-course-details

**Feature Name**: Course Details View & Authentication Redirect (Chi tiết Khóa học & Chuyển hướng Xác thực)  
**Input**: Specification documents from `/specs/003-course-details/spec.md` and `/specs/003-course-details/plan.md`  
**Target Repository**: `/Users/macbookpro/Documents/Work/Prepare/PKS/pks-course-enrollment-portal`

---

## Execution Summary

- **Total Tasks**: 25
- **User Stories Covered**:
  - `[US1]` (P1 - MVP): Detailed Course View & Syllabus Inspection
  - `[US2]` (P1): Unauthenticated Guest Redirection to Login with `returnUrl`
  - `[US3]` (P2): Real-Time Capacity & Dynamic Action Button State
  - `[US4]` (P2): Course 404 Not Found & Error Recovery Flow
- **MVP Scope**: Phases 1 through 3 (`[US1]` Course Details View & Syllabus Inspection)

---

## Phase 1: Setup & Environment

**Purpose**: Initialize route definitions, TypeScript interfaces, and validation schemas.

- [ ] T001 Extend `client/src/types/course.ts` with `CourseDetail` interface including `is_enrolled?: boolean`
- [ ] T002 [P] Implement `courseIdParamSchema` using Zod validating UUID format in `server/src/validators/course.validator.ts`
- [ ] T003 Mount route `GET /:id` with `optionalAuthenticateJWT` middleware in `server/src/routes/course.routes.ts`

---

## Phase 2: Foundational Prerequisites

**Purpose**: Core backend query and controller logic for fetching single course details.

- [ ] T004 Implement `optionalAuthenticateJWT` middleware in `server/src/middlewares/auth.middleware.ts` to decode Bearer tokens without blocking guest requests
- [ ] T005 Implement `CourseService.getCourseById` querying active courses (`is_active: true`) and resolving `is_enrolled` status when `userId` is present in `server/src/services/course.service.ts`
- [ ] T006 Implement `CourseController.getCourseById` returning HTTP 200 with uniform envelope or HTTP 404 `COURSE_NOT_FOUND` in `server/src/controllers/course.controller.ts`
- [ ] T007 Implement frontend API method `courseService.getCourseById(id: string)` in `client/src/services/courseService.ts`

---

## Phase 3: User Story 1 — Detailed Course View & Syllabus Inspection (Priority: P1) 🎯 MVP

**Goal**: Deliver a comprehensive course detail page with breadcrumb navigation, title, instructor card, syllabus modules, price, and capacity indicators.  
**Independent Test**: Navigate to `/courses/:id`; verify breadcrumbs, title, category, instructor, full syllabus, price (`formatCurrency`), and progress bar render accurately.

- [ ] T008 [P] [US1] Create `CourseDetailHeader` component with breadcrumb link (`data-testid="breadcrumb-catalog"`), category badge (`data-testid="course-detail-category"`), title (`data-testid="course-detail-title"`), and instructor card in `client/src/components/course/CourseDetailHeader.tsx`
- [ ] T009 [P] [US1] Create `CourseDetailSyllabus` component displaying comprehensive description, learning outcomes, and module syllabus in `client/src/components/course/CourseDetailSyllabus.tsx`
- [ ] T010 [P] [US1] Create `CourseDetailActionCard` component with tuition fee (`data-testid="course-detail-price"`), capacity metrics, and progress bar (`data-testid="progress-capacity-detail"`) in `client/src/components/course/CourseDetailActionCard.tsx`
- [ ] T011 [US1] Implement `useCourseDetail` hook managing single course data loading, 404 detection, and network error handling in `client/src/hooks/useCourseDetail.ts`
- [ ] T012 [US1] Assemble `CourseDetailPage` composing header, syllabus, action card, and mount route `/courses/:id` in `client/src/pages/CourseDetailPage.tsx` and `client/src/App.tsx`

---

## Phase 4: User Story 2 — Unauthenticated Guest Redirection to Login with `returnUrl` (Priority: P1)

**Goal**: Direct unauthenticated guests to login when clicking enroll while preserving the target course URL, and return them post-login.  
**Independent Test**: As a guest on `/courses/:id`, click the enroll button; verify navigation to `/login?returnUrl=/courses/:id`. Log in; verify browser returns to `/courses/:id`.

- [ ] T013 [P] [US2] Implement guest redirection logic in `CourseDetailActionCard.tsx` dispatching `navigate('/login?returnUrl=' + encodeURIComponent(location.pathname))` when unauthenticated in `client/src/components/course/CourseDetailActionCard.tsx`
- [ ] T014 [US2] Update `LoginPage.tsx` (or auth form) to inspect `returnUrl` from `useSearchParams()` and redirect back upon successful authentication in `client/src/pages/LoginPage.tsx`
- [ ] T015 [US2] Implement open-redirect protection verifying `returnUrl` begins with `/` and contains no protocol or host before redirection in `client/src/utils/sanitizeRedirect.ts`

---

## Phase 5: User Story 3 — Real-Time Capacity & Dynamic Action Button State (Priority: P2)

**Goal**: Dynamically adjust the action button based on student enrollment status and remaining seat capacity.  
**Independent Test**: Inspect button for enrolled student (disabled "Đã ghi danh"), full course (disabled "Đã hết chỗ"), and available course (active "Ghi danh ngay").

- [ ] T016 [P] [US3] Implement `getActionButtonConfig` helper resolving 4 mutually exclusive states (Guest, Student Available, Student Enrolled, Course Full) in `client/src/utils/courseButtonState.ts`
- [ ] T017 [US3] Connect `getActionButtonConfig` into `CourseDetailActionCard.tsx` applying Deep Emerald for available courses and Deep Crimson for full courses in `client/src/components/course/CourseDetailActionCard.tsx`
- [ ] T018 [US3] Implement disabled button styling with `cursor-not-allowed` and helper explanation text when course is full or already enrolled in `client/src/components/course/CourseDetailActionCard.tsx`

---

## Phase 6: User Story 4 — Course 404 Not Found & Error Recovery Flow (Priority: P2)

**Goal**: Provide friendly 404 and error states with clear recovery actions when courses are missing or server calls fail.  
**Independent Test**: Navigate to `/courses/non-existent-id`; verify 404 state displays with "Quay lại danh mục" button (`data-testid="btn-back-catalog"`).

- [ ] T019 [P] [US4] Create `NotFoundState` component with file question icon, explanation, and "Quay lại danh mục" button (`data-testid="btn-back-catalog"`) in `client/src/components/common/NotFoundState.tsx`
- [ ] T020 [P] [US4] Create `CourseDetailSkeleton` component rendering shimmer placeholders for header, description paragraphs, and sidebar action card in `client/src/components/course/CourseDetailSkeleton.tsx`
- [ ] T021 [US4] Wire `isNotFound` and `error` states into `CourseDetailPage.tsx` rendering `NotFoundState` or `ErrorState` with retry button (`data-testid="btn-retry-detail"`) in `client/src/pages/CourseDetailPage.tsx`

---

## Final Phase: Polish & Cross-Cutting Verification

**Purpose**: Verify mobile ergonomics, accessibility labels, dark mode contrast, and API documentation.

- [ ] T022 Audit mobile viewport ($375\text{px}$) ergonomics: verify action button has height $\ge 44\text{px}$ (`h-11`) and page body has adequate bottom padding (`pb-20`) to prevent sticky bar overlap in `client/src/pages/CourseDetailPage.tsx`
- [ ] T023 Audit WAI-ARIA compliance: verify `role="progressbar"`, `aria-valuenow`, `aria-valuemax`, and all `data-testid` attributes on detail page in `client/src/pages/CourseDetailPage.tsx`
- [ ] T024 Validate Deep Muted Semantics color contrast in both Light and Dark modes for detail status badges and progress bar in `client/src/components/course/CourseDetailActionCard.tsx`
- [ ] T025 Export and verify Postman collection covering `GET /api/courses/:id` (valid course, 404 not found, 400 invalid UUID, authenticated `is_enrolled` check) in `docs/postman_collection.json`

---

## Dependencies & Execution Graph

```text
Phase 1 (Setup: T001-T003)
   │
   ▼
Phase 2 (Foundational: T004-T007)
   │
   ├──▶ Phase 3 (US1 - MVP Detail View: T008-T012) 🎯 MVP Checkpoint
   │       │
   │       ├──▶ Phase 4 (US2 - Login Redirect: T013-T015)
   │       │
   │       ├──▶ Phase 5 (US3 - Dynamic Action Button: T016-T018)
   │       │
   │       └──▶ Phase 6 (US4 - 404 & Error Recovery: T019-T021)
   │
   └──▶ Final Phase (Polish, A11y, Mobile 44px, Postman: T022-T025)
```
