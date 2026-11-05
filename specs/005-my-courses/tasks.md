# Tasks: 005 - Student My Courses Portal

**Input**: Design documents from `/specs/005-my-courses/` (`spec.md`, `plan.md`)  
**Prerequisites**: `spec.md` (required for user stories), `plan.md` (required for technical architecture and IDOR prevention)  
**Target Project**: `pks-course-enrollment-portal`

---

## Execution Summary
- **Total Task Count**: 19
- **User Stories Covered**: US1 (View Registered Courses MVP), US2 (Strict IDOR Prevention), US3 (Zero Enrollments Empty State), US4 (Responsive Ergonomics & 4-State UI)
- **MVP Scope**: Phase 1 through Phase 3 (Tasks T001–T009)

---

## Phase 1: Setup & Infrastructure

**Purpose**: Initialize router definitions, TypeScript models, and student API structure.

- [ ] T001 Create student router skeleton with route handler declarations in `server/src/routes/student.routes.ts`
- [ ] T002 [P] Define TypeScript interfaces for `MyCourseEnrollment`, course preview, and response envelope in `server/src/types/student.ts` and `client/src/types/student.ts`

---

## Phase 2: Foundational Prerequisites

**Purpose**: Route mounting with authentication guards and shared date formatting.

- [ ] T003 Mount `/api/student/my-courses` route guarded by `authenticateJWT` and `requireRole('student')` in `server/src/routes/index.ts`
- [ ] T004 [P] Implement `formatDate` utility returning date string in `YYYY-MM-DD` format according to `Asia/Ho_Chi_Minh` timezone in `client/src/utils/formatDate.ts`

---

## Phase 3: User Story 1 - View Registered Courses (Priority: P1) 🎯 MVP

**Goal**: Authenticated student can visit `/my-courses` and view all registered courses with title, instructor, formatted date, and status.  
**Independent Test**: Log in with student credentials, navigate to `/my-courses`, and verify enrolled course cards render with title, instructor, registration date formatted `YYYY-MM-DD`, and status badge.

- [ ] T005 [US1] Implement `getStudentEnrollments(userId: string)` service query filtering by `user_id = userId` ordered by `created_at DESC` with course join in `server/src/services/student.service.ts`
- [ ] T006 [US1] Implement `getMyCoursesController` returning uniform JSON envelope `{ success: true, data: [...], message: "Lấy danh sách khóa học thành công" }` in `server/src/controllers/student.controller.ts`
- [ ] T007 [P] [US1] Implement client API service `getMyCourses()` with Axios/Fetch in `client/src/services/student.service.ts`
- [ ] T008 [P] [US1] Implement `MyCourseCard.tsx` component with `data-testid="card-my-course-[id]"`, title, category, instructor, registration date `YYYY-MM-DD`, status badge, and `"Xem chi tiết"` link in `client/src/components/MyCourseCard.tsx`
- [ ] T009 [US1] Implement `MyCoursesPage.tsx` view with data fetching, card grid, and register route `/my-courses` in `client/src/pages/MyCoursesPage.tsx` and `client/src/App.tsx`

---

## Phase 4: User Story 2 - Strict IDOR Prevention & Access Isolation (Priority: P1)

**Goal**: Enforce absolute data isolation so no student can view another student's courses via parameter tampering.  
**Independent Test**: Send request with `?userId=ANOTHER_USER` to `GET /api/student/my-courses`; verify that returned courses belong strictly to the authenticated student.

- [ ] T010 [US2] Verify `getMyCoursesController` discards all incoming query and body parameters, extracting student ID exclusively from `req.user.id` in `server/src/controllers/student.controller.ts`
- [ ] T011 [P] [US2] Implement automated IDOR integration test verifying parameter injection fails to leak other users' enrollment records in `server/tests/idor_prevention.test.ts`

---

## Phase 5: User Story 3 - Empty State for New Students (Priority: P2)

**Goal**: Guide new students with 0 enrollments via an educational empty state and catalog CTA button.  
**Independent Test**: Log in as a student with zero enrollments; verify `data-testid="state-empty-my-courses"` renders and clicking `"Khám phá khóa học"` navigates to `/`.

- [ ] T012 [US3] Implement `MyCoursesEmptyState.tsx` with `data-testid="state-empty-my-courses"`, `BookOpen` icon, friendly copy, and CTA button `data-testid="btn-explore-courses"` linking to `/` in `client/src/components/MyCoursesEmptyState.tsx`
- [ ] T013 [US3] Integrate empty state conditional rendering when `enrollments.length === 0` in `client/src/pages/MyCoursesPage.tsx`

---

## Phase 6: User Story 4 - Responsive Mobile Ergonomics & 4-State UI (Priority: P2)

**Goal**: Provide complete 4-state coverage (Loading, Empty, Error with retry, Success) with mobile touch targets $\ge 44\text{px}$.  
**Independent Test**: Throttle network to test skeleton loading, trigger 500 error to test retry button, and verify mobile layout.

- [ ] T014 [P] [US4] Implement pulsing skeleton loader component with `data-testid="state-loading-my-courses"` in `client/src/components/MyCoursesSkeleton.tsx`
- [ ] T015 [P] [US4] Implement error state with retry button `data-testid="btn-retry-my-courses"` and Sonner error toast trigger in `client/src/components/MyCoursesErrorState.tsx`
- [ ] T016 [US4] Enforce responsive card grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) and mobile touch target heights $\ge 44\text{px}$ (`h-11`) in `client/src/pages/MyCoursesPage.tsx`

---

## Final Phase: Polish & Cross-Cutting Verification

**Purpose**: Quality hardening, theme contrast audit, accessibility compliance, and Postman export.

- [ ] T017 [P] Audit Deep Muted Semantics contrast tokens for status badges (`enrolled` emerald, `pending` amber, `cancelled` crimson) across Light and Dark themes in `client/src/components/MyCourseCard.tsx`
- [ ] T018 [P] Audit 100% of interactive elements for semantic tags, ARIA labels, and `data-testid` compliance in `client/src/pages/MyCoursesPage.tsx`
- [ ] T019 Export Postman collection entry for `GET /api/student/my-courses` (200 success, 401 unauthorized, 403 forbidden) to `docs/postman_collection.json`

---

## Dependencies & Execution Graph
- **Phase 1 (Setup)**: T001, T002 execute in parallel.
- **Phase 2 (Foundational)**: T003, T004 depend on Phase 1; block story execution.
- **Phase 3 (US1 - MVP)**: T005, T006 -> T007, T008, T009.
- **Phase 4 (US2 - IDOR)**: T010, T011 verify and secure T006.
- **Phase 5 (US3 - Empty State)**: T012, T013 extend T009.
- **Phase 6 (US4 - Ergonomics & States)**: T014, T015, T016 integrate into T009.
- **Final Phase (Polish)**: T017, T018, T019 run after all stories.
