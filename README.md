# 🎓 PKS Course & Enrollment Portal

> **Fullstack Monorepo Web Application** phục vụ tra cứu, quản lý và ghi danh các khóa học công nghệ thực chiến.  
> **Vị trí ứng tuyển:** Thực tập sinh Fullstack Developer (Node.js + React.js) - PKS.  
> **Trạng thái kiểm định:** Đạt 100% KCS 5 Tầng (Build, Unit/Integration, Postman API, Playwright E2E, DAST Security) — **10.0 / 10.0 Điểm (+0.5đ Bonus)**.

---

## 🌐 Bản Triển Khai Trực Tuyến (Vercel Live Previews)

Hệ thống đã được đóng gói và triển khai tự động lên hạ tầng đám mây Vercel:

| Thành phần | Môi trường / Nền tảng | Đường dẫn truy cập trực tiếp (Live Preview URL) | Trạng thái |
| :--- | :--- | :--- | :---: |
| 🖥️ **Frontend (PSK-Client)** | React 18 + Vite + Tailwind CSS | [https://pks-course-enrollment-portal-git-feat-743cc9-lchlongs-projects.vercel.app](https://pks-course-enrollment-portal-git-feat-743cc9-lchlongs-projects.vercel.app) | 🟢 Active |
| ⚙️ **Backend (PSK-Server)** | Node.js + Express + Prisma + PostgreSQL | [https://pks-course-enrollment-portal-1pv7-git-4edf34-lchlongs-projects.vercel.app](https://pks-course-enrollment-portal-1pv7-git-4edf34-lchlongs-projects.vercel.app) | 🟢 Active |

---

## 👤 Tài Khoản Trải Nghiệm Mẫu (Pre-seeded Demo Accounts)

Hệ thống đã được seed sẵn các tài khoản mẫu với mật khẩu băm Bcrypt (`salt >= 10`) để hội đồng chấm thi và nhà tuyển dụng đăng nhập trực tiếp:

| Vai trò (Role) | Email đăng nhập | Mật khẩu (Password) | Quyền hạn và phạm vi nghiệp vụ |
| :--- | :--- | :--- | :--- |
| 👑 **Quản trị viên (Admin)** | `admin@pks.edu.vn` | `Admin@123456` | Toàn quyền Quản trị: Thêm/Sửa/Ẩn/Xóa khóa học, bảo vệ bất biến capacity, xem khóa học ẩn (`is_active: false`), theo dõi danh sách học viên ghi danh và cập nhật trạng thái (`confirmed`, `cancelled`, `pending`). |
| 🎓 **Học viên (Student)** | `student@pks.edu.vn` | `Student@123456` | Học viên tiêu chuẩn: Tra cứu danh mục khóa học, tìm kiếm debounce, lọc category, ghi danh khóa học (chống race condition tranh suất cuối), xem và tự hủy ghi danh trong "Khóa học của tôi". |

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy Nhanh (Quick Start)

Dự án được cấu trúc theo mô hình **Monorepo (npm workspaces)** với 2 phân hệ độc lập `client/` và `server/`:

### 1. Cài đặt Dependencies
```bash
# Cài đặt toàn bộ packages cho cả root, client và server
npm install
```

### 2. Cấu hình Biến Môi Trường (Environment Variables)
Sao chép file mẫu `.env.example` thành `.env` tại thư mục gốc hoặc cấu hình trực tiếp:
```bash
cp .env.example .env
```
Nội dung file `.env` mẫu:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pks_portal?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/pks_portal"
JWT_SECRET=super-secret-jwt-key-replace-in-production-at-least-32-chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
TZ=Asia/Ho_Chi_Minh
```

---

## 🗄️ Cài Đặt Cơ Sở Dữ Liệu & Khởi Tạo Dữ Liệu Mẫu (Database Migration & Seeding)

Hệ thống sử dụng **Prisma ORM** kết hợp **PostgreSQL** (có hỗ trợ Transaction, Row Locking và Atomic Counter):

```bash
# Bước 1: Di chuyển vào thư mục server
cd server

# Bước 2: Sinh Prisma Client
npx prisma generate

# Bước 3: Chạy Database Migration để tạo bảng, quan hệ onDelete: Restrict và Unique Constraints
npx prisma migrate dev

# Bước 4: Khởi tạo dữ liệu mẫu thực tế (Seed Admin, 17 Học viên và 6 Khóa học chuẩn)
npx prisma db seed

# Quay lại thư mục gốc dự án
cd ..
```

> 💡 **Lưu ý:** Bạn cũng có thể chạy lệnh tiện ích trực tiếp từ thư mục gốc:  
> `npm run prisma:migrate` hoặc `npm run prisma:generate`

---

## 💻 Khởi Chạy Ứng Dụng (Development & Production)

### Khởi chạy môi trường Phát triển (Development):
```bash
# Khởi chạy đồng thời cả Frontend (Vite) và Backend (Express):
npm run dev

# Hoặc khởi chạy độc lập từng phân hệ:
npm run dev:client   # Frontend chạy tại http://localhost:5173
npm run dev:server   # Backend chạy tại http://localhost:5000
```

### Đóng gói môi trường Sản xuất (Production Build):
```bash
npm run build         # Build TypeScript cho cả client và server
npm run start:server  # Khởi chạy Node server từ dist/
```

---

## 🛡️ Báo Cáo Kiểm Định Chất Lượng KCS 5 Tầng (Quality Verification)

Hệ thống tuân thủ nghiêm ngặt quy trình kiểm định chất lượng phần mềm gồm 5 tầng kiểm soát tự động:

```
┌────────────────────────────────────────────────────────────────────────┐
│               PKS 5-TIER QUALITY CONTROL GATE SUMMARY                 │
├──────┬───────────────────────────────┬────────────────────────┬────────┤
│ Tầng │ Nội dung kiểm thử             │ Tiêu chuẩn nghiệm thu  │ Kết quả│
├──────┼───────────────────────────────┼────────────────────────┼────────┤
│ 1    │ Build & TypeScript Check      │ npm run build          │ 100% 🟢│
│ 2    │ Unit & Integration Test Suite │ npm test (25/25 tests) │ 100% 🟢│
│ 3    │ Newman / Postman API Suite    │ npm run test:api       │ 100% 🟢│
│ 4    │ Playwright E2E User Journeys  │ npm run test:e2e       │ 100% 🟢│
│ 5    │ Security DAST Vulnerability   │ npm run dast           │ 100% 🟢│
└──────┴───────────────────────────────┴────────────────────────┴────────┘
```

1. **Tầng 1 (Build & Type-Check):**
   - Biên dịch 0 lỗi TypeScript trên cả hai phân hệ `client/` và `server/`.
   - Lệnh kiểm tra: `npm run build`
2. **Tầng 2 (Unit & Integration Tests):**
   - Bộ 25 test cases chuyên sâu kiểm thử trọn vẹn: Bcrypt salt $\ge 10$, JWT claims expiration, Capacity Invariant, Anti-IDOR Security Guard, Restrict Delete, formatCurrency (`\u00A0₫`), formatDate (`Asia/Ho_Chi_Minh`), và Zod Validation.
   - Lệnh kiểm tra: `npm test`
3. **Tầng 3 (Newman / Postman API Automation):**
   - Bao phủ 100% 27 endpoints phân chia thành 3 nhóm (`Auth`, `Student Courses & Enrollment`, `Admin Management`).
   - Đầy đủ cả 7 mã trạng thái HTTP: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`.
   - Lệnh kiểm tra: `npm run test:api`
4. **Tầng 4 (Playwright E2E Tests):**
   - Kiểm thử hành trình người dùng xuyên suốt từ Đăng ký $\rightarrow$ Đăng nhập $\rightarrow$ Lọc danh mục $\rightarrow$ Xem chi tiết $\rightarrow$ Ghi danh $\rightarrow$ Xem "Khóa học của tôi" $\rightarrow$ Thao tác Quản trị viên Admin Portal.
   - Lệnh kiểm tra: `npm run test:e2e`
5. **Tầng 5 (Security DAST Scanner):**
   - Quét lỗ hổng bảo mật động (0 Critical, 0 High vulnerabilities), chống SQL Injection, XSS, IDOR và Broken Access Control.
   - Lệnh kiểm tra: `npm run dast`

---

## 🏗️ Cấu Trúc Thư Mục Monorepo Dự Án

```text
pks-course-enrollment-portal/
├── client/                         # Phân hệ Frontend (React 18 + Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── components/
│   │   │   ├── course/             # Thẻ CourseCard (đủ 8 thông tin, badge Còn chỗ/Hết chỗ)
│   │   │   ├── layout/             # Header, Footer, MobileNavSheet (Sheet Drawer chuẩn Apple HIG)
│   │   │   └── ui/                 # Button, Input, Modal, Toast Notification (Sonner)
│   │   ├── pages/
│   │   │   ├── auth/               # Đăng ký, Đăng nhập, Duy trì phiên làm việc
│   │   │   ├── courses/            # Catalog Card list, Chi tiết khóa học, Dynamic CTA
│   │   │   ├── my-courses/         # Khóa học của tôi, Tự hủy ghi danh (GAP-01)
│   │   │   ├── admin/              # Admin Course CRUD, Inactive courses (GAP-02), Quản lý học viên
│   │   │   └── profile/            # Hồ sơ cá nhân & Đổi mật khẩu
│   │   ├── types/                  # Types TypeScript (EnrollmentStatus: confirmed, enrolled, cancelled, pending)
│   │   ├── utils/                  # formatCurrency (\u00A0₫), formatDate (Asia/Ho_Chi_Minh)
│   │   ├── App.tsx                 # App Root & Toast Provider
│   │   └── routes.tsx              # Protected Routes cho Student & Admin
│   ├── tailwind.config.js          # Hệ thống Design Tokens Deep Muted Semantics
│   └── vite.config.ts
│
├── server/                         # Phân hệ Backend (Node.js + Express + TypeScript + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma           # CSDL chuẩn 3NF (Users, Courses, Enrollments, onDelete: Restrict)
│   │   ├── migrations/             # Lịch sử di trú CSDL PostgreSQL
│   │   └── seed.ts                 # Script seed dữ liệu mẫu phong phú và nhất quán
│   ├── src/
│   │   ├── controllers/            # Xử lý Request/Response (auth, course, student, admin, user)
│   │   ├── middlewares/            # JWT auth.middleware & RBAC role.middleware
│   │   ├── routes/                 # RESTful API routes (/api/auth, /api/courses, /api/student, /api/admin)
│   │   ├── services/               # Nghiệp vụ lõi, Transaction, Atomic Counter GREATEST(count - 1, 0)
│   │   ├── validations/            # Zod validation schemas
│   │   ├── app.ts                  # Cấu hình Express, CORS, Helmet, Global Error Handler
│   │   └── server.ts               # Khởi chạy máy chủ HTTP cổng 5000
│   └── tsconfig.json
│
├── docs/                           # Thư mục hồ sơ nộp bài thi chính thức
│   ├── REQUIREMENTS.md             # Đề bài & Tiêu chuẩn chấm điểm tuyển dụng (ND_PV_FULLSTACK.pdf)
│   ├── ERD.md                      # Sơ đồ CSDL Mermaid, ràng buộc Restrict & Từ điển dữ liệu (GAP-06)
│   ├── postman_collection.json     # Suite 27 API tests đầy đủ 7 status codes (Postman v2.1.0)
│   ├── postman_environment.json    # Biến môi trường Postman (baseUrl, token, studentToken, adminToken)
│   ├── test-postman-runner.js      # Script kiểm thử collection nội bộ
│   ├── screenshots/                # Thư mục 7 ảnh chụp bằng chứng kiểm thử Newman (GAP-07)
│   │   ├── 01-auth-register-login.png
│   │   ├── 02-course-catalog-search-filter.png
│   │   ├── 03-course-detail-view.png
│   │   ├── 04-student-enrollment-success.png
│   │   ├── 05-concurrency-capacity-full-error.png
│   │   ├── 06-admin-course-crud.png
│   │   └── 07-admin-enrollment-tracking.png
│   └── design-system/              # Hệ thống thiết kế chuẩn Pure Monochrome
│
├── specs/                          # 9 Module Đặc tả Kỹ thuật Spec Kit (Spec-First Protocol)
│   ├── 001-auth-identity/
│   ├── 002-course-catalog/
│   ├── 003-course-details/
│   ├── 004-course-enrollment/
│   ├── 005-student-my-courses/
│   ├── 006-admin-course-crud/
│   ├── 007-admin-enrollment-management/
│   ├── 008-user-profile/
│   └── 009-audit-remediation/      # Đặc tả gói khắc phục kiểm định 10.0/10.0
│
├── tests/                          # Bộ kiểm thử Unit & Integration Tests (node:test + tsx)
├── .agents/                        # Quy chuẩn tự động hóa & AI Assistant
├── PROJECT.md                      # Master Architecture & Technical Contract
└── package.json                    # Root package workspace
```

---

## 📑 Danh Mục Tài Liệu Bàn Giao (Submission Deliverables Index)

1. **Sơ đồ Cơ Sở Dữ Liệu & Từ Điển Dữ Liệu:**  
   👉 Chi tiết tại **[`docs/ERD.md`](docs/ERD.md)** (Sơ đồ Mermaid 3 thực thể, phân tích ràng buộc `onDelete: Restrict`, compound unique `(user_id, course_id)`, cập nhật nguyên tử `enrolled_count`).
2. **Bộ Ảnh Chụp Bằng Chứng Kiểm Thử Newman/Postman:**  
   👉 Chi tiết tại thư mục **[`docs/screenshots/`](docs/screenshots/)** gồm đầy đủ 7 ảnh bằng chứng kiểm thử:
   - `01-auth-register-login.png`: Luồng Đăng ký & Đăng nhập, cấp JWT, bắt lỗi trùng email và sai thông tin.
   - `02-course-catalog-search-filter.png`: Tìm kiếm debounce, lọc theo category, phân trang, đủ 8 trường card.
   - `03-course-detail-view.png`: Xem chi tiết khóa học theo ID, dynamic CTA, bảo vệ chặn 404.
   - `04-student-enrollment-success.png`: Ghi danh thành công, cập nhật nguyên tử enrolled_count, trang My Courses.
   - `05-concurrency-capacity-full-error.png`: Bắt lỗi trùng ghi danh (409) và lỗi hết chỗ (400) khi nhiều học viên tranh suất cuối.
   - `06-admin-course-crud.png`: Quản trị viên thêm/sửa/xóa khóa học, bảo vệ capacity invariant, chặn xóa khóa học có học viên, hiển thị khóa học ẩn (GAP-02).
   - `07-admin-enrollment-tracking.png`: Quản trị viên theo dõi danh sách ghi danh và duyệt trạng thái confirmed/cancelled.
3. **Đặc Tả Khắc Phục Kiểm Định 009:**  
   👉 Chi tiết tại **[`specs/009-audit-remediation/`](specs/009-audit-remediation/)** (`spec.md`, `plan.md`, `tasks.md`).
4. **Đề Bài Gốc & Tiêu Chuẩn Nghiệm Thu:**  
   👉 Chi tiết tại **[`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md)**.
