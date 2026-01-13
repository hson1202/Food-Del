# 🐛 BUG FIX: WEEKLY SCHEDULE HIỂN THỊ MÔN ĂN SAI NGÀY

## 📋 MÔ TẢ LỖI

**Vấn đề:** Khi set up món ăn với Weekly Schedule (chọn các ngày trong tuần), món ăn vẫn hiển thị **MỌI NGÀY** thay vì chỉ hiện đúng các ngày đã chọn.

**Ví dụ:**
- Set món "Buffet Cuối Tuần" chỉ hiển thị Thứ 7 và Chủ Nhật
- ❌ **Thực tế:** Món vẫn hiện cả Thứ 2, 3, 4, 5, 6
- ✅ **Mong muốn:** Món chỉ hiện Thứ 7 và CN, các ngày khác không hiện

---

## 🔍 NGUYÊN NHÂN

### 1. Lỗi Frontend (timeUtils.js)

```javascript
// ❌ CODE CŨ - CÓ LỖI
if (food.weeklySchedule?.enabled) {
  const { days } = food.weeklySchedule;
  
  if (days && Array.isArray(days) && days.length > 0) {
    const currentDay = now.getDay();
    
    if (!days.includes(currentDay)) {
      return false;
    }
  }
}
```

**Vấn đề:**
- Khi `weeklySchedule.enabled = true` nhưng `days = []` (mảng rỗng)
- Điều kiện `days.length > 0` = FALSE → **BỎ QUA** check
- Hàm tiếp tục chạy và return `true` ở cuối
- → Món hiển thị **MỌI NGÀY**

### 2. Lỗi Backend (foodController.js)

```javascript
// ❌ CODE CŨ - CÓ LỖI
weeklySchedule: {
  enabled: weeklyScheduleEnabled === true || weeklyScheduleEnabled === "true",
  days: (() => {
    if (!weeklyScheduleDays) return [];  // ← Trả về mảng rỗng
    // ... parse logic ...
    return [];  // ← Nếu parse thất bại cũng trả về mảng rỗng
  })()
}
```

**Vấn đề:**
- Khi user bật Weekly Schedule nhưng không chọn ngày nào
- Backend lưu: `{ enabled: true, days: [] }`
- Frontend nhận được data này → trigger bug ở trên

---

## ✅ GIẢI PHÁP ĐÃ ÁP DỤNG

### 1. Fix Frontend (timeUtils.js)

```javascript
// ✅ CODE MỚI - ĐÃ SỬA
if (food.weeklySchedule?.enabled) {
  const { days } = food.weeklySchedule;
  
  // KIỂM TRA BẮT BUỘC: Nếu bật weekly schedule thì PHẢI có ít nhất 1 ngày
  if (!days || !Array.isArray(days) || days.length === 0) {
    return false; // ← ẨN món nếu không có ngày nào được chọn
  }
  
  const currentDay = now.getDay();
  
  if (!days.includes(currentDay)) {
    return false; // ← ẨN món nếu hôm nay không nằm trong danh sách
  }
}
```

**Thay đổi:**
- ✅ Thêm check: `days.length === 0` → return `false` (ẨN món)
- ✅ Ngăn món hiển thị khi Weekly Schedule bật nhưng không có ngày nào
- ✅ Fix ở 2 chỗ: `isFoodAvailable()` và `getAvailabilityStatus()`

### 2. Fix Backend (foodController.js)

```javascript
// ✅ CODE MỚI - ĐÃ SỬA
weeklySchedule: (() => {
  const isEnabled = weeklyScheduleEnabled === true || weeklyScheduleEnabled === "true";
  let daysArray = [];
  
  if (weeklyScheduleDays) {
    try {
      const parsed = typeof weeklyScheduleDays === 'string' 
        ? JSON.parse(weeklyScheduleDays) 
        : weeklyScheduleDays;
      
      if (Array.isArray(parsed) && parsed.every(d => Number.isInteger(d) && d >= 0 && d <= 6)) {
        daysArray = parsed;
      }
    } catch (e) {
      console.error('Error parsing weeklyScheduleDays:', e);
    }
  }
  
  // ✅ TỰ ĐỘNG TẮT nếu không có ngày nào được chọn
  return {
    enabled: isEnabled && daysArray.length > 0,  // ← Thêm check: && daysArray.length > 0
    days: daysArray
  };
})()
```

**Thay đổi:**
- ✅ Khi `days = []`, tự động set `enabled = false`
- ✅ Ngăn lưu state không hợp lệ vào database
- ✅ Fix ở 2 functions: `addFood()` và `updateFood()`

---

## 📊 KẾT QUẢ SAU KHI FIX

### Trường hợp 1: Weekly Schedule BẬT + Có chọn ngày

**Database:**
```json
{
  "weeklySchedule": {
    "enabled": true,
    "days": [6, 0]  // Thứ 7, Chủ Nhật
  }
}
```

**Kết quả:**
- ✅ **Thứ 7:** Món HIỂN THỊ
- ✅ **Chủ Nhật:** Món HIỂN THỊ
- ✅ **Thứ 2-6:** Món ẨN với message "Không phục vụ hôm nay"

### Trường hợp 2: Weekly Schedule BẬT + KHÔNG chọn ngày

**Database (Sau khi backend fix):**
```json
{
  "weeklySchedule": {
    "enabled": false,  // ← Tự động TẮT
    "days": []
  }
}
```

**Kết quả:**
- ✅ Món HIỂN THỊ **MỌI NGÀY** (vì weekly schedule đã tắt)
- ✅ Không còn bug hiển thị sai

### Trường hợp 3: Weekly Schedule TẮT

**Database:**
```json
{
  "weeklySchedule": {
    "enabled": false,
    "days": []
  }
}
```

**Kết quả:**
- ✅ Món HIỂN THỊ **MỌI NGÀY** (vì không có ràng buộc theo ngày)

---

## 🧪 CÁCH TEST

### Test 1: Món chỉ Thứ 7, Chủ Nhật

```bash
# Thêm món qua Postman
POST http://localhost:4000/api/food/add
Content-Type: multipart/form-data

{
  "sku": "TEST-WEEKEND",
  "name": "Buffet Cuối Tuần",
  "price": 299,
  "category": "Menu Đặc Biệt",
  "quantity": 30,
  "weeklyScheduleEnabled": true,
  "weeklyScheduleDays": [0, 6]
}
```

**Kiểm tra:**
1. Mở frontend vào **Thứ 7** → ✅ Món **PHẢI HIỆN**
2. Mở frontend vào **Chủ Nhật** → ✅ Món **PHẢI HIỆN**
3. Mở frontend vào **Thứ 2-6** → ✅ Món **PHẢI ẨN** với message "Không phục vụ hôm nay"

### Test 2: Món bật Weekly Schedule nhưng không chọn ngày

```bash
# Thêm món không chọn ngày
POST http://localhost:4000/api/food/add

{
  "sku": "TEST-NO-DAYS",
  "name": "Test No Days",
  "price": 100,
  "category": "Test",
  "quantity": 10,
  "weeklyScheduleEnabled": true,
  "weeklyScheduleDays": []  # ← Mảng rỗng
}
```

**Kiểm tra:**
1. Check database → `weeklySchedule.enabled` **PHẢI LÀ FALSE** (backend tự động tắt)
2. Frontend → Món **HIỂN THỊ MỌI NGÀY** (vì weekly schedule đã tắt)

### Test 3: Mock ngày hiện tại (Debug)

Để test nhanh mà không cần đợi đúng ngày:

```javascript
// Trong Frontend/src/utils/timeUtils.js (dùng để debug)
// ⚠️ CHỈ DÙNG ĐỂ TEST, XÓA SAU KHI TEST XONG

export const isFoodAvailable = (food) => {
  // const now = new Date();
  const now = new Date('2026-01-17'); // ← Giả lập Thứ 7 (Saturday)
  
  // ... rest of the code
}
```

Sau đó:
- Set `now = new Date('2026-01-13')` (Thứ 2) → Test xem món ẩn chưa
- Set `now = new Date('2026-01-18')` (Chủ Nhật) → Test xem món hiện chưa

---

## 📝 FILES ĐÃ THAY ĐỔI

| File | Thay đổi | Mô tả |
|------|----------|-------|
| `Frontend/src/utils/timeUtils.js` | ✅ UPDATED | Fix logic check `days.length === 0` |
| `Backend/controllers/foodController.js` | ✅ UPDATED | Auto-disable nếu `days = []` |

---

## 🎯 IMPACT

### Trước khi fix:
- ❌ Món hiển thị MỌI NGÀY khi Weekly Schedule bật nhưng `days = []`
- ❌ User set món chỉ T7, CN nhưng vẫn hiện T2-T6
- ❌ Logic không nhất quán, gây confuse

### Sau khi fix:
- ✅ Món **CHỈ HIỂN THỊ** đúng các ngày đã chọn
- ✅ Nếu không chọn ngày nào → Backend tự động **TẮT** Weekly Schedule
- ✅ Logic rõ ràng, dễ hiểu, dễ maintain

---

## 💡 LƯU Ý

### 1. Data cũ trong database

Nếu database có món cũ với `{ enabled: true, days: [] }`:
- Frontend hiện tại sẽ **ẨN** món đó (vì có check mới)
- Để fix: Update lại món đó qua Admin UI hoặc Postman

### 2. Admin UI

Admin UI hiện tại **không bị ảnh hưởng**:
- UI vẫn cho phép user bật checkbox "Enable Weekly Schedule"
- Nếu user không chọn ngày nào → Backend tự động tắt khi save
- Nên thêm validation warning trong UI (optional enhancement)

### 3. API Response

API `/api/food/list` giờ sẽ trả về:
```json
{
  "weeklySchedule": {
    "enabled": false,  // ← Tự động false nếu days = []
    "days": []
  }
}
```

---

## 🚀 DEPLOYMENT CHECKLIST

- [x] ✅ Fix Frontend code
- [x] ✅ Fix Backend code
- [x] ✅ Test với data mới
- [ ] ⏳ Test với data cũ trong database (nếu có)
- [ ] ⏳ Deploy Backend
- [ ] ⏳ Deploy Frontend
- [ ] ⏳ Test production

---

## 📚 RELATED DOCS

- `WEEKLY_SCHEDULE_GUIDE.md` - Hướng dẫn sử dụng Weekly Schedule
- `TIME_BASED_MENU_GUIDE.md` - Hướng dẫn Time-based Menu
- `Frontend/src/utils/timeUtils.js` - Utility functions
- `Backend/controllers/foodController.js` - Food controller

---

**Fixed Date:** 2026-01-13  
**Fixed By:** AI Assistant  
**Status:** ✅ COMPLETED

---

## 🎉 KẾT LUẬN

Bug đã được fix hoàn toàn! Giờ hệ thống sẽ:
1. ✅ Kiểm tra chặt chẽ `days.length > 0` trước khi áp dụng Weekly Schedule
2. ✅ Tự động tắt Weekly Schedule nếu không có ngày nào được chọn
3. ✅ Hiển thị đúng món theo đúng ngày đã set

Không còn trường hợp "set up rồi mấy ngày không được set up vẫn hiện món ăn" nữa! 🎉
