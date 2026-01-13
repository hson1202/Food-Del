# 🕐 HƯỚNG DẪN SỬ DỤNG TIME-BASED MENU

## 🎯 Vấn Đề Đã Giải Quyết

**Trước đây:**
- ❌ Menu time-based chưa có UI riêng
- ❌ Chưa được dịch đa ngôn ngữ
- ❌ Không biết đặt ở đâu trong menu (menu đã quá nhiều)
- ❌ Khó quản lý và hiển thị

**Bây giờ:**
- ✅ Có **component riêng** hiển thị đẹp mắt
- ✅ **Đa ngôn ngữ** (Tiếng Việt, English, Slovenčina)
- ✅ **Tự động phân loại** theo khung giờ (Sáng/Trưa/Tối/Đặc biệt)
- ✅ **Tự động cập nhật** theo thời gian thực
- ✅ **Responsive** trên mọi thiết bị

---

## 📦 Component Mới: TodaySpecialMenu

### Vị Trí Hiển Thị

Component được đặt ngay sau **ExploreMenu** và trước **FoodDisplay** trên trang Home:

```
┌─────────────────────────────────┐
│ Header (Banner)                 │
├─────────────────────────────────┤
│ ExploreMenu (Categories)        │
├─────────────────────────────────┤
│ 🕐 TodaySpecialMenu ← NEW!      │ ← Đây!
├─────────────────────────────────┤
│ FoodDisplay (All Foods)         │
└─────────────────────────────────┘
```

### Cách Hoạt Động

1. **Tự động filter** các món có time-based availability
2. **Kiểm tra** xem món có đang available không (theo giờ hiện tại)
3. **Phân loại** món vào 4 nhóm:
   - 🌅 **Bữa Sáng** (06:00 - 11:00)
   - 🍱 **Bữa Trưa** (11:00 - 15:00)
   - 🌙 **Bữa Tối** (17:00 - 22:00)
   - ⭐ **Đặc Biệt** (khung giờ khác hoặc date-based)
4. **Hiển thị** trong layout đẹp với header gradient
5. **Tự động refresh** mỗi phút

### Nếu Không Có Món Time-Based

Component sẽ **tự động ẩn** hoàn toàn → không chiếm chỗ, không ảnh hưởng layout!

---

## 🚀 CÁCH SỬ DỤNG

### Bước 1: Thêm Món Có Time-Based Availability

Dùng Postman để thêm món với khung giờ:

#### **Ví Dụ 1: Phở Sáng (07:00 - 10:00)**

```json
POST http://localhost:4000/api/food/add

{
  "sku": "BF-001",
  "name": "Phở bò sáng",
  "nameVI": "Phở bò sáng",
  "nameEN": "Morning Beef Pho",
  "nameSK": "Ranné hovädzie Pho",
  "description": "Phở bò truyền thống",
  "price": 65,
  "category": "Menu Sáng",
  "quantity": 50,
  "status": "active",
  
  // ⏰ Khung giờ
  "dailyAvailabilityEnabled": true,
  "dailyTimeFrom": "07:00",
  "dailyTimeTo": "10:00"
}
```

**Kết quả:** Món này sẽ tự động hiển thị trong section **🌅 Bữa Sáng** từ 7h-10h mỗi ngày.

#### **Ví Dụ 2: Cơm Trưa (11:00 - 14:30)**

```json
{
  "sku": "LC-001",
  "name": "Cơm tấm trưa",
  "price": 75,
  "category": "Menu Trưa",
  "quantity": 80,
  
  // ⏰ Khung giờ
  "dailyAvailabilityEnabled": true,
  "dailyTimeFrom": "11:00",
  "dailyTimeTo": "14:30"
}
```

**Kết quả:** Món này sẽ hiển thị trong section **🍱 Bữa Trưa** từ 11h-14h30 mỗi ngày.

#### **Ví Dụ 3: Set Lẩu Tối (17:00 - 21:00)**

```json
{
  "sku": "DN-001",
  "name": "Set lẩu hải sản",
  "price": 350,
  "category": "Menu Tối",
  "quantity": 20,
  
  // ⏰ Khung giờ
  "dailyAvailabilityEnabled": true,
  "dailyTimeFrom": "17:00",
  "dailyTimeTo": "21:00"
}
```

**Kết quả:** Món này sẽ hiển thị trong section **🌙 Bữa Tối** từ 17h-21h mỗi ngày.

#### **Ví Dụ 4: Menu Cuối Tuần (Date-based)**

```json
{
  "sku": "WE-001",
  "name": "Buffet cuối tuần",
  "price": 199,
  "category": "Menu Đặc Biệt",
  "quantity": 50,
  
  // 📅 Ngày cụ thể
  "availableFrom": "2026-01-18T10:00:00.000Z",  // Thứ 7
  "availableTo": "2026-01-19T22:00:00.000Z"     // Chủ Nhật
}
```

**Kết quả:** Món này sẽ hiển thị trong section **⭐ Đặc Biệt** vào cuối tuần cụ thể.

### Bước 2: Test Trên Frontend

1. Mở trang chủ: `http://localhost:5173`
2. Scroll xuống sau phần **Explore Menu**
3. Bạn sẽ thấy section **"🕐 Menu Hôm Nay"** (nếu có món time-based)

### Bước 3: Kiểm Tra Multilingual

- Click nút đổi ngôn ngữ (VI / EN / SK)
- Tất cả text sẽ tự động đổi ngôn ngữ
- Tên món cũng đổi theo (nếu đã set `nameVI`, `nameEN`, `nameSK`)

---

## 🎨 GIao Diện

### Desktop View

```
┌─────────────────────────────────────────────────────────────┐
│  🕐 Menu Hôm Nay                         🕐 14:30           │
│  Món ăn có sẵn theo khung giờ                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🌅 Bữa Sáng                                     3 món      │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌────────┐  ┌────────┐  ┌────────┐                       │
│  │ Phở bò │  │ Bánh mì│  │ Cháo   │                       │
│  │ €6.50  │  │ €3.50  │  │ €4.00  │                       │
│  │⏰ 7-10h│  │⏰ 7-10h│  │⏰ 7-10h│                       │
│  └────────┘  └────────┘  └────────┘                       │
│                                                             │
│  🍱 Bữa Trưa                                     5 món      │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌──────┐│
│  │ Cơm tấm│  │ Bún bò │  │ Mì xào │  │ Lẩu    │  │ Gỏi  ││
│  │ €7.50  │  │ €8.00  │  │ €7.00  │  │ €35.00 │  │ €6.00││
│  └────────┘  └────────┘  └────────┘  └────────┘  └──────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Mobile View

```
┌──────────────────────────┐
│ 🕐 Menu Hôm Nay         │
│ Món ăn có sẵn theo khung│
│                   🕐14:30│
├──────────────────────────┤
│                          │
│ 🌅 Bữa Sáng              │
│             3 món        │
│ ──────────────────────── │
│                          │
│ ┌──────────────────────┐ │
│ │ Phở bò               │ │
│ │ €6.50  ⏰ 7h-10h    │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │ Bánh mì              │ │
│ │ €3.50  ⏰ 7h-10h    │ │
│ └──────────────────────┘ │
│                          │
└──────────────────────────┘
```

---

## ⚙️ TÙY CHỈNH

### 1. Thay Đổi Khung Giờ Phân Loại

File: `Frontend/src/components/TodaySpecialMenu/TodaySpecialMenu.jsx`

Tìm function `categorizeByTimePeriod()`:

```javascript
// Dòng ~88
const categorizeByTimePeriod = () => {
  const categories = {
    breakfast: [], // 6:00 - 11:00  ← Thay đổi ở đây
    lunch: [],     // 11:00 - 15:00 ← 
    dinner: [],    // 17:00 - 22:00 ← 
    special: []    // Other
  }
  
  // Logic phân loại (dòng ~98)
  if (hours >= 6 && hours < 11) {        // Breakfast
    categories.breakfast.push(item)
  } else if (hours >= 11 && hours < 15) { // Lunch - Thay 15 thành 16 để kéo dài đến 16h
    categories.lunch.push(item)
  } else if (hours >= 17 && hours < 22) { // Dinner
    categories.dinner.push(item)
  }
}
```

### 2. Thay Đổi Tốc Độ Auto-Refresh

```javascript
// Dòng ~56
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTime(new Date())
  }, 60000) // ← Thay 60000 (60 giây) thành 30000 (30 giây)
  
  return () => clearInterval(interval)
}, [])
```

### 3. Thêm Category Mới (Ví dụ: Afternoon Tea)

**Bước 1:** Thêm translation (dòng ~15)

```javascript
const translations = {
  vi: {
    title: '🕐 Menu Hôm Nay',
    subtitle: 'Món ăn có sẵn theo khung giờ',
    breakfast: '🌅 Bữa Sáng',
    lunch: '🍱 Bữa Trưa',
    afternoon: '☕ Trà Chiều', // ← NEW
    dinner: '🌙 Bữa Tối',
    special: '⭐ Đặc Biệt',
  },
  en: {
    // ... tương tự
    afternoon: '☕ Afternoon Tea', // ← NEW
  },
  sk: {
    // ... tương tự
    afternoon: '☕ Popoludňajší čaj', // ← NEW
  }
}
```

**Bước 2:** Thêm vào categories (dòng ~89)

```javascript
const categories = {
  breakfast: [],
  lunch: [],
  afternoon: [], // ← NEW
  dinner: [],
  special: []
}
```

**Bước 3:** Thêm logic (dòng ~98)

```javascript
if (hours >= 15 && hours < 17) {
  categories.afternoon.push(item) // ← NEW
}
```

**Bước 4:** Render (dòng ~178)

```javascript
{renderCategory('breakfast', categorizedItems.breakfast)}
{renderCategory('lunch', categorizedItems.lunch)}
{renderCategory('afternoon', categorizedItems.afternoon)} {/* ← NEW */}
{renderCategory('dinner', categorizedItems.dinner)}
{renderCategory('special', categorizedItems.special)}
```

### 4. Thay Đổi Màu Sắc

File: `Frontend/src/components/TodaySpecialMenu/TodaySpecialMenu.css`

```css
/* Header gradient (dòng ~13) */
.today-menu-header {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  /* Thay thành: */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Category badge color (dòng ~59) */
.category-count {
  background: #ff6b35;
  /* Thay thành: */
  background: #667eea;
}

/* Border color (dòng ~52) */
.category-header {
  border-bottom: 3px solid #ff6b35;
  /* Thay thành: */
  border-bottom: 3px solid #667eea;
}
```

---

## 🔧 TROUBLESHOOTING

### ❓ Component không hiển thị?

**Nguyên nhân:** Không có món nào có time-based availability hoặc tất cả món đều hết giờ.

**Giải pháp:**
1. Kiểm tra database xem có món nào có `dailyAvailability.enabled = true` hoặc `availableFrom/availableTo` không
2. Kiểm tra giờ hiện tại có nằm trong khung giờ phục vụ không
3. Check console: `F12` → Console tab → xem có lỗi không

### ❓ Món không hiển thị đúng category?

**Nguyên nhân:** Logic phân loại dựa vào `dailyTimeFrom`.

**Giải pháp:**
- Nếu món có `dailyTimeFrom = "07:00"` → Bữa Sáng
- Nếu món có `dailyTimeFrom = "11:30"` → Bữa Trưa
- Nếu món có `dailyTimeFrom = "18:00"` → Bữa Tối
- Nếu món chỉ có `availableFrom/To` (date-based) → Đặc Biệt

### ❓ Thời gian không tự động cập nhật?

**Nguyên nhân:** Interval không chạy hoặc component unmount.

**Giải pháp:**
1. Mở Console: `F12` → Console
2. Xem có error không
3. Check component có bị unmount không (khi navigate away)

### ❓ Dịch không hoạt động?

**Nguyên nhân:** Thiếu `nameVI`, `nameEN`, `nameSK` trong database.

**Giải pháp:**
Update món trong database:

```json
PUT http://localhost:4000/api/food/update/:id

{
  "nameVI": "Phở bò sáng",
  "nameEN": "Morning Beef Pho",
  "nameSK": "Ranné hovädzie Pho"
}
```

---

## 📊 THỐNG KÊ

### Files Được Tạo/Sửa

| File | Trạng Thái | Mô Tả |
|------|-----------|-------|
| `Frontend/src/components/TodaySpecialMenu/TodaySpecialMenu.jsx` | ✅ **NEW** | Main component |
| `Frontend/src/components/TodaySpecialMenu/TodaySpecialMenu.css` | ✅ **NEW** | Styles |
| `Frontend/src/components/TodaySpecialMenu/README.md` | ✅ **NEW** | Documentation (English) |
| `Frontend/src/pages/Home/Home.jsx` | ✅ **UPDATED** | Added TodaySpecialMenu |
| `TIME_BASED_MENU_GUIDE.md` | ✅ **UPDATED** | Added frontend section |
| `HUONG_DAN_TIME_BASED_MENU.md` | ✅ **NEW** | This file (Vietnamese guide) |

### Tính Năng Hoàn Thành

- ✅ Component riêng cho time-based menu
- ✅ Tự động filter theo thời gian
- ✅ Phân loại thông minh (Sáng/Trưa/Tối/Đặc biệt)
- ✅ Multilingual support (VI/EN/SK)
- ✅ Auto-refresh mỗi phút
- ✅ Responsive design (Desktop/Tablet/Mobile)
- ✅ Loading và empty states
- ✅ Real-time clock display
- ✅ Beautiful gradient header với animation
- ✅ Integration với FoodItem component
- ✅ Product detail popup support

---

## 🎉 KẾT LUẬN

### Trước Khi Có Component Này:
- ❌ Menu time-based không có chỗ hiển thị riêng
- ❌ Trộn lẫn với menu thường, khó phân biệt
- ❌ Không có multilingual
- ❌ Phải tự filter và categorize

### Sau Khi Có Component Này:
- ✅ **Riêng biệt**, nổi bật, dễ tìm
- ✅ **Tự động** filter, categorize, refresh
- ✅ **Đa ngôn ngữ** đầy đủ
- ✅ **UI/UX đẹp**, professional
- ✅ **Không ảnh hưởng** layout nếu không có món

### Lợi Ích:
1. **Cho khách hàng:** Dễ dàng tìm món theo khung giờ
2. **Cho admin:** Không cần quản lý UI, chỉ cần add món với time settings
3. **Cho developer:** Code clean, dễ maintain, dễ customize
4. **Cho business:** Tăng conversion rate, UX tốt hơn

---

## 💡 GỢI Ý SỬ DỤNG

### 1. Menu Sáng (Breakfast)
```
Thời gian: 07:00 - 10:00
Món: Phở, Bánh mì, Cháo, Xôi, Chả giò, Cà phê
```

### 2. Menu Trưa (Lunch)
```
Thời gian: 11:00 - 14:30
Món: Cơm tấm, Bún bò, Mì xào, Lẩu, Gỏi, Nem
```

### 3. Menu Tối (Dinner)
```
Thời gian: 17:00 - 21:00
Món: Set lẩu, Nướng, Hải sản, Hotpot, BBQ
```

### 4. Menu Đặc Biệt (Special)
```
- Happy Hour: 15:00 - 17:00
- Late Night: 22:00 - 01:00
- Weekend Special: Thứ 7, Chủ Nhật
- Holiday Menu: Tết, Giáng sinh, v.v.
```

---

## 🚀 NEXT STEPS

Bây giờ bạn có thể:

1. ✅ **Test với món thật** - Thêm vài món có time-based availability
2. ✅ **Tùy chỉnh UI** - Đổi màu sắc, font, layout theo brand
3. ✅ **Thêm category mới** - Nếu cần (như Afternoon Tea)
4. ✅ **Monitor performance** - Xem có cần optimize không
5. ✅ **Gather feedback** - Hỏi ý kiến người dùng

---

**Chúc bạn thành công! 🎉**

Nếu có vấn đề gì, check:
1. Console logs (F12 → Console)
2. Network tab (F12 → Network)
3. Database (MongoDB)
4. Backend logs

Hoặc tham khảo:
- `Frontend/src/components/TodaySpecialMenu/README.md` (English docs)
- `TIME_BASED_MENU_GUIDE.md` (Full guide)
