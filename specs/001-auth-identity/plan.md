# Implementation Plan: 001-auth-identity

**Branch**: `001-auth-identity` | **Date**: 2026-11-05 | **Spec**: [Feature Specification: 001-auth-identity](./spec.md)  
**Target Project**: `/Users/macbookpro/Documents/Work/Prepare/PKS/pks-course-enrollment-portal`

---

## 1. Summary

This plan specifies the technical architecture, data model, RESTful API contracts, security mechanisms, and verification routines for the **001-auth-identity** feature. It delivers:
1. Public registration API (`POST /api/auth/register`) with RFC 5322 email normalization, duplicate email collision detection (HTTP 409 `EMAIL_ALREADY_EXISTS`), and `bcryptjs` password hashing with salt rounds $\ge 10$.
2. Public login API (`POST /api/auth/login`) with constant-time password verification and signed JWT token issuance (`expiresIn: '1d'`).
3. Protected user session hydration API (`GET /api/auth/me`) guarded by JWT verification middleware.
4. Client-side authentication context (`AuthContext`), persistent storage integration (`localStorage`), Sonner toast notification wiring, and accessible React views (`RegisterPage`, `LoginPage`, `Header` integration) with 100% `data-testid` and ARIA coverage.

---

## 2. Technical Context

- **Frontend Runtime & Framework**: React 18.3.1, TypeScript 5.6.3, Vite 5.4.10.
- **Frontend Routing & Styling**: `react-router-dom` v6.27.0, Tailwind CSS 3.4.14, Radix UI Dialog & Slot primitives, Lucide React icons, Sonner toast v1.7.0.
- **Backend Runtime & Framework**: Node.js v20+, Express 4.21.1, TypeScript 5.6.3 (`tsx` runtime execution).
- **Database & ORM**: PostgreSQL 15+ (hosted on Supabase Cloud), Prisma ORM 5.21.1.
- **Security & Validation Libraries**:
  - `bcryptjs` 2.4.3 (salt work factor $\ge 10$).
  - `jsonwebtoken` 9.0.2 (HS256 symmetric signing, explicit `expiresIn`).
  - `zod` 3.23.8 (request payload schema validation).
- **Timezone & Locale**: Timezone `Asia/Ho_Chi_Minh` (UTC+7), Date format `YYYY-MM-DD`.

---

## 3. Constitution & Architecture Governance Gates

| Gate ID | Governance Check | Status | Verification Detail |
|---|---|---|---|
| **GATE-01** | Dual Theme Support | PASS | Tailwind `darkMode: 'class'` configured with Deep Muted Semantics (Emerald `#065F46` / `#34D399` for student, Amber `#92400E` / `#FBBF24` for admin). |
| **GATE-02** | Mobile-First Ergonomics | PASS | All input elements have font size $\ge 16\text{px}$ (`text-base sm:text-sm`) to eliminate iOS Safari auto-zoom; button heights $\ge 44\text{px}$ (`h-11`). |
| **GATE-03** | Cryptographic Hygiene | PASS | `bcryptjs.hash(password, 10)` strictly enforced. `password_hash` omitted from all Prisma select queries and JSON outputs. |
| **GATE-04** | Token Lifecycle Hygiene | PASS | JWT signed with explicit expiration (`expiresIn: '1d'`); secret loaded from `process.env.JWT_SECRET`. |
| **GATE-05** | Standard Uniform Envelope | PASS | All responses adhere to `{ success: true, data, message }` or `{ success: false, error: { code, message, details } }`. |
| **GATE-06** | Zero Native Alerts | PASS | 100% of user notifications dispatched via `sonner` (`toast.success`, `toast.error`); no native `alert()` or `confirm()`. |

---

## 4. Project Structure & Code Layout

```text
pks-course-enrollment-portal/
├── specs/001-auth-identity/
│   ├── spec.md
│   ├── plan.md
│   └── tasks.md
├── client/
│   └── src/
│       ├── contexts/
│       │   └── AuthContext.tsx           # Global auth provider, user state, login/logout/updateUser methods
│       ├── services/
│       │   └── authService.ts            # Typed API client for register, login, getMe
│       ├── pages/
│       │   ├── RegisterPage.tsx          # Accessible registration form with validation & Sonner
│       │   └── LoginPage.tsx             # Accessible login form with returnUrl handling & Sonner
│       ├── components/
│       │   └── Header.tsx                # Authenticated vs Guest navigation, role badge, logout
│       └── types/
│           └── auth.ts                   # User, AuthState, LoginCredentials, RegisterPayload types
└── server/
    ├── prisma/
    │   └── schema.prisma                 # User model definition with role enum and unique email
    └── src/
        ├── controllers/
        │   └── auth.controller.ts        # Handlers for register, login, me
        ├── services/
        │   └── auth.service.ts           # Business logic: hashing, JWT creation, DB transactions
        ├── schemas/
        │   └── auth.schema.ts            # Zod validation schemas for register and login payloads
        ├── middlewares/
        │   ├── auth.middleware.ts        # Bearer token extractor & JWT validator
        │   └── validate.middleware.ts    # Generic Zod validation middleware
        └── routes/
            ├── auth.routes.ts            # Router mounting /register, /login, /me
            └── index.ts                  # Main API router mounting /api/auth
```

---

## 5. Data Model (`User`)

### 5.1. Prisma Schema Mapping
```prisma
enum Role {
  student
  admin
}

model User {
  id            String       @id @default(uuid())
  name          String
  email         String       @unique
  password_hash String
  role          Role         @default(student)
  created_at    DateTime     @default(now())
  updated_at    DateTime     @updatedAt

  enrollments   Enrollment[]

  @@map("users")
}
```

### 5.2. Field Constraints & Validation Rules
| Field | Type | Storage / DB Rule | Validation Rules | Description |
|---|---|---|---|---|
| `id` | `String` | UUID v4 PK | Non-empty string | Unique system identifier |
| `name` | `String` | `VARCHAR(255)` NOT NULL | Length $\ge 2$ and $\le 100$ chars, trimmed | User's full display name |
| `email` | `String` | `VARCHAR(255)` NOT NULL, UNIQUE | RFC 5322 email regex, normalized to lowercase | Unique authentication identifier |
| `password_hash` | `String` | `VARCHAR(255)` NOT NULL | Bcrypt hash string with cost $\ge 10$ | Salted password hash |
| `role` | `Role` | Enum (`student`, `admin`) NOT NULL | Must be valid enum value, default: `student` | Authorization level |
| `created_at` | `DateTime` | `TIMESTAMPTZ` NOT NULL | Default: `now()` | Account creation timestamp |
| `updated_at` | `DateTime` | `TIMESTAMPTZ` NOT NULL | Auto-updated | Last modification timestamp |

### 5.3. State Transition Matrix
```mermaid
stateDiagram-v2
    [*] --> Guest: Unauthenticated
    Guest --> Registered: POST /api/auth/register (Role: student)
    Registered --> Guest: Redirect to /login
    Guest --> Authenticated: POST /api/auth/login (JWT issued)
    Authenticated --> Authenticated: GET /api/auth/me (Refresh / Validate)
    Authenticated --> Guest: User triggers Logout (Token removed)
    Authenticated --> Guest: Token expired / 401 error
```

---

## 6. Interface Contracts (REST API)

### 6.1. Endpoint Inventory
| HTTP Verb | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No (Public) | Registers a new student account |
| `POST` | `/api/auth/login` | No (Public) | Authenticates user and returns JWT + user info |
| `GET` | `/api/auth/me` | Yes (`Bearer <token>`) | Retrieves current authenticated user profile |

---

### 6.2. Endpoint 1: Register User
`POST /api/auth/register`

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body Schema (Zod)
```typescript
export const registerSchema = z.object({
  name: z.string().trim().min(2, "Họ và tên phải có ít nhất 2 ký tự").max(100, "Họ và tên không quá 100 ký tự"),
  email: z.string().trim().toLowerCase().email("Định dạng email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").max(100, "Mật khẩu không quá 100 ký tự")
});
```

#### Request Body Example
```json
{
  "name": "Nguyễn Văn A",
  "email": "nguyen.van.a@example.com",
  "password": "Password123!"
}
```

#### Response 201 Created
```json
{
  "success": true,
  "data": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Nguyễn Văn A",
    "email": "nguyen.van.a@example.com",
    "role": "student",
    "created_at": "2026-11-05T17:30:00.000Z"
  },
  "message": "Đăng ký tài khoản thành công! Vui lòng đăng nhập."
}
```

#### Response 400 Bad Request (Validation Error)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu đầu vào không hợp lệ",
    "details": [
      {
        "field": "email",
        "message": "Định dạng email không hợp lệ"
      }
    ]
  }
}
```

#### Response 409 Conflict (Duplicate Email)
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.",
    "details": null
  }
}
```

---

### 6.3. Endpoint 2: Login User
`POST /api/auth/login`

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body Schema (Zod)
```typescript
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Định dạng email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu")
});
```

#### Request Body Example
```json
{
  "email": "student@pks.edu.vn",
  "password": "Student@123456"
}
```

#### Response 200 OK
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "3b241101-e291-49ae-967a-1296c6665799",
      "name": "Học Viên Mẫu",
      "email": "student@pks.edu.vn",
      "role": "student",
      "created_at": "2026-11-05T10:00:00.000Z"
    }
  },
  "message": "Đăng nhập thành công"
}
```

#### Response 401 Unauthorized (Invalid Credentials)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email hoặc mật khẩu không chính xác.",
    "details": null
  }
}
```

---

### 6.4. Endpoint 3: Current User Session
`GET /api/auth/me`

#### Request Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response 200 OK
```json
{
  "success": true,
  "data": {
    "id": "3b241101-e291-49ae-967a-1296c6665799",
    "name": "Học Viên Mẫu",
    "email": "student@pks.edu.vn",
    "role": "student",
    "created_at": "2026-11-05T10:00:00.000Z"
  },
  "message": "Lấy thông tin người dùng thành công"
}
```

#### Response 401 Unauthorized (Missing or Expired Token)
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

---

## 7. Security Implementation Details

### 7.1. Password Hashing Specification
```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
```

### 7.2. JWT Token Issuance & Verification
```typescript
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  email: string;
  role: 'student' | 'admin';
}

export function generateToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: '1d'
  });
}
```

### 7.3. Auth Middleware Pattern
```typescript
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Vui lòng đăng nhập để tiếp tục', details: null }
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    const code = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
    return res.status(401).json({
      success: false,
      error: { code, message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn', details: null }
    });
  }
};
```

---

## 8. Quickstart & Verification Guide

### 8.1. Local Testing via cURL

```bash
# 1. Register a new student account
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Trần Văn Test", "email": "tran.van.test@example.com", "password": "TestPassword123"}'

# 2. Attempt duplicate registration (Expected: 409 Conflict)
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Trần Văn Test", "email": "tran.van.test@example.com", "password": "TestPassword123"}'

# 3. Log in with the newly registered user (Expected: 200 OK with token)
TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "tran.van.test@example.com", "password": "TestPassword123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 4. Fetch /me profile using the Bearer token (Expected: 200 OK)
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 5. Call /me with invalid token (Expected: 401 Unauthorized)
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer invalid-token-string"
```

### 8.2. Frontend Accessibility & Contract Audit
1. Run browser to `http://localhost:5173/register` and inspect:
   - Check presence of `data-testid="input-register-name"`, `data-testid="input-register-email"`, `data-testid="input-register-password"`, `data-testid="btn-register-submit"`.
   - Verify tap targets have minimum height of 44px (`h-11`).
   - Verify font sizes are $\ge 16\text{px}$ (`text-base sm:text-sm`).
2. Run browser to `http://localhost:5173/login`:
   - Check presence of `data-testid="input-login-email"`, `data-testid="input-login-password"`, `data-testid="btn-login-submit"`.
   - Trigger failed login and verify Sonner toast notification appears with NO native `alert()`.
