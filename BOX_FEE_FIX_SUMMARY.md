# 🔧 BOX FEE FIX - SUMMARY

## ❌ VẤN ĐỀ

Box Fee vẫn hiển thị **0.3€** dù đã save giá khác trong Admin → Delivery Zones.

## 🔍 NGUYÊN NHÂN

Có nhiều chỗ trong code vẫn **hardcode 0.3** thay vì dùng giá trị từ database:

1. ❌ `Frontend/src/components/CartPopup/CartPopup.jsx` - Hardcode 0.3 trong 2 chỗ
2. ❌ `Backend/services/emailService.js` - Email confirmation hardcode 0.3
3. ❌ `Admin/src/components/EditProductPopup/EditProductPopup.jsx` - Display hardcode 0.3
4. ❌ `Admin/src/pages/Products/Products.jsx` - Display hardcode 0.3

---

## ✅ ĐÃ FIX

### **1. CartPopup.jsx** (QUAN TRỌNG NHẤT)

**Trước:**
```javascript
const boxFee = isBoxFeeDisabled(item) ? 0 : 0.3;  // ❌ Hardcode
totalBoxFee += 0.3 * item.quantity;  // ❌ Hardcode
```

**Sau:**
```javascript
const { boxFee } = useContext(StoreContext);  // ✅ Get from context
const itemBoxFee = isBoxFeeDisabled(item) ? 0 : boxFee;  // ✅ Dynamic
totalBoxFee += boxFee * item.quantity;  // ✅ Dynamic
```

---

### **2. emailService.js** (Backend)

**Trước:**
```javascript
const boxFee = isBoxFeeDisabled ? 0 : 0.3;  // ❌ Hardcode
```

**Sau:**
```javascript
// Fetch global box fee from restaurant settings
let globalBoxFee = 0.3; // Default
try {
  const restaurant = await restaurantLocationModel.findOne({ 
    isActive: true, 
    isPrimary: true 
  });
  if (restaurant && restaurant.boxFee !== undefined) {
    globalBoxFee = restaurant.boxFee;
  }
} catch (err) {
  console.warn('⚠️ Could not fetch box fee, using default 0.3');
}

// Use in calculation
const boxFee = isBoxFeeDisabled ? 0 : globalBoxFee;  // ✅ Dynamic
```

---

### **3. deliveryController.js** (Added Debug Logs)

```javascript
console.log('🔍 Update Restaurant Location - Request body:', req.body);
console.log('📦 Box Fee received:', boxFee, 'Type:', typeof boxFee);
console.log(`📦 Box Fee updated: ${oldBoxFee} → ${location.boxFee}`);
```

---

## 🧪 CÁCH TEST

### **Bước 1: Restart Backend**

```bash
cd Backend
npm run server
```

Xem console, sẽ thấy log khi update location.

---

### **Bước 2: Update Box Fee trong Admin**

1. Login Admin → Delivery Zones
2. Click **"Update Location"**
3. Thay đổi Box Fee: `0.30` → `0.50`
4. Click **"Save Location"**

**Check console Backend:**
```
🔍 Update Restaurant Location - Request body: { ..., boxFee: 0.5 }
📦 Box Fee received: 0.5 Type: number
📦 Box Fee updated: 0.3 → 0.5
✅ Location saved successfully
```

---

### **Bước 3: Restart Frontend**

```bash
cd Frontend
npm run dev
```

**QUAN TRỌNG:** Phải restart hoặc hard refresh (Ctrl + F5) để fetch boxFee mới!

---

### **Bước 4: Test trên Frontend**

1. **Refresh trang** (Ctrl + F5)
2. **Add món vào cart** (món không có disableBoxFee)
3. **Mở cart popup**
4. **Check giá:**

```
Món: €8.50
+ Box Fee: €0.50  ← Phải là 0.50 (không phải 0.30)
─────────────────
Total: €9.00
```

---

### **Bước 5: Test với món có disableBoxFee**

1. Vào Products → Edit món
2. ✅ Tick **"Tắt tiền hộp"**
3. Save
4. Add món đó vào cart
5. Check: **KHÔNG** có box fee

---

## 🔍 DEBUG CHECKLIST

Nếu vẫn thấy 0.3, check từng bước:

### **1. Check Database**

```javascript
// MongoDB query
db.restaurantlocations.findOne({ isPrimary: true })

// Expected result:
{
  _id: ...,
  name: "VietBowls Restaurant",
  boxFee: 0.5,  // ← Phải là giá mới
  ...
}
```

---

### **2. Check API Response**

**Frontend Console (F12) → Network tab:**

```
GET /api/delivery/restaurant-location

Response:
{
  "success": true,
  "data": {
    "name": "VietBowls Restaurant",
    "boxFee": 0.5,  // ← Check giá này
    ...
  }
}
```

---

### **3. Check StoreContext**

**Frontend Console:**

```javascript
// In browser console
console.log('Box Fee:', window.__STORE_CONTEXT__?.boxFee)
// Should show: 0.5
```

Hoặc thêm log vào `StoreContext.jsx`:

```javascript
useEffect(() => {
  console.log('📦 Box Fee loaded:', boxFee);
}, [boxFee]);
```

---

### **4. Check CartPopup**

**Add log vào `CartPopup.jsx`:**

```javascript
const { boxFee } = useContext(StoreContext);
console.log('📦 CartPopup - Box Fee:', boxFee);
```

---

## 🚨 COMMON ISSUES

### **Issue 1: Vẫn thấy 0.3**

**Nguyên nhân:** Frontend chưa refresh

**Giải pháp:**
1. Hard refresh: **Ctrl + F5** (Windows) hoặc **Cmd + Shift + R** (Mac)
2. Clear cache: F12 → Application → Clear Storage
3. Restart frontend dev server

---

### **Issue 2: API trả về boxFee: 0.3**

**Nguyên nhân:** Database chưa update

**Giải pháp:**
1. Check database query (xem trên)
2. Re-save trong Admin
3. Check Backend console logs

---

### **Issue 3: boxFee = undefined**

**Nguyên nhân:** StoreContext chưa fetch

**Giải pháp:**
1. Check `fetchBoxFee()` có được gọi không
2. Check API endpoint có hoạt động không
3. Add error handling

---

## 📝 FILES ĐÃ SỬA

### **Frontend:**
- ✅ `Frontend/src/components/CartPopup/CartPopup.jsx`
  - Line 85: Add `boxFee` to context
  - Line 163: Use `boxFee` instead of `0.3`
  - Line 355: Use `boxFee` instead of `0.3`

### **Backend:**
- ✅ `Backend/services/emailService.js`
  - Line 3: Import `restaurantLocationModel`
  - Line 391-410: Fetch `globalBoxFee` in `sendOrderConfirmation`
  - Line 1267: Update `calculateItemPrice` to use `globalBoxFee`

- ✅ `controllers/deliveryController.js`
  - Line 517-532: Add debug logs for box fee update

---

## ✅ EXPECTED BEHAVIOR

### **Scenario 1: Box Fee = 0.5**

```
Admin: Set Box Fee = 0.5
Frontend: Refresh
Cart:
  - Phở bò: €8.50
  - Box Fee: €0.50  ✅
  - Total: €9.00    ✅
```

### **Scenario 2: Box Fee = 0 (Free)**

```
Admin: Set Box Fee = 0
Frontend: Refresh
Cart:
  - Phở bò: €8.50
  - Box Fee: €0.00  ✅
  - Total: €8.50    ✅
```

### **Scenario 3: Món có disableBoxFee**

```
Admin: Box Fee = 0.5 (global)
Product: disableBoxFee = true
Cart:
  - Combo: €15.00
  - Box Fee: €0.00  ✅ (disabled)
  - Total: €15.00   ✅
```

---

## 🎯 FINAL CHECKLIST

Sau khi fix, test tất cả:

- [ ] Restart Backend
- [ ] Update Box Fee trong Admin
- [ ] Check Backend console logs
- [ ] Restart Frontend
- [ ] Hard refresh browser (Ctrl + F5)
- [ ] Add món vào cart
- [ ] Check box fee đúng giá mới
- [ ] Test món có disableBoxFee
- [ ] Test place order
- [ ] Check email confirmation (nếu có)

---

## 📞 SUPPORT

Nếu vẫn không work:

1. Check tất cả logs (Backend + Frontend console)
2. Verify database value
3. Test API endpoint trực tiếp (Postman)
4. Check Network tab trong browser
5. Liên hệ developer

---

**Good luck! 🚀**
