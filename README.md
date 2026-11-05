# PKS Course & Enrollment Portal

Mini web-app phục vụ tra cứu, quản lý và ghi danh các khóa học công nghệ.
Bài test kỹ năng Vòng 2 - Thực tập sinh Fullstack Developer (Node.js + React.js) - PKS.

---

## 🚀 Bắt đầu nhanh (Quick Start)

Dự án được tổ chức theo mô hình **Monorepo (npm workspaces)** với 2 phân hệ `client/` và `server/`:

```bash
# 1. Cài đặt toàn bộ dependencies cho cả client và server
npm install

# 2. Khởi chạy đồng thời cả Frontend và Backend ở môi trường Development
npm run dev

# Hoặc khởi chạy độc lập từng phân hệ:
npm run dev:client   # Frontend chạy tại http://localhost:5173
npm run dev:server   # Backend chạy tại http://localhost:5000
```

---

## 🏗️ Cấu trúc thư mục Monorepo

```text
pks-course-enrollment-portal/
├── client/                     # Phân hệ Frontend (React + Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── components/
│   │   │   ├── course/         # Thẻ khóa học CourseCard (đủ 8 thông tin, chuẩn mobile)
│   │   │   └── layout/         # Header (Theme Toggle + Drawer), Footer
│   │   ├── types/              # Định nghĩa Types TypeScript (Course, User, Enrollment)
│   │   ├── utils/              # formatCurrency (\u00A0₫), formatDate (YYYY-MM-DD)
│   │   ├── App.tsx             # Giao diện chính tích hợp Sonner Toast
│   │   ├── main.tsx
│   │   └── index.css           # Cấu hình Tailwind + Font 16px chống iOS auto-zoom
│   ├── tailwind.config.js      # Bảng màu Deep Muted Semantics + Dark Mode
│   └── vite.config.ts
│
├── server/                     # Phân hệ Backend (Node.js + Express + TypeScript + Prisma)
│   ├── prisma/
│   │   └── schema.prisma       # CSDL SQLite/PostgreSQL (Users, Courses, Enrollments)
│   ├── src/
│   │   ├── middlewares/        # Xác thực JWT (auth.middleware) & Phân quyền (role.middleware)
│   │   ├── routes/             # Định tuyến RESTful API (/api)
│   │   ├── app.ts              # Cấu hình Express App, CORS, Error Handler
│   │   └── server.ts           # Điểm khởi chạy Server cổng 5000
│   └── tsconfig.json
│
├── docs/                       # Tài liệu đặc tả & Design System
│   ├── REQUIREMENTS.md         # Đề bài & Checklist nghiệm thu 36h
│   └── design-system/          # Hệ thống thiết kế chuẩn
│       ├── UI_RULES.md         # Quy tắc UI cho lập trình viên
│       ├── tokens.json         # Design tokens JSON chuẩn DTCG
│       ├── tokens.css          # Biến CSS sẵn dùng
│       └── preview.html        # Trình xem trước giao diện và kiểm thử Mobile/Desktop
│
├── .agents/                    # Quy tắc tự động cho AI Coding Assistant
│   └── rules/
│       └── ui-rules.md         # Luôn kích hoạt (trigger: always_on)
├── AGENTS.md                   # Chỉ dẫn tổng quan cho AI Agent
├── .env.example                # File mẫu biến môi trường
├── .gitignore
└── package.json                # Root package.json với npm workspaces
```

---

## 📚 Tài liệu & Quy chuẩn dự án

- **[Yêu cầu & Checklist nghiệm thu](docs/REQUIREMENTS.md):** Đặc tả chi tiết từng chức năng nghiệp vụ và tiêu chí chấm điểm.
- **[Hướng dẫn thiết lập Supabase Database](docs/SUPABASE_SETUP.md):** Cách kết nối PostgreSQL, Connection Pooling và chạy Seed Data.
- **[Quy chuẩn AI Agent](AGENTS.md):** Chỉ dẫn và quy tắc tự động cho AI Coding Assistant (`.agents/rules/ui-rules.md`).
- **Thư mục Hệ thống Thiết kế ([docs/design-system/](docs/design-system/)):**
  - **[UI Rules & Quy chuẩn giao diện](docs/design-system/UI_RULES.md):** Quy chuẩn thiết kế Pure Monochrome, cấu trúc Course Card và tương tác.
  - **[Design Tokens (JSON)](docs/design-system/tokens.json):** Đặc tả Design Tokens chuẩn (W3C DTCG format) cho AI và lập trình viên.
  - **[Theme Tokens (CSS)](docs/design-system/tokens.css):** Các biến CSS đơn sắc sẵn sàng tái sử dụng.
  - **[Xem trước Trực quan (Live Preview HTML)](docs/design-system/preview.html):** Mở trực tiếp bằng trình duyệt để xem bảng màu và mô phỏng Card khóa học.

