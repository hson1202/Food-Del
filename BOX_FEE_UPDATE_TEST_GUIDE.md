# 📦 HƯỚNG DẪN TEST BOX FEE UPDATE - ĐÃ FIX

## ✅ ĐÃ FIX

### **Backend Changes:**

1. ✅ **restaurantLocationModel.js** - Đã thêm field `boxFee`:
   ```javascript
   boxFee: {
     type: Number,
     required: true,
     min: 0,
     default: 0.3  // Default box fee in EUR
   }
   ```

2. ✅ **deliveryController.js** - Đã update `updateRestaurantLocation`:
   - Nhận `boxFee` từ request body
   - Update boxFee vào database
   - Log chi tiết để debug
   ```javascript
   const { name, address, latitude, longitude, boxFee } = req.body;
   console.log('📦 Box Fee received:', boxFee, 'Type:', typeof boxFee);
   
   if (boxFee !== undefined && boxFee !== null) {
     location.boxFee = Number(boxFee);
     console.log(`📦 Box Fee updated: ${oldBoxFee} → ${location.boxFee}`);
   }
   ```

3. ✅ **Backend đã restart** - Chạy trên port 4000

---

## 🧪 CÁCH TEST (CHI TIẾT)

### **Bước 1: Kiểm tra Backend đang chạy**

Mở terminal và check:
```bash
# Backend terminal
# Should see:
✅ DB Connected Successfully
🚀 Server running on port 4000
✅ Email service is configured and working!
```

---

### **Bước 2: Mở Admin Panel**

1. Mở browser: `http://localhost:5174` (hoặc port Admin của bạn)
2. Login vào Admin (nếu chưa login)
3. Vào menu **"Delivery Zones"**

---

### **Bước 3: Xem Box Fee hiện tại**

Trong phần **"📍 Restaurant Location"** ở trên cùng, bạn sẽ thấy:

```
┌────────────────────────────────────┐
│  📍 Restaurant Location           │
├────────────────────────────────────┤
│  Name: VietBowls Restaurant       │
│  Address: ...                     │
│  Coordinates: 48.xxx, 17.xxx      │
│  📦 Box Fee: €0.30                │ ← Giá hiện tại
│                                   │
│  [Update Location]                │
└────────────────────────────────────┘
```

---

### **Bước 4: Update Box Fee**

1. Click nút **"Update Location"**

2. Form sẽ hiện ra:
```
┌────────────────────────────────────┐
│  Restaurant Name:                 │
│  [VietBowls Restaurant]          │
│                                   │
│  Address:                         │
│  [Full address here...]          │
│                                   │
│  Latitude:   Longitude:           │
│  [48.1486]   [17.1077]           │
│                                   │
│  📦 Box Fee (€):                 │
│  [0.30] ← THAY ĐỔI Ở ĐÂY         │
│  Default packaging fee per item   │
│                                   │
│  [Save Location] [Cancel]         │
└────────────────────────────────────┘
```

3. **Thay đổi Box Fee:**
   - Ví dụ: Từ `0.30` → `0.50`
   - Hoặc bất kỳ giá nào bạn muốn test

4. Click **"Save Location"**

---

### **Bước 5: Check Backend Console Logs**

**QUAN TRỌNG:** Mở terminal Backend (Terminal 8) và xem logs:

Bạn **PHẢI THẤY** những logs sau:

```
🔍 Update Restaurant Location - Request body: { 
  name: 'VietBowls Restaurant',
  address: '...',
  latitude: 48.1486,
  longitude: 17.1077,
  boxFee: 0.5  ← Giá mới bạn vừa nhập
}
📦 Box Fee received: 0.5 Type: number
📦 Box Fee updated: 0.3 → 0.5
✅ Location saved successfully
```

**Nếu KHÔNG THẤY logs này** → Có vấn đề!
- Check xem Admin có gửi request không (F12 → Network tab)
- Check token authorization

---

### **Bước 6: Verify trong Admin**

Sau khi save:
1. Toast notification sẽ hiện: **"Restaurant location updated successfully!"**
2. Box Fee sẽ tự động refresh và hiện giá mới:

```
📦 Box Fee: €0.50  ← Giá mới
```

**Nếu vẫn hiển thị €0.30** → Refresh page (F5) và check lại

---

### **Bước 7: Test trên Frontend (User Side)**

#### **7.1. Restart Frontend (Nếu cần)**

```bash
# Nếu frontend đang chạy, có thể cần restart
cd Frontend
npm run dev
```

#### **7.2. Hard Refresh Browser**

- **Windows:** `Ctrl + F5` hoặc `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`
- Hoặc: F12 → Application → Clear Storage → Clear site data

#### **7.3. Test Cart**

1. Vào trang chủ: `http://localhost:5173` (hoặc port Frontend)
2. **Add món ăn** vào cart (món KHÔNG có "Disable Box Fee")
3. **Mở Cart Popup** (click icon giỏ hàng)
4. **Kiểm tra giá:**

```
┌──────────────────────────┐
│  Cart                    │
├──────────────────────────┤
│  Phở bò                  │
│  Base: €8.50             │
│  + Box Fee: €0.50  ✅    │ ← PHẢI LÀ GIÁ MỚI (0.50)
│  ─────────────────       │
│  Total: €9.00      ✅    │
└──────────────────────────┘
```

**Nếu vẫn thấy €0.30:**
- Check F12 Console → Search "Box Fee"
- Check Network tab → GET `/api/delivery/restaurant-location`
  - Response should have `boxFee: 0.5`

---

### **Bước 8: Test với Món có disableBoxFee**

1. Vào Admin → Products
2. Edit một món → Tick **"Tắt tiền hộp"**
3. Save
4. Thêm món đó vào cart
5. Check: **Box fee = €0** (dù global box fee là 0.5)

```
┌──────────────────────────┐
│  Cart                    │
├──────────────────────────┤
│  Combo Set               │
│  Base: €15.00            │
│  + Box Fee: €0.00  ✅    │ ← NO FEE (disabled)
│  ─────────────────────────│
│  Total: €15.00     ✅    │
└──────────────────────────┘
```

---

## 🔍 DEBUG CHECKLIST

### **❌ Vấn đề 1: Backend không log gì**

**Nguyên nhân:** Request không tới backend

**Giải pháp:**
1. Check Admin console (F12):
   - Network tab → Filter "restaurant-location"
   - Click request → Check Headers, Payload
2. Check token:
   ```javascript
   // In Admin console
   console.log('Token:', localStorage.getItem('adminToken'))
   ```
3. Check URL:
   - Admin phải gửi đến đúng backend URL
   - Check `config.js` hoặc `Admin/src/config`

---

### **❌ Vấn đề 2: Backend log nhưng Frontend vẫn hiển thị 0.30**

**Nguyên nhân:** Frontend chưa fetch lại boxFee

**Giải pháp:**
1. **Hard refresh:** Ctrl + F5
2. **Check API response:**
   ```
   F12 → Network → Filter: restaurant-location
   → Click GET request
   → Check Response:
   {
     "success": true,
     "data": {
       "boxFee": 0.5  ← Phải là giá mới
     }
   }
   ```
3. **Check StoreContext:**
   ```javascript
   // In Frontend console
   console.log('Box Fee in context:', /* check context */)
   ```
4. **Clear cache:**
   - F12 → Application → Clear Storage
   - Or: Chrome Settings → Clear browsing data

---

### **❌ Vấn đề 3: Database không update**

**Nguyên nhân:** Schema chưa có field hoặc validation error

**Giải pháp:**
1. Check database trực tiếp:
   ```javascript
   // MongoDB Shell or Compass
   db.restaurantlocations.findOne({ isPrimary: true })
   
   // Expected:
   {
     _id: ...,
     name: "VietBowls Restaurant",
     boxFee: 0.5,  ← PHẢI CÓ FIELD NÀY
     ...
   }
   ```
2. Nếu không có field `boxFee`:
   - Restart MongoDB (nếu dùng local)
   - Re-save từ Admin
3. Check Backend logs for errors

---

### **❌ Vấn đề 4: 401 Unauthorized**

**Nguyên nhân:** Token expired hoặc không có token

**Giải pháp:**
1. Logout và Login lại Admin
2. Check middleware auth:
   - `Backend/middleware/adminAuth.js`
3. Check token trong request headers:
   ```
   F12 → Network → restaurant-location → Headers
   → Request Headers → token: "..."
   ```

---

## ✅ EXPECTED RESULTS (KẾT QUẢ MONG ĐỢI)

### **Scenario 1: Update Box Fee từ 0.30 → 0.50**

| Bước | Kết quả mong đợi |
|------|------------------|
| Admin update | Toast: "Restaurant location updated successfully!" |
| Backend log | `📦 Box Fee updated: 0.3 → 0.5` |
| Database | `boxFee: 0.5` |
| Frontend API | Response: `{ boxFee: 0.5 }` |
| Cart display | `+ Box Fee: €0.50` |
| Total calculation | Đúng = base + 0.50 |

---

### **Scenario 2: Update Box Fee = 0 (Free packaging)**

| Bước | Kết quả mong đợi |
|------|------------------|
| Admin update | Box Fee = 0 |
| Backend log | `📦 Box Fee updated: 0.5 → 0` |
| Frontend cart | `+ Box Fee: €0.00` |
| Total | = base price (no box fee) |

---

### **Scenario 3: Món có disableBoxFee = true**

| Bước | Kết quả mong đợi |
|------|------------------|
| Global box fee | 0.50 |
| Product | disableBoxFee = true |
| Cart display | `+ Box Fee: €0.00` |
| Total | = base price only |

---

## 📞 NẾU VẪN KHÔNG WORK

### **Cách 1: Check từng step**
1. ✅ Backend restart thành công? → Check port 4000
2. ✅ Admin gửi request? → Check Network tab
3. ✅ Backend nhận request? → Check terminal logs
4. ✅ Database update? → Check MongoDB
5. ✅ Frontend fetch? → Check API response
6. ✅ Cart display? → Check CartPopup component

### **Cách 2: Debug logs**

**Backend (deliveryController.js):**
```javascript
console.log('🔍 Update Restaurant Location - Request body:', req.body);
console.log('📦 Box Fee received:', boxFee, 'Type:', typeof boxFee);
console.log(`📦 Box Fee updated: ${oldBoxFee} → ${location.boxFee}`);
```

**Frontend (StoreContext.jsx):**
```javascript
useEffect(() => {
  console.log('📦 Box Fee loaded:', boxFee);
}, [boxFee]);
```

**Frontend (CartPopup.jsx):**
```javascript
const { boxFee } = useContext(StoreContext);
console.log('📦 CartPopup - Box Fee:', boxFee);
```

### **Cách 3: Full restart**
```bash
# Stop all
Ctrl + C (all terminals)

# Clear node_modules cache (optional)
cd Backend
rm -rf node_modules package-lock.json
npm install

cd ../Frontend
rm -rf node_modules package-lock.json
npm install

cd ../Admin
rm -rf node_modules package-lock.json
npm install

# Restart all
cd Backend && npm start
cd Frontend && npm run dev
cd Admin && npm run dev
```

---

## 🎉 SUMMARY

| Component | Status | Changes |
|-----------|--------|---------|
| **Backend Model** | ✅ Fixed | Added `boxFee` field |
| **Backend Controller** | ✅ Fixed | Handle `boxFee` in update |
| **Backend Server** | ✅ Running | Port 4000 |
| **Admin Panel** | ✅ Ready | Already has boxFee input |
| **Frontend Context** | ✅ Ready | Already fetches boxFee |
| **Frontend Cart** | ✅ Ready | Already uses boxFee |

**Chỉ cần TEST để verify!** 🚀

---

**Good luck! 🎯**
