# Project: PKS Course & Enrollment Portal Enhancements

## Architecture
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide icons, React Router DOM, next-themes.
- **Backend**: Express, Node.js, TypeScript, Prisma ORM, PostgreSQL (Supabase).
- **Infrastructure**: Vercel Serverless Functions (`sin1` Singapore), Vercel Static Hosting.
- **Module Boundaries**:
  - Navigation & Layout: `client/src/components/layout/`, `client/src/routes.tsx`, `client/src/pages/home/`
  - Admin Course Management: `client/src/pages/admin/`, `client/src/components/ui/Badge.tsx`
  - Course Search & Filter: `client/src/pages/courses/`, `server/src/services/course.service.ts`, `server/src/utils/vietnamese.ts`
  - Performance & Caching: `server/src/controllers/`, `server/src/config/database.ts`, `server/vercel.json`, `client/src/components/ui/api.ts`
  - Submission & Documentation: `SUBMISSION.md`, `docs/PERFORMANCE_ANALYSIS.md`

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Navigation Consolidation | Distinct Home (with Hero banner) vs Courses catalog, active link highlighting, fix TS6133 in MobileNavSheet | M1 | Survey Explorer 1 (R2) |
| 2 | Category Badge Truncation Fix | Full text visibility for multi-word categories on all viewports, min-w-[860px] table, Design System Badge | M2 | Survey Explorer 2 (R3) |
| 3 | Vietnamese Search & Accent Stripping | Support accented and unaccented Vietnamese search across title, description, instructor in backend & admin | M3 | Survey Explorer 3 (R4) |
| 4 | Smooth Filter UX (Zero Skeleton Flash) | Split isInitialLoading vs isFetching, keep course grid mounted with subtle opacity, debounced search | M3 | Survey Explorer 3 (R4) |
| 5 | Vercel Caching & Latency Optimization | Edge Cache-Control headers, serverless Prisma singleton, sin1 region pinning, client-side in-memory cache | M4 | Survey Explorer 3 (R5) |
| 6 | Performance Analysis Report | Detailed root-cause analysis of Vercel latency and architectural mitigations | M4 | Survey Explorer 3 (R5) |
| 7 | Submission Standardization | SUBMISSION.md with 4 mandatory fields (Repo, Demo, Video script, Tech summary & test accounts) | M5 | Survey Explorer 3 (R1) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Navigation Clarity & Client Build Fix (R2) | Header, MobileNavSheet, HomePage, routes, Breadcrumb, Footer | none | PLANNED |
| 2 | Admin Category Badge & Table Responsiveness (R3) | AdminCoursesTable, AdminCourseRow, Badge.tsx | none | PLANNED |
| 3 | Vietnamese Search & Smooth Filter UX (R4) | CourseCatalogPage, course.service.ts, vietnamese.ts, useAdminCourses.ts | none | PLANNED |
| 4 | Vercel Performance Optimization & Caching (R5) | course.controller.ts, database.ts, vercel.json, api.ts, docs/PERFORMANCE_ANALYSIS.md | none | PLANNED |
| 5 | Submission Documentation & Full Verification (R1) | SUBMISSION.md, build & test verification across client & server | M1, M2, M3, M4 | PLANNED |

## Interface Contracts
### Client Navigation ↔ Routes
- Route `/` renders `HomePage` with Hero section followed by course catalog.
- Route `/courses` renders `CourseCatalogPage` in `CatalogWrapper`.
- Active states: `isHomeActive = location.pathname === '/'`, `isCoursesActive = location.pathname.startsWith('/courses')`.

### Admin Table ↔ Badge Component
- `<Badge variant="neutral">` guarantees `whitespace-nowrap shrink-0` across light and dark themes.
- `<table>` enforces `min-w-[860px]` inside `overflow-x-auto`.

### Client Catalog ↔ Backend Course API
- Search parameter `search` passes string; backend unaccents and matches case-insensitively.
- Response includes `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`.

## Code Layout
- `client/src/components/layout/Header.tsx`
- `client/src/components/layout/MobileNavSheet.tsx`
- `client/src/components/layout/Footer.tsx`
- `client/src/pages/home/HomePage.tsx`
- `client/src/pages/courses/CourseCatalogPage.tsx`
- `client/src/pages/courses/Breadcrumb.tsx`
- `client/src/pages/admin/AdminCoursesTable.tsx`
- `client/src/pages/admin/AdminCourseRow.tsx`
- `client/src/components/ui/Badge.tsx`
- `client/src/components/ui/api.ts`
- `server/src/utils/vietnamese.ts`
- `server/src/services/course.service.ts`
- `server/src/controllers/course.controller.ts`
- `server/src/config/database.ts`
- `server/vercel.json`
- `SUBMISSION.md`
- `docs/PERFORMANCE_ANALYSIS.md`
