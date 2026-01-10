# 🕐 HƯỚNG DẪN SỬ DỤNG MENU THEO THỜI GIAN

## 📋 TỔNG QUAN

Tính năng này cho phép bạn:
- ✅ Set thời gian hiển thị cho từng món ăn
- ✅ Tự động ẩn/hiện món theo thời gian thực
- ✅ Hiển thị badge thời gian trên món ăn
- ✅ 2 chế độ: **Khung giờ cố định** hoặc **Ngày giờ cụ thể**

---

## 🎯 CÁC LOẠI TIME-BASED MENU

### **1. Khung giờ hàng ngày** (Daily Time Availability)

Dùng cho món phục vụ **hàng ngày** trong khung giờ cố định.

**Ví dụ:**
- Lunch Special: 11:00 - 14:30 (mỗi ngày)
- Breakfast Menu: 07:00 - 10:00 (mỗi ngày)
- Dinner Special: 17:00 - 21:00 (mỗi ngày)

### **2. Ngày giờ cụ thể** (Date Range Availability)

Dùng cho món **đặc biệt**, **event**, hoặc **promotion có thời hạn**.

**Ví dụ:**
- Menu Tết: 01/02/2026 - 15/02/2026
- Valentine Special: 14/02/2026 (cả ngày)
- Weekend Special: 18/01/2026 9:00 - 19/01/2026 22:00

---

## 📝 CÁCH SỬ DỤNG VỚI POSTMAN

### **Option 1: Khung giờ hàng ngày**

```json
POST http://localhost:4000/api/food/add
Content-Type: multipart/form-data

{
  "sku": "LUNCH-001",
  "name": "Cơm trưa combo đặc biệt",
  "nameVI": "Cơm trưa combo đặc biệt",
  "nameEN": "Lunch Combo Special",
  "nameSK": "Obedové kombo špeciál",
  "description": "Chỉ phục vụ trong giờ trưa",
  "price": 85,
  "category": "Menu Ngày",
  "quantity": 50,
  "status": "active",
  
  // ⭐ Khung giờ hàng ngày
  "dailyAvailabilityEnabled": true,
  "dailyTimeFrom": "11:00",
  "dailyTimeTo": "14:30"
}
```

### **Option 2: Ngày giờ cụ thể**

```json
POST http://localhost:4000/api/food/add
Content-Type: multipart/form-data

{
  "sku": "TET-001",
  "name": "Menu Tết 2026",
  "nameVI": "Menu Tết 2026",
  "description": "Món đặc biệt dịp Tết",
  "price": 250,
  "category": "Menu Ngày",
  "quantity": 30,
  "status": "active",
  
  // ⭐ Ngày giờ cụ thể
  "availableFrom": "2026-02-01T00:00:00.000Z",
  "availableTo": "2026-02-15T23:59:59.000Z"
}
```

### **Option 3: Kết hợp cả 2**

```json
{
  "sku": "SPECIAL-001",
  "name": "Lẩu hải sản cuối tuần",
  "price": 450,
  "category": "Menu Ngày",
  "quantity": 20,
  
  // Chỉ có vào cuối tuần
  "availableFrom": "2026-01-10T00:00:00.000Z",
  "availableTo": "2026-01-12T23:59:59.000Z",
  
  // Và chỉ phục vụ buổi tối
  "dailyAvailabilityEnabled": true,
  "dailyTimeFrom": "17:00",
  "dailyTimeTo": "21:00"
}
```

---

## 🖥️ POSTMAN COLLECTION EXAMPLES

### **Example 1: Breakfast Menu**

```json
{
  "sku": "BF-001",
  "name": "Phở bò sáng",
  "nameVI": "Phở bò sáng",
  "nameEN": "Morning Beef Pho",
  "price": 65,
  "category": "Menu Ngày",
  "quantity": 100,
  "dailyAvailabilityEnabled": true,
  "dailyTimeFrom": "07:00",
  "dailyTimeTo": "10:00"
}
```

### **Example 2: Lunch Special**

```json
{
  "sku": "LC-001",
  "name": "Cơm tấm trưa",
  "price": 75,
  "category": "Menu Ngày",
  "quantity": 80,
  "dailyAvailabilityEnabled": true,
  "dailyTimeFrom": "11:00",
  "dailyTimeTo": "14:30"
}
```

### **Example 3: Dinner Special**

```json
{
  "sku": "DN-001",
  "name": "Set lẩu tối",
  "price": 350,
  "category": "Menu Ngày",
  "quantity": 20,
  "dailyAvailabilityEnabled": true,
  "dailyTimeFrom": "17:00",
  "dailyTimeTo": "21:00"
}
```

### **Example 4: Weekend Special**

```json
{
  "sku": "WE-001",
  "name": "Buffet cuối tuần",
  "price": 199,
  "category": "Menu Ngày",
  "quantity": 50,
  "availableFrom": "2026-01-11T10:00:00.000Z",  // Saturday
  "availableTo": "2026-01-12T22:00:00.000Z"     // Sunday
}
```

---

## 🎨 CÁCH HIỂN THỊ TRÊN FRONTEND

### **Món đang available:**
```
┌─────────────────────┐
│  [Photo]           │
│  ⏰ 11:00 - 14:30  │ ← Badge xanh
├─────────────────────┤
│  Cơm trưa combo    │
│  €85               │
│  [Add to Cart]     │
└─────────────────────┘
```

### **Món hết giờ:**
```
┌─────────────────────┐
│  [Photo - Dimmed]  │
│  🚫 Hết giờ        │ ← Overlay đỏ
│  ⏰ 11:00 - 14:30  │
├─────────────────────┤
│  Cơm trưa combo    │
│  €85               │
└─────────────────────┘
```

---

## 📱 API ENDPOINTS

### **1. Add Food với Time Availability**

```bash
POST /api/food/add
Content-Type: multipart/form-data

Fields:
- sku (required)
- name (required)
- price (required)
- category (required)
- quantity (required)

# Optional time fields:
- availableFrom (ISO Date)
- availableTo (ISO Date)
- dailyAvailabilityEnabled (boolean)
- dailyTimeFrom (HH:MM format)
- dailyTimeTo (HH:MM format)
```

### **2. Update Food**

```bash
PUT /api/food/update/:id
Content-Type: multipart/form-data

# Same fields as add
```

### **3. List Foods** (Tự động filter theo thời gian)

```bash
GET /api/food/list?forUser=true

# Frontend tự động ẩn món hết giờ
```

---

## ⚙️ QUY TẮC HOẠT ĐỘNG

### **1. Priority Logic:**

```javascript
if (availableFrom || availableTo) {
  // Check date range first
  if (now < availableFrom) → KHÔNG HIỂN THỊ
  if (now > availableTo) → KHÔNG HIỂN THỊ
}

if (dailyAvailability.enabled) {
  // Then check daily time
  if (currentTime < timeFrom) → KHÔNG HIỂN THỊ
  if (currentTime > timeTo) → KHÔNG HIỂN THỊ
}

// Nếu pass cả 2 checks → HIỂN THỊ
```

### **2. Format thời gian:**

- **dailyTimeFrom/To:** `"HH:MM"` (24h format)
  - Ví dụ: `"09:30"`, `"14:00"`, `"21:45"`
  
- **availableFrom/To:** ISO 8601 Date
  - Ví dụ: `"2026-01-15T10:00:00.000Z"`

### **3. Null Values:**

- `null` hoặc không set → món luôn available
- Chỉ set 1 trong 2 (From hoặc To) → chỉ check 1 bên

---

## 🔧 TROUBLESHOOTING

### **Món không hiển thị:**

1. Check thời gian server:
```bash
node -e "console.log(new Date())"
```

2. Check database:
```javascript
db.foods.find({ sku: "LUNCH-001" })
```

3. Check frontend console:
```javascript
// Trong utils/timeUtils.js có log
console.log('Current time:', currentTime)
console.log('Available:', isAvailable)
```

### **Badge không hiển thị:**

- Check CSS đã import đúng chưa
- Check props được pass từ parent component
- Xem trong DevTools Elements

---

## 📊 USE CASES THỰC TẾ

### **1. Nhà hàng phục vụ theo khung giờ:**

```javascript
// Breakfast: 7h - 10h
// Lunch: 11h - 14h30
// Dinner: 17h - 21h

→ Set dailyAvailability cho từng món
```

### **2. Promotion có thời hạn:**

```javascript
// Flash sale 24h
availableFrom: "2026-01-15T00:00:00.000Z"
availableTo: "2026-01-15T23:59:59.000Z"
```

### **3. Menu theo mùa:**

```javascript
// Summer special: Jun - Aug
availableFrom: "2026-06-01T00:00:00.000Z"
availableTo: "2026-08-31T23:59:59.000Z"
```

### **4. Happy Hour:**

```javascript
// 15h - 17h mỗi ngày
dailyAvailabilityEnabled: true
dailyTimeFrom: "15:00"
dailyTimeTo: "17:00"
```

---

## 🚀 QUICK START

### **Bước 1: Tạo category "Menu Ngày"**

```bash
POST /api/category/add
{
  "name": "Menu Ngày",
  "description": "Món ăn theo khung giờ",
  "sortOrder": 1
}
```

### **Bước 2: Add món với time**

```bash
POST /api/food/add
{
  "sku": "LUNCH-001",
  "name": "Cơm trưa",
  "price": 85,
  "category": "Menu Ngày",
  "quantity": 50,
  "dailyAvailabilityEnabled": true,
  "dailyTimeFrom": "11:00",
  "dailyTimeTo": "14:30"
}
```

### **Bước 3: Check frontend**

- Mở trang web
- Xem món trong category "Menu Ngày"
- Nếu đúng khung giờ → thấy badge xanh
- Nếu ngoài giờ → thấy overlay đỏ

---

## ✅ CHECKLIST

- [ ] Database schema đã update (foodModel.js)
- [ ] Backend controller đã update (foodController.js)
- [ ] Frontend utils đã tạo (timeUtils.js)
- [ ] FoodItem component đã update
- [ ] CSS đã thêm time badges
- [ ] Test với Postman
- [ ] Test trên frontend
- [ ] Test các edge cases (midnight, timezone)

---

## 📞 SUPPORT

Nếu có lỗi hoặc cần hỗ trợ:
1. Check console logs (F12)
2. Check API response trong Network tab
3. Verify database schema
4. Test lại với Postman

**Chúc bạn thành công! 🎉**

