# Implementation Plan: 006 - Admin Course Management (CRUD)

## 1. Technical Context & Stack

- **Target Project Directory**: `/Users/macbookpro/Documents/Work/Prepare/PKS/pks-course-enrollment-portal`
- **Frontend Stack**:
  - React 18 (`react: ^18.3.1`, `react-dom: ^18.3.1`)
  - React Router DOM v6 (`react-router-dom: ^6.27.0`)
  - Vite (`vite: ^5.4.10`)
  - Tailwind CSS v3 (`tailwindcss: ^3.4.14`) + PostCSS + Autoprefixer
  - Radix UI Primitives: `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-slot`
  - Feedback & Icons: `sonner` (`^1.7.0`), `lucide-react` (`^0.454.0`)
  - Styling Utilities: `clsx`, `tailwind-merge`
- **Backend Stack**:
  - Node.js runtime with Express (`express: ^4.21.1`)
  - TypeScript 5.6 (`typescript: ^5.6.3`, `tsx: ^4.19.2`)
  - Database ORM: Prisma Client (`@prisma/client: ^5.21.1`, `prisma: ^5.21.1`)
  - PostgreSQL 15+ hosted on Supabase Cloud
  - Validation: `zod` (`^3.23.8`)
  - Authentication & Security: `jsonwebtoken` (`^9.0.2`), `cors` (`^2.8.5`), `dotenv` (`^16.4.5`)
- **Key Target Files**:
  - Frontend:
    - `client/src/pages/admin/AdminCoursesPage.tsx` (Main admin courses list view)
    - `client/src/components/admin/CourseFormModal.tsx` (Add/Edit modal dialog)
    - `client/src/components/admin/CourseDeleteDialog.tsx` (Safe delete confirmation alert dialog)
    - `client/src/components/admin/CourseTable.tsx` (Accessible data table with skeleton & empty states)
    - `client/src/services/adminCourse.service.ts` (API client integration)
    - `client/src/types/course.ts` (Shared frontend course interfaces)
  - Backend:
    - `server/src/controllers/adminCourse.controller.ts` (HTTP request handlers)
    - `server/src/services/adminCourse.service.ts` (Business logic, capacity check, deletion guard)
    - `server/src/routes/adminCourse.routes.ts` (Route definitions with auth and role middlewares)
    - `server/src/validations/course.validation.ts` (Zod schemas for create, update, toggle)
    - `server/src/routes/index.ts` (Mount admin course routes at `/api/admin/courses`)

---

## 2. Architecture & Governance Gates

- [x] **RBAC Governance**: All endpoints require `authenticateJWT` and `requireRole('admin')`.
- [x] **Dual Theme Semantics**: Light mode and Dark mode with Deep Muted Semantics (Emerald `#065F46`/`#34D399`, Crimson `#991B1B`/`#F87171`, Amber `#92400E`/`#FBBF24`).
- [x] **Mobile Ergonomics**: Interactive targets $\ge 44\text{px}$ (`h-11`), font size on inputs $\ge 16\text{px}$ (`text-base sm:text-sm`).
- [x] **Uniform JSON Envelope**: `{ success: true, data: T, message: string }` and `{ success: false, error: { code, message, details } }`.
- [x] **Capacity Invariant Gate**: Backend strictly validates `capacity >= enrolled_count` on update; throws HTTP 400 `INVALID_CAPACITY`.
- [x] **Safe Deletion Gate**: Backend rejects hard delete if `enrolled_count > 0` or enrollments exist; throws HTTP 409 `COURSE_HAS_ENROLLMENTS`.
- [x] **Sonner Toast**: 100% notification via `sonner`; strictly zero `alert()`.

---

## 3. Data Model (`Course`)

### 3.1. Prisma Schema Mapping
```prisma
model Course {
  id             String       @id @default(uuid())
  title          String
  category       String
  instructor     String
  description    String
  price          Int          // Lưu trữ bằng VND, số nguyên không âm
  capacity       Int          // Sĩ số tối đa, số nguyên dương > 0
  enrolled_count Int          @default(0) // Số học viên đã đăng ký thực tế
  is_active      Boolean      @default(true) // Trạng thái tuyển sinh (Ẩn / Hiện)
  created_at     DateTime     @default(now())
  updated_at     DateTime     @updatedAt
  enrollments    Enrollment[]

  @@index([category])
  @@index([is_active])
  @@map("courses")
}
```

### 3.2. State Transitions of Course Entity
```text
[New Course Form] 
       │
       ▼ (POST /api/admin/courses, capacity > 0, price >= 0)
[is_active: true, enrolled_count: 0] ◄────────┐
       │                                     │ (PATCH status toggle)
       ├─────────────────────────────────────┘
       ▼ (PATCH /api/admin/courses/:id/status, is_active: false)
[is_active: false] (Hidden from public catalog)
       │
       ├─ If enrolled_count == 0 ──► (DELETE /api/admin/courses/:id) ──► [DELETED]
       │
       └─ If enrolled_count > 0  ──► (DELETE attempt) ──► [BLOCKED: 409 COURSE_HAS_ENROLLMENTS]
```

---

## 4. Interface Contracts (RESTful API Specifications)

### 4.1. `GET /api/admin/courses` — Lấy danh sách khóa học quản trị
- **Method**: `GET`
- **Path**: `/api/admin/courses`
- **Headers**:
  - `Authorization: Bearer <jwt_token>` (Admin required)
- **Query Parameters**:
  - `search` (optional, string): Lọc theo tiêu đề hoặc giảng viên
  - `category` (optional, string): Lọc theo danh mục
  - `is_active` (optional, boolean): Lọc theo trạng thái ẩn/hiện (`true`, `false`)
  - `page` (optional, integer, default: 1): Trang hiện tại
  - `limit` (optional, integer, default: 50): Số bản ghi mỗi trang
- **Success Response (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "courses": [
        {
          "id": "c3b88939-2b0e-4de3-b291-768a1f6a1523",
          "title": "Lập Trình Web Fullstack Chuyên Nghiệp (Node.js & React)",
          "category": "Fullstack",
          "instructor": "PKS Master Trainer",
          "description": "Chương trình đào tạo chuẩn doanh nghiệp...",
          "price": 4500000,
          "capacity": 20,
          "enrolled_count": 14,
          "is_active": true,
          "created_at": "2026-11-05T10:00:00.000Z",
          "updated_at": "2026-11-05T10:00:00.000Z"
        }
      ],
      "pagination": {
        "total": 6,
        "page": 1,
        "limit": 50,
        "totalPages": 1
      }
    },
    "message": "Lấy danh sách khóa học thành công"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Token thiếu hoặc hết hạn (`code: "UNAUTHORIZED"`).
  - `403 Forbidden`: Người dùng không có quyền admin (`code: "FORBIDDEN"`).

---

### 4.2. `POST /api/admin/courses` — Tạo mới khóa học
- **Method**: `POST`
- **Path**: `/api/admin/courses`
- **Headers**:
  - `Authorization: Bearer <jwt_token>` (Admin required)
  - `Content-Type: application/json`
- **Request Body Schema (Zod)**:
  ```typescript
  export const createCourseSchema = z.object({
    title: z.string().min(3, "Tiêu đề khóa học phải có ít nhất 3 ký tự").max(255),
    category: z.string().min(1, "Danh mục không được để trống").max(100),
    instructor: z.string().min(2, "Tên giảng viên phải có ít nhất 2 ký tự").max(100),
    description: z.string().min(10, "Mô tả khóa học phải có ít nhất 10 ký tự"),
    price: z.number().int("Học phí phải là số nguyên").min(0, "Học phí không được âm"),
    capacity: z.number().int("Sĩ số phải là số nguyên").min(1, "Sĩ số tối đa phải lớn hơn 0"),
    is_active: z.boolean().optional().default(true)
  });
  ```
- **Success Response (HTTP 201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "e93fbc23-a128-44e2-9d3b-18a77d45f32a",
      "title": "Lập Trình Web Fullstack Chuyên Nghiệp (Node.js & React)",
      "category": "Fullstack",
      "instructor": "PKS Master Trainer",
      "description": "Chương trình đào tạo chuẩn doanh nghiệp...",
      "price": 4500000,
      "capacity": 20,
      "enrolled_count": 0,
      "is_active": true,
      "created_at": "2026-11-06T00:00:00.000Z",
      "updated_at": "2026-11-06T00:00:00.000Z"
    },
    "message": "Tạo khóa học mới thành công"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Body không hợp lệ (`code: "VALIDATION_ERROR"`, kèm chi tiết các trường lỗi).
  - `401 Unauthorized`: Token không hợp lệ (`code: "UNAUTHORIZED"`).
  - `403 Forbidden`: Quyền truy cập bị từ chối (`code: "FORBIDDEN"`).

---

### 4.3. `GET /api/admin/courses/:id` — Chi tiết khóa học quản trị
- **Method**: `GET`
- **Path**: `/api/admin/courses/:id`
- **Headers**:
  - `Authorization: Bearer <jwt_token>` (Admin required)
- **Success Response (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "c3b88939-2b0e-4de3-b291-768a1f6a1523",
      "title": "Lập Trình Web Fullstack Chuyên Nghiệp (Node.js & React)",
      "category": "Fullstack",
      "instructor": "PKS Master Trainer",
      "description": "Chương trình đào tạo...",
      "price": 4500000,
      "capacity": 20,
      "enrolled_count": 14,
      "is_active": true,
      "created_at": "2026-11-05T10:00:00.000Z",
      "updated_at": "2026-11-05T10:00:00.000Z"
    },
    "message": "Lấy chi tiết khóa học thành công"
  }
  ```
- **Error Responses**:
  - `404 Not Found`: Khóa học không tồn tại (`code: "COURSE_NOT_FOUND"`).

---

### 4.4. `PUT /api/admin/courses/:id` — Chỉnh sửa khóa học & Thực thi Bất biến Capacity
- **Method**: `PUT`
- **Path**: `/api/admin/courses/:id`
- **Headers**:
  - `Authorization: Bearer <jwt_token>` (Admin required)
  - `Content-Type: application/json`
- **Request Body Schema (Zod)**:
  ```typescript
  export const updateCourseSchema = z.object({
    title: z.string().min(3).max(255).optional(),
    category: z.string().min(1).max(100).optional(),
    instructor: z.string().min(2).max(100).optional(),
    description: z.string().min(10).optional(),
    price: z.number().int().min(0).optional(),
    capacity: z.number().int().min(1).optional(),
    is_active: z.boolean().optional()
  });
  ```
- **Invariant Implementation Rule**:
  ```typescript
  // In server/src/services/adminCourse.service.ts:
  // Use interactive transaction with row lock / atomic conditional update to eliminate TOCTOU race condition
  return await prisma.$transaction(async (tx) => {
    // 1. Lock the course row exclusively to prevent concurrent student enrollments from interleaving
    const [existingCourse] = await tx.$queryRaw<Course[]>`
      SELECT * FROM "courses"
      WHERE "id" = ${id}::uuid
      FOR UPDATE;
    `;

    if (!existingCourse) {
      throw new NotFoundError('COURSE_NOT_FOUND', 'Khóa học không tồn tại');
    }

    if (payload.capacity !== undefined && payload.capacity < existingCourse.enrolled_count) {
      throw new BadRequestError(
        'INVALID_CAPACITY',
        `Sĩ số tối đa không thể nhỏ hơn số học viên hiện tại: ${existingCourse.enrolled_count}`
      );
    }

    const updated = await tx.course.update({
      where: { id },
      data: payload
    });

    return updated;
  });
  ```
- **Success Response (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "c3b88939-2b0e-4de3-b291-768a1f6a1523",
      "title": "Lập Trình Web Fullstack Chuyên Nghiệp (Node.js & React) - Nâng Cao",
      "category": "Fullstack",
      "instructor": "PKS Master Trainer",
      "description": "Cập nhật mô tả mới...",
      "price": 4500000,
      "capacity": 25,
      "enrolled_count": 14,
      "is_active": true,
      "created_at": "2026-11-05T10:00:00.000Z",
      "updated_at": "2026-11-06T01:15:00.000Z"
    },
    "message": "Cập nhật khóa học thành công"
  }
  ```
- **Error Response (HTTP 400 Bad Request — Invariant Violation)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_CAPACITY",
      "message": "Sĩ số tối đa không thể nhỏ hơn số học viên hiện tại: 14",
      "details": {
        "current_enrolled_count": 14,
        "requested_capacity": 10
      }
    }
  }
  ```

---

### 4.5. `PATCH /api/admin/courses/:id/status` — Chuyển đổi trạng thái Ẩn/Hiện
- **Method**: `PATCH`
- **Path**: `/api/admin/courses/:id/status`
- **Headers**:
  - `Authorization: Bearer <jwt_token>` (Admin required)
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "is_active": false
  }
  ```
- **Success Response (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "c3b88939-2b0e-4de3-b291-768a1f6a1523",
      "is_active": false,
      "updated_at": "2026-11-06T01:20:00.000Z"
    },
    "message": "Cập nhật trạng thái hiển thị khóa học thành công"
  }
  ```

---

### 4.6. `DELETE /api/admin/courses/:id` — Xóa an toàn khóa học
- **Method**: `DELETE`
- **Path**: `/api/admin/courses/:id`
- **Headers**:
  - `Authorization: Bearer <jwt_token>` (Admin required)
- **Safe Deletion Guard Implementation**:
  ```typescript
  // In server/src/services/adminCourse.service.ts:
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      _count: {
        select: { enrollments: true }
      }
    }
  });

  if (!course) {
    throw new NotFoundError('COURSE_NOT_FOUND', 'Khóa học không tồn tại');
  }

  // Guard: If course has enrolled students or enrollment history records
  if (course.enrolled_count > 0 || course._count.enrollments > 0) {
    throw new ConflictError(
      'COURSE_HAS_ENROLLMENTS',
      'Không thể xóa khóa học đã có học viên đăng ký. Vui lòng chuyển sang trạng thái Ẩn.'
    );
  }

  await prisma.course.delete({ where: { id } });
  ```
- **Success Response (HTTP 200 OK — Khóa học có 0 học viên)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "c3b88939-2b0e-4de3-b291-768a1f6a1523"
    },
    "message": "Xóa khóa học thành công"
  }
  ```
- **Error Response (HTTP 409 Conflict — Guard Triggered)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "COURSE_HAS_ENROLLMENTS",
      "message": "Không thể xóa khóa học đã có học viên đăng ký. Vui lòng chuyển sang trạng thái Ẩn.",
      "details": {
        "enrolled_count": 14
      }
    }
  }
  ```

---

## 5. UI Architecture & Component Implementation Plan

### 5.1. Component Tree & Hierarchy
```text
AdminCoursesPage (client/src/pages/admin/AdminCoursesPage.tsx)
 ├── AdminHeader / SubNavbar (Title, Breadcrumbs, Action: "Thêm khóa học")
 ├── FilterBar (Search input, Category dropdown, Clear button)
 ├── CourseTable (client/src/components/admin/CourseTable.tsx)
 │    ├── StateLoading (Skeleton rows)
 │    ├── StateEmpty (No courses found graphic + CTA)
 │    ├── StateError (Error banner + retry button)
 │    └── TableRow (Course data, Badge, Progress bar, Action buttons)
 ├── CourseFormModal (client/src/components/admin/CourseFormModal.tsx)
 │    └── Form (Zod validation, inline errors, capacity >= enrolled invariant check)
 └── CourseDeleteDialog (client/src/components/admin/CourseDeleteDialog.tsx)
      └── AlertDialog (Radix primitive, confirmation prompt, warning if enrolled > 0)
```

### 5.2. UI Contract Compliance Rules
- Every input element must have an associated `<label htmlFor="...">` and `data-testid`.
- Every button must specify its `aria-label` and `data-testid`.
- Dynamic elements:
  - Edit button: `data-testid={`btn-edit-course-${course.id}`}`
  - Delete button: `data-testid={`btn-delete-course-${course.id}`}`
  - Status switch: `data-testid={`btn-toggle-active-${course.id}`}`
  - View enrollments link: `data-testid={`btn-view-enrollments-${course.id}`}`

---

## 6. End-to-End Quickstart Verification Guide

### Scenario 1: Verify Capacity Invariant (HTTP 400 `INVALID_CAPACITY`)
```bash
# 1. Login as Admin to get JWT token
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pks.edu.vn","password":"Admin@123456"}' | jq -r '.data.token')

# 2. Inspect a course with enrolled students (e.g. Fullstack course has 14 enrolled)
COURSE_ID=$(curl -s -X GET http://localhost:5001/api/admin/courses \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.data.courses[0].id')

# 3. Attempt to update capacity to 10 (less than 14)
curl -i -X PUT http://localhost:5001/api/admin/courses/$COURSE_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"capacity": 10}'
# Expected Output: HTTP 400 Bad Request, code: "INVALID_CAPACITY"
```

### Scenario 2: Verify Safe Course Deletion (HTTP 409 `COURSE_HAS_ENROLLMENTS`)
```bash
# Attempt to delete course with enrolled students
curl -i -X DELETE http://localhost:5001/api/admin/courses/$COURSE_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Expected Output: HTTP 409 Conflict, code: "COURSE_HAS_ENROLLMENTS"
```

### Scenario 3: Verify RBAC Protection (HTTP 403 `FORBIDDEN`)
```bash
# 1. Login as Student
STUDENT_TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@pks.edu.vn","password":"Student@123456"}' | jq -r '.data.token')

# 2. Attempt to call Admin Course API
curl -i -X GET http://localhost:5001/api/admin/courses \
  -H "Authorization: Bearer $STUDENT_TOKEN"
# Expected Output: HTTP 403 Forbidden, code: "FORBIDDEN"
```

---

## 7. Implementation Touch-Points & Work Breakdown

| Module | Exact File Path | Responsibility |
|---|---|---|
| BE Validation | `server/src/validations/course.validation.ts` | Zod schema for course creation and updates |
| BE Service | `server/src/services/adminCourse.service.ts` | Database queries, capacity invariant check, deletion guard |
| BE Controller | `server/src/controllers/adminCourse.controller.ts` | HTTP request parsing, response formatting |
| BE Routes | `server/src/routes/adminCourse.routes.ts` | Endpoint routing, middleware binding (`authenticateJWT`, `requireRole('admin')`) |
| BE Router Mount | `server/src/routes/index.ts` | Mount `/api/admin/courses` |
| FE Types | `client/src/types/course.ts` | TypeScript interface declarations |
| FE Service | `client/src/services/adminCourse.service.ts` | Axios/fetch API client wrappers |
| FE Component | `client/src/components/admin/CourseTable.tsx` | Data table with 4 states, badges, progress bar |
| FE Component | `client/src/components/admin/CourseFormModal.tsx` | Add/Edit dialog with validation |
| FE Component | `client/src/components/admin/CourseDeleteDialog.tsx` | Confirmation dialog with deletion warning |
| FE Page | `client/src/pages/admin/AdminCoursesPage.tsx` | Main page coordinator, search/filter state |
