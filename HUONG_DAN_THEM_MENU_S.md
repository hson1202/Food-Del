# Hướng Dẫn Thêm Menu - Phần S (Sashimi, Soup, Beverages)

## 📋 Tổng Quan

Script này sẽ thêm **37 món ăn** vào database, bao gồm:
- **Bento** (B006-B015): 10 món
- **Nápoje** (Đồ uống) (N001-N015): 15 món
- **Predjedlá** (Khai vị) (P001-P005): 5 món
- **Polievky** (Súp) (PO001-PO007): 7 món

## 🚀 Cách Sử Dụng

### Bước 1: Lấy Admin Token

Đăng nhập admin để lấy token:

```powershell
$loginResponse = Invoke-RestMethod `
    -Uri "http://localhost:4000/api/admin/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body '{"email":"admin@gmail.com","password":"admin123"}'

$TOKEN = $loginResponse.token
Write-Host "Token: $TOKEN"
```

### Bước 2: Cập Nhật Token Trong Script

Mở file `add-menu-s-section.ps1` và thay thế dòng:
```powershell
$TOKEN = "YOUR_ADMIN_TOKEN_HERE"
```

Bằng:
```powershell
$TOKEN = "token_bạn_vừa_lấy_được"
```

### Bước 3: Chạy Script

```powershell
.\add-menu-s-section.ps1
```

## 📦 Chi Tiết Các Món

### 🍱 BENTO (B006-B015)
| SKU | Tên Slovak | Tên Tiếng Việt | Giá |
|-----|-----------|----------------|-----|
| B006 | Tori Bento | Bento Gà | 10.50€ |
| B007 | Kamo Bento | Bento Vịt | 10.90€ |
| B008 | Sake Bento | Bento Cá Hồi | 11.90€ |
| B009 | Gyuniku Bento | Bento Bò | 10.90€ |
| B010 | Tofu Bento | Bento Đậu Phụ | 9.50€ |
| B011 | Tori Soba Bento | Bento Gà Soba | 9.50€ |
| B012 | Nigiri Maki Bento | Bento Nigiri Maki | 11.90€ |
| B013 | Sashimi Bento | Bento Sashimi | 12.90€ |
| B014 | Vege Bento | Bento Chay | 8.90€ |
| B015 | Salmon Bento | Bento Cá Hồi Premium | 13.90€ |

### 🥤 NÁPOJE - Đơn giản (N001-N007, N011-N013)
| SKU | Tên | Giá |
|-----|-----|-----|
| N001 | Cola | 2.00€ |
| N002 | Cola Zero | 2.00€ |
| N003 | Fanta | 2.00€ |
| N004 | Sprite | 2.00€ |
| N005 | Monster | 2.20€ |
| N006 | Kinley | 2.00€ |
| N007 | Number 1 | 2.50€ |
| N011 | Minerálka neperlivá | 1.50€ |
| N012 | Minerálka jemne perlivá | 1.50€ |
| N013 | Minerálka perlivá | 1.50€ |

### 🥤 NÁPOJE - Có Options (N008-N010, N014-N015)
| SKU | Tên | Options | Giá |
|-----|-----|---------|-----|
| N008 | Foco | Lychee / Mango / Coconut | 2.50€ |
| N009 | Vinut | Lychee / Strawberry / Coconut | 2.50€ |
| N010 | Aloe Vera | Strawberry / Mango | 2.50€ |
| N014 | Fuzetea | Lemon / Strawberry / Peach | 2.00€ |
| N015 | Cappy | Orange / Strawberry / Apple / Multivitamin | 1.80€ |

### 🥟 PREDJEDLÁ (P001-P005)
| SKU | Tên Slovak | Tên Tiếng Việt | Options | Giá |
|-----|-----------|----------------|---------|-----|
| P001 | Gyoza 150g | Gyoza 150g | - | 5.80€ |
| P002 | Edamame Fazule | Đậu Edamame | - | 4.50€ |
| P003 | Nem Cuon | Nem Cuốn | Chicken / Shrimp / Vegetarian | 4.50-5.00€ |
| P004 | Nem Vyprážané | Nem Chiên | Pork / Vegetarian | 5.00€ |
| P005 | Tempura Krevety | Tôm Tempura | - | 6.50€ |

### 🍜 POLIEVKY (PO001-PO007)
| SKU | Tên Slovak | Tên Tiếng Việt | Options | Giá |
|-----|-----------|----------------|---------|-----|
| PO001 | Ostrokyslá Polievka | Súp Chua Cay | - | 1.50€ |
| PO002 | Lososová Polievka | Súp Cá Hồi | - | 2.50€ |
| PO003 | Hanojský Vývar | Phở Hà Nội | - | 1.50€ |
| PO004 | Miso Shiro | Súp Miso | - | 2.50€ |
| PO005 | Tom Kha Gai | Tom Kha Gà | Chicken / Shrimp / Tofu | 3.00-3.50€ |
| PO006 | Tom Yum | Tom Yum | Chicken / Shrimp / Tofu | 3.00-3.50€ |
| PO007 | Gyoza Soup | Súp Gyoza | - | 3.90€ |

## 🌐 Đa Ngôn Ngữ

Tất cả món ăn đều có đầy đủ 3 ngôn ngữ:
- **Slovak (SK)**: Ngôn ngữ gốc từ menu
- **Vietnamese (VI)**: Tiếng Việt
- **English (EN)**: Tiếng Anh

### Options cũng có đa ngôn ngữ:
- **Option Names**: Flavor / Hương vị / Príchuť
- **Choice Labels**: Lychee / Vải / Liči

## 📂 Files Tạo Ra

1. **add-menu-bento-continued.json** - Dữ liệu Bento
2. **add-menu-napoje.json** - Đồ uống đơn giản
3. **add-menu-napoje-with-options.json** - Đồ uống có options
4. **add-menu-predjedla.json** - Khai vị
5. **add-menu-polievky.json** - Súp
6. **add-menu-s-section.ps1** - Script PowerShell chính

## ✅ Kiểm Tra Sau Khi Chạy

Kiểm tra số lượng món trong mỗi category:

```powershell
# Kiểm tra Bento
$bento = Invoke-RestMethod -Uri "http://localhost:4000/api/food/list"
$bentoCount = ($bento.data | Where-Object { $_.category -eq "Bento" }).Count
Write-Host "Bento: $bentoCount món"

# Kiểm tra Nápoje
$napoje = ($bento.data | Where-Object { $_.category -eq "Napoje" }).Count
Write-Host "Nápoje: $napoje món"

# Kiểm tra Predjedlá
$predjedla = ($bento.data | Where-Object { $_.category -eq "Predjedla" }).Count
Write-Host "Predjedlá: $predjedla món"

# Kiểm tra Polievky
$polievky = ($bento.data | Where-Object { $_.category -eq "Polievky" }).Count
Write-Host "Polievky: $polievky món"
```

## 🔧 Xử Lý Lỗi

Nếu gặp lỗi "Category not found", kiểm tra categories có sẵn:

```powershell
$categories = Invoke-RestMethod -Uri "http://localhost:4000/api/category"
$categories.data | Select-Object name, _id
```

Cần có đủ các category sau:
- ✅ Bento
- ✅ Napoje
- ✅ Predjedla
- ✅ Polievky

## 📝 Ghi Chú

- **SKU Format**: 
  - Bento: B + số (B006-B015)
  - Nápoje: N + số (N001-N015)
  - Predjedlá: P + số (P001-P005)
  - Polievky: PO + số (PO001-PO007)

- **Options**: Tất cả options đều dùng `pricingMode: "override"`
- **Multilingual**: Đầy đủ nameVI, nameEN, nameSK cho tất cả món
- **Option Labels**: Đầy đủ labelVI, labelEN, labelSK cho tất cả choices

## 🎯 Tiếp Theo

Sau khi thêm xong phần này, tiếp tục với các trang menu còn lại!

