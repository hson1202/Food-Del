# 📅 HƯỚNG DẪN SỬ DỤNG WEEKLY SCHEDULE (LỊCH THEO NGÀY TRONG TUẦN)

## 📋 TỔNG QUAN

Tính năng **Weekly Schedule** cho phép bạn set món ăn chỉ phục vụ vào những **ngày cụ thể trong tuần** (Thứ 2, Thứ 3, ..., Chủ Nhật).

### ✨ Tính năng mới:
- ✅ Chọn những ngày trong tuần món ăn có sẵn
- ✅ Tự động check ngày hiện tại là thứ mấy
- ✅ Tự động ẩn/hiện món theo ngày trong tuần
- ✅ Kết hợp được với Daily Time và Date Range
- ✅ Multilingual support (VI/EN/SK)

---

## 🎯 USE CASES

### **1. Món chỉ phục vụ cuối tuần**
```
Món: Buffet cuối tuần
Weekly Schedule: Thứ 7, Chủ Nhật
→ Chỉ hiển thị vào T7 và CN
```

### **2. Món phục vụ các ngày trong tuần**
```
Món: Cơm văn phòng
Weekly Schedule: Thứ 2, 3, 4, 5, 6
→ Chỉ hiển thị T2-T6, không hiện T7, CN
```

### **3. Món special ngày cụ thể**
```
Món: Phở bò tái đặc biệt
Weekly Schedule: Thứ 2, Thứ 5
→ Chỉ hiển thị vào T2 và T5
```

### **4. Kết hợp với khung giờ**
```
Món: Lẩu hải sản tối cuối tuần
Weekly Schedule: Thứ 6, 7, CN
Daily Time: 17:00 - 22:00
→ Chỉ hiển thị T6, T7, CN từ 5h-10h tối
```

---

## 📝 CÁCH SỬ DỤNG VỚI POSTMAN

### **Example 1: Món cuối tuần**

```json
POST http://localhost:4000/api/food/add
Content-Type: multipart/form-data

{
  "sku": "WEEKEND-001",
  "name": "Buffet Cuối Tuần",
  "nameVI": "Buffet Cuối Tuần",
  "nameEN": "Weekend Buffet",
  "nameSK": "Víkendový bufet",
  "description": "Chỉ phục vụ vào cuối tuần",
  "price": 299,
  "category": "Menu Đặc Biệt",
  "quantity": 30,
  "status": "active",
  
  // ⭐ Weekly Schedule
  "weeklyScheduleEnabled": true,
  "weeklyScheduleDays": [0, 6]  // 0=Sunday, 6=Saturday
}
```

### **Example 2: Món các ngày trong tuần**

```json
POST http://localhost:4000/api/food/add
Content-Type: multipart/form-data

{
  "sku": "WEEKDAY-001",
  "name": "Cơm Văn Phòng",
  "nameVI": "Cơm Văn Phòng",
  "nameEN": "Office Lunch",
  "description": "Chỉ phục vụ T2-T6",
  "price": 75,
  "category": "Menu Ngày",
  "quantity": 100,
  
  // ⭐ Weekly Schedule - Monday to Friday
  "weeklyScheduleEnabled": true,
  "weeklyScheduleDays": [1, 2, 3, 4, 5]
}
```

### **Example 3: Kết hợp với Daily Time**

```json
POST http://localhost:4000/api/food/add
Content-Type: multipart/form-data

{
  "sku": "SPECIAL-001",
  "name": "Lẩu Hải Sản Tối Cuối Tuần",
  "price": 450,
  "category": "Menu Đặc Biệt",
  "quantity": 20,
  
  // ⭐ Weekly Schedule - Friday, Saturday, Sunday
  "weeklyScheduleEnabled": true,
  "weeklyScheduleDays": [5, 6, 0],
  
  // ⭐ Daily Time - Evening only
  "dailyAvailabilityEnabled": true,
  "dailyTimeFrom": "17:00",
  "dailyTimeTo": "22:00"
}
```

### **Example 4: Phở bò chỉ T2 và T5**

```json
POST http://localhost:4000/api/food/add

{
  "sku": "PHO-MON-THU",
  "name": "Phở Bò Tái Đặc Biệt",
  "nameVI": "Phở Bò Tái Đặc Biệt",
  "price": 85,
  "category": "Món Phở",
  "quantity": 50,
  
  // ⭐ Chỉ có vào Thứ 2 và Thứ 5
  "weeklyScheduleEnabled": true,
  "weeklyScheduleDays": [1, 4]  // 1=Monday, 4=Thursday
}
```

---

## 🔢 NGÀY TRONG TUẦN (Day of Week Values)

```javascript
0 = Chủ Nhật  (Sunday)
1 = Thứ 2     (Monday)
2 = Thứ 3     (Tuesday)
3 = Thứ 4     (Wednesday)
4 = Thứ 5     (Thursday)
5 = Thứ 6     (Friday)
6 = Thứ 7     (Saturday)
```

**Ví dụ array:**
```json
[1, 2, 3, 4, 5]  // Thứ 2 đến Thứ 6
[6, 0]           // Thứ 7 và Chủ Nhật
[1, 3, 5]        // Thứ 2, 4, 6
```

---

## ⚙️ QUY TẮC HOẠT ĐỘNG

### **1. Priority Logic (Thứ tự check):**

```javascript
// 1. Check Date Range (nếu có)
if (availableFrom || availableTo) {
  if (now < availableFrom) → KHÔNG HIỂN THỊ
  if (now > availableTo) → KHÔNG HIỂN THỊ
}

// 2. Check Weekly Schedule (nếu bật)
if (weeklySchedule.enabled) {
  currentDay = getCurrentDayOfWeek() // 0-6
  if (!weeklySchedule.days.includes(currentDay)) {
    → KHÔNG HIỂN THỊ (Không phục vụ hôm nay)
  }
}

// 3. Check Daily Time (nếu bật)
if (dailyAvailability.enabled) {
  if (currentTime < timeFrom || currentTime > timeTo) {
    → KHÔNG HIỂN THỊ (Hết giờ)
  }
}

// Nếu pass tất cả checks → HIỂN THỊ
```

### **2. Format dữ liệu:**

**Backend/Postman:**
```json
{
  "weeklyScheduleEnabled": true,        // boolean hoặc "true"/"false"
  "weeklyScheduleDays": [1, 2, 3]       // array of numbers (0-6)
  // hoặc
  "weeklyScheduleDays": "[1, 2, 3]"     // JSON string cũng được accept
}
```

**Database:**
```javascript
{
  weeklySchedule: {
    enabled: true,
    days: [1, 2, 3]  // Array of numbers
  }
}
```

### **3. Null/Empty Values:**

- `enabled: false` hoặc không set → món available mọi ngày
- `days: []` (empty array) → món available mọi ngày
- `days: [1, 2, 3]` → chỉ available Thứ 2, 3, 4

---

## 🖥️ CÁCH SỬ DỤNG TRÊN ADMIN UI

### **Bước 1: Add/Edit Product**

1. Mở form Add Product hoặc Edit Product
2. Scroll đến section **"Time-Based Availability"**
3. Tích checkbox **"Enable Weekly Schedule"**
4. Chọn các ngày trong tuần bạn muốn món có sẵn
5. Save product

### **Bước 2: Visual Interface**

```
┌─────────────────────────────────────────────────┐
│  ☑️ Enable Weekly Schedule                      │
│  Product will only be available on selected    │
│  days of the week                              │
├─────────────────────────────────────────────────┤
│  Select Days:                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ Monday  │ │ Tuesday │ │Wednesday│ ...       │
│  └─────────┘ └─────────┘ └─────────┘          │
│                                                 │
│  Selected: 3 day(s)                            │
└─────────────────────────────────────────────────┘
```

**Ghi chú:**
- Các ngày được chọn sẽ có màu xanh
- Click vào ngày để toggle on/off
- Có thể chọn nhiều ngày cùng lúc

---

## 📱 HIỂN THỊ TRÊN FRONTEND

### **Món available:**
```
┌─────────────────────┐
│  [Photo]           │
│  📅 T2, T4, T6     │ ← Badge hiện các ngày
├─────────────────────┤
│  Phở Bò Đặc Biệt   │
│  €85               │
│  [Add to Cart]     │
└─────────────────────┘
```

### **Món không available hôm nay:**
```
┌─────────────────────┐
│  [Photo - Dimmed]  │
│  🚫 Không phục vụ   │ ← Overlay
│  hôm nay           │
│  📅 T2, T4, T6     │ ← Hiện ngày có
├─────────────────────┤
│  Phở Bò Đặc Biệt   │
│  €85               │
└─────────────────────┘
```

---

## 🎨 MESSAGES MULTILINGUAL

### **Vietnamese:**
```
- Không phục vụ hôm nay
- Phục vụ: Thứ 2, Thứ 3, Thứ 4
```

### **English:**
```
- Not available today
- Available: Monday, Tuesday, Wednesday
```

### **Slovak:**
```
- Dnes nie je k dispozícii
- Dostupné: Pondelok, Utorok, Streda
```

---

## 📊 KẾT HỢP CÁC TÍNH NĂNG

### **Example: Món hoàn chỉnh**

```json
{
  "sku": "COMPLETE-001",
  "name": "Lẩu Hải Sản Premium",
  "price": 550,
  "category": "Menu Cao Cấp",
  "quantity": 10,
  
  // 1. Date Range: Chỉ từ 1/2 đến 28/2
  "availableFrom": "2026-02-01T00:00:00.000Z",
  "availableTo": "2026-02-28T23:59:59.000Z",
  
  // 2. Weekly: Chỉ T6, T7, CN
  "weeklyScheduleEnabled": true,
  "weeklyScheduleDays": [5, 6, 0],
  
  // 3. Daily: Chỉ buổi tối
  "dailyAvailabilityEnabled": true,
  "dailyTimeFrom": "18:00",
  "dailyTimeTo": "22:00"
}
```

**Logic check:**
1. ✅ Hôm nay có trong tháng 2/2026 không?
2. ✅ Hôm nay là T6, T7 hoặc CN không?
3. ✅ Giờ hiện tại có từ 18h-22h không?

→ **Chỉ HIỂN THỊ** khi pass cả 3 checks!

---

## 🔧 TROUBLESHOOTING

### **Món không hiển thị đúng ngày:**

1. **Check current day:**
```javascript
console.log(new Date().getDay())  // 0-6
```

2. **Check database:**
```javascript
db.foods.findOne({ sku: "WEEKEND-001" })
// Kiểm tra weeklySchedule.enabled và weeklySchedule.days
```

3. **Check frontend console:**
```javascript
// Trong timeUtils.js sẽ log
console.log('Current day:', currentDay)
console.log('Allowed days:', weeklySchedule.days)
```

### **Admin UI không hiển thị checkboxes:**

- Clear browser cache
- Check console errors
- Verify i18n translations loaded

### **Backend không lưu weeklySchedule:**

- Check req.body có `weeklyScheduleEnabled` và `weeklyScheduleDays`
- Verify JSON.parse for array
- Check model schema có field `weeklySchedule`

---

## 📞 API ENDPOINTS

### **1. Add Food với Weekly Schedule**

```bash
POST /api/food/add
Content-Type: multipart/form-data

Fields:
- sku (required)
- name (required)
- price (required)
- category (required)
- quantity (required)
- weeklyScheduleEnabled (boolean or "true"/"false")
- weeklyScheduleDays (JSON array or string: "[1,2,3]")
```

### **2. Update Food**

```bash
PUT /api/food/update/:id
Content-Type: multipart/form-data

# Same fields as add
```

### **3. List Foods**

```bash
GET /api/food/list

# Returns all foods with weeklySchedule field
# Frontend tự động filter theo ngày hiện tại
```

---

## ✅ QUICK TEST

### **Test 1: Món cuối tuần**

```bash
# Add món chỉ T7, CN
POST /api/food/add
{
  "sku": "TEST-WEEKEND",
  "name": "Test Weekend",
  "price": 100,
  "category": "Test",
  "quantity": 10,
  "weeklyScheduleEnabled": true,
  "weeklyScheduleDays": [0, 6]
}

# Check frontend:
- Nếu hôm nay là T7 hoặc CN → món hiển thị
- Nếu hôm nay là T2-T6 → món ẩn với message "Không phục vụ hôm nay"
```

### **Test 2: Món T2, T4, T6**

```bash
# Add món
POST /api/food/add
{
  "sku": "TEST-MWF",
  "name": "Test Monday-Wednesday-Friday",
  "price": 100,
  "category": "Test",
  "quantity": 10,
  "weeklyScheduleEnabled": true,
  "weeklyScheduleDays": [1, 3, 5]
}

# Check:
- Thứ 2: ✅ Hiển thị
- Thứ 3: ❌ Ẩn
- Thứ 4: ✅ Hiển thị
- Thứ 5: ❌ Ẩn
- Thứ 6: ✅ Hiển thị
- Thứ 7, CN: ❌ Ẩn
```

---

## 🎯 SO SÁNH CÁC LOẠI TIME-BASED MENU

| Loại | Use Case | Format | Example |
|------|----------|--------|---------|
| **Daily Time** | Khung giờ hàng ngày | `"HH:MM"` | Cơm trưa: 11:00-14:30 mỗi ngày |
| **Date Range** | Event, promotion | ISO Date | Menu Tết: 01/02-15/02 |
| **Weekly Schedule** ⭐ NEW | Ngày trong tuần | Array `[0-6]` | Buffet: Chỉ T7, CN |

---

## 📝 CHECKLIST

- [x] Database schema updated (weeklySchedule field)
- [x] Backend controller xử lý weeklyScheduleEnabled & weeklyScheduleDays
- [x] Frontend timeUtils check day of week
- [x] Admin UI - Add Product form có weekly selector
- [x] Admin UI - Edit Product form có weekly selector
- [x] i18n translations (VI/EN/SK)
- [x] Documentation
- [ ] Test với Postman ✨ NEXT
- [ ] Test trên Frontend
- [ ] Test combinations (Weekly + Daily + Date Range)

---

## 🚀 TIẾP THEO

1. **Test với Postman** - Tạo món test với weekly schedule
2. **Test Frontend** - Xem món hiển thị đúng ngày chưa
3. **Test Admin UI** - Add/Edit món với weekly schedule
4. **Test combinations** - Kết hợp Weekly + Daily Time + Date Range

---

## 💡 TIPS

### **Tip 1: Test nhanh**
Để test nhanh mà không cần đợi đúng ngày:
```javascript
// Trong timeUtils.js, tạm thời hardcode currentDay
const currentDay = 6;  // Giả lập hôm nay là Thứ 7
```

### **Tip 2: Debug**
```javascript
// Log trong isFoodAvailable()
console.log({
  currentDay: now.getDay(),
  enabledDays: food.weeklySchedule?.days,
  isAvailable: food.weeklySchedule?.days?.includes(now.getDay())
});
```

### **Tip 3: Bulk update**
Nếu muốn set weekly schedule cho nhiều món:
```javascript
// Script để update nhiều món cùng lúc
db.foods.updateMany(
  { category: "Buffet" },
  { $set: { 
    "weeklySchedule.enabled": true,
    "weeklySchedule.days": [0, 6]
  }}
)
```

---

**Chúc bạn thành công! 🎉**

Nếu có vấn đề, check:
1. Console logs (F12)
2. Network tab → API response
3. Database → weeklySchedule field
4. timeUtils.js → isFoodAvailable() logic
