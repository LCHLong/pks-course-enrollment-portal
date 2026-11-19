import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Check Mermaid syntax using playwright in headless mode to be 100% sure!
import { chromium } from '@playwright/test';

async function testMermaid() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    </head>
    <body>
      <div id="test"></div>
      <script>
        mermaid.initialize({ startOnLoad: false, theme: 'dark' });
      </script>
    </body>
    </html>
  `);

  const diagrams = {
    arch: `graph TD
    subgraph CLIENT["Phân Hệ Frontend (Client - React 18 + Vite)"]
        UI["Giao diện Người dùng<br/>(Catalog, Detail, MyCourses, Admin)"]
        AUTH_CTX["Auth Context<br/>(Duy trì phiên JWT, Role State)"]
        DESIGN["Design System<br/>(Dual Theme, Deep Muted Colors)"]
        API_CLI["Axios API Client<br/>(Bearer Token, Sonner Toast)"]
        UI --> AUTH_CTX
        UI --> DESIGN
        AUTH_CTX --> API_CLI
    end

    subgraph NETWORK["Mạng & Điều Hướng (Cloud Edge)"]
        EDGE_FE["Vercel Frontend Edge<br/>pks-course-enrollment-portal-alpha.vercel.app"]
        EDGE_BE["Vercel Backend API<br/>pks-course-enrollment-portal-1pv7.vercel.app"]
        API_CLI -->|"HTTPS JSON"| EDGE_FE
        EDGE_FE -->|"Proxy /api/*"| EDGE_BE
    end

    subgraph SERVER["Phân Hệ Backend (Server - Node.js + Express)"]
        MW["Middleware Pipeline<br/>(Helmet, CORS, RateLimiter)"]
        AUTH_MW["JWT & RBAC Middleware<br/>(authMiddleware, requireRole)"]
        VALID["Zod Validations<br/>(Auth, Course, Enrollment DTO)"]
        CTRL["Express Controllers<br/>(auth, course, student, admin)"]
        SVC["Core Business Services<br/>(AuthService, EnrollmentService)"]
        EDGE_BE --> MW
        MW --> AUTH_MW
        AUTH_MW --> VALID
        VALID --> CTRL
        CTRL --> SVC
    end

    subgraph DATA["Tầng Dữ Liệu & Giao Tác (PostgreSQL + Prisma)"]
        PRISMA["Prisma Client Engine<br/>(Connection Pool, Transactions)"]
        ATOMIC["Concurrency Engine<br/>(PostgreSQL Atomic Update)"]
        DB[("PostgreSQL Database<br/>users, courses, enrollments")]
        SVC --> PRISMA
        SVC --> ATOMIC
        PRISMA --> DB
        ATOMIC --> DB
    end`,

    erd: `erDiagram
    users {
        String id PK "UUID Khóa chính"
        String name "Họ và tên"
        String email UK "Email định danh"
        String password_hash "Bcrypt salt >= 10"
        Role role "student | admin"
        DateTime created_at "Múi giờ Asia/Ho_Chi_Minh"
        DateTime updated_at "Thời gian cập nhật"
    }

    courses {
        String id PK "UUID Khóa chính"
        String title "Tên khóa học"
        String category "Danh mục công nghệ"
        String instructor "Tên giảng viên"
        String description "Mô tả khóa học"
        Int price "Học phí (VND)"
        Int capacity "Sĩ số tối đa (> 0)"
        Int enrolled_count "Đã ghi danh (<= capacity)"
        Boolean is_active "Mở ghi danh (Index)"
        DateTime created_at "Múi giờ Asia/Ho_Chi_Minh"
        DateTime updated_at "Thời gian cập nhật"
    }

    enrollments {
        String id PK "UUID Khóa chính"
        String user_id FK "Users.id (onDelete: Restrict)"
        String course_id FK "Courses.id (onDelete: Restrict)"
        EnrollmentStatus status "enrolled | confirmed | cancelled | pending"
        DateTime created_at "Ngày ghi danh (YYYY-MM-DD)"
        DateTime updated_at "Thời gian cập nhật"
    }

    users ||--o{ enrollments : "ghi danh"
    courses ||--o{ enrollments : "chứa"`,

    rbac: `flowchart TD
    GUEST["👤 Khách Vãng Lai (Guest)"]
    STUDENT["🎓 Học Viên (Student)"]
    ADMIN["👑 Quản Trị Viên (Admin)"]

    subgraph PUBLIC_ZONE["Phạm Vi Công Khai (Public Scope)"]
        PUB1["Xem Catalog Khóa Học (Đủ 8 trường)"]
        PUB2["Tìm kiếm Debounce & Lọc Category"]
        PUB3["Xem Chi tiết Khóa Học"]
        PUB4["Đăng ký & Đăng nhập (Cấp JWT Token)"]
    end

    subgraph STUDENT_ZONE["Phân Hệ Học Viên (Role: student)"]
        STU1["Ghi danh Khóa học (Chống Race Condition)"]
        STU2["Xem 'Khóa học của tôi' (Anti-IDOR)"]
        STU3["Tự hủy ghi danh (Hoàn lại sĩ số)"]
        STU4["Hồ sơ cá nhân & Đổi mật khẩu"]
    end

    subgraph SECURITY_GATE["🛡️ Chốt Chặn Kiểm Soát Quyền (RBAC Guard)"]
        JWT_GUARD{"Xác thực JWT Token<br/>auth.middleware.ts"}
        ROLE_GUARD{"Kiểm tra Role Admin<br/>requireRole('admin')"}
        FORBIDDEN["⛔ HTTP 403 Forbidden<br/>Từ chối truy cập!"]
    end

    subgraph ADMIN_ZONE["Phân Hệ Quản Trị (Role: admin)"]
        ADM1["Thêm Khóa Học Mới"]
        ADM2["Sửa Khóa Học (Bảo vệ capacity >= enrolled_count)"]
        ADM3["Ẩn / Hiện / Xóa Khóa Học"]
        ADM4["Theo dõi Học viên theo từng Khóa"]
        ADM5["Cập nhật Trạng thái (confirmed/cancelled)"]
    end

    GUEST --> PUB1
    GUEST --> PUB2
    GUEST --> PUB3
    GUEST --> PUB4

    STUDENT --> PUB1
    STUDENT --> PUB3
    STUDENT --> STU1
    STUDENT --> STU2
    STUDENT --> STU3
    STUDENT --> STU4

    STUDENT -.->|"Cố tình gọi API Admin"| JWT_GUARD
    JWT_GUARD -->|"Hợp lệ nhưng role=student"| ROLE_GUARD
    ROLE_GUARD -->|"role != 'admin'"| FORBIDDEN

    ADMIN --> JWT_GUARD
    JWT_GUARD -->|"Hợp lệ role=admin"| ROLE_GUARD
    ROLE_GUARD -->|"role == 'admin'"| ADM1
    ROLE_GUARD --> ADM2
    ROLE_GUARD --> ADM3
    ROLE_GUARD --> ADM4
    ROLE_GUARD --> ADM5`,

    race: `sequenceDiagram
    autonumber
    actor StudentA as 🎓 Học Viên A
    actor StudentB as 🎓 Học Viên B
    participant API as ⚙️ Express Backend API
    participant Tx as 🔄 Prisma $transaction
    participant PG as 🗄️ PostgreSQL Database

    Note over PG: Khóa học ID: C-01<br/>capacity = 20 | enrolled_count = 19<br/>(Chỉ còn ĐÚNG 1 suất cuối)

    par Cùng mili-giây T = 0ms
        StudentA->>API: POST /api/courses/C-01/enroll
    and
        StudentB->>API: POST /api/courses/C-01/enroll
    end

    Note over API: Trích xuất userId từ JWT (Anti-IDOR)

    API->>Tx: Bắt đầu Transaction cho Học Viên A
    API->>Tx: Bắt đầu Transaction cho Học Viên B

    rect rgb(20, 50, 35)
        Note over Tx,PG: HỌC VIÊN A ĐẾN TRƯỚC VÀ CHIẾM ROW LOCK
        Tx->>PG: UPDATE "courses" SET "enrolled_count" = "enrolled_count" + 1<br/>WHERE "id" = 'C-01' AND "enrolled_count" < "capacity"
        Note over PG: 19 < 20 là Đúng! enrolled_count = 20.<br/>Affected Rows = 1
        PG-->>Tx: Rows affected = 1 (Thành công)
        Tx->>PG: INSERT INTO "enrollments" (user_id_A, course_id, status='enrolled')
        Tx-->>API: COMMIT Transaction A
        API-->>StudentA: HTTP 201 Created: "Ghi danh thành công!"
    end

    rect rgb(60, 20, 20)
        Note over Tx,PG: HỌC VIÊN B ĐẾN SAU KHI LOCK GIẢI PHÓNG
        Tx->>PG: UPDATE "courses" SET "enrolled_count" = "enrolled_count" + 1<br/>WHERE "id" = 'C-01' AND "enrolled_count" < "capacity"
        Note over PG: enrolled_count hiện tại là 20.<br/>Điều kiện 20 < 20 là SAI!<br/>Affected Rows = 0!
        PG-->>Tx: Rows affected = 0
        Note over Tx: Phát hiện 0 rows -> Kích hoạt ROLLBACK!
        Tx-->>API: Throw AppError('COURSE_FULL', 400)
        API-->>StudentB: HTTP 400 Bad Request: "Khóa học đã đủ sĩ số tối đa."
    end

    Note over PG: Kết quả: enrolled_count = 20 <= capacity = 20<br/>KHÔNG OVERBOOKING!`,

    admin: `sequenceDiagram
    autonumber
    actor Admin as 👑 Quản Trị Viên (Admin)
    participant API as ⚙️ Express Admin Controller
    participant Service as 💼 Admin Service
    participant PG as 🗄️ PostgreSQL Database

    Admin->>API: PUT /api/admin/courses/:id (payload: { capacity: 15 })
    API->>Service: updateCourse(id, { capacity: 15 })
    
    Note over Service,PG: Bắt đầu Transaction & Khóa Dòng (Row Locking)
    Service->>PG: SELECT * FROM "courses" WHERE "id" = :id FOR UPDATE
    Note over PG: Khóa độc quyền dòng khóa học
    PG-->>Service: Dữ liệu hiện tại: { capacity: 25, enrolled_count: 18 }

    Note over Service: KIỂM TRA BẤT BIẾN: new_capacity (15) < enrolled_count (18)?

    alt Vi phạm: new_capacity < enrolled_count (15 < 18)
        Note over Service: Kích hoạt ROLLBACK & Mở khóa dòng!
        Service-->>API: Throw AppError('INVALID_CAPACITY', 400)
        API-->>Admin: HTTP 400 Bad Request: "Sĩ số không được thấp hơn số học viên đã ghi danh (18)."
    else Hợp lệ: new_capacity >= enrolled_count (ví dụ: capacity = 30)
        Service->>PG: UPDATE "courses" SET capacity = 30 WHERE id = :id
        Service-->>API: COMMIT Transaction & Mở khóa dòng
        API-->>Admin: HTTP 200 OK: "Cập nhật thành công!"
    end`,

    state: `stateDiagram-v2
    [*] --> ENROLLED: Học viên ghi danh (enrolled_count + 1)
    
    ENROLLED --> CONFIRMED: Admin xác nhận học viên đã thanh toán
    ENROLLED --> PENDING: Chờ duyệt hồ sơ hoặc chuyển lớp
    PENDING --> CONFIRMED: Admin duyệt vào danh sách chính thức

    ENROLLED --> CANCELLED: Học viên tự hủy trong My Courses (Hoàn sĩ số: GREATEST(count - 1, 0))
    CONFIRMED --> CANCELLED: Admin hủy ghi danh / rút hồ sơ (Hoàn sĩ số: GREATEST(count - 1, 0))

    CANCELLED --> ENROLLED: Học viên đăng ký lại (Kích hoạt lại bản ghi, enrolled_count + 1)

    CANCELLED --> [*]
    CONFIRMED --> [*]`,

    kcs: `flowchart LR
    G1["TẦNG 1: BUILD<br/>npm run build<br/>0 lỗi TypeScript"] --> G2["TẦNG 2: UNIT & INTEGRATION<br/>npm test<br/>29/29 Tests Passed"]
    G2 --> G3["TẦNG 3: NEWMAN POSTMAN<br/>npm run test:api<br/>27 Endpoints, 7 HTTP Codes"]
    G3 --> G4["TẦNG 4: PLAYWRIGHT E2E<br/>npm run test:e2e<br/>Hành trình Người dùng"]
    G4 --> G5["TẦNG 5: DAST SECURITY<br/>npm run dast<br/>0 Lỗ hổng High/Critical"]
    G5 --> PROD["🚀 VERCEL PRODUCTION<br/>Frontend & Backend Active<br/>10.0 / 10.0đ (+0.5đ Bonus)"]`
  };

  for (const [name, code] of Object.entries(diagrams)) {
    const result = await page.evaluate(async ({ name, code }) => {
      try {
        const { svg } = await window.mermaid.render('svg-' + name, code);
        return { success: true, name, svgLength: svg.length };
      } catch (err) {
        return { success: false, name, error: err.message };
      }
    }, { name, code });

    if (result.success) {
      console.log(`✅ [${name}] Valid Mermaid syntax! SVG length: ${result.svgLength}`);
    } else {
      console.error(`❌ [${name}] FAILED:`, result.error);
    }
  }

  await browser.close();
}

testMermaid();
