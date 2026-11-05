# Implementation Plan: 007 - Admin Enrollment Tracking & Management

## 1. Technical Context & Stack

- **Target Project Directory**: `/Users/macbookpro/Documents/Work/Prepare/PKS/pks-course-enrollment-portal`
- **Frontend Stack**:
  - React 18 (`react: ^18.3.1`, `react-dom: ^18.3.1`)
  - React Router DOM v6 (`react-router-dom: ^6.27.0`)
  - Vite (`vite: ^5.4.10`)
  - Tailwind CSS v3 (`tailwindcss: ^3.4.14`)
  - UI Utilities & Icons: `clsx`, `tailwind-merge`, `lucide-react`, `sonner`
  - Date Formatter: Custom helper `formatDate.ts` using `Intl.DateTimeFormat` with timezone `Asia/Ho_Chi_Minh`
- **Backend Stack**:
  - Express.js with TypeScript (`express: ^4.21.1`, `tsx: ^4.19.2`)
  - Prisma ORM (`@prisma/client: ^5.21.1`, `prisma: ^5.21.1`)
  - PostgreSQL 15+ hosted on Supabase Cloud
  - Validation: `zod` (`^3.23.8`)
  - Authentication & Authorization: `jsonwebtoken` (JWT), `authenticateJWT`, `requireRole('admin')`
- **Key Target Files**:
  - Frontend:
    - `client/src/pages/admin/AdminEnrollmentsPage.tsx` (Main enrollment management view)
    - `client/src/components/admin/EnrollmentTable.tsx` (Accessible table with status change dropdowns and badges)
    - `client/src/components/admin/EnrollmentStatsCard.tsx` (Summary metrics for current course: capacity, enrolled, available)
    - `client/src/services/adminEnrollment.service.ts` (API integration client)
    - `client/src/types/enrollment.ts` (TypeScript interfaces)
  - Backend:
    - `server/src/controllers/adminEnrollment.controller.ts` (Controller handlers)
    - `server/src/services/adminEnrollment.service.ts` (Service logic with Prisma interactive transaction and atomic counter synchronization)
    - `server/src/routes/adminEnrollment.routes.ts` (Express routes guarded by JWT and admin role)
    - `server/src/validations/enrollment.validation.ts` (Zod validation schemas)
    - `server/src/routes/index.ts` (Route mounting)

---

## 2. Architecture & Governance Gates

- [x] **RBAC Protection**: Strict middleware enforcement `authenticateJWT` + `requireRole('admin')`.
- [x] **Timezone Invariant**: Standardized to `Asia/Ho_Chi_Minh` (UTC+7), date formatted `YYYY-MM-DD`.
- [x] **Atomic Counter Synchronization & Concurrency Gate**:
  - Using `prisma.$transaction(async (tx) => { ... })` with exclusive row lock (`SELECT ... FOR UPDATE`) on target enrollment row.
  - Decrementing `enrolled_count` on status transition to `cancelled`.
  - Verifying `enrolled_count < capacity` before incrementing on transition from `cancelled` to active.
  - Rejecting with HTTP 409 `CAPACITY_FULL` if course is full.
- [x] **Uniform JSON Response**: `{ success: true, data: T, message: string }` and standard error structure.
- [x] **UI Contract Compliance**: 100% interactive elements have Semantic Role, Accessibility Label, and `data-testid`.
- [x] **Feedback Discipline**: Sonner Toast notifications; strictly zero `alert()`.

---

## 3. Data Model & Database Mapping

### 3.1. Prisma Schema Relations
```prisma
enum EnrollmentStatus {
  enrolled
  confirmed
  cancelled
  pending
}

model Enrollment {
  id         String           @id @default(uuid())
  user_id    String
  course_id  String
  status     EnrollmentStatus @default(enrolled)
  created_at DateTime         @default(now())
  updated_at DateTime         @updatedAt

  user   User   @relation(fields: [user_id], references: [id], onDelete: Cascade)
  course Course @relation(fields: [course_id], references: [id], onDelete: Restrict)

  @@unique([user_id, course_id])
  @@index([user_id])
  @@index([course_id])
  @@map("enrollments")
}
```

---

## 4. Interface Contracts (RESTful API Specifications)

### 4.1. `GET /api/admin/courses/:id/enrollments` — Xem danh sách học viên theo khóa học
- **Method**: `GET`
- **Path**: `/api/admin/courses/:id/enrollments`
- **Headers**:
  - `Authorization: Bearer <jwt_token>` (Admin required)
- **Path Parameters**:
  - `id` (string, UUID): Course ID
- **Query Parameters**:
  - `search` (optional, string): Tìm kiếm theo tên hoặc email của học viên
  - `status` (optional, enum: `enrolled`, `confirmed`, `cancelled`, `pending`): Lọc theo trạng thái
- **Success Response (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "course": {
        "id": "c3b88939-2b0e-4de3-b291-768a1f6a1523",
        "title": "Lập Trình Web Fullstack Chuyên Nghiệp (Node.js & React)",
        "capacity": 20,
        "enrolled_count": 14,
        "is_active": true
      },
      "enrollments": [
        {
          "id": "e4a191f2-51b2-4cd8-89c5-341e457f0011",
          "user_id": "u1b99391-2a0e-4de3-b291-768a1f6a0001",
          "name": "Nguyễn Văn Học Viên",
          "email": "student@pks.edu.vn",
          "course_title": "Lập Trình Web Fullstack Chuyên Nghiệp (Node.js & React)",
          "registration_date": "2026-11-05",
          "status": "enrolled",
          "created_at": "2026-11-05T03:30:00.000Z",
          "updated_at": "2026-11-05T03:30:00.000Z"
        }
      ],
      "total": 14
    },
    "message": "Lấy danh sách học viên ghi danh thành công"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Token thiếu hoặc hết hạn (`code: "UNAUTHORIZED"`).
  - `403 Forbidden`: Người dùng không phải là admin (`code: "FORBIDDEN"`).
  - `404 Not Found`: Khóa học không tồn tại (`code: "COURSE_NOT_FOUND"`).

---

### 4.2. `PUT /api/admin/enrollments/:id/status` — Cập nhật trạng thái ghi danh & Đồng bộ sĩ số nguyên tử
- **Method**: `PUT`
- **Path**: `/api/admin/enrollments/:id/status`
- **Headers**:
  - `Authorization: Bearer <jwt_token>` (Admin required)
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id` (string, UUID): Enrollment ID
- **Request Body Schema (Zod)**:
  ```typescript
  export const updateEnrollmentStatusSchema = z.object({
    status: z.enum(['enrolled', 'confirmed', 'cancelled', 'pending'], {
      errorMap: () => ({ message: "Trạng thái ghi danh không hợp lệ. Cho phép: enrolled, confirmed, cancelled, pending" })
    })
  });
  ```
- **Atomic Transaction & Counter Synchronization Logic**:
  ```typescript
  // In server/src/services/adminEnrollment.service.ts:
  type EnrollmentWithCourse = Enrollment & { capacity: number; enrolled_count: number };

  return await prisma.$transaction(async (tx) => {
    // 1. Lock the enrollment row exclusively to prevent concurrent state updates to the same record
    const [enrollment] = await tx.$queryRaw<EnrollmentWithCourse[]>`
      SELECT e.*, c.capacity, c.enrolled_count
      FROM "enrollments" e
      JOIN "courses" c ON e.course_id = c.id
      WHERE e.id = ${enrollmentId}::uuid
      FOR UPDATE;
    `;

    if (!enrollment) {
      throw new NotFoundError('ENROLLMENT_NOT_FOUND', 'Không tìm thấy thông tin ghi danh');
    }

    const oldStatus = enrollment.status;
    const newStatus = payload.status;

    if (oldStatus === newStatus) {
      return enrollment;
    }

    // All active statuses ('enrolled', 'confirmed', 'pending') hold a seat in enrolled_count
    const isSeatHoldingStatus = (s: string) => s === 'enrolled' || s === 'confirmed' || s === 'pending';
    const isCancelledStatus = (s: string) => s === 'cancelled';

    // 2. Manage atomic counter transitions
    if (isSeatHoldingStatus(oldStatus) && isCancelledStatus(newStatus)) {
      // Transitioning from active to cancelled -> Atomic decrement
      await tx.course.update({
        where: { id: enrollment.course_id },
        data: {
          enrolled_count: { decrement: 1 }
        }
      });
    } else if (isCancelledStatus(oldStatus) && isSeatHoldingStatus(newStatus)) {
      // Transitioning from cancelled to active -> Atomic conditional update to eliminate TOCTOU overbooking race condition
      const updateResult = await tx.$executeRaw`
        UPDATE "courses"
        SET "enrolled_count" = "enrolled_count" + 1,
            "updated_at" = NOW()
        WHERE "id" = ${enrollment.course_id}::uuid
          AND "enrolled_count" < "capacity";
      `;

      if (updateResult === 0) {
        throw new ConflictError(
          'CAPACITY_FULL',
          `Khóa học đã đủ sĩ số tối đa (${enrollment.capacity}/${enrollment.capacity}). Không thể kích hoạt lại học viên này.`
        );
      }
    }
    // Note: transitions between seat-holding statuses (e.g. pending -> confirmed, enrolled -> confirmed) maintain the held seat (delta = 0).

    // 3. Update Enrollment status
    const updatedEnrollment = await tx.enrollment.update({
      where: { id: enrollmentId },
      data: { status: newStatus }
    });

    return updatedEnrollment;
  });
  ```
- **Success Response (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "e4a191f2-51b2-4cd8-89c5-341e457f0011",
      "user_id": "u1b99391-2a0e-4de3-b291-768a1f6a0001",
      "course_id": "c3b88939-2b0e-4de3-b291-768a1f6a1523",
      "status": "cancelled",
      "updated_at": "2026-11-06T02:00:00.000Z"
    },
    "message": "Cập nhật trạng thái ghi danh thành công"
  }
  ```
- **Error Response (HTTP 409 Conflict — Capacity Full Guard)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "CAPACITY_FULL",
      "message": "Khóa học đã đủ sĩ số tối đa (20/20). Không thể kích hoạt lại học viên này.",
      "details": {
        "capacity": 20,
        "enrolled_count": 20
      }
    }
  }
  ```

---

## 5. UI Architecture & Component Implementation Plan

### 5.1. Component Tree & Hierarchy
```text
AdminEnrollmentsPage (client/src/pages/admin/AdminEnrollmentsPage.tsx)
 ├── CourseSelector (Dropdown with data-testid="select-course-enrollment")
 ├── EnrollmentStatsCard (client/src/components/admin/EnrollmentStatsCard.tsx)
 │    └── Metrics: Total Capacity, Enrolled Count, Seats Available
 ├── FilterToolbar (Search input, Status dropdown filter)
 └── EnrollmentTable (client/src/components/admin/EnrollmentTable.tsx)
      ├── StateLoading (Skeleton rows)
      ├── StateEmpty (No students registered empty graphic)
      ├── StateError (Error banner with retry button)
      └── EnrollmentRow (Student name, email, formatted date, Status badge, Action selector)
```

### 5.2. UI Contract Compliance Rules
- Course selector: `<select aria-label="Chọn khóa học để xem danh sách ghi danh" data-testid="select-course-enrollment">`
- Status dropdown per row: `<select aria-label="Thay đổi trạng thái ghi danh" data-testid={`select-enrollment-status-${enrollment.id}`}>`
- Status badge per row: `<span role="status" data-testid={`badge-enrollment-status-${enrollment.id}`}>`
- Loading Skeleton: container `data-testid="state-loading-enrollments"`
- Empty state: container `data-testid="state-empty-enrollments"`
- Error state: container `data-testid="state-error-enrollments"`

---

## 6. End-to-End Quickstart Verification Guide

### Scenario 1: Verify Status Change to `cancelled` and Decrement of `enrolled_count`
```bash
# 1. Login as Admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pks.edu.vn","password":"Admin@123456"}' | jq -r '.data.token')

# 2. Get enrollments for course
ENROLLMENT_DATA=$(curl -s -X GET http://localhost:5001/api/admin/courses/$COURSE_ID/enrollments \
  -H "Authorization: Bearer $ADMIN_TOKEN")
ENROLLMENT_ID=$(echo $ENROLLMENT_DATA | jq -r '.data.enrollments[0].id')

# 3. Cancel enrollment
curl -i -X PUT http://localhost:5001/api/admin/enrollments/$ENROLLMENT_ID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"cancelled"}'
# Expected Output: HTTP 200 OK.
# Course enrolled_count decrements by 1.
```

### Scenario 2: Verify Capacity Overflow Block when Re-activating (HTTP 409 `CAPACITY_FULL`)
```bash
# 1. On a course with capacity full (e.g. MOS Excel Expert 25/25)
# 2. Attempt to reactivate a cancelled enrollment
curl -i -X PUT http://localhost:5001/api/admin/enrollments/$CANCELLED_ENROLLMENT_ID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}'
# Expected Output: HTTP 409 Conflict, code: "CAPACITY_FULL"
```

---

## 7. Implementation Touch-Points & Work Breakdown

| Module | Exact File Path | Responsibility |
|---|---|---|
| BE Validation | `server/src/validations/enrollment.validation.ts` | Zod schema for enrollment status update |
| BE Service | `server/src/services/adminEnrollment.service.ts` | List enrollments, transaction logic for atomic counter sync |
| BE Controller | `server/src/controllers/adminEnrollment.controller.ts` | HTTP handlers for enrollments list and status update |
| BE Routes | `server/src/routes/adminEnrollment.routes.ts` | Endpoints with `authenticateJWT` and `requireRole('admin')` |
| BE Router Mount | `server/src/routes/index.ts` | Mount `/api/admin/courses/:id/enrollments` and `/api/admin/enrollments` |
| FE Types | `client/src/types/enrollment.ts` | TypeScript interfaces for enrollment and student data |
| FE Service | `client/src/services/adminEnrollment.service.ts` | API client methods for fetching enrollments and updating status |
| FE Component | `client/src/components/admin/EnrollmentTable.tsx` | Accessible table with 4 states, status selector, badges |
| FE Component | `client/src/components/admin/EnrollmentStatsCard.tsx` | Summary metrics card |
| FE Page | `client/src/pages/admin/AdminEnrollmentsPage.tsx` | Course selection coordinator, filter state, toast feedback |
