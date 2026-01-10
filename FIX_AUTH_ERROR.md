# 🔐 KHẮC PHỤC LỖI "Not Authorized Login Again"

## 🐛 VẤN ĐỀ

Khi thêm hoặc sửa Delivery Zone, bạn gặp lỗi:
```
❌ Not Authorized! Login Again
```

## 🔍 NGUYÊN NHÂN

Có 3 nguyên nhân chính:

### 1. **Token không tồn tại trong localStorage** 🔑
   - Chưa đăng nhập
   - Token bị xóa do clear cache/cookies
   - Token không được lưu khi login

### 2. **Token đã hết hạn** ⏰
   - JWT token có thời hạn (thường 7-30 ngày)
   - Đã lâu không login lại

### 3. **JWT_SECRET không khớp** 🔐
   - Backend thay đổi JWT_SECRET
   - Token cũ không decode được

---

## ✅ CÁCH KHẮC PHỤC

### **CÁCH 1: Logout và Login lại (Đơn giản nhất)** 🔄

1. Click nút **Logout** trên Admin panel
2. Hoặc mở Console (F12) và chạy:
   ```javascript
   localStorage.clear();
   window.location.href = '/login';
   ```
3. Login lại với tài khoản admin
4. Thử thêm/sửa delivery zone lại

---

### **CÁCH 2: Kiểm tra Token trong Console** 🔍

1. Mở trang Admin
2. Nhấn **F12** để mở DevTools
3. Vào tab **Console**
4. Chạy lệnh:
   ```javascript
   console.log('Token:', localStorage.getItem('token'));
   ```

**Kết quả:**

✅ **Nếu thấy token dài (kiểu `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`):**
   → Token tồn tại, nhưng có thể đã hết hạn
   → **Giải pháp:** Logout và login lại

❌ **Nếu thấy `null` hoặc `undefined`:**
   → Không có token
   → **Giải pháp:** Login lại

---

### **CÁCH 3: Kiểm tra Network Request** 🌐

1. Mở trang Admin → Delivery Zones
2. Nhấn **F12** → Tab **Network**
3. Click **Edit** một zone và sửa giá
4. Click **Update Zone**
5. Tìm request `/api/delivery/zones/xxx` trong Network tab
6. Xem **Headers** → **Request Headers**

**Kiểm tra:**
- ✅ Có field `token: eyJhbGci...` không?
- ❌ Nếu không có → Token chưa được gửi

**Xem Response:**
- Nếu status **401** → Token invalid hoặc hết hạn
- Nếu status **403** → Không phải admin
- Nếu status **200** → Thành công!

---

### **CÁCH 4: Kiểm tra Backend JWT_SECRET** 🔐

1. Mở file `.env` trong thư mục **Backend**
2. Tìm dòng:
   ```
   JWT_SECRET=your_secret_key_here
   ```
3. Đảm bảo **JWT_SECRET** tồn tại và không bị thay đổi
4. Nếu thay đổi → Tất cả token cũ sẽ invalid
5. **Giải pháp:** Logout tất cả users và login lại

---

## 🛠️ ĐÃ FIX GÌ TRONG CODE?

### **1. Thêm kiểm tra token trước khi gửi request**
```javascript
// Check if token exists
const token = localStorage.getItem('token');
if (!token) {
  toast.error('❌ Not authorized! Please login again.');
  return;
}
```

### **2. Hiển thị lỗi rõ ràng hơn**
```javascript
if (error.response?.status === 401) {
  toast.error('❌ Session expired! Please login again.');
}
```

### **3. Thêm Warning Banner**
Nếu không có token, trang sẽ hiển thị banner đỏ:
```
⚠️ Authentication Issue Detected!
No token found in localStorage. Please logout and login again.
[🔄 Go to Login]
```

---

## 🧪 CÁCH TEST SAU KHI FIX

### **Test 1: Kiểm tra Warning Banner**
1. Mở Admin → Delivery Zones
2. Mở Console (F12) và chạy:
   ```javascript
   localStorage.removeItem('token');
   location.reload();
   ```
3. **Kỳ vọng:** Thấy banner đỏ cảnh báo "Authentication Issue"
4. Click **Go to Login** → Redirect đến trang login

### **Test 2: Login và Test Edit**
1. Login lại với tài khoản admin
2. Vào **Delivery Zones**
3. Click **Edit** một zone
4. Sửa **Min Order** hoặc **Delivery Fee**
5. Click **Update Zone**
6. **Kỳ vọng:** 
   - ✅ Toast hiển thị "Delivery zone updated successfully!"
   - ✅ Giá được update trong list
   - ✅ Không có lỗi "Not Authorized"

### **Test 3: Kiểm tra Console Logs**
1. Mở Console (F12)
2. Thực hiện edit/create zone
3. **Nếu thành công:** Không có error log
4. **Nếu lỗi:** Thấy log:
   - `No token found in localStorage` → Chưa login
   - `Error updating zone: 401` → Token hết hạn

---

## 📋 CHECKLIST KHẮC PHỤC

- [ ] Logout khỏi Admin panel
- [ ] Clear localStorage (F12 → Console → `localStorage.clear()`)
- [ ] Login lại với tài khoản admin
- [ ] Kiểm tra token tồn tại (`localStorage.getItem('token')`)
- [ ] Kiểm tra Backend có chạy không
- [ ] Kiểm tra `.env` có `JWT_SECRET` không
- [ ] Test edit delivery zone
- [ ] Kiểm tra Network tab → Request có `token` header không
- [ ] Kiểm tra Response status (200 = OK, 401 = Unauthorized)

---

## 🚨 NẾU VẪN LỖI

### Kiểm tra Login API
1. Vào trang Login
2. Mở Console (F12)
3. Login với tài khoản admin
4. Sau khi login thành công, chạy:
   ```javascript
   console.log('Token after login:', localStorage.getItem('token'));
   ```
5. **Nếu vẫn `null`** → Login API không set token đúng cách

### Kiểm tra Admin Role
1. Trong Console, sau khi login, chạy:
   ```javascript
   fetch('YOUR_BACKEND_URL/api/user/profile', {
     headers: {
       'token': localStorage.getItem('token')
     }
   })
   .then(r => r.json())
   .then(d => console.log('User role:', d));
   ```
2. Xem role có phải `admin` không

---

## 📞 DEBUG TIPS

### Xem token decode:
```javascript
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token payload:', payload);
  console.log('Expires at:', new Date(payload.exp * 1000));
  console.log('Is expired?', Date.now() > payload.exp * 1000);
}
```

### Test token với curl:
```bash
curl -X PUT http://localhost:4000/api/delivery/zones/YOUR_ZONE_ID \
  -H "token: YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Zone","minDistance":0,"maxDistance":5,"deliveryFee":2,"minOrder":10,"estimatedTime":30}'
```

---

## ✅ KẾT LUẬN

**Giải pháp nhanh nhất:** 
1. Logout
2. Login lại
3. Test edit delivery zone

**Nếu vẫn lỗi:** Check Backend logs để xem lỗi cụ thể!

