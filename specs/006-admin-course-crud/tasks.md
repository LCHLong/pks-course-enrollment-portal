# Tasks: 006 - Admin Course Management (CRUD)

## Execution Summary
- **Feature Name**: Admin Course Management (CRUD)
- **Target Subsystem**: Admin Portal (`/admin/courses`)
- **Total Task Count**: 28 tasks
- **User Stories Covered**: US1, US2, US3, US4, US5, US6
- **MVP Scope**: Phase 1 to Phase 5 (US1, US2, US3)

---

## Phase 1: Setup & Environment Initialization
- [ ] T001 Initialize admin course TypeScript interfaces in `client/src/types/course.ts`
- [ ] T002 [P] Define API request/response types for admin course CRUD in `server/src/types/course.ts`
- [ ] T003 [P] Configure admin route paths and navigation link in `client/src/components/Header.tsx`

---

## Phase 2: Foundational Prerequisites (Validation & Routing)
- [ ] T004 Implement Zod schemas for course creation and update with validation (`capacity > 0`, `price >= 0`) in `server/src/validations/course.validation.ts`
- [ ] T005 [P] Create admin course HTTP router with `authenticateJWT` and `requireRole('admin')` in `server/src/routes/adminCourse.routes.ts`
- [ ] T006 Mount `/api/admin/courses` router in `server/src/routes/index.ts`
- [ ] T007 [P] Create admin course API client service in `client/src/services/adminCourse.service.ts`

---

## Phase 3: User Story 1 - Admin Course List & Filtering (Priority: P1)
- [ ] T008 [US1] Implement service function `getAllAdminCourses` with search, category filter, and pagination in `server/src/services/adminCourse.service.ts`
- [ ] T009 [US1] Implement controller handler `getCourses` returning uniform JSON envelope in `server/src/controllers/adminCourse.controller.ts`
- [ ] T010 [P] [US1] Build accessible `CourseTable` component with 4-state UI (Loading Skeleton, Empty State, Error Banner) and `data-testid="table-admin-courses"` in `client/src/components/admin/CourseTable.tsx`
- [ ] T011 [US1] Assemble `AdminCoursesPage` with search input `data-testid="input-search-admin-courses"` and category filter `data-testid="select-filter-admin-category"` in `client/src/pages/admin/AdminCoursesPage.tsx`

---

## Phase 4: User Story 2 - Add Course with Validation (Priority: P1)
- [ ] T012 [US2] Implement service function `createCourse` initializing `enrolled_count = 0` in `server/src/services/adminCourse.service.ts`
- [ ] T013 [US2] Implement controller handler `createCourse` returning HTTP 201 Created in `server/src/controllers/adminCourse.controller.ts`
- [ ] T014 [P] [US2] Build `CourseFormModal` with Semantic Roles, ARIA labels, and `data-testid="modal-course-form"` supporting fields (title, category, instructor, description, price, capacity, is_active) in `client/src/components/admin/CourseFormModal.tsx`
- [ ] T015 [US2] Wire "Thêm khóa học" button `data-testid="btn-add-course"` to open modal and trigger Sonner toast on creation in `client/src/pages/admin/AdminCoursesPage.tsx`

---

## Phase 5: User Story 3 - Edit Course & Capacity Invariant Enforcement (Priority: P1)
- [ ] T016 [US3] Implement service function `updateCourse` with interactive transaction `prisma.$transaction` and exclusive row lock `SELECT ... FOR UPDATE` ensuring atomic conditional verification `enrolled_count <= :new_capacity` to prevent TOCTOU race conditions, throwing HTTP 400 `INVALID_CAPACITY` if violated in `server/src/services/adminCourse.service.ts`
- [ ] T017 [US3] Implement controller handler `updateCourse` returning HTTP 200 on success in `server/src/controllers/adminCourse.controller.ts`
- [ ] T018 [US3] Connect edit trigger `data-testid="btn-edit-course-[id]"` to prefill `CourseFormModal` and validate `new_capacity >= current_enrolled_count` on client in `client/src/components/admin/CourseFormModal.tsx`

---

## Phase 6: User Story 4 - Toggle Active Status (Priority: P2)
- [ ] T019 [US4] Implement service function `toggleCourseStatus` updating `is_active` in `server/src/services/adminCourse.service.ts`
- [ ] T020 [US4] Implement controller handler `toggleStatus` at `PATCH /api/admin/courses/:id/status` in `server/src/controllers/adminCourse.controller.ts`
- [ ] T021 [US4] Add interactive status switch `data-testid="btn-toggle-active-[id]"` with optimistic update and Sonner toast in `client/src/components/admin/CourseTable.tsx`

---

## Phase 7: User Story 5 - Safe Course Deletion & Deletion Guard (Priority: P1)
- [ ] T022 [US5] Implement service function `deleteCourse` with guard: block hard delete if `enrolled_count > 0` or enrollments exist (throw HTTP 409 `COURSE_HAS_ENROLLMENTS`) in `server/src/services/adminCourse.service.ts`
- [ ] T023 [US5] Implement controller handler `deleteCourse` returning HTTP 200 in `server/src/controllers/adminCourse.controller.ts`
- [ ] T024 [P] [US5] Build `CourseDeleteDialog` with Radix AlertDialog, `data-testid="modal-confirm-delete"`, and warning message if enrolled students exist in `client/src/components/admin/CourseDeleteDialog.tsx`

---

## Phase 8: User Story 6 - RBAC Protection & Non-Admin Interception (Priority: P1)
- [ ] T025 [US6] Implement ProtectedRoute guard redirecting non-admin users (`role !== 'admin'`) and unauthenticated guests from `/admin/*` to `/login` with Sonner warning toast in `client/src/components/ProtectedRoute.tsx`
- [ ] T026 [US6] Verify API-level RBAC middleware `requireRole('admin')` returning HTTP 403 `FORBIDDEN` on unauthorized access to admin course routes in `server/src/middlewares/auth.middleware.ts`

---

## Phase 9: Polish & Cross-Cutting Verification
- [ ] T027 Verify accessibility compliance (WCAG 2.1 AA), keyboard focus trap in modals, and `data-testid` coverage across all admin course components in `client/src/pages/admin/AdminCoursesPage.tsx`
- [ ] T028 Verify responsive mobile layout ($< 768\text{px}$) with horizontal scroll and touch target height $\ge 44\text{px}$ in `client/src/components/admin/CourseTable.tsx`

---

## Dependencies & Execution Graph
```text
T001, T002, T003
       │
       ▼
T004, T005, T006, T007 (Foundational Prerequisites)
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
T008, T009, T010, T011 (US1 List)   T012, T013, T014, T015 (US2 Add)
       │                                 │
       └────────────────┬────────────────┘
                        ▼
             T016, T017, T018 (US3 Edit & Invariant)
                        │
                        ▼
             T019, T020, T021 (US4 Status Toggle)
                        │
                        ▼
             T022, T023, T024 (US5 Safe Delete Guard)
                        │
                        ▼
             T025, T026 (US6 RBAC & Route Guard)
                        │
                        ▼
             T027, T028 (Polish & Quality Gates)
```
