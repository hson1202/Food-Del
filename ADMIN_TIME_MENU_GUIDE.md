# 🕐 HƯỚNG DẪN ADMIN - MENU THEO THỜI GIAN

## 📍 VỊ TRÍ CHỈNH SỬA

Bạn có thể set thời gian cho món ăn tại **2 nơi** trong Admin panel:

### **1. Trang Add New Product** (/products)
- Click nút **"Add New Product"** 
- Scroll xuống phần **"🕐 Time-Based Availability"**

### **2. Edit Product Popup**
- Click nút **"Edit"** trên bất kỳ món ăn nào
- Trong popup, scroll xuống phần **"🕐 Time-Based Availability"**

---

## 🎯 CÁC TÙYCHỌN THỜI GIAN

### **Option 1: Khung giờ hàng ngày** ⏰

**Sử dụng khi:**
- Món chỉ phục vụ trong khung giờ cố định mỗi ngày
- Ví dụ: Breakfast (7h-10h), Lunch (11h-14h30), Dinner (17h-21h)

**Cách set:**

1. ✅ Tick vào: **"Enable Daily Time Availability"**
2. Chọn **Available From (Daily)**: `11:00` (Ví dụ)
3. Chọn **Available Until (Daily)**: `14:30` (Ví dụ)

```
┌─────────────────────────────────────┐
│ ☑ Enable Daily Time Availability   │
│                                     │
│ Available From (Daily): [11:00]    │
│ Available Until (Daily): [14:30]   │
└─────────────────────────────────────┘

Món này sẽ hiển thị MỖI NGÀY từ 11:00 đến 14:30
```

---

### **Option 2: Ngày giờ cụ thể** 📅

**Sử dụng khi:**
- Món chỉ có trong event đặc biệt
- Menu theo mùa, promotion có thời hạn
- Ví dụ: Menu Tết, Valentine Special, Weekend Buffet

**Cách set:**

1. Chọn **Available From Date**: `15/01/2026 10:00`
2. Chọn **Available Until Date**: `15/01/2026 22:00`

```
┌─────────────────────────────────────────┐
│ Date Range Availability (Optional)     │
│                                         │
│ Available From Date:                    │
│ [15/01/2026 10:00]                     │
│                                         │
│ Available Until Date:                   │
│ [15/01/2026 22:00]                     │
└─────────────────────────────────────────┘

Món này CHỈ hiển thị từ 15/01 10h đến 15/01 22h
```

---

### **Option 3: Kết hợp cả 2** 🎯

**Ví dụ:** Lẩu hải sản chỉ có cuối tuần, buổi tối

```
┌─────────────────────────────────────────┐
│ ☑ Enable Daily Time Availability       │
│ Available From: [17:00]                 │
│ Available Until: [21:00]                │
│                                         │
│ Available From Date: [11/01/2026]      │
│ Available Until Date: [12/01/2026]     │
└─────────────────────────────────────────┘

→ Chỉ có ngày 11-12/01 (cuối tuần)
→ Và chỉ từ 17h-21h (buổi tối)
```

---

## 📝 VÍ DỤ THỰC TẾ

### **Ví dụ 1: Cơm trưa hàng ngày**

```
Product Name: Cơm trưa combo
Category: Menu Ngày
Price: €85

Time Settings:
☑ Enable Daily Time Availability
  - From: 11:00
  - Until: 14:30
```

**Kết quả:**
- Khách thấy món từ 11:00-14:30 mỗi ngày
- Ngoài giờ: Hiển thị "Hết giờ" + không thể đặt

---

### **Ví dụ 2: Menu Tết (1-15/2)**

```
Product Name: Menu Tết Nguyên Đán
Category: Menu Ngày
Price: €250

Time Settings:
Available From Date: 01/02/2026 00:00
Available Until Date: 15/02/2026 23:59
```

**Kết quả:**
- Chỉ hiển thị từ 1/2 đến 15/2
- Sau 15/2: Món tự động biến mất

---

### **Ví dụ 3: Happy Hour**

```
Product Name: Happy Hour Drinks
Category: Menu Ngày
Price: €25 (Promotion: €50 → €25)

Time Settings:
☑ Enable Daily Time Availability
  - From: 15:00
  - Until: 17:00
```

**Kết quả:**
- Mỗi ngày 15h-17h có giảm giá
- Tự động ẩn ngoài khung giờ

---

### **Ví dụ 4: Buffet cuối tuần**

```
Product Name: Weekend Buffet
Category: Menu Ngày
Price: €199

Time Settings:
Available From Date: 11/01/2026 10:00 (Thứ 7)
Available Until Date: 12/01/2026 22:00 (CN)
```

**Kết quả:**
- Chỉ có thứ 7-CN
- Tự động ẩn vào thứ 2

---

## 🎨 HIỂN THỊ TRÊN TRANG WEB

### **Khi món đang có:**
```
┌────────────────────┐
│  [Hình món ăn]    │
│  ⏰ 11:00-14:30   │ ← Badge xanh
├────────────────────┤
│  Cơm trưa combo   │
│  €85              │
│  [Add to Cart]    │
└────────────────────┘
```

### **Khi món hết giờ:**
```
┌────────────────────┐
│  [Hình - tối]     │
│  🚫 HẾT GIỜ       │ ← Overlay đỏ
│  ⏰ 11:00-14:30   │
├────────────────────┤
│  Cơm trưa combo   │
│  €85 (Không đặt)  │
└────────────────────┘
```

---

## ✅ CHECKLIST KHI ADD MÓN MỚI

- [ ] Điền đầy đủ: SKU, Name, Price, Category, Quantity
- [ ] Upload hình ảnh món ăn
- [ ] **Nếu món có khung giờ cố định:**
  - [ ] Tick "Enable Daily Time Availability"
  - [ ] Set From time (Ví dụ: 11:00)
  - [ ] Set Until time (Ví dụ: 14:30)
- [ ] **Nếu món chỉ có trong event:**
  - [ ] Set Available From Date
  - [ ] Set Available Until Date
- [ ] Xem **Availability Summary** để check lại
- [ ] Click **Add** / **Save**

---

## 💡 TIPS & TRICKS

### **1. Test thời gian hiện tại**

Để test nhanh, set thời gian quanh giờ hiện tại:

```
Bây giờ: 13:30

Set:
From: 13:00
Until: 14:00

→ Món sẽ hiện ngay!
```

### **2. Format thời gian đúng**

- **Daily time:** Browser sẽ hiển thị time picker (24h)
  - ✅ Chọn: 11:00, 14:30, 21:00
  - ❌ Không cần gõ text

- **Date time:** Browser sẽ hiển thị datetime picker
  - ✅ Chọn ngày và giờ từ calendar
  - ❌ Không cần gõ text

### **3. Món luôn available**

Nếu muốn món **luôn hiển thị** (không giới hạn thời gian):
- ❌ **KHÔNG** tick "Enable Daily Time Availability"  
- ❌ **KHÔNG** set Available From/Until Date
- Để trống tất cả time fields

### **4. Xem tóm tắt trước khi save**

Luôn check box **"⏰ Availability Summary"** phía dưới để xác nhận:

```
┌───────────────────────────────────┐
│ ⏰ Availability Summary:         │
│ • Daily: 11:00 - 14:30           │
│ • From: 15/01/2026 10:00         │
│ • Until: 15/01/2026 22:00        │
└───────────────────────────────────┘
```

---

## 🔧 TROUBLESHOOTING

### **❌ Món không hiện trên web**

**Kiểm tra:**
1. ✅ Status = "Active" ?
2. ✅ Quantity > 0 ?
3. ✅ Thời gian hiện tại có trong khung giờ set không?
4. ✅ Refresh trang web (F5)

### **❌ Badge thời gian không hiện**

- Đảm bảo đã set ít nhất 1 trong 2:
  - Daily Time Availability
  - Date Range

### **❌ Món vẫn hiện ngoài giờ**

- Check lại:
  - Daily time có enable không?
  - Time có đúng không? (11:00 vs 11:00 PM)
  - Browser có đúng timezone không?

---

## 📊 QUẢN LÝ MENU NGÀY

### **Best Practices:**

1. **Tạo category riêng:**
   - Tên: "Menu Ngày" hoặc "Daily Specials"
   - Add tất cả món time-based vào category này

2. **Đặt tên rõ ràng:**
   ```
   ✅ "Cơm trưa combo" (rõ là lunch)
   ✅ "Phở sáng" (rõ là breakfast)
   ❌ "Menu 1" (không rõ ràng)
   ```

3. **Set quantity hợp lý:**
   - Món limited: Quantity = 20-50
   - Món popular: Quantity = 100+
   - Monitor và adjust theo nhu cầu

4. **Sử dụng Promotion:**
   - Combine với time để tạo flash sale
   - Ví dụ: Happy Hour với promotion price

---

## 🚀 WORKFLOW ĐỀ XUẤT

### **Hàng ngày:**

1. **Sáng (8:00):**
   - Check quantity các món lunch
   - Update nếu cần

2. **Trưa (14:00):**
   - Check sold count lunch
   - Prepare món dinner

3. **Tối (21:00):**
   - Review sales
   - Plan menu ngày mai

### **Hàng tuần:**

1. **Thứ 2:**
   - Plan special menu cuối tuần
   - Set date range cho weekend

2. **Thứ 6:**
   - Double check weekend menu
   - Verify time settings

### **Hàng tháng:**

1. **Đầu tháng:**
   - Plan seasonal menu
   - Set date range cho cả tháng

2. **Cuối tháng:**
   - Review performance
   - Adjust prices & times

---

## 📞 SUPPORT

**Nếu cần hỗ trợ:**

1. Check file: `TIME_BASED_MENU_GUIDE.md`
2. Check Admin console (F12) xem có lỗi không
3. Liên hệ developer

---

## ✨ TÓM TẮT NHANH

| Loại Menu | Checkbox Daily | Daily Time | Date Range |
|-----------|----------------|------------|------------|
| **Lunch hàng ngày** | ✅ | 11:00-14:30 | ❌ |
| **Menu Tết** | ❌ | ❌ | 01/02-15/02 |
| **Weekend Buffet** | ❌ | ❌ | Thứ 7-CN |
| **Happy Hour** | ✅ | 15:00-17:00 | ❌ |
| **Combo + Event** | ✅ | 17:00-21:00 | 11/01-12/01 |

---

**Chúc bạn quản lý menu thành công! 🎉**

