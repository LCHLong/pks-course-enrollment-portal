# Feature Specification: 009 - Post-Audit Remediation & Full Spec Compliance

**Feature Branch**: `009-audit-remediation`  
**Created**: 2026-11-06  
**Status**: Ready for Implementation  
**Target Subsystem**: Fullstack System Remediation (Backend API, Client UI/UX, Documentation & Submission Deliverables)  
**Input**: Findings from `docs/AUDIT_REPORT.md` (GAP-01 to GAP-08), `ND_PV_FULLSTACK.pdf`, `docs/REQUIREMENTS.md`, `.agents/rules/ui-rules.md`, and `AGENTS.md`.

---

## 1. Overview & Business Context

### 1.1. Feature Summary
The **Post-Audit Remediation & Full Spec Compliance** specification addresses all 8 functional defects, UI/type discrepancies, and documentation gaps identified during the comprehensive independent audit (`docs/AUDIT_REPORT.md`). 

Resolving these gaps transitions the project from an initial score of **8.10 / 10.0** to a perfect **10.0 / 10.0** (with qualification for the **+0.5 Bonus** for complete automated test suites), achieving 100% compliance with `ND_PV_FULLSTACK.pdf` and internal design standards.

### 1.2. Key Remediation Pillars
1. **Pillar 1: Business Logic & RBAC Repair (P1 - Defects)**:
   - Provide a dedicated, secure student cancellation endpoint `POST /api/student/enrollments/:id/cancel`, eliminating the critical HTTP 403 Forbidden bug when learners cancel their own enrollment.
   - Decouple admin course catalog fetching from public catalog filtering, enabling administrators to view and manage inactive/hidden courses (`is_active: false`).
2. **Pillar 2: UI Ergonomics & Type Safety (P2 - Warnings)**:
   - Implement a mobile-first **Sheet Drawer** navigation menu sliding from the right for viewport `< 768px` in strict accordance with `.agents/rules/ui-rules.md §3`.
   - Update client TypeScript types to include `'confirmed'` in `EnrollmentStatus`.
   - Guarantee consistent local date rendering by explicitly locking `formatDate` to `Asia/Ho_Chi_Minh` timezone.
3. **Pillar 3: Official Deliverables & Submission Package (P3 - Gaps)**:
   - Author `docs/ERD.md` with complete Mermaid ER diagram and entity relational constraints.
   - Generate and commit 7 automated/verified Newman Postman execution screenshots in `docs/screenshots/`.
   - Enrich `README.md` with step-by-step database migration, seeding commands, and demo account credentials.

---

## 2. Clarifications & Architectural Decisions

### Session 2026-11-06 (Post-Audit Review)
- **Q1: Why did student cancellation trigger an HTTP 403 Forbidden error?**  
  → **Finding & Decision**: The frontend function `cancelEnrollment` in `myCoursesApi.ts` invoked `PATCH /api/admin/enrollments/:id/status`. This route is protected by `requireRole('admin')`. Regular students lack the admin role, resulting in an immediate 403 rejection.  
  → **Solution**: Create a dedicated student route `POST /api/student/enrollments/:id/cancel` protected by `requireRole('student')`. The controller verifies that the enrollment record belongs to the requesting user (`user_id === req.user.id`) to prevent IDOR, marks status as `'cancelled'`, and atomically decrements `enrolled_count` (`enrolled_count = GREATEST(enrolled_count - 1, 0)`) inside a Prisma transaction.
- **Q2: Why are inactive courses invisible in the Admin Portal?**  
  → **Finding & Decision**: `admin.routes.ts` or its underlying service reused `courseService.getCourses()` which enforces `where: { is_active: true }`.  
  → **Solution**: Introduce `adminService.getAdminCourses()` or an optional filter parameter `includeInactive: true` so administrators can inspect, reactivate, or edit soft-deleted / draft courses.
- **Q3: How must the Mobile Menu be structured?**  
  → **Finding & Decision**: Currently implemented as a simple collapsible dropdown below the header. The UI rules (`.agents/rules/ui-rules.md §3`) strictly require: *"Màn hình < 768px dùng Hamburger menu kết hợp Sheet Drawer (trượt từ phải sang)"*.  
  → **Solution**: Implement a slide-over Sheet Drawer using Radix UI Dialog / Portal with smooth slide-in CSS transitions, background backdrop blur, close button, touch targets $\ge 44$px, and trap focus accessibility.
- **Q4: How should the Postman test screenshots be collected?**  
  → **Solution**: Execute the existing `docs/PKS_Portal_Collection.json` via Newman or headless browser test runner, capturing the 7 required milestone scenarios into `docs/screenshots/`.

---

## 3. User Scenarios & Acceptance Criteria

### User Story 1 - Student Enrollment Self-Cancellation (Priority: P1) 🎯 Critical Defect Fix

As an authenticated student,  
I want to cancel an active enrollment from my personal "Khóa học của tôi" dashboard,  
So that I can release my seat without receiving a 403 Forbidden error, and the course capacity reflects the released seat.

#### Acceptance Criteria
- [ ] **AC 1.1 (Route Availability)**: Backend mounts `POST /api/student/enrollments/:id/cancel` protected by `authenticateJWT` and `requireRole('student')`.
- [ ] **AC 1.2 (IDOR Verification)**: If Student A attempts to cancel Student B's enrollment ID, the server rejects the request with HTTP 403 Forbidden (`FORBIDDEN_RESOURCE`) or HTTP 404 Not Found.
- [ ] **AC 1.3 (State Transition & Seat Release)**:
  - Inside a `prisma.$transaction`, the enrollment status is updated to `'cancelled'`.
  - The associated course's `enrolled_count` is atomically decremented by 1: `UPDATE courses SET enrolled_count = GREATEST(enrolled_count - 1, 0) WHERE id = :courseId`.
  - Cancellation is idempotent; cancelling an already `'cancelled'` enrollment returns an appropriate error (`ALREADY_CANCELLED`, 400).
- [ ] **AC 1.4 (Frontend Client Alignment)**: `client/src/pages/my-courses/myCoursesApi.ts` calls `POST /api/student/enrollments/:id/cancel`. The card updates immediately with Sonner success toast and displays Deep Crimson badge `"Đã hủy"`.

---

### User Story 2 - Admin Full Course Visibility (Priority: P1)

As an administrator,  
I want to view all courses in the system—including inactive and hidden courses—in the Admin Course Management table,  
So that I can manage, update, or reactivate previously deactivated courses.

#### Acceptance Criteria
- [ ] **AC 2.1 (Admin Course Retrieval)**: Endpoint `GET /api/admin/courses` returns all courses regardless of their `is_active` status.
- [ ] **AC 2.2 (Status Indication)**: Admin course table clearly distinguishes between Active (`is_active: true`, Deep Emerald badge `"Đang mở"`) and Inactive (`is_active: false`, Deep Muted Zinc/Amber badge `"Đã ẩn"`).
- [ ] **AC 2.3 (Student Catalog Unaffected)**: Public student catalog (`GET /api/courses`) continues strictly filtering for `is_active: true`.

---

### User Story 3 - Mobile Navigation Sheet Drawer & UI Consistency (Priority: P2)

As a mobile user (viewport `< 768px`),  
I want to access navigation links and theme toggle via a smooth slide-over Sheet Drawer from the right edge,  
So that the navigation complies with modern mobile ergonomics and Apple HIG standards.

#### Acceptance Criteria
- [ ] **AC 3.1 (Drawer Mechanism)**: Clicking the hamburger button (`min-h-[44px]`) on screens `< 768px` triggers a Sheet Drawer sliding in from the right edge of the screen.
- [ ] **AC 3.2 (Backdrop & Dismissal)**: Clicking the backdrop overlay, pressing `Escape`, or clicking any navigation item closes the drawer smoothly.
- [ ] **AC 3.3 (Content & Touch Targets)**: The drawer houses navigation links, User Profile / Auth actions, and the Theme Toggle button. All touch targets meet `h-11` ($\ge 44$px).
- [ ] **AC 3.4 (Type Safety & Date Pinning)**:
  - `client/src/types/index.ts` contains `EnrollmentStatus = 'enrolled' | 'pending' | 'cancelled' | 'confirmed'`.
  - `formatDate` utility uses `{ timeZone: 'Asia/Ho_Chi_Minh' }` for deterministic output.

---

### User Story 4 - Official Submission Deliverables & Documentation (Priority: P3)

As a technical evaluator or hiring manager,  
I want to inspect complete architectural diagrams, Postman execution evidence, and clear setup instructions,  
So that I can evaluate the project against the 10.0-point scoring rubric without missing artifact penalties.

#### Acceptance Criteria
- [ ] **AC 4.1 (Database ERD Document)**: Create `docs/ERD.md` containing a Mermaid ER diagram detailing `users`, `courses`, and `enrollments` tables, data types, primary keys, foreign keys, constraints, and relationships.
- [ ] **AC 4.2 (Test Evidence Screenshots)**: Populate `docs/screenshots/` with 7 clear test execution images:
  1. `01-auth-register-login.png`
  2. `02-course-catalog-search-filter.png`
  3. `03-course-detail-view.png`
  4. `04-student-enrollment-success.png`
  5. `05-concurrency-capacity-full-error.png`
  6. `06-admin-course-crud.png`
  7. `07-admin-enrollment-tracking.png`
- [ ] **AC 4.3 (README Enhancement)**: Update root `README.md` to document:
  - Exact database migration commands (`npx prisma migrate dev`).
  - Database seeding command (`npx prisma db seed`).
  - Table of pre-seeded Demo Credentials (Admin & Student).
