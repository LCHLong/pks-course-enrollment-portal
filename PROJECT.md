# Project: PKS Course & Enrollment Portal Specification Suite

## Architecture
- **Target Project**: `/Users/macbookpro/Documents/Work/Prepare/PKS/pks-course-enrollment-portal`
- **Specification Standard**: Spec Kit Standard (`ba-spec`, `speckit-specify`, `speckit-plan`, `speckit-tasks`)
- **Specification Output Location**: `pks-course-enrollment-portal/specs/<feature-name>/`
- **Document Structure per Feature**:
  1. `spec.md` (Business requirements, user stories, acceptance criteria, UI contract, edge cases)
  2. `plan.md` (Technical plan, architecture, REST API contracts, data models, error handling, invariants)
  3. `tasks.md` (Actionable task breakdown by phase and user story with strict `- [ ] [TaskID] [P?] [Story?] ...` syntax)
- **Technical Architecture Baseline**:
  - Frontend: React 18, Vite, TypeScript, Tailwind CSS (Dual Theme: Zinc + Deep Muted Semantics), Radix UI, Sonner toast, Lucide icons.
  - Backend: Node.js Express, TypeScript, Prisma ORM, Supabase PostgreSQL, bcryptjs (salt >= 10), jsonwebtoken (expiresIn), zod validation.
  - Timezone: `Asia/Ho_Chi_Minh` (UTC+7), Date format: `YYYY-MM-DD`.
  - Data Models: `User` (student, admin), `Course` (capacity, enrolled_count), `Enrollment` (enrolled, cancelled, pending with `UNIQUE(user_id, course_id)`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | 001-auth-identity | User Registration, Login, Logout, /me, Bcrypt salt >= 10, JWT expiresIn, Role Assignment | M1 | REQUIREMENTS §3.1.A-B, PDF p.1 |
| 2 | 002-course-catalog | Course Catalog Grid with 8 mandatory fields, Search by title, Category Filter, Pagination, Empty/Loading states | M2 | REQUIREMENTS §3.1.C, PDF p.1, UI_RULES |
| 3 | 003-course-details | Course Details view, full description, capacity indicator, Auth redirect to /login with returnUrl | M3 | REQUIREMENTS §3.1.D, PDF p.2 |
| 4 | 004-course-enrollment | Concurrency-safe enrollment engine, Race Condition protection on last seat, Unique enrollment check, Atomic Counter / Row Locking | M4 | REQUIREMENTS §3.1.E, PDF p.2 |
| 5 | 005-my-courses | Student My Courses page, IDOR protection, Registration Date (YYYY-MM-DD), Enrollment Status | M5 | REQUIREMENTS §3.1.F, PDF p.2 |
| 6 | 006-admin-course-crud | Admin Course Management: Add, Edit with `capacity >= enrolled_count` invariant, Safe Delete / Hide active course | M6 | REQUIREMENTS §3.2.B, PDF p.2 |
| 7 | 007-admin-enrollment-mgmt | Admin Enrollment Tracking per course, Status Approval/Cancellation, Atomic Counter synchronization | M7 | REQUIREMENTS §3.2.C, 4.3, PDF p.2-3 |
| 8 | 008-user-profile | User Profile management: View info, Update Name, Change Password with old password validation | M8 | REQUIREMENTS §5 (API 3, 10), PDF p.1-3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | 001-auth-identity | `specs/001-auth-identity/` (spec.md, plan.md, tasks.md) | none | PLANNED |
| M2 | 002-course-catalog | `specs/002-course-catalog/` (spec.md, plan.md, tasks.md) | M1 | PLANNED |
| M3 | 003-course-details | `specs/003-course-details/` (spec.md, plan.md, tasks.md) | M1, M2 | PLANNED |
| M4 | 004-course-enrollment | `specs/004-course-enrollment/` (spec.md, plan.md, tasks.md) | M1, M3 | PLANNED |
| M5 | 005-my-courses | `specs/005-my-courses/` (spec.md, plan.md, tasks.md) | M1, M4 | PLANNED |
| M6 | 006-admin-course-crud | `specs/006-admin-course-crud/` (spec.md, plan.md, tasks.md) | M1 | PLANNED |
| M7 | 007-admin-enrollment-mgmt | `specs/007-admin-enrollment-mgmt/` (spec.md, plan.md, tasks.md) | M1, M4, M6 | PLANNED |
| M8 | 008-user-profile | `specs/008-user-profile/` (spec.md, plan.md, tasks.md) | M1 | PLANNED |
| M9 | spec-quality-audit | Forensic Audit & Independent Agent-as-Judge verification across all 8 feature specs | M1-M8 | PLANNED |

## Interface Contracts
### UI Contract Standard
- 100% interactive elements MUST specify:
  - `Semantic Role`: button, link, heading, textbox, combobox, dialog, alert, status.
  - `Accessibility Label`: `aria-label`, `<label htmlFor="...">`, `aria-describedby`.
  - `data-testid`: Exact taxonomy (`btn-register-submit`, `input-login-email`, `course-card-<id>`, `badge-status-capacity`, etc.).
- 4-State UI Coverage: Loading (Skeleton/Spinner), Empty State (friendly graphic + CTA), Error State (inline error + Sonner toast + retry button), Success State (Sonner toast, strictly NO alert()).
- Mobile Touch Target: `>= 44px` (`h-11`). Input font size: `>= 16px` to prevent iOS Safari auto-zoom.
- Currency Formatting: Non-breaking space `\u00A0₫` with `whitespace-nowrap shrink-0`. `price = 0` displays as "Miễn phí".
- Dual Theme Semantics:
  - Còn chỗ: Deep Emerald (`#065F46` light / `#34D399` dark)
  - Hết chỗ: Deep Crimson (`#991B1B` light / `#F87171` dark)
  - Chờ duyệt: Deep Amber (`#92400E` light / `#FBBF24` dark)

### Backend Contract Standard
- Uniform JSON Envelope:
  - Success: `{ "success": true, "data": <T>, "message": "<string>" }`
  - Error: `{ "success": false, "error": { "code": "<UPPERCASE_CODE>", "message": "<human_message>", "details": <any> } }`
- HTTP Status Codes:
  - 200 OK, 201 Created
  - 400 Bad Request (Validation failure, `INVALID_CAPACITY`)
  - 401 Unauthorized (Missing/expired token, `INVALID_CREDENTIALS`, `TOKEN_EXPIRED`)
  - 403 Forbidden (Role mismatch, `FORBIDDEN`)
  - 404 Not Found (`COURSE_NOT_FOUND`, `NOT_FOUND`)
  - 409 Conflict (`EMAIL_ALREADY_EXISTS`, `ALREADY_ENROLLED`, `CAPACITY_FULL`)
  - 500 Internal Server Error
- Concurrency & Invariants:
  - Last-seat race condition: Must use DB Transaction (`$transaction`) with Row Lock (`SELECT ... FOR UPDATE`) or Atomic Conditional Update (`UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = :id AND enrolled_count < capacity`).
  - Admin Capacity Invariant: `capacity >= enrolled_count` enforced on updates.
  - Admin Course Deletion Invariant: Hard delete blocked if `enrolled_count > 0`. Must use soft-delete/hide (`is_active = false`).

## Code Layout
```
pks-course-enrollment-portal/
├── docs/
│   ├── REQUIREMENTS.md
│   ├── design-system/
│   │   ├── UI_RULES.md
│   │   ├── tokens.json
│   │   └── tokens.css
├── specs/
│   ├── 001-auth-identity/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── tasks.md
│   ├── 002-course-catalog/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── tasks.md
│   ├── 003-course-details/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── tasks.md
│   ├── 004-course-enrollment/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── tasks.md
│   ├── 005-my-courses/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── tasks.md
│   ├── 006-admin-course-crud/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── tasks.md
│   ├── 007-admin-enrollment-mgmt/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── tasks.md
│   └── 008-user-profile/
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
```
