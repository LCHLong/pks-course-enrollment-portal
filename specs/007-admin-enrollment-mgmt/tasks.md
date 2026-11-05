# Tasks: 007 - Admin Enrollment Tracking & Management

## Execution Summary
- **Feature Name**: Admin Enrollment Tracking & Management
- **Target Subsystem**: Admin Portal (`/admin/enrollments`)
- **Total Task Count**: 26 tasks
- **User Stories Covered**: US1, US2, US3, US4, US5
- **MVP Scope**: Phase 1 to Phase 6 (US1, US2, US3, US4)

---

## Phase 1: Setup & Environment Initialization
- [ ] T001 Initialize enrollment management TypeScript types in `client/src/types/enrollment.ts`
- [ ] T002 [P] Define API request/response types for admin enrollment endpoints in `server/src/types/enrollment.ts`
- [ ] T003 [P] Add navigation item for "Quản lý ghi danh" in `client/src/components/Header.tsx`

---

## Phase 2: Foundational Prerequisites (Validation & Routing)
- [ ] T004 Implement Zod schema `updateEnrollmentStatusSchema` for valid statuses (`enrolled`, `confirmed`, `cancelled`, `pending`) in `server/src/validations/enrollment.validation.ts`
- [ ] T005 [P] Create admin enrollment routes with `authenticateJWT` and `requireRole('admin')` in `server/src/routes/adminEnrollment.routes.ts`
- [ ] T006 Mount admin enrollment routes in `server/src/routes/index.ts`
- [ ] T007 [P] Create admin enrollment API client service in `client/src/services/adminEnrollment.service.ts`

---

## Phase 3: User Story 1 - View Enrolled Students per Course (Priority: P1)
- [ ] T008 [US1] Implement service function `getCourseEnrollments` formatting `registration_date` in `Asia/Ho_Chi_Minh` (`YYYY-MM-DD`) in `server/src/services/adminEnrollment.service.ts`
- [ ] T009 [US1] Implement controller handler `getEnrollmentsByCourse` returning uniform JSON envelope in `server/src/controllers/adminEnrollment.controller.ts`
- [ ] T010 [P] [US1] Build accessible `EnrollmentStatsCard` showing total capacity, enrolled count, and available seats in `client/src/components/admin/EnrollmentStatsCard.tsx`
- [ ] T011 [P] [US1] Build `EnrollmentTable` with Semantic Roles, accessibility labels, and `data-testid="table-enrollments"` covering 4 states (Loading Skeleton, Empty State, Error Banner) in `client/src/components/admin/EnrollmentTable.tsx`
- [ ] T012 [US1] Assemble `AdminEnrollmentsPage` with course selector `data-testid="select-course-enrollment"` and URL query param sync (`?courseId=...`) in `client/src/pages/admin/AdminEnrollmentsPage.tsx`

---

## Phase 4: User Story 2 - Status Approval & Modification Workflow (Priority: P1)
- [ ] T013 [US2] Implement service logic for enrollment status updates acquiring row lock with `SELECT ... FOR UPDATE` inside `prisma.$transaction`, handling transitions between seat-holding statuses (`enrolled`, `confirmed`, `pending`) with zero counter delta in `server/src/services/adminEnrollment.service.ts`
- [ ] T014 [US2] Implement controller handler `updateStatus` returning HTTP 200 with updated enrollment in `server/src/controllers/adminEnrollment.controller.ts`
- [ ] T015 [P] [US2] Add status change dropdown `data-testid="select-enrollment-status-[id]"` and Deep Muted status badges in `client/src/components/admin/EnrollmentTable.tsx`
- [ ] T016 [US2] Wire status update call to trigger Sonner toast "Cập nhật trạng thái ghi danh thành công!" and refresh table in `client/src/pages/admin/AdminEnrollmentsPage.tsx`

---

## Phase 5: User Story 3 - Enrollment Cancellation with Atomic Decrement (Priority: P1)
- [ ] T017 [US3] Implement atomic decrement of `course.enrolled_count` inside `prisma.$transaction` when transitioning from active seat-holding status (`enrolled`, `confirmed`, `pending`) to `cancelled` in `server/src/services/adminEnrollment.service.ts`
- [ ] T018 [US3] Wire cancellation UI action to refresh `EnrollmentStatsCard` freeing 1 seat and display Sonner confirmation toast in `client/src/pages/admin/AdminEnrollmentsPage.tsx`

---

## Phase 6: User Story 4 - Re-enrollment Capacity Check & Atomic Increment (Priority: P1)
- [ ] T019 [US4] Implement atomic conditional update (`UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = :id AND enrolled_count < capacity`) inside `prisma.$transaction` when reactivating from `cancelled` to active status, throwing HTTP 409 `CAPACITY_FULL` if full in `server/src/services/adminEnrollment.service.ts`
- [ ] T020 [US4] Handle HTTP 409 `CAPACITY_FULL` error in UI with Sonner error toast and reset dropdown to previous status in `client/src/components/admin/EnrollmentTable.tsx`

---

## Phase 7: User Story 5 - Search & Filter Enrolled Students (Priority: P2)
- [ ] T021 [US5] Add search by student name/email and status filter query parameters to `getCourseEnrollments` in `server/src/services/adminEnrollment.service.ts`
- [ ] T022 [US5] Add search input `data-testid="input-search-enrollments"` and status filter `data-testid="select-filter-enrollment-status"` to `client/src/pages/admin/AdminEnrollmentsPage.tsx`
- [ ] T023 [P] [US5] Add "Xóa bộ lọc" button `data-testid="btn-clear-enrollment-filter"` in `client/src/pages/admin/AdminEnrollmentsPage.tsx`

---

## Phase 8: Polish & Cross-Cutting Verification
- [ ] T024 Verify timezone normalization `Asia/Ho_Chi_Minh` and date format `YYYY-MM-DD` across all enrollment table rows in `client/src/components/admin/EnrollmentTable.tsx`
- [ ] T025 Verify accessibility compliance (WCAG 2.1 AA), keyboard navigation, and `data-testid` coverage across all enrollment management components in `client/src/pages/admin/AdminEnrollmentsPage.tsx`
- [ ] T026 Verify mobile responsive layout ($< 768\text{px}$) with horizontal scroll and touch target height $\ge 44\text{px}$ in `client/src/components/admin/EnrollmentTable.tsx`

---

## Dependencies & Execution Graph
```text
T001, T002, T003
       │
       ▼
T004, T005, T006, T007 (Foundational Prerequisites)
       │
       ▼
T008, T009, T010, T011, T012 (US1 View Enrollments)
       │
       ▼
T013, T014, T015, T016 (US2 Status Approval Workflow)
       │
       ▼
T017, T018 (US3 Cancellation & Atomic Decrement)
       │
       ▼
T019, T020 (US4 Re-enrollment Capacity Check & Atomic Increment)
       │
       ▼
T021, T022, T023 (US5 Search & Filter)
       │
       ▼
T024, T025, T026 (Polish & Quality Gates)
```
