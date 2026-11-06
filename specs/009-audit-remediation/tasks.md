# Tasks: 009 - Post-Audit Remediation & Full Spec Compliance

**Input**: Design documents from `/specs/009-audit-remediation/` (`spec.md`, `plan.md`)  
**Prerequisites**: Findings documented in `docs/AUDIT_REPORT.md`  
**Target Project**: `pks-course-enrollment-portal`

---

## Execution Summary
- **Total Task Count**: 16
- **GAPs Covered**: GAP-01 (Student Cancel), GAP-02 (Admin Inactive Courses), GAP-03 (Mobile Sheet Drawer), GAP-04 (Union Type), GAP-05 (Timezone Pinning), GAP-06 (ERD), GAP-07 (Screenshots), GAP-08 (README Setup)
- **Target Score**: Transition score from 8.10/10.0 to 10.0/10.0 (+0.5 Bonus)

---

## Phase 1: Backend Defect Remediation (Priority: P1)

**Purpose**: Fix critical student cancellation 403 Forbidden bug (GAP-01) and expose inactive courses to admin (GAP-02).

- [ ] T001 [P1] [GAP-01] Implement `cancelStudentEnrollment(enrollmentId, userId)` in `server/src/services/enrollment.service.ts` with IDOR check, status mutation, and atomic seat release (`enrolled_count = GREATEST(enrolled_count - 1, 0)`) inside a Prisma transaction.
- [ ] T002 [P1] [GAP-01] Add `cancelEnrollmentController` handling `POST /api/student/enrollments/:id/cancel` in `server/src/controllers/student.controller.ts`.
- [ ] T003 [P1] [GAP-01] Mount `POST /enrollments/:id/cancel` with `authenticateJWT` and `requireRole('student')` in `server/src/routes/student.routes.ts`.
- [ ] T004 [P1] [GAP-02] Implement `getAdminCourses()` omitting `where: { is_active: true }` filter in `server/src/services/course.service.ts`.
- [ ] T005 [P1] [GAP-02] Add `getAdminCoursesController` and mount `GET /api/admin/courses` in `server/src/controllers/admin.controller.ts` and `server/src/routes/admin.routes.ts`.

---

## Phase 2: Frontend Client Integration & Type Safety (Priority: P1 & P2)

**Purpose**: Fix frontend cancel call (GAP-01), update types (GAP-04), and pin timezone (GAP-05).

- [ ] T006 [P1] [GAP-01] Repoint `cancelEnrollment` in `client/src/pages/my-courses/myCoursesApi.ts` to `POST /api/student/enrollments/${id}/cancel`.
- [ ] T007 [P2] [GAP-04] Add `'confirmed'` to `EnrollmentStatus` union in `client/src/types/index.ts` (or `client/src/types/student.ts`).
- [ ] T008 [P2] [GAP-05] Update `client/src/utils/formatDate.ts` (or `client/src/utils/date.ts`) with explicit `timeZone: 'Asia/Ho_Chi_Minh'` parameter.

---

## Phase 3: Mobile Navigation Sheet Drawer (Priority: P2)

**Purpose**: Replace dropdown navigation with right-sliding Sheet Drawer for screens `< 768px` (GAP-03).

- [ ] T009 [P2] [GAP-03] Implement `client/src/components/layout/MobileNavSheet.tsx` with right-sliding animation, backdrop blur, close button, touch targets $\ge 44$px (`h-11`), and theme toggle.
- [ ] T010 [P2] [GAP-03] Refactor `client/src/components/layout/Header.tsx` to mount `MobileNavSheet` when hamburger button is clicked.

---

## Phase 4: Official Deliverables & Documentation (Priority: P3)

**Purpose**: Satisfy all submission requirements in `ND_PV_FULLSTACK.pdf §5` (GAP-06, GAP-07, GAP-08).

- [ ] T011 [P3] [GAP-06] Create `docs/ERD.md` with complete Mermaid Entity-Relationship diagram, field types, primary keys, foreign keys (`Restrict`), and constraints.
- [ ] T012 [P3] [GAP-07] Create `docs/screenshots/` and populate with 7 test execution screenshots covering Auth, Catalog, Detail, Enroll, Concurrency Full, Admin CRUD, and Admin Enrollments.
- [ ] T013 [P3] [GAP-08] Update root `README.md` with database migration instructions (`npx prisma migrate dev`), seeding instructions (`npx prisma db seed`), and Demo Accounts table.

---

## Phase 5: Verification & Full Regression Audit

**Purpose**: Ensure zero regressions and confirm all criteria pass.

- [ ] T014 Run backend tests (`npm test` in `server`) and verify 100% pass rate.
- [ ] T015 Run full monorepo build (`npm run build`) to confirm TypeScript compilation.
- [ ] T016 Verify all items in `docs/AUDIT_REPORT.md` are completely resolved.
