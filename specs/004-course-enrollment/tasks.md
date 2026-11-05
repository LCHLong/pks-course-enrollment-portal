# Tasks: 004 - Course Enrollment Engine

**Input**: Design documents from `/specs/004-course-enrollment/` (`spec.md`, `plan.md`)  
**Prerequisites**: `spec.md` (required for user stories), `plan.md` (required for technical context and architecture)  
**Target Project**: `pks-course-enrollment-portal`

---

## Execution Summary
- **Total Task Count**: 19
- **User Stories Covered**: US1 (Student Enrollment MVP), US2 (Concurrency & Race Condition Elimination), US3 (Duplicate Prevention), US4 (Guest Interception), US5 (Full Capacity State)
- **MVP Scope**: Phase 1 through Phase 3 (Tasks T001–T010)

---

## Phase 1: Setup & Infrastructure

**Purpose**: Initialize route definitions, TypeScript interfaces, and validation schemas for enrollment.

- [ ] T001 Create enrollment route skeleton with router initialization in `server/src/routes/enrollment.routes.ts`
- [ ] T002 [P] Define TypeScript interfaces for Enrollment entity, request payload, and API responses in `server/src/types/enrollment.ts` and `client/src/types/enrollment.ts`
- [ ] T003 [P] Define Zod schema validating course UUID path parameters in `server/src/schemas/enrollment.schema.ts`

---

## Phase 2: Foundational Prerequisites

**Purpose**: Core error handling infrastructure and route mounting blocking all story implementations.

- [ ] T004 Implement custom application error classes (`ConflictError`, `NotFoundError`, `BadRequestError`) returning uniform JSON error envelope `{ success: false, error: { code, message, details } }` in `server/src/errors/appErrors.ts`
- [ ] T005 Mount `/api/courses/:id/enroll` route guarded by `authenticateJWT` and `requireRole('student')` in `server/src/routes/index.ts`

---

## Phase 3: User Story 1 - Authenticated Student Course Enrollment (Priority: P1) 🎯 MVP

**Goal**: Authenticated student can click "Ghi danh" to successfully register for an open course with Sonner toast feedback and database persistence.  
**Independent Test**: Log in with student credentials, click "Ghi danh" on an open course, verify HTTP 201 Created response, Sonner success toast, and database record creation in `Enrollment`.

- [ ] T006 [US1] Implement `enrollCourse` service with Prisma transaction in `server/src/services/enrollment.service.ts`
- [ ] T007 [US1] Implement `enrollCourseController` handling HTTP 201 response with uniform JSON envelope `{ success: true, data: ..., message: "Ghi danh khóa học thành công!" }` in `server/src/controllers/enrollment.controller.ts`
- [ ] T008 [P] [US1] Implement client API service `enrollInCourse(courseId: string)` with Axios/Fetch in `client/src/services/enrollment.service.ts`
- [ ] T009 [US1] Implement `useEnrollment` hook managing loading state, anti-spam button lock, and Sonner toast notifications in `client/src/hooks/useEnrollment.ts`
- [ ] T010 [P] [US1] Update `CourseCard.tsx` with `data-testid="btn-enroll-[id]"`, `aria-label`, anti-spam `Loader2` spinner, and remove legacy `alert()` in `client/src/components/course/CourseCard.tsx`

---

## Phase 4: User Story 2 - Concurrency & Overbooking Elimination (Priority: P1)

**Goal**: Guarantee zero overbooking on last-seat race conditions using atomic conditional update `enrolled_count < capacity`.  
**Independent Test**: Fire 10 simultaneous asynchronous requests for a course with 1 seat remaining; assert exactly 1 returns HTTP 201 and 9 return HTTP 409 `CAPACITY_FULL`.

- [ ] T011 [US2] Refactor `enrollCourse` service to execute atomic conditional update `UPDATE "courses" SET "enrolled_count" = "enrolled_count" + 1 WHERE "id" = :id::uuid AND "enrolled_count" < "capacity" AND "is_active" = true` throwing `ConflictError('CAPACITY_FULL', 'Khóa học đã đủ sĩ số tối đa')` when row count is 0 in `server/src/services/enrollment.service.ts`
- [ ] T012 [P] [US2] Implement automated concurrency race condition benchmark script firing parallel requests against the last seat in `server/tests/concurrency_enroll.test.ts`

---

## Phase 5: User Story 3 - Duplicate Enrollment Prevention (Priority: P2)

**Goal**: Prevent duplicate enrollments by checking existing records, catching Prisma P2002 errors on concurrent duplicate submissions, and enforcing `@@unique([user_id, course_id])`.  
**Independent Test**: Call enroll twice with the same student token; verify second call returns HTTP 409 `ALREADY_ENROLLED` and button displays `"Đã ghi danh"` (disabled).

- [ ] T013 [US3] Add duplicate check query `tx.enrollment.findUnique` and catch Prisma unique constraint error `P2002` on `tx.enrollment.create` mapping to `ConflictError('ALREADY_ENROLLED', 'Bạn đã đăng ký khóa học này rồi')` in `server/src/services/enrollment.service.ts`
- [ ] T014 [P] [US3] Update `CourseCard.tsx` to render button with label `"Đã ghi danh"`, disabled state, and `data-testid="btn-enroll-disabled-[id]"` when user is already enrolled in `client/src/components/course/CourseCard.tsx`

---

## Phase 6: User Story 4 - Unauthenticated Guest Enrollment Interception (Priority: P2)

**Goal**: Intercept guest clicks on "Ghi danh", redirecting to `/login?returnUrl=/courses/:id` with Sonner guidance toast.  
**Independent Test**: Click "Ghi danh" as guest; verify browser navigates to `/login?returnUrl=...` with Sonner toast `"Vui lòng đăng nhập để ghi danh khóa học"`.

- [ ] T015 [US4] Implement guest interception logic in `useEnrollment.ts` redirecting unauthenticated users to `/login?returnUrl=/courses/${courseId}` with Sonner info toast in `client/src/hooks/useEnrollment.ts`

---

## Phase 7: User Story 5 - Course Full State & Boundary Enforcement (Priority: P3)

**Goal**: Reflect full capacity state visually with Deep Crimson badge and disabled button.  
**Independent Test**: Load course with `enrolled_count >= capacity`; verify button is disabled with text `"Hết chỗ"` and badge shows Deep Crimson styling.

- [ ] T016 [US5] Implement Deep Crimson semantic status badge (`text-[#991B1B] dark:text-[#F87171] bg-[#FEF2F2] dark:bg-[#7F1D1D33] border-[#B91C1C] dark:border-[#991B1B]`) and disabled button state with `data-testid="btn-enroll-full-[id]"` in `client/src/components/course/CourseCard.tsx`

---

## Final Phase: Polish & Cross-Cutting Verification

**Purpose**: Quality hardening, mobile ergonomics, theme contrast, and documentation export.

- [ ] T017 [P] Verify 100% of feedback notifications use Sonner toast and confirm zero instances of native `window.alert()` in `client/src/App.tsx` and `client/src/components/course/CourseCard.tsx`
- [ ] T018 [P] Audit mobile touch target sizes ($\ge 44\text{px}$) and Dark/Light theme Deep Muted contrast ratios in `client/src/components/course/CourseCard.tsx`
- [ ] T019 Export Postman collection entries for enrollment endpoints (201 success, 409 duplicate, 409 full) to `docs/postman_collection.json`

---

## Dependencies & Execution Graph
- **Phase 1 (Setup)**: T001, T002, T003 can execute in parallel.
- **Phase 2 (Foundational)**: T004, T005 depend on Phase 1; block all subsequent phases.
- **Phase 3 (US1 - MVP)**: T006, T007 (backend) -> T008, T009, T010 (frontend).
- **Phase 4 (US2 - Concurrency)**: T011, T012 extend T006.
- **Phase 5 (US3 - Duplicate)**: T013, T014 build on US1.
- **Phase 6 (US4 - Guest Redirect)**: T015 integrates into T009.
- **Phase 7 (US5 - Full State)**: T016 extends T010.
- **Final Phase (Polish)**: T017, T018, T019 run after all stories.
