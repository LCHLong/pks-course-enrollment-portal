# Implementation Plan: 003-course-details

**Feature Name**: Course Details View & Authentication Redirect (Chi tiết Khóa học & Chuyển hướng Xác thực)  
**Branch**: `003-course-details`  
**Status**: Ready for Implementation  
**Spec Reference**: `specs/003-course-details/spec.md`  
**Target Monorepo**: `/Users/macbookpro/Documents/Work/Prepare/PKS/pks-course-enrollment-portal`

---

## 1. Technical Context & Stack

### 1.1. Monorepo Ecosystem
- **Frontend Stack**:
  - React 18 (`react: ^18.3.1`, `react-dom: ^18.3.1`)
  - Routing: `react-router-dom: ^6.27.0` (`useParams`, `useNavigate`, `useSearchParams`, `useLocation`)
  - Styling: Tailwind CSS v3 with Deep Muted Semantics and Zinc grays
  - Icons: Lucide React (`lucide-react: ^0.454.0`)
  - Notifications: Sonner toast (`sonner: ^1.7.0`)
  - TypeScript: Strict type checks (`noUnusedLocals: true`)
- **Backend Stack**:
  - Node.js LTS + Express (`express: ^4.21.1`)
  - ORM: Prisma Client (`@prisma/client: ^5.21.1`)
  - Database: PostgreSQL 15+ (Supabase Cloud)
  - Validation: Zod (`zod: ^3.23.8`)
  - Auth: Optional JWT extraction via `authMiddleware` (HS256)
- **Timezone & Currency**:
  - `Asia/Ho_Chi_Minh`
  - Vietnamese Dong (`VND`) with non-breaking space `\u00A0₫`

---

## 2. Architecture & Governance Gates

- [x] **Authentication Return Flow**: When an unauthenticated user clicks the enroll action, the system executes:
  `navigate('/login?returnUrl=' + encodeURIComponent(location.pathname))`
  Login view verifies `returnUrl` is relative (starts with `/`, no protocol/host) and redirects back post-authentication.
- [x] **Contextual Student Enrollment Flag**: If an optional Bearer JWT is passed to `GET /api/courses/:id`, the backend queries `Enrollment` table for `(user_id, course_id)` and attaches `is_enrolled: boolean` to the response payload.
- [x] **404 Not Found Safety**: Non-existent or inactive courses (`is_active = false`) return HTTP 404 `COURSE_NOT_FOUND` rather than empty 200 or 500 error.
- [x] **Zero Native Alert Policy**: Strictly zero usage of `window.alert()` or `window.confirm()`.
- [x] **Mobile Action Bar Sticky Ergonomics**: On small screens, action button provides $\ge 44\text{px}$ touch target (`h-11`) with bottom padding on the body (`pb-20`) to eliminate overlap.

---

## 3. Project Structure & File Layout

### 3.1. Frontend Files (`client/src/`)
```text
client/src/
├── types/
│   └── course.ts                            # Extended CourseDetail interface with is_enrolled
├── services/
│   └── courseService.ts                     # Added getCourseById method
├── hooks/
│   └── useCourseDetail.ts                   # Lifecycle hook handling fetch, 404 state, enroll action
├── components/
│   ├── common/
│   │   └── NotFoundState.tsx                # Reusable 404 view with graphic & back button
│   └── course/
│       ├── CourseDetailHeader.tsx           # Breadcrumb, title, category, instructor
│       ├── CourseDetailSyllabus.tsx         # Detailed curriculum breakdown & description
│       ├── CourseDetailActionCard.tsx       # Sticky action box: price, capacity, status, button
│       └── CourseDetailSkeleton.tsx         # Loading placeholder matching detail layout
└── pages/
    └── CourseDetailPage.tsx                 # Main detail page composing header, syllabus, action box
```

### 3.2. Backend Files (`server/src/`)
```text
server/src/
├── validators/
│   └── course.validator.ts                  # courseIdParamSchema validating UUID format
├── services/
│   └── course.service.ts                    # findCourseById with active check & enrollment check
├── controllers/
│   └── course.controller.ts                 # getCourseById handler with HTTP 200/404 envelopes
└── routes/
    └── course.routes.ts                     # Added GET /:id with optionalAuthMiddleware
```

---

## 4. Data Model & Database Mapping

### 4.1. Prisma Model Mapping
The detail query inspects the `Course` model and optionally cross-references `Enrollment`:

```prisma
model Course {
  id             String       @id @default(uuid())
  title          String
  category       String
  instructor     String
  description    String
  price          Int
  capacity       Int
  enrolled_count Int          @default(0)
  is_active      Boolean      @default(true)
  created_at     DateTime     @default(now())
  updated_at     DateTime     @updatedAt
  enrollments    Enrollment[]

  @@map("courses")
}

model Enrollment {
  id         String           @id @default(uuid())
  user_id    String
  course_id  String
  status     EnrollmentStatus @default(enrolled)
  user       User             @relation(fields: [user_id], references: [id], onDelete: Cascade)
  course     Course           @relation(fields: [course_id], references: [id], onDelete: Restrict)

  @@unique([user_id, course_id])
  @@map("enrollments")
}
```

### 4.2. Extended TypeScript Interface (`client/src/types/course.ts`)
```typescript
export interface CourseDetail extends Course {
  is_enrolled?: boolean;
}
```

---

## 5. RESTful Interface Contracts

### 5.1. Endpoint: `GET /api/courses/:id`
Retrieves detailed information for a specific course.

- **Authentication**: Optional (Bearer JWT). If provided, computes `is_enrolled` for the user.
- **HTTP Method**: `GET`
- **Path**: `/api/courses/:id`

#### Path Parameter Schema:
```typescript
import { z } from 'zod';

export const courseIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Mã khóa học phải là UUID hợp lệ' }),
});
```

#### Success Response Envelope (HTTP 200 OK):
```json
{
  "success": true,
  "data": {
    "id": "c1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "title": "Lập Trình Web Fullstack Chuyên Nghiệp (Node.js & React)",
    "category": "Lập trình Web",
    "instructor": "Nguyễn Văn A",
    "description": "Chương trình đào tạo Co-op IT thực chiến 12 tuần...\n\n### Nội dung đào tạo:\n- Phần 1: TypeScript & Clean Code\n- Phần 2: Backend Architecture & RESTful API\n- Phần 3: React 18, State Management & Tailwind CSS",
    "price": 3500000,
    "capacity": 20,
    "enrolled_count": 14,
    "is_active": true,
    "is_enrolled": false,
    "created_at": "2026-11-01T08:00:00.000Z",
    "updated_at": "2026-11-05T12:00:00.000Z"
  },
  "message": "Lấy chi tiết khóa học thành công"
}
```

#### Error Response Envelope (HTTP 404 Not Found):
```json
{
  "success": false,
  "error": {
    "code": "COURSE_NOT_FOUND",
    "message": "Khóa học không tồn tại hoặc đã tạm dừng tuyển sinh",
    "details": null
  }
}
```

#### Error Response Envelope (HTTP 400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_COURSE_ID",
    "message": "Định dạng mã khóa học không hợp lệ",
    "details": [
      {
        "field": "id",
        "message": "Mã khóa học phải là UUID hợp lệ"
      }
    ]
  }
}
```

---

## 6. Backend Service & Controller Implementation

### 6.1. Optional Auth Middleware (`server/src/middlewares/auth.middleware.ts`)
```typescript
export const optionalAuthenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthenticatedUser;
      req.user = decoded;
    } catch {
      // Token expired or invalid; proceed as guest
      req.user = undefined;
    }
  }
  next();
};
```

### 6.2. Course Detail Service (`server/src/services/course.service.ts`)
```typescript
export class CourseService {
  static async getCourseById(courseId: string, userId?: string) {
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        is_active: true, // Inactive courses inaccessible to public
      },
    });

    if (!course) {
      return null;
    }

    let is_enrolled = false;
    if (userId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          user_id_course_id: {
            user_id: userId,
            course_id: courseId,
          },
        },
      });
      is_enrolled = !!enrollment;
    }

    return {
      ...course,
      is_enrolled,
    };
  }
}
```

### 6.3. Course Controller Handler (`server/src/controllers/course.controller.ts`)
```typescript
export class CourseController {
  static async getCourseById(req: Request, res: Response) {
    const validation = courseIdParamSchema.safeParse(req.params);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_COURSE_ID',
          message: 'Định dạng mã khóa học không hợp lệ',
          details: validation.error.errors,
        },
      });
    }

    const { id } = validation.data;
    const userId = req.user?.id;

    const course = await CourseService.getCourseById(id, userId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COURSE_NOT_FOUND',
          message: 'Khóa học không tồn tại hoặc đã tạm dừng tuyển sinh',
          details: null,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: course,
      message: 'Lấy chi tiết khóa học thành công',
    });
  }
}
```

---

## 7. Frontend Architecture & User Journey Wiring

### 7.1. Course Detail Hook (`client/src/hooks/useCourseDetail.ts`)
```typescript
export function useCourseDetail(courseId?: string) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchDetail = useCallback(async () => {
    if (!courseId) return;
    setIsLoading(true);
    setIsNotFound(false);
    setError(null);
    try {
      const response = await courseService.getCourseById(courseId);
      if (response.success && response.data) {
        setCourse(response.data);
      } else if (response.error?.code === 'COURSE_NOT_FOUND') {
        setIsNotFound(true);
      } else {
        setError(response.error?.message || 'Lỗi tải thông tin khóa học');
      }
    } catch {
      setError('Không thể kết nối đến máy chủ.');
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  const handleEnrollClick = (isAuthenticated: boolean) => {
    if (!isAuthenticated) {
      // Redirect to login preserving destination
      const returnUrl = encodeURIComponent(location.pathname);
      navigate(`/login?returnUrl=${returnUrl}`);
      return;
    }
    // Authenticated student enrollment handled via enrollment service
    navigate(`/courses/${courseId}/enroll-confirm`);
  };

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    course,
    isLoading,
    isNotFound,
    error,
    handleEnrollClick,
    refetch: fetchDetail,
  };
}
```

### 7.2. Action Button State Decision Matrix
```typescript
interface ActionButtonConfig {
  label: string;
  disabled: boolean;
  className: string;
  icon?: string;
  helperText?: string;
}

export function getActionButtonConfig(
  isAuthenticated: boolean,
  course: CourseDetail
): ActionButtonConfig {
  const isFull = course.enrolled_count >= course.capacity;

  if (!isAuthenticated) {
    return {
      label: 'Đăng nhập để ghi danh',
      disabled: false,
      className: 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900',
      helperText: 'Đăng nhập hoặc đăng ký tài khoản để tiếp tục',
    };
  }

  if (course.is_enrolled) {
    return {
      label: 'Đã ghi danh',
      disabled: true,
      className: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed border border-zinc-200 dark:border-zinc-700',
      helperText: 'Bạn đã đăng ký khóa học này',
    };
  }

  if (isFull) {
    return {
      label: 'Đã hết chỗ',
      disabled: true,
      className: 'bg-[#FEF2F2] dark:bg-[#7F1D1D33] text-[#991B1B] dark:text-[#F87171] border border-red-700/30 cursor-not-allowed',
      helperText: 'Khóa học đã đạt sĩ số tối đa',
    };
  }

  return {
    label: 'Ghi danh ngay',
    disabled: false,
    className: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
    helperText: `Còn lại ${course.capacity - course.enrolled_count} suất học`,
  };
}
```

---

## 8. Verification & Quickstart Guide

### 8.1. API Verification via cURL
```bash
# 1. Fetch valid course details (c1a2b3c4...)
curl -s http://localhost:5001/api/courses/c1a2b3c4-d5e6-7890-abcd-ef1234567890 | jq .

# 2. Fetch non-existent course (verifying 404 COURSE_NOT_FOUND)
curl -s http://localhost:5001/api/courses/00000000-0000-0000-0000-000000000000 | jq .

# 3. Fetch with authenticated student token to check is_enrolled
curl -s http://localhost:5001/api/courses/c1a2b3c4-d5e6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer <STUDENT_JWT>" | jq .
```

### 8.2. Frontend Redirection Test Flow
1. Open Incognito window (unauthenticated guest).
2. Visit `http://localhost:5173/courses/c1a2b3c4-d5e6-7890-abcd-ef1234567890`.
3. Click "Đăng nhập để ghi danh" (`data-testid="btn-enroll-action"`).
4. Verify URL transitions to `/login?returnUrl=%2Fcourses%2Fc1a2b3c4-d5e6-7890-abcd-ef1234567890`.
5. Enter valid student credentials (`student@pks.edu.vn` / `Student@123456`).
6. Click Login; verify the browser returns directly to `/courses/c1a2b3c4-d5e6-7890-abcd-ef1234567890`.
7. Verify the button now shows "Đã ghi danh" (if pre-enrolled) or "Ghi danh ngay" with enabled state.
