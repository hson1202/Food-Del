# 📦 HƯỚNG DẪN IMPORT CATEGORIES VÀO POSTMAN

## ✅ ĐÃ TẠO FILE:
**File:** `Postman_Categories_Import.json`

File này chứa **19 categories** sẵn sàng import vào Postman!

---

## 🚀 CÁCH IMPORT VÀO POSTMAN:

### Bước 1: Mở Postman
- Mở ứng dụng Postman

### Bước 2: Import Collection
1. Click **"Import"** (góc trên bên trái)
2. Tab **"File"** hoặc **"Upload Files"**
3. Chọn file: `Postman_Categories_Import.json`
4. Click **"Import"**

### Bước 3: Thiết lập Environment Variable
1. Click icon **"Environments"** bên trái
2. Tạo environment mới hoặc chọn existing
3. Thêm variable:
   - **Variable:** `baseUrl`
   - **Initial Value:** `http://localhost:4000`
   - **Current Value:** `http://localhost:4000`
4. Save

### Bước 4: Send All Requests
1. Chọn environment vừa tạo
2. Click vào collection **"Import Categories - All 19 Items"**
3. Click **"..."** (3 chấm)
4. Chọn **"Run collection"**
5. Check all 19 items
6. Click **"Run Import Categories"**
7. Chờ kết quả!

---

## 📋 DANH SÁCH 19 CATEGORIES TRONG COLLECTION:

1. BENTO
2. CALIFORNIA MAKI / ROLL
3. CALIFORNIA TEMPURA ROLL
4. CHIRASHI SUSHI
5. FUTOMAKI
6. HLAVNÉ JEDLÁ
7. MAKI
8. NIGIRI
9. NÁPOJE
10. POKE
11. POLIEVKY
12. PREDJEDLÁ
13. PRÍLOHA
14. REZANCE
15. Ryžové rezance (vietnamské)
16. SASHIMI
17. SUSHI SETY
18. TATARÁK
19. ŠALÁT

---

## ⚙️ CẤU HÌNH BACKEND:

Đảm bảo backend đang chạy:
```bash
cd Backend
npm install
npm start
```

Backend phải chạy trên: `http://localhost:4000`

---

## ✅ KIỂM TRA SAU KHI IMPORT:

Test API lấy danh sách categories:
```bash
GET http://localhost:4000/api/category
```

Response sẽ có **19 items** nếu import thành công!

---

## 💡 LƯU Ý:

- Mỗi request là POST để tạo category mới
- Nếu category đã tồn tại sẽ báo lỗi duplicate
- Có thể chạy từng request riêng nếu cần
- Tất cả images đang dùng Cloudinary URL

---

## 🎯 KẾT QUẢ MONG ĐỢI:

Sau khi run collection, bạn sẽ thấy:
- 19/19 requests thành công ✅
- Mỗi category có ID riêng được tạo
- Response: `{"success": true, "message": "Category created", ...}`

