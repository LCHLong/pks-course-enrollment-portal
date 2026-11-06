# Implementation Plan: 009 - Post-Audit Remediation & Full Spec Compliance

**Branch**: `009-audit-remediation`  
**Date**: 2026-11-06  
**Spec Reference**: `specs/009-audit-remediation/spec.md`  
**Target Project**: `pks-course-enrollment-portal`

---

## 1. Technical Context & Stack

### Files to Create or Modify:
- **Backend (Server)**:
  - `server/src/routes/student.routes.ts`: Mount `POST /enrollments/:id/cancel`
  - `server/src/controllers/student.controller.ts`: Implement `cancelEnrollmentController`
  - `server/src/services/enrollment.service.ts`: Implement `cancelStudentEnrollment(enrollmentId, userId)` with atomic counter decrement
  - `server/src/controllers/admin.controller.ts`: Implement `getAdminCoursesController`
  - `server/src/routes/admin.routes.ts`: Mount or adjust `GET /courses` for admin
  - `server/src/services/course.service.ts`: Add `getAdminCourses()` omitting `where: { is_active: true }`
- **Frontend (Client)**:
  - `client/src/pages/my-courses/myCoursesApi.ts`: Repoint `cancelEnrollment` to `POST /api/student/enrollments/${id}/cancel`
  - `client/src/types/index.ts`: Add `'confirmed'` to `EnrollmentStatus` union
  - `client/src/utils/formatDate.ts`: Explicitly configure `timeZone: 'Asia/Ho_Chi_Minh'`
  - `client/src/components/layout/Header.tsx`: Replace dropdown menu with right-sliding Sheet Drawer
  - `client/src/components/layout/MobileNavSheet.tsx`: New mobile drawer component
- **Documentation & Deliverables**:
  - `docs/ERD.md`: Full Mermaid Entity-Relationship diagram and schema documentation
  - `docs/screenshots/`: Directory housing 7 PNG screenshots covering core API endpoints
  - `README.md`: Database setup, migration commands, seed commands, demo accounts table

---

## 2. Architecture & Governance Gates

- [x] **IDOR Prevention Gate**: Student self-cancellation strictly verifies that `enrollment.user_id === req.user.id`. Unauthorized attempts return HTTP 403 / 404.
- [x] **Database Transaction Gate**: Cancellation wraps status mutation and `enrolled_count` decrement in `prisma.$transaction`.
- [x] **Atomic Counter Floor Gate**: Decrement uses `GREATEST(enrolled_count - 1, 0)` to guarantee counts never drop below zero.
- [x] **Mobile Ergonomics Gate**: Drawer trigger button and internal navigation links adhere to $\ge 44$px touch targets (`h-11`).
- [x] **Dual Theme Gate**: Sheet Drawer and status badges strictly support Dark (`bg-zinc-900 border-zinc-800 text-zinc-100`) and Light (`bg-white border-zinc-200 text-zinc-900`) themes.
- [x] **Rubric Compliance Gate**: All deliverables requested in `ND_PV_FULLSTACK.pdf §5` are accounted for.

---

## 3. Detailed Component & Implementation Designs

### 3.1. Backend: Student Self-Cancellation (GAP-01)

#### Route:
`POST /api/student/enrollments/:id/cancel`  
Guarded by `authenticateJWT` and `requireRole('student')`.

#### Service Implementation Logic (`server/src/services/enrollment.service.ts`):
```typescript
export async function cancelStudentEnrollment(enrollmentId: string, userId: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch enrollment with course info
    const enrollment = await tx.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: true }
    });

    if (!enrollment) {
      throw new AppError('NOT_FOUND', 'Không tìm thấy thông tin ghi danh', 404);
    }

    // 2. IDOR Protection: Must belong to caller
    if (enrollment.user_id !== userId) {
      throw new AppError('FORBIDDEN', 'Bạn không có quyền hủy khóa học của học viên khác', 403);
    }

    // 3. Status Guard: Must not already be cancelled
    if (enrollment.status === 'cancelled') {
      throw new AppError('ALREADY_CANCELLED', 'Lượt ghi danh này đã được hủy trước đó', 400);
    }

    // 4. Update status to cancelled
    const updated = await tx.enrollment.update({
      where: { id: enrollmentId },
      data: { status: 'cancelled' }
    });

    // 5. Atomically decrement course enrolled_count
    await tx.$executeRaw`
      UPDATE "courses"
      SET "enrolled_count" = GREATEST("enrolled_count" - 1, 0)
      WHERE "id" = ${enrollment.course_id}
    `;

    return updated;
  });
}
```

### 3.2. Backend: Admin Full Course Retrieval (GAP-02)

#### Route:
`GET /api/admin/courses`  
Guarded by `authenticateJWT` and `requireRole('admin')`.

#### Implementation:
Fetch courses with pagination and search, but **without** filtering by `is_active: true`. Include `enrolled_count`, `capacity`, and `is_active` in the response envelope so admins can view active, inactive, and draft courses.

### 3.3. Client API Client Correction (GAP-01 Frontend)

In `client/src/pages/my-courses/myCoursesApi.ts`:
```typescript
export async function cancelEnrollment(enrollmentId: string): Promise<ApiResponse<Enrollment>> {
  const response = await api.post(`/api/student/enrollments/${enrollmentId}/cancel`);
  return response.data;
}
```

### 3.4. Mobile Navigation Sheet Drawer (GAP-03)

In `client/src/components/layout/MobileNavSheet.tsx`:
- Trigger: Hamburger button with `aria-label="Mở menu"` and `min-h-[44px]`.
- Structure:
  - Fixed backdrop with `bg-black/50 backdrop-blur-sm` animated transition.
  - Slide-in panel positioned `fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 p-6 flex flex-col`.
  - Header with title, close button (`X` icon $\ge 44$px).
  - Body with vertical nav items (`Home`, `My Courses`, `Admin Portal` if applicable).
  - Footer with User Profile and Theme Toggle (Light/Dark).
  - Handles `Escape` key and click-outside dismissal.

### 3.5. Type Safety & Date Formatting (GAP-04 & GAP-05)

- In `client/src/types/index.ts`:
  ```typescript
  export type EnrollmentStatus = 'enrolled' | 'pending' | 'cancelled' | 'confirmed';
  ```
- In `client/src/utils/formatDate.ts`:
  ```typescript
  export function formatDate(dateString: string | Date): string {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d); // Outputs YYYY-MM-DD
  }
  ```

### 3.6. Documentation & Deliverables (GAP-06, GAP-07, GAP-08)

1. **`docs/ERD.md`**:
   - Mermaid diagram with `USERS`, `COURSES`, `ENROLLMENTS`.
   - Markdown data dictionary with primary keys, foreign keys (`onDelete: Restrict`), unique indexes, and audit timestamps.
2. **`docs/screenshots/`**:
   - Automated/manual capture of 7 key endpoint executions using Newman runner.
3. **`README.md`**:
   - Add "Database Migration & Seeding" section.
   - Add "Tài khoản Demo (Demo Accounts)" table with admin and student credentials.

---

## 4. Verification & Testing Matrix

| ID | Test Case | Target Component | Expected Result |
|---|---|---|---|
| TC-01 | Student cancels own enrollment | `POST /api/student/enrollments/:id/cancel` | Status becomes `cancelled`, `enrolled_count` decreases by 1, HTTP 200 |
| TC-02 | Student attempts to cancel another student's enrollment | `POST /api/student/enrollments/:id/cancel` | HTTP 403 Forbidden, IDOR prevented |
| TC-03 | Student attempts to cancel already cancelled enrollment | `POST /api/student/enrollments/:id/cancel` | HTTP 400 Bad Request, idempotent |
| TC-04 | Admin views course list | `GET /api/admin/courses` | Receives both `is_active: true` and `is_active: false` courses |
| TC-05 | Mobile menu test | Mobile viewport `< 768px` | Drawer slides in from right, smooth close on backdrop click |
| TC-06 | Date format test | `formatDate` | Output formatted `YYYY-MM-DD` in `Asia/Ho_Chi_Minh` timezone |
| TC-07 | Documentation check | `docs/ERD.md`, `README.md`, `docs/screenshots/` | All 3 artifacts exist and render cleanly |
