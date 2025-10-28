# 🚀 HƯỚNG DẪN ĐĂNG KÍ ADMIN TRÊN POSTMAN

Backend URL: **https://food-del-backend-4jjf.onrender.com/**

---

## 📋 THÔNG TIN REQUEST

### ✅ Check 1: Test Backend (GET)
**URL:** `https://food-del-backend-4jjf.onrender.com/`  
**Method:** GET  
**Response:**
```json
{
  "success": true,
  "message": "🚀 Food Delivery API is Working!",
  "timestamp": "2025-10-28T01:37:53.576Z",
  "env": "production"
}
```

### ✅ Check 2: Health Check (GET)
**URL:** `https://food-del-backend-4jjf.onrender.com/health`  
**Method:** GET  
**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "database": "disconnected",  // ⚠️ Lưu ý: Database có thể chưa connected
  "timestamp": "...",
  "uptime": 133.17
}
```

---

## 🔐 ĐĂNG KÍ ADMIN (POST)

### Endpoint
```
https://food-del-backend-4jjf.onrender.com/api/admin/signup
```

### Request Details

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "Admin123456",
    "role": "admin"
}
```

---

## 📝 HƯỚNG DẪN POSTMAN (CHI TIẾT)

### Cách 1: Import cURL (Nhanh nhất)

1. Mở **Postman**
2. Click **Import** (góc trên bên trái)
3. Chọn tab **Raw Text**
4. Copy và paste cURL sau:
```bash
curl -X POST https://food-del-backend-4jjf.onrender.com/api/admin/signup -H "Content-Type: application/json" -d "{\"name\":\"Admin User\",\"email\":\"admin@example.com\",\"password\":\"Admin123456\",\"role\":\"admin\"}"
```
5. Click **Import**
6. Click **Send**

---

### Cách 2: Tạo request thủ công

#### Bước 1: Tạo Request mới
- Click **New** → **HTTP Request**
- Đặt tên: `Admin Signup`

#### Bước 2: Setup Method & URL
- Method: Chọn **POST**
- URL: `https://food-del-backend-4jjf.onrender.com/api/admin/signup`

#### Bước 3: Setup Headers
1. Click tab **Headers**
2. Add header:
   - **Key:** `Content-Type`
   - **Value:** `application/json`

#### Bước 4: Setup Body
1. Click tab **Body**
2. Chọn **raw**
3. Dropdown bên phải chọn **JSON**
4. Paste JSON sau:
```json
{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "Admin123456",
    "role": "admin"
}
```

#### Bước 5: Send Request
- Click button **Send** (màu xanh)
- Chờ kết quả

---

## 📦 RESPONSE KỲ VỌNG

### ✅ Thành công (201):
```json
{
    "success": true,
    "message": "Admin account created successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "email": "admin@example.com",
        "role": "admin",
        "name": "Admin User"
    }
}
```

### ❌ Thất bại - Email đã tồn tại (400):
```json
{
    "success": false,
    "message": "User with this email already exists"
}
```

### ❌ Thất bại - Thiếu thông tin (400):
```json
{
    "success": false,
    "message": "Name, email and password are required"
}
```

### ❌ Thất bại - Server Error (500):
```json
{
    "success": false,
    "message": "Internal server error"
}
```
> ⚠️ Lưu ý: Nếu gặp 500 error, có thể database chưa connect. Kiểm tra MongoDB connection trên Render.

---

## 🔑 ĐĂNG NHẬP ADMIN (Sau khi đăng kí thành công)

**URL:** `https://food-del-backend-4jjf.onrender.com/api/admin/login`

**Body (JSON):**
```json
{
    "email": "admin@example.com",
    "password": "Admin123456"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGc...",
    "user": {
        "email": "admin@example.com",
        "role": "admin",
        "name": "Admin User"
    }
}
```

---

## ⚙️ CÁC API ENDPOINTS KHÁC

```
GET  /api/food          - Lấy danh sách food
GET  /api/user           - User endpoints
POST /api/user/register  - Đăng kí user thường
POST /api/user/login     - Đăng nhập user thường
GET  /api/cart           - Cart endpoints
GET  /api/order          - Order endpoints
GET  /api/admin          - Admin endpoints (cần token)
GET  /api/category       - Category endpoints
GET  /api/blog           - Blog endpoints
GET  /api/reservation    - Reservation endpoints
GET  /api/contact        - Contact endpoints
```

---

## 🔧 TROUBLESHOOTING

### 1. Lỗi 500 - Internal Server Error
- Kiểm tra MongoDB connection trên Render dashboard
- Xem logs trên Render để debug

### 2. Lỗi 400 - Bad Request
- Kiểm tra JSON format
- Email phải hợp lệ
- Password tối thiểu 8 ký tự

### 3. Backend không response
- Kiểm tra Render service đang running
- Xem logs: `https://dashboard.render.com/`

### 4. Timeout
- Render free tier có cold start (có thể chậm 1-2 phút lần đầu)
- Đợi khoảng 30-60 giây rồi thử lại

---

## 📞 SUPPORT

- Backend URL: https://food-del-backend-4jjf.onrender.com/
- Health Check: https://food-del-backend-4jjf.onrender.com/health
- API Info: https://food-del-backend-4jjf.onrender.com/api

