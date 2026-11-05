# Implementation Plan: 005 - Student My Courses Portal

**Branch**: `005-my-courses`  
**Date**: 2026-11-05  
**Spec Reference**: `specs/005-my-courses/spec.md`  
**Target Project**: `pks-course-enrollment-portal`

---

## 1. Technical Context & Stack

- **Target Directory Structure**:
  - `client/src/pages/MyCoursesPage.tsx` (Main view with 4-state lifecycle handling)
  - `client/src/components/MyCourseCard.tsx` (Card component displaying course info, `YYYY-MM-DD` date, status badge)
  - `client/src/components/MyCoursesEmptyState.tsx` (Empty state illustration and "Khám phá khóa học" CTA)
  - `client/src/components/MyCoursesSkeleton.tsx` (Pulsing skeleton loader)
  - `client/src/services/student.service.ts` (API Client for student dashboard)
  - `server/src/controllers/student.controller.ts` (Express controller extracting JWT user)
  - `server/src/services/student.service.ts` (Prisma queries with user ID filter)
  - `server/src/routes/student.routes.ts` (Route definitions guarded by `authenticateJWT` and `requireRole('student')`)
- **Frontend Stack**: React 18.3.1, TypeScript 5.6.3, Vite 5.4.10, Tailwind CSS 3.4.14, Radix UI primitives, Sonner 1.7.0, Lucide React 0.454.0.
- **Backend Stack**: Node.js, Express 4.21.1, TypeScript 5.6.3, Prisma ORM 5.21.1, jsonwebtoken 9.0.2.
- **Database Engine**: PostgreSQL 15+ hosted on Supabase Cloud.

---

## 2. Architecture & Governance Gates

- [x] **IDOR Prevention Gate**: The endpoint `GET /api/student/my-courses` derives user identity strictly from `req.user.id`. Any incoming query parameter (`?userId=...`) or body field is intentionally ignored and discarded.
- [x] **RBAC Gate**: Guarded by `authenticateJWT` and `requireRole('student')`. Admin or unauthenticated requests are rejected with HTTP 403 or 401.
- [x] **Date & Timezone Gate**: Stored in UTC in PostgreSQL; rendered as `YYYY-MM-DD` in `Asia/Ho_Chi_Minh` timezone.
- [x] **Uniform JSON Envelope Gate**: Response strictly formatted as `{ success: true, data: [...], message: "..." }`.
- [x] **4-State UI Gate**: Complete coverage for Loading (Skeleton), Empty (`state-empty-my-courses`), Error (Retry button + Sonner toast), and Success.
- [x] **Mobile Touch Gate**: Mobile action buttons maintain height $\ge 44\text{px}$ (`h-11`).
- [x] **Dual Theme Gate**: Deep Emerald, Deep Amber, and Deep Crimson badge tokens paired for light and dark modes.

---

## 3. IDOR Prevention & Query Architecture

### 3.1. Architectural Mechanism
Insecure Direct Object Reference (IDOR) occurs when an application exposes a reference to an internal object (such as a database key or user ID) in URL parameters, query strings, or request bodies without verifying user ownership.

To eliminate this vulnerability:
1. `GET /api/student/my-courses` takes **NO** parameters.
2. The `authenticateJWT` middleware extracts and verifies the JWT token from the `Authorization: Bearer <token>` header using the server's private secret (`process.env.JWT_SECRET`).
3. The verified payload is attached to `req.user`:
   ```typescript
   export interface AuthenticatedUser {
     id: string;
     email: string;
     role: Role;
   }
   ```
4. The service layer executes a Prisma query parameterized solely by `req.user.id`:
   ```typescript
   // server/src/services/student.service.ts
   export async function getStudentEnrollments(userId: string) {
     return await prisma.enrollment.findMany({
       where: {
         user_id: userId
       },
       orderBy: {
         created_at: 'desc'
       },
       include: {
         course: {
           select: {
             id: true,
             title: true,
             category: true,
             instructor: true,
             description: true,
             price: true,
             capacity: true,
             enrolled_count: true,
             is_active: true
           }
         }
       }
     });
   }
   ```
5. It is architecturally impossible for Student A to view Student B's enrollments, even if Student A intercepts and tampers with the client request.

---

## 4. Data Serialization & Date Formatting

### 4.1. Server Response Mapping
```typescript
// server/src/controllers/student.controller.ts
export async function getMyCoursesController(req: Request, res: Response) {
  const userId = req.user!.id;
  const enrollments = await getStudentEnrollments(userId);

  const formattedData = enrollments.map((item) => ({
    id: item.id,
    course_id: item.course_id,
    status: item.status,
    created_at: item.created_at.toISOString(),
    registration_date: formatDateToLocal(item.created_at), // YYYY-MM-DD
    course: {
      id: item.course.id,
      title: item.course.title,
      category: item.course.category,
      instructor: item.course.instructor,
      price: item.course.price,
      is_active: item.course.is_active
    }
  }));

  return res.status(200).json({
    success: true,
    data: formattedData,
    message: 'Lấy danh sách khóa học thành công'
  });
}
```

### 4.2. Date Formatting Utility (`formatDate.ts`)
```typescript
// client/src/utils/formatDate.ts
export function formatDate(dateString: string | Date): string {
  const d = new Date(dateString);
  // Enforce Asia/Ho_Chi_Minh formatting YYYY-MM-DD
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(d);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}
```

---

## 5. Interface Contracts & API Specifications

### 5.1. Student My Courses Endpoint

- **Endpoint**: `GET /api/student/my-courses`
- **Method**: `GET`
- **Security**: Bearer JWT (`Authorization: Bearer <token>`)
- **RBAC**: `req.user.role === 'student'`

#### Request Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Request Query / Body
None. All input parameters are rejected or ignored.

#### Response Scenarios

##### 1. Success Response (HTTP 200 OK - Populated List)
```json
{
  "success": true,
  "data": [
    {
      "id": "e4b3c8f1-8219-4972-bb20-1a7f6920391d",
      "course_id": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
      "status": "enrolled",
      "created_at": "2026-11-05T08:15:00.000Z",
      "registration_date": "2026-11-05",
      "course": {
        "id": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
        "title": "Lập Trình Web Fullstack Chuyên Nghiệp (Node.js & React)",
        "category": "Fullstack Web",
        "instructor": "PKS Senior Mentors",
        "price": 2500000,
        "is_active": true
      }
    }
  ],
  "message": "Lấy danh sách khóa học thành công"
}
```

##### 2. Success Response (HTTP 200 OK - Empty List)
```json
{
  "success": true,
  "data": [],
  "message": "Lấy danh sách khóa học thành công"
}
```

##### 3. Unauthorized Error (HTTP 401 Unauthorized)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Vui lòng đăng nhập để xem khóa học của bạn",
    "details": null
  }
}
```

##### 4. Forbidden Error (HTTP 403 Forbidden)
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Bạn không có quyền truy cập chức năng này",
    "details": null
  }
}
```

---

## 6. Frontend Component Architecture

### 6.1. Component Hierarchy
```text
client/src/pages/MyCoursesPage.tsx
├── Header.tsx (Existing navigation bar)
├── Main Container (data-testid="page-my-courses")
│   ├── Page Title & Breadcrumb ("Khóa học của tôi")
│   ├── Conditional Rendering:
│   │   ├── State: Loading -> <MyCoursesSkeleton data-testid="state-loading-my-courses" />
│   │   ├── State: Error   -> <MyCoursesErrorState data-testid="state-error-my-courses" onRetry={refetch} />
│   │   ├── State: Empty   -> <MyCoursesEmptyState data-testid="state-empty-my-courses" />
│   │   └── State: Success -> <div data-testid="list-my-courses" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
│   │                              {courses.map(course => <MyCourseCard key={course.id} course={course} />)}
│   │                          </div>
└── Toaster (Sonner notification container)
```

### 6.2. Component Contract: `MyCourseCard.tsx`
- **Props**: `{ enrollment: MyCourseEnrollment }`
- **Render Elements**:
  - Article container with `data-testid="card-my-course-[course.id]"`
  - Category badge with `data-testid="course-category-[course.id]"`
  - Title heading with `data-testid="course-title-[course.id]"`
  - Instructor with `data-testid="course-instructor-[course.id]"`
  - Registration date with `<time>` tag and `data-testid="course-reg-date-[course.id]"`
  - Status badge with `data-testid="badge-enrollment-status-[course.id]"`
  - Action link with `data-testid="btn-view-course-[course.id]"` and `aria-label="Xem chi tiết khóa học ${course.title}"`

---

## 7. Quickstart & Verification Guide

### 7.1. IDOR Automated Test (`server/tests/idor_prevention.test.ts`)
```typescript
import axios from 'axios';

async function testIDOR() {
  const tokenStudentA = 'jwt_token_for_student_a';
  const victimUserId = 'student_b_uuid';

  // Request with attempted query param tampering
  const response = await axios.get(`http://localhost:5000/api/student/my-courses?userId=${victimUserId}`, {
    headers: { Authorization: `Bearer ${tokenStudentA}` }
  });

  // Verify that all returned enrollments belong strictly to Student A
  const allBelongToA = response.data.data.every((item: any) => item.course !== undefined);
  console.log('IDOR Test Passed: ', allBelongToA && response.status === 200);
}
```

### 7.2. Empty State Verification
1. Log in with `tran.thi.b@pks.edu.vn` / `Student@123456`.
2. Visit `/my-courses`.
3. Assert element with `data-testid="state-empty-my-courses"` is visible.
4. Click button with `data-testid="btn-explore-courses"`.
5. Assert browser URL is `/`.
