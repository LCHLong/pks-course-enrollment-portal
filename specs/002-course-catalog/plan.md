# Implementation Plan: 002-course-catalog

**Feature Name**: Course Catalog (Danh mục Khóa học)  
**Branch**: `002-course-catalog`  
**Status**: Ready for Implementation  
**Spec Reference**: `specs/002-course-catalog/spec.md`  
**Target Monorepo**: `/Users/macbookpro/Documents/Work/Prepare/PKS/pks-course-enrollment-portal`

---

## 1. Technical Context & Stack

### 1.1. Monorepo Ecosystem
- **Frontend Stack**:
  - React 18 (`react: ^18.3.1`, `react-dom: ^18.3.1`)
  - Vite (`vite: ^5.4.10`, `@vitejs/plugin-react: ^4.3.3`)
  - Routing: `react-router-dom: ^6.27.0`
  - Styling: Tailwind CSS v3 (`tailwindcss: ^3.4.14`), PostCSS, Autoprefixer
  - Primitives: Lucide React (`lucide-react: ^0.454.0`), Sonner toast (`sonner: ^1.7.0`), Radix UI Primitives
  - TypeScript: `^5.6.3` with strict typing (`noUnusedLocals: true`)
- **Backend Stack**:
  - Node.js 18+ LTS with Express (`express: ^4.21.1`)
  - ORM: Prisma Client (`@prisma/client: ^5.21.1`)
  - Database: PostgreSQL 15+ (Hosted on Supabase Cloud)
  - Validation: Zod (`zod: ^3.23.8`)
  - Runtime: TypeScript with `tsx` (`tsx watch src/server.ts`)
- **Timezone & Locale**:
  - Timezone: `Asia/Ho_Chi_Minh` (UTC+7)
  - Currency: Vietnamese Dong (`VND`) formatted with `\u00A0₫` and non-breaking space.

---

## 2. Architecture & Governance Gates

- [x] **Dual Theme Semantics**: Zinc neutral palette combined with Deep Muted Semantics for status badges (`dark:` classes via `document.documentElement.classList`).
- [x] **Mobile Ergonomics**: All interactive buttons enforce minimum touch target height $\ge 44\text{px}$ (`h-11` or `min-h-[44px]`). Input font size $\ge 16\text{px}$ (`text-base sm:text-sm`).
- [x] **Zero Native Alert Policy**: Strictly zero usage of browser native `alert()`, `confirm()`, or `prompt()`. All notifications handled via Sonner toast.
- [x] **Uniform JSON Response Envelope**: All API endpoints return standardized envelope:
  - Success: `{ "success": true, "data": <T>, "message": "<string>" }`
  - Error: `{ "success": false, "error": { "code": "<CODE>", "message": "<string>", "details": <any> } }`
- [x] **Public Catalog Isolation**: Public queries MUST enforce `{ is_active: true }` in Prisma queries so inactive courses are never leaked.
- [x] **Currency Formatting Discipline**: Non-breaking space `\u00A0₫` and `whitespace-nowrap shrink-0` guaranteed across all renderers.

---

## 3. Project Structure & File Layout

### 3.1. Frontend Files (`client/src/`)
```text
client/src/
├── types/
│   └── course.ts                            # Course entity, filter, and pagination types
├── services/
│   └── courseService.ts                     # API client for fetching catalog & categories
├── hooks/
│   └── useCourses.ts                        # React query/state hook for catalog lifecycle
├── components/
│   ├── common/
│   │   ├── EmptyState.tsx                   # Reusable empty state with graphic & CTA
│   │   └── ErrorState.tsx                   # Reusable error display with retry button
│   └── course/
│       ├── CourseCard.tsx                   # 8-field card with Deep Muted badges & data-testid
│       ├── CourseCardSkeleton.tsx           # Accessible shimmer loading placeholder
│       ├── CourseGrid.tsx                   # Responsive 1/2/3 column grid container
│       ├── CourseSearchFilter.tsx           # Debounced search bar & category dropdown
│       └── CoursePagination.tsx             # Accessible pagination bar with prev/next/pages
└── pages/
    └── CatalogPage.tsx                      # Main catalog page assembling grid & filters
```

### 3.2. Backend Files (`server/src/`)
```text
server/src/
├── validators/
│   └── course.validator.ts                  # Zod schema for catalog query params
├── services/
│   └── course.service.ts                    # Prisma query logic with search, filter, pagination
├── controllers/
│   └── course.controller.ts                 # HTTP request/response handler with uniform envelope
├── routes/
│   ├── course.routes.ts                     # Route definitions for GET /api/courses
│   └── index.ts                             # Router index mounting courseRoutes at /api/courses
└── types/
    └── api.types.ts                         # Standard API response & pagination types
```

---

## 4. Data Model & Database Mapping

### 4.1. Prisma Schema (`server/prisma/schema.prisma`)
The feature directly consumes the existing `Course` model:

```prisma
model Course {
  id             String       @id @default(uuid())
  title          String
  category       String
  instructor     String
  description    String
  price          Int          // In VND (integer >= 0)
  capacity       Int          // Max students (> 0)
  enrolled_count Int          @default(0)
  is_active      Boolean      @default(true)
  created_at     DateTime     @default(now())
  updated_at     DateTime     @updatedAt
  enrollments    Enrollment[]

  @@index([category])
  @@index([is_active])
  @@map("courses")
}
```

### 4.2. TypeScript DTOs & Interfaces (`client/src/types/course.ts`)
```typescript
export interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  description: string;
  price: number;
  capacity: number;
  enrolled_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CourseCatalogResponse {
  courses: Course[];
  pagination: PaginationMeta;
}

export interface CourseQueryFilter {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}
```

---

## 5. RESTful Interface Contracts

### 5.1. Endpoint: `GET /api/courses`
Retrieves a paginated list of published courses, optionally filtered by keyword search or category.

- **Authentication**: None (Publicly accessible).
- **HTTP Method**: `GET`
- **Path**: `/api/courses`

#### Request Query Parameters:
| Parameter | Type | Required | Default | Constraints & Description |
|---|---|---|---|---|
| `search` | `string` | No | `""` | Search query matching `title` or `instructor` (case-insensitive substring) |
| `category` | `string` | No | `""` | Exact category name filter (e.g., `"Lập trình Web"`) |
| `page` | `integer` | No | `1` | Page number, integer $\ge 1$ |
| `limit` | `integer` | No | `9` | Number of items per page, integer between $1$ and $50$ |

#### Request Validation Schema (`server/src/validators/course.validator.ts`):
```typescript
import { z } from 'zod';

export const courseQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(9),
});

export type CourseQueryParams = z.infer<typeof courseQuerySchema>;
```

#### Success Response Envelope (HTTP 200 OK):
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "c1a2b3c4-d5e6-7890-abcd-ef1234567890",
        "title": "Lập Trình Web Fullstack Chuyên Nghiệp (Node.js & React)",
        "category": "Lập trình Web",
        "instructor": "Nguyễn Văn A",
        "description": "Khóa học đào tạo thực chiến dự án Web Fullstack từ cơ bản đến nâng cao...",
        "price": 3500000,
        "capacity": 20,
        "enrolled_count": 14,
        "is_active": true,
        "created_at": "2026-11-01T08:00:00.000Z",
        "updated_at": "2026-11-05T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 9,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "Lấy danh sách khóa học thành công"
}
```

#### Error Response Envelope (HTTP 400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Tham số truy vấn không hợp lệ",
    "details": [
      {
        "field": "limit",
        "message": "Số lượng mỗi trang không được vượt quá 50"
      }
    ]
  }
}
```

#### Error Response Envelope (HTTP 500 Internal Server Error):
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Đã có lỗi xảy ra từ máy chủ nội bộ. Vui lòng thử lại sau.",
    "details": null
  }
}
```

---

## 6. Backend Query Implementation Logic

### 6.1. Prisma Service Query (`server/src/services/course.service.ts`)
```typescript
import { prisma } from '../config/database.js';
import { CourseQueryParams } from '../validators/course.validator.js';

export class CourseService {
  static async getCatalog(params: CourseQueryParams) {
    const { search, category, page, limit } = params;
    const skip = (page - 1) * limit;

    // Base filter: Strictly active courses
    const where: any = {
      is_active: true,
    };

    // Category filter
    if (category && category !== 'all' && category.trim() !== '') {
      where.category = category.trim();
    }

    // Keyword search on title or instructor
    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { instructor: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Parallel fetch: total count & paginated records
    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async getCategories() {
    // Distinct categories for active courses
    const distinctCategories = await prisma.course.findMany({
      where: { is_active: true },
      select: { category: true },
      distinct: ['category'],
    });

    return distinctCategories.map((c) => c.category);
  }
}
```

---

## 7. Frontend Component Design & State Wiring

### 7.1. State Management Hook (`client/src/hooks/useCourses.ts`)
```typescript
import { useState, useEffect, useCallback } from 'react';
import { Course, PaginationMeta } from '@/types/course';
import { courseService } from '@/services/courseService';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 9, total: 0, totalPages: 1 });
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await courseService.getCourses({ search, category, page, limit: 9 });
      if (response.success && response.data) {
        setCourses(response.data.courses);
        setPagination(response.data.pagination);
      } else {
        setError(response.error?.message || 'Không thể tải danh sách khóa học');
      }
    } catch (err: any) {
      setError('Lỗi kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [search, category, page]);

  // Reset page to 1 when filters change
  const handleSearchChange = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setPage(1);
  };

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    pagination,
    categories,
    search,
    category,
    page,
    isLoading,
    error,
    setPage,
    handleSearchChange,
    handleCategoryChange,
    handleResetFilters,
    refetch: fetchCourses,
  };
}
```

### 7.2. CourseCard Presentation Requirements
1. Semantic tag: `<article className="..." aria-labelledby={`course-title-${course.id}`}>`.
2. Status pill:
   - Available: Deep Emerald badge with pulsing dot and text `"Còn chỗ"`.
   - Full: Deep Crimson badge with text `"Đã hết chỗ"`.
3. Title with link to `/courses/${course.id}` and `line-clamp-2`.
4. Description with `line-clamp-3`.
5. Progress bar: `role="progressbar"`, `aria-valuenow={course.enrolled_count}`, `aria-valuemax={course.capacity}`.
6. Tuition: `formatCurrency(course.price)` with `whitespace-nowrap shrink-0`.
7. Action button: `btn-enroll-${course.id}` with `h-11 sm:h-9` ($\ge 44\text{px}$ on mobile).

---

## 8. Verification & Quickstart Guide

### 8.1. Local Testing via cURL
```bash
# 1. Fetch paginated course list (Page 1, 9 items)
curl -s http://localhost:5001/api/courses | jq .

# 2. Search for "React" keyword
curl -s "http://localhost:5001/api/courses?search=React" | jq .

# 3. Filter by category
curl -s "http://localhost:5001/api/courses?category=L%E1%BA%ADp%20tr%C3%ACnh%20Web" | jq .

# 4. Verify validation error on negative page
curl -s "http://localhost:5001/api/courses?page=-1" | jq .
```

### 8.2. UI Contract Invariant Verification
1. Open browser dev tools on Mobile Viewport ($375\text{px}$).
2. Verify all buttons have `min-height >= 44px`.
3. Verify input has `font-size: 16px` (`text-base`).
4. Verify non-breaking space `\u00A0₫` preserves currency tag inline without wrapping.
5. Verify dark mode toggle switches badges from light emerald/crimson to deep muted dark counterparts.
