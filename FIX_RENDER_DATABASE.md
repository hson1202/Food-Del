# 🔧 FIX DATABASE TRÊN RENDER

## ⚠️ VẤN ĐỀ HIỆN TẠI

Database vẫn chưa connected:
```json
{
  "success": true,
  "status": "healthy",
  "database": "disconnected",  // ❌ Vẫn chưa connect
  "timestamp": "...",
  "uptime": 333.40
}
```

---

## ✅ CÁC BƯỚC FIX

### 1️⃣ KIỂM TRA ENVIRONMENT VARIABLES TRÊN RENDER

Vào: https://dashboard.render.com/ → Chọn service backend của bạn

**Kiểm tra các variables sau:**

```
✅ MONGODB_URL=your-mongodb-connection-string
   HOẶC
✅ MONGODB_URI=your-mongodb-connection-string

✅ JWT_SECRET=your-secret-key

✅ NODE_ENV=production
```

**Lưu ý:**
- Backend code nhận cả `MONGODB_URL` và `MONGODB_URI`
- Nếu bạn có `MONGODB_URI` thì không cần `MONGODB_URL` (và ngược lại)
- Bắt buộc phải có một trong hai biến này!

---

### 2️⃣ RESTART SERVICE TRÊN RENDER

Sau khi set environment variables:

1. Vào service dashboard: https://dashboard.render.com/
2. Click vào service của bạn
3. Click **"Manual Deploy"** → **"Clear build cache & deploy"**
4. Hoặc click **"Events"** → Click button restart/deply lại

---

### 3️⃣ KIỂM TRA LOGS

Sau khi restart, check logs:

1. Vào service dashboard
2. Click tab **"Logs"**
3. Tìm dòng: `✅ DB Connected Successfully`

**Nếu thấy:**
```
❌ Database connection error: ...
```
→ Xem lỗi cụ thể

**Nếu thấy:**
```
✅ DB Connected Successfully
```
→ Database đã connect OK!

---

### 4️⃣ KIỂM TRA MONGODB CONNECTION STRING

**Format đúng:**

Cho **MongoDB Atlas:**
```
mongodb+srv://username:password@cluster.mongodb.net/food-delivery?retryWrites=true&w=majority
```

Cho **MongoDB Local (không dùng cho Render):**
```
mongodb://localhost:27017/food-delivery
```

**Lưu ý:**
- Phải có username và password
- Phải có database name (ví dụ: `food-delivery`)
- Không có khoảng trống trong connection string
- Render cần MongoDB Atlas (cloud database), không dùng local

---

### 5️⃣ TEST LẠI SAU KHI RESTART

**Check Health:**
```bash
curl https://food-del-backend-4jjf.onrender.com/health
```

Kết quả mong đợi:
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",  // ✅ Phải là "connected"
  ...
}
```

**Test Admin Signup:**
```bash
curl -X POST https://food-del-backend-4jjf.onrender.com/api/admin/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Admin\",\"email\":\"admin@test.com\",\"password\":\"Admin123456\"}"
```

---

## 🔍 DEBUG CHI TIẾT

### Nếu database vẫn "disconnected"

**1. Check environment variable name:**
- Render dùng: `MONGODB_URL` hoặc `MONGODB_URI`
- Backend code check: `process.env.MONGODB_URL || process.env.MONGODB_URI`

**2. Check MongoDB Atlas:**
- Vào MongoDB Atlas dashboard
- Kiểm tra Network Access → IP Whitelist
- Thêm IP: `0.0.0.0/0` (allow all IPs) HOẶC
- Thêm specific Render IPs

**3. Check Connection String:**
- Phải có đầy đủ: username, password, cluster, database name
- Không có ký tự đặc biệt sai format
- Database name phải tồn tại

**4. Check Render Logs:**
```
Look for:
- ✅ DB Connected Successfully
- ❌ Database connection error
- Error: MONGODB_URL/MONGODB_URI is not set in environment variables
```

---

## 📋 CHECKLIST FIX NHANH

```
□ Vào Render Dashboard → Service backend
□ Vào tab "Environment"
□ Kiểm tra có biến: MONGODB_URL hoặc MONGODB_URI
□ Copy connection string từ MongoDB Atlas
□ Paste vào Render environment variable
□ Click "Save Changes"
□ Vào tab "Events" hoặc "Deploy"
□ Click "Deploy" hoặc "Restart"
□ Đợi 2-3 phút
□ Test lại: curl https://food-del-backend-4jjf.onrender.com/health
□ Check database status: phải là "connected"
```

---

## 🚀 SAU KHI DATABASE CONNECTED

Thử đăng kí admin lại bằng Postman hoặc curl:

```bash
curl -X POST https://food-del-backend-4jjf.onrender.com/api/admin/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Admin\",\"email\":\"admin@test.com\",\"password\":\"Admin123456\"}"
```

Response mong đợi:
```json
{
  "success": true,
  "message": "Admin account created successfully",
  "token": "eyJhbG...",
  "user": {
    "email": "admin@test.com",
    "role": "admin",
    "name": "Admin"
  }
}
```

---

## 🔗 LINKS HỮU ÍCH

- Render Dashboard: https://dashboard.render.com/
- MongoDB Atlas: https://cloud.mongodb.com/
- Backend Health: https://food-del-backend-4jjf.onrender.com/health
- Backend API Info: https://food-del-backend-4jjf.onrender.com/api

