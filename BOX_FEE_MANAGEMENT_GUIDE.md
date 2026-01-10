# 📦 HƯỚNG DẪN QUẢN LÝ TIỀN HỘP (BOX FEE)

## 🎯 TỔNG QUAN

Tiền hộp (Box Fee) giờ đã **linh hoạt** và có thể chỉnh sửa từ Admin Panel, thay vì hardcode 0.3€ như trước.

### **Tính năng mới:**
- ✅ Box Fee có thể edit trong Admin
- ✅ Lưu trong Restaurant Location settings
- ✅ Apply tự động cho tất cả món ăn
- ✅ Món nào có `disableBoxFee = true` sẽ không tính

---

## 📍 VỊ TRÍ CHỈNH SỬA

### **Admin Panel → Delivery Zones**

1. Login vào Admin
2. Vào menu **"Delivery Zones"**
3. Phần **"📍 Restaurant Location"** ở trên cùng
4. Click **"Update Location"**
5. Sẽ thấy field **"📦 Box Fee (€)"**

```
┌────────────────────────────────────┐
│  📍 Restaurant Location           │
├────────────────────────────────────┤
│  Name: VietBowls Restaurant       │
│  Address: ...                     │
│  Coordinates: 48.xxx, 17.xxx      │
│  📦 Box Fee: €0.30                │
│                                   │
│  [Update Location]                │
└────────────────────────────────────┘
```

---

## 🔧 CÁCH CHỈNH BOX FEE

### **Bước 1: Vào Admin Panel**

```
http://localhost:5174/delivery-zones
(hoặc port Admin của bạn)
```

### **Bước 2: Click "Update Location"**

Trong phần Restaurant Location, click nút **"Update Location"**

### **Bước 3: Chỉnh Box Fee**

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

### **Bước 4: Save**

- Click **"Save Location"**
- Thay đổi áp dụng ngay lập tức

---

## 💰 CÁCH BOX FEE HOẠT ĐỘNG

### **Logic tính giá:**

```javascript
Base Price (Món ăn)
+ Options (Nếu có)
+ Box Fee (Từ settings)
─────────────────────
= TOTAL PER ITEM
```

### **Ví dụ 1: Món bình thường**

```
Phở bò: €8.50
Box Fee: €0.30
─────────────
Total: €8.80
```

### **Ví dụ 2: Món có disableBoxFee**

```
Combo meal: €15.00
Box Fee: €0 (disabled)
─────────────────────
Total: €15.00
```

### **Ví dụ 3: Món có options**

```
Phở: €8.50
 + Large size: +€2.00
 + Extra beef: +€3.00
Box Fee: €0.30
─────────────────────
Total: €13.80
```

---

## 🎯 USE CASES

### **Use Case 1: Tăng box fee do giá nguyên liệu**

**Tình huống:** Giá hộp đựng tăng từ 0.3€ lên 0.5€

**Giải pháp:**
1. Vào Admin → Delivery Zones
2. Update Box Fee: `0.30` → `0.50`
3. Save
4. Tất cả món tự động tính với 0.5€

**Kết quả:**
- ✅ Không cần edit từng món
- ✅ Apply ngay lập tức
- ✅ Consistent trên toàn bộ menu

---

### **Use Case 2: Promotion miễn phí hộp**

**Tình huống:** Khuyến mãi free packaging trong tháng 2

**Giải pháp:**
1. Đầu tháng 2: Set Box Fee = `0`
2. Cuối tháng 2: Set lại Box Fee = `0.30`

**Kết quả:**
- ✅ All items free box fee
- ✅ Easy to turn on/off

---

### **Use Case 3: Box fee khác nhau theo món**

**Tình huống:** Combo lớn đã bao gồm box fee

**Giải pháp:**
1. Set global Box Fee = `0.30` (default)
2. Edit món combo:
   - Price: €20
   - ✅ **Tick "Disable Box Fee"**
3. Save

**Kết quả:**
- Món thường: +0.30€ box fee
- Combo: NO box fee

---

## 📊 QUẢN LÝ BOX FEE

### **Best Practices:**

1. **Review định kỳ:**
   - Check giá box mỗi 3-6 tháng
   - Adjust theo inflation/cost

2. **Communication:**
   - Thông báo khách trước khi tăng giá
   - Giải thích lý do (nếu cần)

3. **Testing:**
   - Test trước khi apply
   - Check cart calculation
   - Verify order total

4. **Backup:**
   - Note lại box fee cũ
   - Easy to rollback nếu cần

---

## 🔍 KIỂM TRA BOX FEE

### **1. Check trong Admin:**

```
Delivery Zones → Restaurant Location
→ Xem "📦 Box Fee: €X.XX"
```

### **2. Check trên Frontend:**

Thêm món vào cart và xem breakdown:

```
┌──────────────────────┐
│  Cart Total         │
├──────────────────────┤
│  Phở bò: €8.50     │
│  Box fee: €0.30    │ ← Check số này
│  ─────────────────  │
│  Subtotal: €8.80   │
└──────────────────────┘
```

### **3. Check trong Database:**

```javascript
// MongoDB query
db.restaurantlocation.findOne({ isPrimary: true })

// Result
{
  name: "VietBowls Restaurant",
  boxFee: 0.3,  // ← Current box fee
  ...
}
```

---

## 🚨 TROUBLESHOOTING

### **❌ Box fee không thay đổi trên frontend**

**Nguyên nhân:** Cache hoặc chưa refresh

**Giải pháp:**
1. Hard refresh frontend (Ctrl + F5)
2. Clear browser cache
3. Check Network tab xem API `/api/delivery/restaurant-location`
4. Verify response có `boxFee` đúng không

---

### **❌ Món vẫn tính box fee dù đã disable**

**Nguyên nhân:** `disableBoxFee` không được set đúng

**Kiểm tra:**
1. Vào Products → Edit món
2. Check checkbox **"Tắt tiền hộp (0.3€)"**
3. Save lại

---

### **❌ Box fee = 0 cho tất cả món**

**Nguyên nhân:** Box fee settings = 0

**Giải pháp:**
1. Vào Delivery Zones
2. Update Location
3. Set Box Fee = `0.30` (hoặc giá mong muốn)
4. Save

---

## 📝 TECHNICAL DETAILS

### **Database Schema:**

```javascript
// models/restaurantLocationModel.js
{
  name: String,
  address: String,
  latitude: Number,
  longitude: Number,
  boxFee: {
    type: Number,
    required: true,
    min: 0,
    default: 0.3  // Default value
  }
}
```

### **API Endpoints:**

#### **GET Restaurant Location:**
```
GET /api/delivery/restaurant-location

Response:
{
  success: true,
  data: {
    name: "VietBowls Restaurant",
    boxFee: 0.3,
    ...
  }
}
```

#### **UPDATE Restaurant Location:**
```
PUT /api/delivery/restaurant-location
Headers: { token: adminToken }

Body:
{
  name: "VietBowls Restaurant",
  address: "...",
  latitude: 48.1486,
  longitude: 17.1077,
  boxFee: 0.5  // New box fee
}
```

### **Frontend Usage:**

```javascript
// StoreContext.jsx
const { boxFee } = useContext(StoreContext);

// Box fee is fetched on app load
// Used in getTotalCartAmount calculation
const itemBoxFee = isBoxFeeDisabled ? 0 : boxFee;
const finalPrice = basePrice + itemBoxFee;
```

---

## ✅ CHECKLIST

**Sau khi thay đổi Box Fee:**

- [ ] Save trong Admin
- [ ] Refresh frontend (Ctrl + F5)
- [ ] Test add món vào cart
- [ ] Check cart total có đúng không
- [ ] Verify với món có disableBoxFee
- [ ] Test place order
- [ ] Check order confirmation có đúng không

---

## 📞 SUPPORT

**Nếu cần hỗ trợ:**

1. Check Admin console (F12)
2. Check Network tab - API calls
3. Verify database value
4. Contact developer

---

## 🎉 TÓM TẮT

| Trước | Sau |
|-------|-----|
| ❌ Hardcode 0.3€ | ✅ Edit được từ Admin |
| ❌ Phải sửa code để đổi | ✅ Click button là đổi |
| ❌ Apply cho tất cả | ✅ Linh hoạt per món |
| ❌ Không linh hoạt | ✅ Dễ quản lý |

---

**Chúc bạn quản lý Box Fee thành công! 🎉**
