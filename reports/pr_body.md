## 🌐 Vercel Live Preview Deployments
- 🖥️ **Frontend Preview (PSK-Client)**: https://pks-course-enrollment-portal-client.vercel.app
- ⚙️ **Backend Preview (PSK-Server)**: https://pks-course-enrollment-portal-server.vercel.app

## 📋 Hạng Mục Đã Triển Khai Hoàn Chỉnh (Tuân thủ 100% Spec Kit)
- [x] Module 001 - Auth & Identity (Register, Login JWT, Bcrypt salt >= 10, Me)
- [x] Module 002 - Course Catalog (Filters, Search debounce, Pagination, 8 Fields)
- [x] Module 003 - Course Details (Breadcrumb, Dynamic CTA, 404 Guard)
- [x] Module 004 - Course Enrollment (Atomic SQL Concurrency Guard, P2002 Trapping)
- [x] Module 005 - Student My Courses (Anti-IDOR Security Guard)
- [x] Module 006 - Admin Course CRUD (Capacity Invariant Guard, Restrict Delete)
- [x] Module 007 - Admin Enrollment Management (Row-level Locking, Status Sync)
- [x] Module 008 - User Profile (Password Change Bcrypt Verification)

## 🛡️ Báo Cáo Kiểm Định Chất Lượng KCS 5 Tầng
- [x] **Tầng 1 (Build & Lint)**: Pass 100% (Client & Server)
- [x] **Tầng 2 (Unit/Integration Tests)**: Pass 100%
- [x] **Tầng 3 (Postman API Tests)**: 27/27 requests Pass qua Newman CLI (Đầy đủ 200, 201, 400, 401, 403, 404, 409)
- [x] **Tầng 4 (Playwright E2E)**: Pass 100% user journeys
- [x] **Tầng 5 (Security DAST)**: 0 CRITICAL / 0 HIGH vulnerabilities
