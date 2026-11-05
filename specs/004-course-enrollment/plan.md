# Implementation Plan: 004 - Course Enrollment Engine

**Branch**: `004-course-enrollment`  
**Date**: 2026-11-05  
**Spec Reference**: `specs/004-course-enrollment/spec.md`  
**Target Project**: `pks-course-enrollment-portal`

---

## 1. Technical Context & Stack

- **Target Directory Structure**:
  - `client/src/services/enrollment.service.ts` (API Client for enrollment)
  - `client/src/hooks/useEnrollment.ts` (State hook managing in-flight requests, toasts, and card updates)
  - `client/src/components/CourseCard.tsx` (Card UI with anti-spam button, test IDs, and ARIA roles)
  - `server/src/controllers/enrollment.controller.ts` (Express request handler & error mapping)
  - `server/src/services/enrollment.service.ts` (Core business logic, atomic transaction, and concurrency lock)
  - `server/src/routes/enrollment.routes.ts` (Route definitions guarded by `authenticateJWT` and `requireRole('student')`)
  - `server/src/schemas/enrollment.schema.ts` (Zod validation schemas)
  - `server/prisma/schema.prisma` (Database schema and relations)
- **Frontend Stack**: React 18.3.1, TypeScript 5.6.3, Vite 5.4.10, Tailwind CSS 3.4.14, Radix UI Slot/Dialog, Sonner 1.7.0, Lucide React 0.454.0.
- **Backend Stack**: Node.js, Express 4.21.1, TypeScript 5.6.3, Prisma ORM 5.21.1, Zod 3.23.8, jsonwebtoken 9.0.2.
- **Database Engine**: PostgreSQL 15+ hosted on Supabase Cloud (Port 6543 / 5432).

---

## 2. Architecture & Governance Gates

- [x] **Concurrency & Race Condition Gate**: Implements atomic conditional update and PostgreSQL row-level locking (`SELECT ... FOR UPDATE` or conditional `UPDATE`) within a Prisma interactive transaction. Overbooking is impossible.
- [x] **Data Integrity Gate**: Enforces database-level uniqueness via `@@unique([user_id, course_id])`.
- [x] **RBAC Gate**: Endpoint restricted to authenticated users with `role === 'student'`. Admin calls receive HTTP 403 Forbidden.
- [x] **Uniform JSON Envelope Gate**: All success responses follow `{ success: true, data: ..., message: "..." }`; all errors follow `{ success: false, error: { code: "...", message: "...", details: ... } }`.
- [x] **Feedback Gate**: Sonner toast is used for all notifications; native `alert()` is strictly prohibited.
- [x] **Mobile-First Touch Gate**: All clickable elements maintain height $\ge 44\text{px}$ (`h-11`).
- [x] **Dual Theme Gate**: Deep Emerald and Deep Crimson semantic tokens applied with dark mode variants.

---

## 3. Concurrency Protection & Invariant Implementation Strategy

### 3.1. The Race Condition Problem
When a course has `capacity = 20` and `enrolled_count = 19`, 5 simultaneous requests could all read `enrolled_count = 19` in an uncommitted read. Without atomic locks, each worker would proceed to insert an enrollment and set `enrolled_count = 20`, producing 5 new records and resulting in 24 enrolled students (overbooking by 4 seats).

### 3.2. Solution Architecture: Conditional Atomic Update in Interactive Transaction

We employ a two-step transactional protocol in PostgreSQL via Prisma:

```typescript
// server/src/services/enrollment.service.ts
import { prisma } from '../config/database.js';
import { ConflictError, NotFoundError, BadRequestError } from '../errors/appErrors.js';

export async function enrollCourse(userId: string, courseId: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Check if course exists and is active
    const course = await tx.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, capacity: true, enrolled_count: true, is_active: true }
    });

    if (!course) {
      throw new NotFoundError('COURSE_NOT_FOUND', 'Khóa học không tồn tại');
    }

    if (!course.is_active) {
      throw new BadRequestError('COURSE_INACTIVE', 'Khóa học hiện không mở đăng ký');
    }

    // 2. Check for duplicate enrollment (Application level check)
    const existingEnrollment = await tx.enrollment.findUnique({
      where: {
        userId_courseId: {
          user_id: userId,
          course_id: courseId
        }
      }
    });

    if (existingEnrollment) {
      throw new ConflictError('ALREADY_ENROLLED', 'Bạn đã đăng ký khóa học này rồi');
    }

    // 3. ATOMIC CONDITIONAL UPDATE:
    // Execute conditional update that only increments IF current enrolled_count < capacity
    // This utilizes row-level locking at Postgres engine level.
    const updateResult = await tx.$executeRaw`
      UPDATE "courses"
      SET "enrolled_count" = "enrolled_count" + 1,
          "updated_at" = NOW()
      WHERE "id" = ${courseId}::uuid
        AND "enrolled_count" < "capacity"
        AND "is_active" = true;
    `;

    // If updateResult === 0, the course was already full or reached capacity concurrently
    if (updateResult === 0) {
      throw new ConflictError('CAPACITY_FULL', 'Khóa học đã đủ sĩ số tối đa');
    }

    // 4. Create the Enrollment record (with P2002 race condition handling)
    try {
      const enrollment = await tx.enrollment.create({
        data: {
          user_id: userId,
          course_id: courseId,
          status: 'enrolled'
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              category: true,
              instructor: true,
              capacity: true,
              enrolled_count: true
            }
          }
        }
      });

      return enrollment;
    } catch (error: any) {
      // Prisma error P2002: Unique constraint failed on the fields: (`user_id`,`course_id`)
      if (error?.code === 'P2002') {
        throw new ConflictError('ALREADY_ENROLLED', 'Bạn đã đăng ký khóa học này rồi');
      }
      throw error;
    }
  }, {
    // Transaction options: ReadCommitted / Serializable isolation
    maxWait: 5000,
    timeout: 10000
  });
}
```

### 3.3. Mathematical Proof of Correctness
- **Initial condition**: $enrolled\_count \le capacity$.
- **Transition rule**: $enrolled\_count \leftarrow enrolled\_count + 1 \iff enrolled\_count < capacity$.
- In PostgreSQL, `UPDATE ... WHERE id = :id AND enrolled_count < capacity` acquires an exclusive row-level write lock on the target tuple.
- If $K$ threads execute this simultaneously, the first acquiring thread sees $enrolled\_count = capacity - 1$, updates to $capacity$, and releases the lock.
- All remaining $K - 1$ threads acquire the lock sequentially, evaluate `enrolled_count < capacity` ($capacity < capacity \equiv \text{False}$), update 0 rows, and throw `CAPACITY_FULL`.
- Therefore, $enrolled\_count \le capacity$ is maintained for all possible execution interleavings.

---

## 4. Data Model & Schema

### 4.1. Prisma Schema Mapping
```prisma
enum EnrollmentStatus {
  enrolled
  confirmed
  cancelled
  pending
}

model Course {
  id             String       @id @default(uuid())
  title          String
  category       String
  instructor     String
  description    String
  price          Int          // VND (0 = Free)
  capacity       Int
  enrolled_count Int          @default(0)
  is_active      Boolean      @default(true)
  created_at     DateTime     @default(now())
  updated_at     DateTime     @updatedAt
  enrollments    Enrollment[]

  @@index([category])
  @@index([is_active])
  @@map("courses")
}

model Enrollment {
  id         String           @id @default(uuid())
  user_id    String
  course_id  String
  status     EnrollmentStatus @default(enrolled)
  created_at DateTime         @default(now())
  updated_at DateTime         @updatedAt
  user       User             @relation(fields: [user_id], references: [id], onDelete: Cascade)
  course     Course           @relation(fields: [course_id], references: [id], onDelete: Restrict)

  @@unique([user_id, course_id])
  @@index([user_id])
  @@index([course_id])
  @@map("enrollments")
}
```

---

## 5. Interface Contracts & API Specifications

### 5.1. Primary Enrollment Endpoint

- **Endpoint**: `POST /api/courses/:id/enroll` (Alias: `POST /api/enrollments`)
- **Method**: `POST`
- **Security**: Bearer JWT (`Authorization: Bearer <token>`)
- **RBAC**: `req.user.role === 'student'`

#### Request Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### Request Parameters
- `id` (path, required): UUID string of the course.

#### Request Body
```json
{}
```
*(No payload required since student identity is extracted from JWT and course ID from path).*

#### Response Scenarios

##### 1. Success Response (HTTP 201 Created)
```json
{
  "success": true,
  "data": {
    "id": "e4b3c8f1-8219-4972-bb20-1a7f6920391d",
    "user_id": "9a12c8b4-f654-4a21-9981-d10293847561",
    "course_id": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
    "status": "enrolled",
    "created_at": "2026-11-05T17:30:00.000Z",
    "course": {
      "id": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
      "title": "Lập Trình Web Fullstack Chuyên Nghiệp (Node.js & React)",
      "category": "Fullstack Web",
      "instructor": "PKS Senior Mentors",
      "capacity": 20,
      "enrolled_count": 15
    }
  },
  "message": "Ghi danh khóa học thành công!"
}
```

##### 2. Duplicate Enrollment Error (HTTP 409 Conflict)
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_ENROLLED",
    "message": "Bạn đã đăng ký khóa học này rồi",
    "details": null
  }
}
```

##### 3. Capacity Full / Race Condition Error (HTTP 409 Conflict)
```json
{
  "success": false,
  "error": {
    "code": "CAPACITY_FULL",
    "message": "Khóa học đã đủ sĩ số tối đa",
    "details": null
  }
}
```

##### 4. Inactive Course Error (HTTP 400 Bad Request)
```json
{
  "success": false,
  "error": {
    "code": "COURSE_INACTIVE",
    "message": "Khóa học hiện không mở đăng ký",
    "details": null
  }
}
```

##### 5. Course Not Found Error (HTTP 404 Not Found)
```json
{
  "success": false,
  "error": {
    "code": "COURSE_NOT_FOUND",
    "message": "Khóa học không tồn tại",
    "details": null
  }
}
```

##### 6. Unauthorized Error (HTTP 401 Unauthorized)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Vui lòng đăng nhập để tiếp tục",
    "details": null
  }
}
```

##### 7. Forbidden Role Error (HTTP 403 Forbidden)
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Tài khoản quản trị viên không thể ghi danh khóa học",
    "details": null
  }
}
```

---

## 6. Frontend Architecture & UI Component Plan

### 6.1. State Hook: `useEnrollment`
```typescript
// client/src/hooks/useEnrollment.ts
interface UseEnrollmentReturn {
  isEnrolling: boolean;
  enroll: (courseId: string) => Promise<boolean>;
}
```
- Manages `isEnrolling` state.
- Handles guest redirection to `/login?returnUrl=/courses/:id`.
- Triggers `toast.success` on HTTP 201.
- Triggers `toast.error` on HTTP 409 / 400 / 500.
- Re-fetches catalog or updates local course state immutably.

### 6.2. UI Component Modifications: `CourseCard.tsx`
- Bind `data-testid="btn-enroll-[course.id]"`.
- Add `aria-label="Ghi danh khóa học ${course.title}"`.
- Handle 4 states:
  - Open: Zinc button with text `"Ghi danh"`.
  - In-flight: Button disabled with `<Loader2 className="animate-spin h-4 w-4 mr-2" />` and text `"Đang xử lý..."`.
  - Enrolled: Disabled button with text `"Đã ghi danh"`.
  - Full: Disabled button with text `"Hết chỗ"`.
- Replace any lingering native `alert()` with `useEnrollment` hook.

---

## 7. Quickstart & Verification Guide

### 7.1. Concurrency Benchmark Test
Create an automated concurrency test script at `server/tests/concurrency_enroll.ts`:
```typescript
import axios from 'axios';

async function testConcurrency() {
  const courseId = 'target-course-id-with-1-seat-left';
  const tokens = ['student_token_1', 'student_token_2', 'student_token_3'];

  const promises = tokens.map(token =>
    axios.post(`http://localhost:5000/api/courses/${courseId}/enroll`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => ({ status: res.status, data: res.data }))
      .catch(err => ({ status: err.response.status, data: err.response.data }))
  );

  const results = await Promise.all(promises);
  console.log('Results:', results);
  // Expect exactly ONE 201 Created and TWO 409 Conflict (CAPACITY_FULL)
}
```
