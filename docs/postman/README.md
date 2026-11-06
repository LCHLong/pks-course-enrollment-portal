# 📮 PKS Course & Enrollment Portal - Postman API Test Suite

> **Thư mục:** `docs/postman/`  
> **Tuân thủ:** `ND_PV_FULLSTACK.pdf §6, §8`  
> **Bộ sưu tập:** 27 Endpoints bao phủ 100% các luồng nghiệp vụ và 7 mã trạng thái HTTP (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`).

---

## 📁 Danh Mục Tệp Tin
| Tệp tin | Vai trò & Ý nghĩa |
| :--- | :--- |
| `postman_collection.json` | Bộ sưu tập Postman Collection v2.1.0 gồm 3 nhóm: Auth, Student Courses & Enrollment, Admin Management (27 endpoints, 47 test assertions). |
| `postman_environment.json` | Biến môi trường mặc định (Local: `http://localhost:5000`). |
| `postman_environment.local.json` | Biến môi trường dành cho kiểm thử Local (`http://localhost:5000`). |
| `postman_environment.production.json` | Biến môi trường dành cho kiểm thử Cloud Vercel (`https://pks-course-enrollment-portal-1pv7.vercel.app`). |
| `test-postman-runner.js` | Script kiểm thử cấu trúc collection nội bộ bằng Node.js. |

---

## 🚀 Hướng Dẫn Chạy Kiểm Thử Tự Động (Newman CLI)

### 1. Cài đặt Newman (nếu chưa có)
```bash
npm install -g newman
```

### 2. Chạy toàn bộ 27 API tests qua Newman
Từ thư mục gốc dự án:
```bash
# Kiểm thử trên môi trường Local:
npm run test:api
# hoặc:
newman run docs/postman/postman_collection.json -e docs/postman/postman_environment.local.json

# Kiểm thử trên môi trường Production (Vercel Cloud):
newman run docs/postman/postman_collection.json -e docs/postman/postman_environment.production.json
```

### 3. Kiểm tra cú pháp và danh mục request nội bộ
```bash
node docs/postman/test-postman-runner.js
```

---

## 📥 Hướng Dẫn Import vào Postman Desktop App
1. Mở ứng dụng **Postman**.
2. Bấm nút **Import** ở góc trên cùng bên trái.
3. Kéo thả các file:
   - `docs/postman/postman_collection.json`
   - `docs/postman/postman_environment.local.json` (nếu test backend máy cục bộ)
   - `docs/postman/postman_environment.production.json` (nếu test backend trực tiếp trên Vercel Cloud)
4. Chọn Environment mong muốn (**PKS Portal - Local** hoặc **PKS Portal - Production**) ở góc trên cùng bên phải.
5. Bấm **Run collection** để thực thi toàn bộ luồng tự động.
