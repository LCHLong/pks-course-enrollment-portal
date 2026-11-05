# TÀI LIỆU YÊU CẦU DỰ ÁN & CHECKLIST NGHIỆM THU CHI TIẾT
## PKS Course & Enrollment Portal
- **Vị trí ứng tuyển:** Thực tập sinh Fullstack Developer (Node.js + React.js)
- **Thời gian làm bài:** Tối đa **36 giờ** (tính từ thời điểm bấm "Bắt đầu làm bài" trên Cổng nộp bài)
- **Đơn vị tổ chức:** Công ty TNHH Công Nghệ & Giáo Dục PKS
- **Mã tài liệu gốc:** `ND_PV_FULLSTACK.pdf`

---

## 1. BỐI CẢNH DỰ ÁN & ĐỀ BÀI
Công ty TNHH Công Nghệ & Giáo Dục PKS vận hành hai thương hiệu:
- **PKS Education:** Đào tạo thực chiến Co-op IT và Tin học quốc tế MOS.
- **PKS Technology:** Giải pháp công nghệ, Web chuẩn SEO và Mini-ERP.

**Mục tiêu bài test:** Xây dựng mini web-app **"PKS Course & Enrollment Portal"** phục vụ tra cứu, quản lý và ghi danh các khóa học công nghệ. Hệ thống có 2 vai trò người dùng:
1. **Học viên (Student)**
2. **Quản trị viên (Admin/Staff)**

---

## 2. STACK CÔNG NGHỆ QUY ĐỊNH & KHUYẾN NGHỊ

| Thành phần | Công nghệ yêu cầu / Khuyến nghị | Ghi chú từ đề bài |
| :--- | :--- | :--- |
| **Frontend** | React.js (khuyến nghị dùng **Vite** hoặc **Next.js**) | React Router v6+ có **Protected Routes** |
| **Backend** | Node.js với **Express / Fastify / NestJS** | Xây dựng RESTful API chuẩn |
| **Database** | **PostgreSQL / MySQL / MongoDB** | Kết hợp ORM: Prisma / Drizzle / TypeORM / Mongoose |
| **Bảo mật** | **Bcrypt** (salt $\ge 10$), **JWT** có thời hạn sử dụng (`expiresIn`) | RBAC nghiêm ngặt giữa Student & Admin |
| **Quy chuẩn Code & Git** | Conventional Commits, file `.env.example`, không commit secret, không bulk commit | Source code tổ chức phân tầng rõ ràng |
| **Thời gian & Múi giờ** | Múi giờ `Asia/Ho_Chi_Minh`, định dạng ngày `YYYY-MM-DD` | Đồng nhất ở cả Database, API và Frontend |

---

## 3. CHI TIẾT ĐẶC TẢ YÊU CẦU CHỨC NĂNG

### 3.1. Phân hệ Học viên (Student)

#### A. Đăng ký tài khoản (Register)
- **Input:** Họ tên (`name`), Email (`email`), Mật khẩu (`password`).
- **Validation:**
  - Kiểm tra tính hợp lệ của email (format regex).
  - Độ dài mật khẩu tối thiểu hợp lý.
  - Kiểm tra email đã tồn tại trong CSDL hay chưa; nếu đã tồn tại thì báo lỗi conflict (HTTP 409 hoặc 400).
- **Security:** Mật khẩu bắt buộc phải băm bằng `bcrypt` với `salt >= 10` trước khi lưu CSDL.
- **Role mặc định:** Tạo mới mặc định mang vai trò `student`.

#### B. Đăng nhập & Đăng xuất (Authentication)
- **Đăng nhập:** Email và mật khẩu.
  - Kiểm tra thông tin xác thực. Nếu sai trả về lỗi rõ ràng (HTTP 401).
  - Khi xác thực thành công: Backend cấp JWT có thiết lập thời gian hết hạn (`expiresIn`, ví dụ: `1d` hoặc `7d`).
- **Duy trì phiên đăng nhập:** Frontend lưu trữ token an toàn và khôi phục trạng thái đăng nhập khi người dùng F5 / mở lại trình duyệt.
- **Đăng xuất:** Xóa token và đưa người dùng về trạng thái khách (Guest).

#### C. Trang chủ - Danh sách khóa học (Course Catalog)
- **Giao diện:** Hiển thị danh sách khóa học dạng **Card/Thẻ**.
- **Thông tin hiển thị trên mỗi Card (BẮT BUỘC ĐẦY ĐỦ 8 THÔNG TIN):**
  1. Tên khóa học (`title`/`name`)
  2. Danh mục (`category`)
  3. Giảng viên (`instructor`)
  4. Mô tả ngắn (`description`)
  5. Học phí (`price`/`tuition_fee`)
  6. Sĩ số tối đa (`capacity`)
  7. Số lượng học viên đã đăng ký (`enrolled_count`)
  8. Trạng thái: **"Còn chỗ"** (nếu `enrolled_count < capacity`) hoặc **"Hết chỗ"** (nếu `enrolled_count >= capacity`)
- **Bộ lọc & Tìm kiếm:**
  - Tìm kiếm khóa học theo tên (Search by name).
  - Lọc theo danh mục (Filter by category).

#### D. Trang chi tiết khóa học (Course Details)
- Xem thông tin chi tiết đầy đủ của khóa học.
- Nút bấm hành động: **"Ghi danh" (Enroll)**:
  - Nếu khách chưa đăng nhập: Chuyển hướng ngay sang trang Đăng nhập (`/login`). Sau khi đăng nhập thành công có thể quay lại trang khóa học.
  - Nếu đã đăng nhập: Thực hiện ghi danh.

#### E. Nghiệp vụ Ghi danh khóa học (Core Concurrency & Integrity Logic)
- **Chặn đăng ký trùng:** Mỗi học viên chỉ được ghi danh một khóa học đúng 1 lần. Nếu đã ghi danh rồi mà bấm tiếp, hệ thống từ chối và thông báo đã đăng ký.
- **Chặn khi hết chỗ:** Nếu khóa học đã đạt sĩ số tối đa (`enrolled_count >= capacity`), hệ thống từ chối yêu cầu và phản hồi thông báo khóa học đã đủ sĩ số.
- **Xử lý Race Condition khi tranh suất cuối:**
  - Đối với trường hợp nhiều học viên cùng đăng ký suất cuối cùng, hệ thống **bắt buộc** phải sử dụng:
    - **Database Transaction**, hoặc
    - **Row Locking (`SELECT ... FOR UPDATE`)**, hoặc
    - **Atomic Update (`UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = :id AND enrolled_count < capacity`)**.
  - Đảm bảo không xảy ra hiện tượng Overbooking (`enrolled_count > capacity`).
- **Tính nhất quán:** Sau khi ghi danh thành công, bản ghi trong bảng `Enrollments` và giá trị `enrolled_count` của khóa học phải đảm bảo khớp hoàn toàn.

#### F. Khóa học của tôi (My Courses)
- Học viên xem danh sách các khóa học mà chính tài khoản này đã đăng ký.
- Thông tin mỗi mục: Tên khóa học, ngày ghi danh (`YYYY-MM-DD`), trạng thái ghi danh.
- **Kiểm soát truy cập (IDOR Prevention):** Học viên tuyệt đối chỉ được xem dữ liệu ghi danh thuộc tài khoản của chính mình.

---

### 3.2. Phân hệ Quản trị viên (Admin / Staff)

#### A. Đăng nhập Quản trị & Phân quyền (RBAC)
- Đăng nhập bằng tài khoản Quản trị viên (`role: admin`).
- **JWT & Role Middleware:** Mọi route Frontend quản trị và API Backend `/api/admin/*` phải được bảo vệ bởi middleware xác thực JWT và kiểm tra `role === 'admin'`.
- Người dùng có role `student` bị từ chối truy cập (HTTP 403 Forbidden trên API và redirect chặn route trên Frontend).

#### B. Quản lý khóa học (Course CRUD)
Admin/Staff có toàn quyền:
- **Thêm mới khóa học:** Nhập tên, danh mục, giảng viên, mô tả, học phí, sĩ số tối đa (`capacity`), trạng thái ẩn/hiện.
- **Chỉnh sửa khóa học:** Cập nhật thông tin khóa học và cấu hình sĩ số tối đa.
  - **Ràng buộc nghiệp vụ quan trọng:** **Sĩ số tối đa (`capacity`) không được thiết lập thấp hơn số lượng học viên đã ghi danh thực tế (`capacity >= enrolled_count`)**.
- **Xóa / Ẩn khóa học:** Xóa hoặc chuyển trạng thái ẩn để học viên không nhìn thấy.
- **Validation:** Backend phải validate chặt chẽ mọi dữ liệu đầu vào trước khi lưu vào CSDL.

#### C. Xem danh sách ghi danh theo khóa học (Enrollment Tracking)
- Admin/Staff có thể chọn từng khóa học để xem danh sách toàn bộ học viên đã đăng ký khóa đó.
- Thông tin bắt buộc hiển thị:
  1. Họ tên học viên
  2. Email học viên
  3. Tên khóa học
  4. Thời gian đăng ký (định dạng `YYYY-MM-DD`)
  5. Trạng thái ghi danh

#### D. Trạng thái giao diện & UX
- Quá trình gọi API phải có đầy đủ:
  - **Loading State:** Spinner / Skeleton khi đang tải dữ liệu.
  - **Empty State:** Thông báo rõ ràng khi danh sách trống.
  - **Error State:** Hiển thị lỗi thân thiện khi API gặp trục trặc.
  - **Disabled Button:** Vô hiệu hóa nút bấm khi form đang submit để tránh bấm nhiều lần.
- **Thông báo:** Mọi phản hồi thành công hoặc thất bại phải dùng **Toast Notification** (hoặc Notification UI component tương đương), **tuyệt đối không sử dụng `alert()` mặc định**.

---

## 4. THIẾT KẾ DỮ LIỆU TỐI THIỂU (MINIMUM DATABASE ENTITIES)

### 4.1. Bảng `Users`
- `id`: Khóa chính (UUID / INT Auto Increment)
- `name`: String (Họ và tên)
- `email`: String (Unique, Indexed)
- `password_hash`: String (Bcrypt salt $\ge 10$)
- `role`: Enum / String (`student`, `admin`)
- `created_at`, `updated_at`: DateTime

### 4.2. Bảng `Courses`
- `id`: Khóa chính
- `title`: String (Tên khóa học)
- `category`: String (Danh mục công nghệ: Frontend, Backend, AI, MOS, ...)
- `instructor`: String (Tên giảng viên)
- `description`: Text (Mô tả khóa học)
- `price`: Decimal / Integer (Học phí)
- `capacity`: Integer (Sĩ số tối đa, $> 0$)
- `enrolled_count`: Integer (Số lượng đã ghi danh, mặc định 0, không được vượt quá `capacity`)
- `is_active` / `status`: Boolean hoặc Enum (`active`, `hidden`, `deleted`)
- `created_at`, `updated_at`: DateTime

### 4.3. Bảng `Enrollments`
- `id`: Khóa chính
- `user_id`: Khóa ngoại liên kết `Users(id)`
- `course_id`: Khóa ngoại liên kết `Courses(id)`
- `registration_date`: Date / DateTime (Múi giờ `Asia/Ho_Chi_Minh`, hiển thị `YYYY-MM-DD`)
- `status`: String / Enum (`confirmed`, `cancelled`, ...)
- `created_at`, `updated_at`: DateTime
- **Ràng buộc duy nhất:** `UNIQUE(user_id, course_id)` để đảm bảo 1 học viên không thể đăng ký 2 lần cho cùng 1 khóa ở tầng CSDL.

---

## 5. ĐẶC TẢ API & CHUẨN PHẢN HỒI JSON

### Cấu trúc JSON Response thống nhất:
- **Thành công:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Thao tác thành công"
}
```
- **Lỗi:**
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

### Danh sách API chính:
1. `POST /api/auth/register` - Đăng ký tài khoản
2. `POST /api/auth/login` - Đăng nhập (trả JWT token & user info)
3. `GET /api/auth/me` - Lấy thông tin user hiện tại (yêu cầu JWT)
4. `GET /api/courses` - Lấy danh sách khóa học (hỗ trợ query `?search=...&category=...`)
5. `GET /api/courses/:id` - Xem chi tiết 1 khóa học
6. `POST /api/courses/:id/enroll` - Ghi danh khóa học (Học viên, chống race condition)
7. `GET /api/student/my-courses` - Lấy danh sách khóa học của học viên đang đăng nhập
8. `POST /api/admin/courses` - Tạo khóa học mới (Admin)
9. `PUT /api/admin/courses/:id` - Cập nhật khóa học & capacity (Admin, validate capacity >= enrolled_count)
10. `DELETE /api/admin/courses/:id` - Xóa hoặc ẩn khóa học (Admin)
11. `GET /api/admin/courses/:id/enrollments` - Xem danh sách học viên ghi danh của 1 khóa học (Admin)

---

## 6. THƯ MỤC NỘP BÀI `/docs` & YÊU CẦU KIỂM THỬ

Thư mục `/docs` là phần bắt buộc trong bài thi và chiếm tỉ trọng điểm lớn:
```
docs/
├── REQUIREMENTS.md               # Tài liệu yêu cầu bài test (file này)
├── ERD.md (hoặc ERD.png)         # Sơ đồ quan hệ thực thể cơ sở dữ liệu
├── postman_collection.json       # Export file Postman Collection chứa toàn bộ API
└── screenshots/                  # Thư mục hình ảnh bằng chứng kiểm thử
    ├── test-auth-register.png    # Ảnh test đăng ký thành công & lỗi trùng email
    ├── test-auth-login.png       # Ảnh test đăng nhập đúng & sai mật khẩu
    ├── test-course-crud.png      # Ảnh test thêm/sửa/xóa khóa học (Admin)
    ├── test-enroll-success.png   # Ảnh test ghi danh thành công
    ├── test-enroll-duplicate.png # Ảnh test mã lỗi khi đăng ký trùng
    ├── test-enroll-capacity.png  # Ảnh test mã lỗi khi khóa học hết chỗ
    └── test-race-condition.png   # Ảnh/log test concurrency tranh suất cuối
```

### Yêu cầu Postman Collection:
- Phải gom nhóm các thư mục: `Auth`, `Student Courses & Enrollment`, `Admin Management`.
- Thiết lập sẵn biến môi trường Postman (như `{{baseUrl}}`, `{{token}}`).
- Test đủ các status code:
  - `200 OK` / `201 Created`
  - `400 Bad Request` (Validation lỗi dữ liệu)
  - `401 Unauthorized` (Chưa đăng nhập / Token hết hạn)
  - `403 Forbidden` (Student cố tình gọi API Admin hoặc xem dữ liệu học viên khác)
  - `404 Not Found` (Khóa học không tồn tại)
  - `409 Conflict` (Email đã tồn tại / Đã ghi danh khóa này rồi)

---

## 7. QUY CHUẨN SOURCE CODE, GIT & BẢO MẬT

1. **Bảo mật biến môi trường:**
   - **Tuyệt đối không commit file `.env` hoặc secret keys** lên Git.
   - Bắt buộc tạo và duy trì file `.env.example` với đầy đủ các biến mẫu (`PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `VITE_API_BASE_URL`, ...).
2. **Quy chuẩn Git Commit:**
   - Sử dụng **Conventional Commits**:
     - `feat: ...` (tính năng mới)
     - `fix: ...` (sửa lỗi)
     - `docs: ...` (tài liệu, requirements, ERD, postman)
     - `refactor: ...` (tối ưu cấu trúc mã nguồn)
     - `test: ...` (unit / integration test)
   - **Tuyệt đối không bulk dump:** Phải commit từng bước theo tiến độ phát triển thay vì 1 commit duy nhất toàn bộ source code.
3. **Cấu trúc Source Code phân tầng:**
   - Phân tách rõ ràng: Routes -> Controllers -> Services -> Models/Repositories -> Middlewares -> Validations.
4. **File `README.md` tại thư mục gốc:**
   - Giới thiệu dự án, công nghệ sử dụng.
   - Hướng dẫn cài đặt Dependencies & biến môi trường.
   - Hướng dẫn chạy Database Migration / Seeding dữ liệu mẫu.
   - Hướng dẫn khởi chạy Backend & Frontend.
   - **Tài khoản Demo:** Cung cấp sẵn ít nhất 2 tài khoản:
     - Tài khoản Admin: `admin@pks.edu.vn` / `Password123@`
     - Tài khoản Student: `student@pks.edu.vn` / `Password123@`
   - Link Demo online hoặc đính kèm video demo thao tác nếu có.

---

## 8. THANG ĐIỂM ĐÁNH GIÁ CHI TIẾT (THANG 10 ĐIỂM + 0.5 BONUS)

```
┌────────────────────────────────────────────────────────┬─────────┐
│ Hạng mục đánh giá                                      │ Điểm số │
├────────────────────────────────────────────────────────┼─────────┤
│ 1. BACKEND & CƠ SỞ DỮ LIỆU                             │ 3.0 đ   │
│   • ERD hợp lý, chuẩn hóa quan hệ (Users, Courses, ...)│ 0.75 đ  │
│   • RESTful API CRUD Khóa học & Xác thực Auth          │ 1.25 đ  │
│   • Xử lý trùng lặp & sức chứa capacity (Race Condition) 1.00 đ  │
│   • Tiêu chí nâng cao: Transaction, Input Validation,  │         │
│     xử lý chuẩn Date YYYY-MM-DD Asia/Ho_Chi_Minh       │         │
├────────────────────────────────────────────────────────┼─────────┤
│ 2. FRONTEND & UI/UX                                    │ 2.5 đ   │
│   • Giao diện Responsive (Desktop & Mobile)            │ 1.00 đ  │
│   • Gọi API danh sách dạng Card & chi tiết khóa học    │ 1.00 đ  │
│   • Login / Logout & duy trì phiên làm việc            │ 0.50 đ  │
│   • Tiêu chí nâng cao: Loading/Empty/Disabled State,   │         │
│     Toast Notification (không dùng alert), Code split  │         │
├────────────────────────────────────────────────────────┼─────────┤
│ 3. PHÂN QUYỀN (RBAC) & BẢO MẬT                         │ 1.5 đ   │
│   • Tách biệt phân hệ Admin và Student                 │ 0.75 đ  │
│   • Protected Routes (FE) & JWT Middleware (BE)        │ 0.75 đ  │
│   • Tiêu chí nâng cao: Bcrypt salt >= 10, bảo mật .env │         │
├────────────────────────────────────────────────────────┼─────────┤
│ 4. KIỂM THỬ & POSTMAN                                  │ 1.5 đ   │
│   • Postman Collection đầy đủ các luồng trong /docs    │ 0.75 đ  │
│   • Ảnh chụp kết quả test CRUD & mã lỗi rõ ràng        │ 0.75 đ  │
│   • Tiêu chí nâng cao: Unit / Integration Test         │ +0.5 đ  │
│     bằng Jest / Vitest / Supertest (Bonus)             │         │
├────────────────────────────────────────────────────────┼─────────┤
│ 5. GIT & CLEAN CODE                                    │ 1.5 đ   │
│   • Cấu trúc source code rõ ràng, phân tầng chuẩn      │ 0.75 đ  │
│   • README chuyên nghiệp, hướng dẫn setup & demo acc   │ 0.75 đ  │
│   • Tiêu chí nâng cao: Conventional Commits,           │         │
│     .env.example, không bulk dump code                 │         │
├────────────────────────────────────────────────────────┼─────────┤
│ TỔNG CỘNG ĐIỂM TỐI ĐA                                  │ 10.5 đ  │
└────────────────────────────────────────────────────────┴─────────┘
```

---

## 9. QUY CHẾ VÀ LƯU Ý SỐNG CÒN KHI NỘP BÀI
> [!CAUTION]
> **Quy chế nộp bài của PKS:**
> 1. Bạn **BẮT BUỘC** thực hiện tải đề bài, làm bài và gửi bài làm (upload file bài làm / đính kèm link GitHub / link Demo) **trực tiếp trên Cổng nộp bài định danh hệ thống**.
> 2. Hệ thống **tự động ghi nhận**: Kết quả chỉ hợp lệ khi bạn hoàn thành thao tác bấm **"Nộp bài"** thành công trên Cổng trực tuyến trong thời hạn **36 giờ** (tính từ thời điểm bấm bắt đầu).
> 3. Hệ thống **tuyệt đối không tiếp nhận bài làm nộp qua Email cá nhân hoặc các kênh liên hệ khác**.
> 4. Trường hợp không nộp trong thời hạn quy định sẽ được hiểu là từ chối tham gia tiếp các vòng tuyển dụng.
