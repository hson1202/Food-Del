# 🧪 HƯỚNG DẪN TEST WEEKLY SCHEDULE

## 📋 QUICK TEST CHECKLIST

### ✅ Test 1: Backend - Add món cuối tuần
```bash
POST http://localhost:4000/api/food/add

FormData:
- sku: WEEKEND-TEST-001
- name: Test Weekend Buffet
- price: 299
- category: Test
- quantity: 30
- weeklyScheduleEnabled: true
- weeklyScheduleDays: [0, 6]    # Chủ Nhật và Thứ 7
```

**Expected Result:**
- ✅ Status 200
- ✅ Response có field `weeklySchedule.enabled = true`
- ✅ Response có field `weeklySchedule.days = [0, 6]`

---

### ✅ Test 2: Database - Verify data saved
```javascript
// MongoDB shell hoặc Compass
db.foods.findOne({ sku: "WEEKEND-TEST-001" })

// Should return:
{
  sku: "WEEKEND-TEST-001",
  name: "Test Weekend Buffet",
  weeklySchedule: {
    enabled: true,
    days: [0, 6]
  }
}
```

---

### ✅ Test 3: Frontend - Check availability logic

**Scenario A: Hôm nay là Thứ 7 (Saturday)**
```javascript
// Expected: Món hiển thị bình thường
// Badge hiện: "📅 Thứ 7, Chủ Nhật"
```

**Scenario B: Hôm nay là Thứ 2 (Monday)**
```javascript
// Expected: Món bị dimmed với overlay
// Message: "🚫 Không phục vụ hôm nay"
// Badge hiện: "Thứ 7, Chủ Nhật"
```

---

### ✅ Test 4: Admin UI - Add Product

**Steps:**
1. Mở Admin Panel → Products
2. Click "Add New Product"
3. Scroll đến "Time-Based Availability"
4. Tích ☑️ "Enable Weekly Schedule"
5. Chọn các ngày: Monday, Wednesday, Friday
6. Save

**Expected:**
- ✅ Checkboxes hiển thị đúng
- ✅ Ngày được chọn có màu xanh
- ✅ Preview summary hiện: "Days: Mon, Wed, Fri"
- ✅ Save thành công

---

### ✅ Test 5: Admin UI - Edit Product

**Steps:**
1. Edit một product có sẵn
2. Chuyển sang tab "🕐 Time Availability"
3. Tích "Enable Weekly Schedule"
4. Chọn Saturday & Sunday
5. Save

**Expected:**
- ✅ Tab "Time Availability" có weekly schedule section
- ✅ Checkboxes toggle được
- ✅ Update thành công
- ✅ Reload lại page → data vẫn đúng

---

## 🎯 TEST CASES CHI TIẾT

### Test Case 1: Món chỉ cuối tuần
```json
Input:
{
  "weeklyScheduleEnabled": true,
  "weeklyScheduleDays": [0, 6]
}

Test Days:
- Monday (1): ❌ Không hiển thị
- Tuesday (2): ❌ Không hiển thị
- Wednesday (3): ❌ Không hiển thị
- Thursday (4): ❌ Không hiển thị
- Friday (5): ❌ Không hiển thị
- Saturday (6): ✅ Hiển thị
- Sunday (0): ✅ Hiển thị
```

---

### Test Case 2: Món T2-T6
```json
Input:
{
  "weeklyScheduleEnabled": true,
  "weeklyScheduleDays": [1, 2, 3, 4, 5]
}

Test Days:
- Monday (1): ✅ Hiển thị
- Tuesday (2): ✅ Hiển thị
- Wednesday (3): ✅ Hiển thị
- Thursday (4): ✅ Hiển thị
- Friday (5): ✅ Hiển thị
- Saturday (6): ❌ Không hiển thị
- Sunday (0): ❌ Không hiển thị
```

---

### Test Case 3: Kết hợp Weekly + Daily Time
```json
Input:
{
  "weeklyScheduleEnabled": true,
  "weeklyScheduleDays": [5, 6, 0],  // Fri, Sat, Sun
  "dailyAvailabilityEnabled": true,
  "dailyTimeFrom": "17:00",
  "dailyTimeTo": "22:00"
}

Test Scenarios:
1. Friday 16:00 → ❌ (Đúng ngày nhưng chưa đến giờ)
2. Friday 18:00 → ✅ (Đúng cả ngày và giờ)
3. Friday 23:00 → ❌ (Đúng ngày nhưng quá giờ)
4. Monday 18:00 → ❌ (Đúng giờ nhưng sai ngày)
```

---

### Test Case 4: Kết hợp cả 3 loại
```json
Input:
{
  "availableFrom": "2026-02-01T00:00:00.000Z",
  "availableTo": "2026-02-28T23:59:59.000Z",
  "weeklyScheduleEnabled": true,
  "weeklyScheduleDays": [5, 6, 0],
  "dailyAvailabilityEnabled": true,
  "dailyTimeFrom": "18:00",
  "dailyTimeTo": "22:00"
}

Logic Check Order:
1. Check Date: 2026-02-15 → ✅ (trong tháng 2)
2. Check Day: Friday → ✅ (trong list [5,6,0])
3. Check Time: 19:00 → ✅ (trong khung 18-22h)
→ Final: ✅ HIỂN THỊ

Another test:
1. Check Date: 2026-02-16 → ✅ (trong tháng 2)
2. Check Day: Monday → ❌ (không trong list)
→ Final: ❌ KHÔNG HIỂN THỊ (stop tại check 2)
```

---

## 🐛 DEBUG GUIDE

### Problem 1: Món không hiển thị đúng ngày

**Check 1: Current day**
```javascript
// Trong browser console
console.log(new Date().getDay())  
// 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
```

**Check 2: Database value**
```javascript
db.foods.findOne({ sku: "YOUR-SKU" })
// Verify weeklySchedule.days array
```

**Check 3: Frontend logic**
```javascript
// Trong Frontend/src/utils/timeUtils.js
// Add console.log in isFoodAvailable()
console.log('Current day:', now.getDay())
console.log('Allowed days:', food.weeklySchedule?.days)
console.log('Is included:', food.weeklySchedule?.days?.includes(now.getDay()))
```

---

### Problem 2: Admin UI không lưu được

**Check 1: FormData**
```javascript
// Trong handleAddProduct hoặc handleEditProduct
console.log('weeklyScheduleEnabled:', newProduct.weeklyScheduleEnabled)
console.log('weeklyScheduleDays:', newProduct.weeklyScheduleDays)

// Check formData entries
for (let pair of formData.entries()) {
  if (pair[0].includes('weekly')) {
    console.log(pair[0], '=', pair[1])
  }
}
```

**Check 2: Backend received data**
```javascript
// Trong Backend/controllers/foodController.js
console.log('Received:', {
  weeklyScheduleEnabled: req.body.weeklyScheduleEnabled,
  weeklyScheduleDays: req.body.weeklyScheduleDays
})
```

---

### Problem 3: Array parsing lỗi

**Issue:** weeklyScheduleDays bị lỗi khi parse

**Solution:**
```javascript
// Backend phải handle cả string và array
const parsed = typeof weeklyScheduleDays === 'string' 
  ? JSON.parse(weeklyScheduleDays) 
  : weeklyScheduleDays;
```

**Test:**
```bash
# Test với string
weeklyScheduleDays: "[0, 6]"

# Test với array
weeklyScheduleDays: [0, 6]

# Cả 2 đều phải work
```

---

## 📊 TEST RESULTS TEMPLATE

```markdown
## Test Results - Weekly Schedule Feature

Date: [DATE]
Tester: [NAME]

### Backend Tests
- [ ] Add món với weekly schedule → Status 200
- [ ] Data saved correctly in DB
- [ ] Update món với weekly schedule → Status 200
- [ ] Array parsing works (string & array)

### Frontend Tests
- [ ] Món hiển thị đúng vào ngày được set
- [ ] Món ẩn vào ngày không được set
- [ ] Message "Không phục vụ hôm nay" hiển thị
- [ ] Badge hiển thị đúng các ngày

### Admin UI Tests
- [ ] Add Product - Weekly schedule section hiển thị
- [ ] Checkboxes toggle được
- [ ] Selected days có màu xanh
- [ ] Save thành công
- [ ] Edit Product - Load data đúng
- [ ] Preview summary hiển thị đúng

### Combination Tests
- [ ] Weekly + Daily Time
- [ ] Weekly + Date Range
- [ ] Weekly + Daily + Date Range (cả 3)

### Edge Cases
- [ ] Empty days array → món available mọi ngày
- [ ] enabled=false → món available mọi ngày
- [ ] Invalid day numbers → bị filter out
- [ ] Duplicate days → được deduplicate

### Issues Found
[List any bugs or issues]

### Notes
[Any additional observations]
```

---

## 🎯 MANUAL TEST SCRIPT

### Cách test nhanh không cần đợi đúng ngày:

**Option 1: Hardcode currentDay**
```javascript
// Trong Frontend/src/utils/timeUtils.js
// Line ~30 trong isFoodAvailable()

// Temporarily hardcode for testing
const currentDay = 6;  // Giả lập Thứ 7
// const currentDay = now.getDay();  // Comment out real one
```

**Option 2: Change system date**
- Windows: Settings → Time & Language → Date & Time
- Mac: System Preferences → Date & Time
- Linux: `sudo date --set="2026-01-18"` (Saturday)

---

## 📝 POSTMAN COLLECTION

Import file: `postman-weekly-schedule-examples.json`

**Includes:**
1. ✅ Weekend Buffet (Sat-Sun)
2. ✅ Weekday Office Lunch (Mon-Fri)
3. ✅ Pho Bo (Mon & Thu only)
4. ✅ Hotpot (Weekend Evening + Daily Time)
5. ✅ Complete Example (All 3 types)
6. ✅ Update Product
7. ✅ List All Foods

---

## ✅ FINAL CHECKLIST

- [ ] Backend API works (add/update)
- [ ] Database saves correctly
- [ ] Frontend filters correctly based on current day
- [ ] Admin UI - Add form works
- [ ] Admin UI - Edit form works
- [ ] Multilingual messages (VI/EN/SK)
- [ ] Combinations with Daily Time work
- [ ] Combinations with Date Range work
- [ ] Edge cases handled
- [ ] Documentation complete
- [ ] Postman examples work

---

**Ready to deploy! 🚀**
