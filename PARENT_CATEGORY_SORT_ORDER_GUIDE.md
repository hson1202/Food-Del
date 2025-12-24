# Hướng Dẫn Sắp Xếp Thứ Tự Parent Categories

## Tổng Quan
Giờ đây bạn có thể tự sắp xếp thứ tự hiển thị của các Parent Categories (🍣 Sushi, 🍹 Nước uống, 🍜 Món Sợi, v.v.) trên thanh menu của website.

## Cách Sử Dụng

### 1. Truy cập Admin Panel
- Đăng nhập vào Admin Panel
- Vào menu **Parent Category** ở sidebar

### 2. Xem Thứ Tự Hiện Tại
- Trong danh sách Parent Categories, bạn sẽ thấy **Sort Order** hiển thị cho mỗi category
- Số càng nhỏ sẽ hiển thị càng trước (bên trái)

### 3. Thêm Parent Category Mới
Khi thêm category mới, bạn sẽ thấy trường **Sort Order**:
- **Sort Order = 0**: Hiển thị đầu tiên (trái nhất)
- **Sort Order = 1**: Hiển thị thứ hai
- **Sort Order = 2**: Hiển thị thứ ba
- Và cứ thế...

**Ví dụ:**
- 🍣 Sushi → Sort Order = 0
- 🍹 Nước uống → Sort Order = 1
- 🍜 Món Sợi → Sort Order = 2
- 🍰 Tráng Miệng → Sort Order = 3
- 🥗 Món Ăn Kèm → Sort Order = 4

### 4. Chỉnh Sửa Thứ Tự
1. Click nút **Edit** trên category muốn thay đổi
2. Thay đổi số trong trường **Sort Order**
3. Click **Save**
4. Refresh trang Frontend để xem thay đổi

### 5. Mẹo Sắp Xếp

#### Cách 1: Sử dụng số cách nhau 10
```
Sushi → 10
Nước uống → 20
Món Sợi → 30
```
**Lợi ích:** Dễ dàng chèn category mới vào giữa (ví dụ: 15, 25)

#### Cách 2: Sử dụng số liên tiếp
```
Sushi → 0
Nước uống → 1
Món Sợi → 2
```
**Lợi ích:** Đơn giản, dễ hiểu

#### Cách 3: Sử dụng số cách nhau 100
```
Sushi → 100
Nước uống → 200
Món Sợi → 300
```
**Lợi ích:** Rất nhiều chỗ để chèn category mới

## Ví Dụ Thực Tế

### Tình huống 1: Đổi vị trí Sushi và Nước uống
**Hiện tại:**
- Sushi (Sort Order = 0)
- Nước uống (Sort Order = 1)

**Muốn:**
- Nước uống hiển thị trước Sushi

**Cách làm:**
1. Edit Nước uống → đổi Sort Order = 0
2. Edit Sushi → đổi Sort Order = 1

### Tình huống 2: Thêm category mới vào giữa
**Hiện tại:**
- Sushi (Sort Order = 10)
- Món Sợi (Sort Order = 20)

**Muốn:**
- Thêm "Nước uống" vào giữa Sushi và Món Sợi

**Cách làm:**
1. Thêm category mới "Nước uống"
2. Set Sort Order = 15

**Kết quả:**
- Sushi (10)
- Nước uống (15) ← mới
- Món Sợi (20)

### Tình huống 3: Sắp xếp lại toàn bộ
**Muốn thứ tự:**
1. Món Ăn Kèm
2. Tráng Miệng
3. Món Sợi
4. Nước uống
5. Sushi

**Cách làm:**
- Edit Món Ăn Kèm → Sort Order = 0
- Edit Tráng Miệng → Sort Order = 1
- Edit Món Sợi → Sort Order = 2
- Edit Nước uống → Sort Order = 3
- Edit Sushi → Sort Order = 4

## Lưu Ý Quan Trọng

1. **Số nhỏ hơn = hiển thị trước (bên trái)**
2. **Có thể dùng số âm** nếu muốn (ví dụ: -1 sẽ hiển thị trước 0)
3. **Không cần số liên tiếp** - có thể dùng 0, 5, 100, 200...
4. **Thay đổi có hiệu lực ngay lập tức** - chỉ cần refresh trang Frontend
5. **Không ảnh hưởng đến dữ liệu** - chỉ thay đổi thứ tự hiển thị

## Thay Đổi Kỹ Thuật

### Backend
- Model `parentCategory` đã có sẵn field `sortOrder`
- API đã sort theo `sortOrder` (số nhỏ → lớn)

### Admin Panel
- ✅ Thêm input field "Sort Order" trong form Add
- ✅ Thêm input field "Sort Order" trong form Edit
- ✅ Hiển thị Sort Order trong danh sách categories

### Frontend
- ✅ Sử dụng thứ tự từ Backend (không sort lại theo createdAt)
- ✅ Hiển thị categories theo đúng Sort Order

## Hỗ Trợ
Nếu có vấn đề gì, hãy liên hệ với developer để được hỗ trợ.

---
**Cập nhật:** 24/12/2025
**Phiên bản:** 1.0

