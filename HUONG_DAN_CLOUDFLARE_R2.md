# Hướng Dẫn Cloudflare R2 - Food Delivery Backend

## Tổng quan cho AI đọc

Project này là **Food Delivery App** (Node.js/Express + MongoDB), deploy trên **Railway**.

**Vấn đề**: Cloudinary tính phí bandwidth → bị dọa disable tài khoản.
**Giải pháp đã implement**: Chuyển toàn bộ image upload sang **Cloudflare R2** + nén ảnh bằng **sharp** (4MB → ~500KB WebP) + cache 1 năm để giảm reads.

### Trạng thái hiện tại (đã hoàn thành)

- [x] `Backend/config/r2.js` - S3Client config
- [x] `Backend/middleware/r2Upload.js` - custom multer storage + sharp + cache headers
- [x] Tất cả routes (food, category, parentCategory, blog, restaurantInfo, upload) đã dùng `r2Upload`
- [x] `Backend/.env` có đủ 5 biến R2 (local)
- [ ] Railway environment variables cần được thêm (xem Bước 7)

### Ảnh cũ trên Cloudinary
Vẫn hiển thị bình thường. Không cần migrate. Chỉ ảnh **upload mới** đi qua R2.

---

## Tại sao chuyển sang R2?

| | Cloudinary | Cloudflare R2 |
|---|---|---|
| Storage | 25GB free (bị dọa disable) | 10GB free |
| Bandwidth | Tính tiền (lý do bị dọa) | **$0 mãi mãi** |
| Sau free tier | Đắt | $0.015/GB storage |

---

## Bước 1: Tạo tài khoản Cloudflare

1. Truy cập [cloudflare.com](https://cloudflare.com) → **Sign Up** (miễn phí)
2. Xác nhận email

---

## Bước 2: Tạo R2 Bucket

1. Đăng nhập Cloudflare Dashboard
2. Menu trái → **R2 Object Storage**
3. Click **Create bucket**
4. Đặt tên bucket: `food-delivery`
5. Location: chọn **Automatic** hoặc gần server nhất
6. Click **Create bucket**

---

## Bước 3: Bật Public Access cho Bucket

Ảnh cần public để frontend hiển thị được.

1. Vào bucket `food-delivery` vừa tạo
2. Tab **Settings**
3. Mục **Public access** → click **Allow Access**
4. Xác nhận → click **Allow**
5. Cloudflare sẽ cấp cho bạn một URL dạng:
   ```
   https://pub-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.dev
   ```
6. **Copy URL này** → đây là `R2_PUBLIC_URL`

---

## Bước 4: Lấy Account ID

1. Cloudflare Dashboard → góc trên phải có dropdown tên account
2. Hoặc vào **R2 Object Storage** → URL trình duyệt có dạng:
   ```
   https://dash.cloudflare.com/ACCOUNT_ID/r2/
   ```
3. Copy `ACCOUNT_ID` → đây là `R2_ACCOUNT_ID`

---

## Bước 5: Tạo R2 API Token

1. Cloudflare Dashboard → **R2 Object Storage**
2. Góc trên phải → **Manage R2 API tokens**
3. Click **Create API token**
4. Cấu hình:
   - Token name: `food-delivery-backend`
   - Permissions: **Object Read & Write**
   - Specify bucket: chọn bucket `food-delivery`
   - TTL: **No expiry** (hoặc tùy ý)
5. Click **Create API Token**
6. Trang kết quả hiển thị:
   - **Access Key ID** → đây là `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → đây là `R2_SECRET_ACCESS_KEY`

> **Lưu ý:** Secret Access Key chỉ hiện 1 lần, copy ngay!

---

## Bước 6: Cập nhật file .env

Mở file `Backend/.env` và điền các giá trị vừa lấy:

```env
R2_ACCOUNT_ID=abc123def456...           # Account ID từ bước 4
R2_ACCESS_KEY_ID=abc123...              # Access Key ID từ bước 5
R2_SECRET_ACCESS_KEY=xyz789...          # Secret Access Key từ bước 5
R2_BUCKET_NAME=food-delivery            # Tên bucket đã tạo
R2_PUBLIC_URL=https://pub-xxxx.r2.dev  # Public URL từ bước 3
```

---

## Bước 7: Cập nhật Railway Environment Variables

Vì backend deploy trên Railway, cần thêm các biến này vào Railway:

1. Vào Railway Dashboard → project của bạn → service Backend
2. Tab **Variables**
3. Thêm 5 biến:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - `R2_PUBLIC_URL`
4. Click **Deploy** để apply

---

## Bước 8: Kiểm tra hoạt động

Sau khi deploy xong, thử upload 1 ảnh từ Admin panel:
- Vào **Admin → Quản lý món ăn → Thêm món mới**
- Upload ảnh
- Nếu URL ảnh có dạng `https://pub-xxxx.r2.dev/food-delivery/uploads/...` → thành công!

---

## Ảnh cũ trên Cloudinary

- Ảnh cũ **vẫn hiển thị bình thường** vì URL trong database vẫn trỏ đến Cloudinary
- Chỉ ảnh **upload mới** mới đi qua R2
- Không cần làm gì với ảnh cũ

---

## Thông tin kỹ thuật

### Ảnh được xử lý như thế nào?

Mỗi ảnh upload sẽ được tự động:
1. Resize về tối đa **1200x1200px** (giữ tỷ lệ, không phóng to)
2. Convert sang **WebP** với quality 80
3. Kết quả: ảnh 4MB → ~**400-700KB** (tiết kiệm 80-90%)

### Cấu trúc thư mục trong R2

```
food-delivery/
└── uploads/
    ├── image-1234567890-abc123.webp
    ├── image-1234567891-def456.webp
    └── ...
```

### Files đã thay đổi trong code

| File | Thay đổi |
|---|---|
| `Backend/config/r2.js` | Mới - config S3Client cho R2 |
| `Backend/middleware/r2Upload.js` | Mới - multer storage + sharp compress |
| `Backend/routes/uploadRoute.js` | Dùng r2Upload thay Cloudinary |
| `Backend/routes/foodRoute.js` | Dùng r2Upload |
| `Backend/routes/categoryRoute.js` | Dùng r2Upload |
| `Backend/routes/parentCategoryRoute.js` | Dùng r2Upload |
| `Backend/routes/blogRoute.js` | Dùng r2Upload |
| `Backend/routes/restaurantInfoRoutes.js` | Dùng r2Upload |

---

## Caching - Giảm chi phí R2 reads

### Tại sao cần cache?

Mỗi lần browser load ảnh = 1 **Class B operation** (read từ R2).
Free tier: 10 triệu reads/tháng. Nếu không cache, site nhiều người dùng sẽ hết nhanh.

### Cache đã được cài sẵn trong code

File `Backend/middleware/r2Upload.js` đã set header khi upload:

```javascript
CacheControl: "public, max-age=31536000, immutable"
```

Nghĩa là:
- **Browser cache**: ảnh được lưu local 1 năm → load lại trang không tốn read R2
- **Cloudflare CDN cache**: tự động cache tại edge server gần người dùng → request không chạm R2
- **immutable**: báo browser ảnh không thay đổi → không bao giờ revalidate

### Kết quả thực tế

| Tình huống | Không cache | Có cache |
|---|---|---|
| 1000 user xem menu (50 ảnh) | 50,000 reads/ngày | ~50 reads/ngày (lần đầu) |
| 1 tháng | ~1.5M reads | ~1,500 reads |

### Lưu ý khi cập nhật ảnh

Vì cache `immutable`, khi **thay ảnh mới** cho 1 món ăn → URL sẽ khác hoàn toàn (do tên file có timestamp) → browser/CDN tự load ảnh mới. Không cần làm gì thêm.

---

## Xử lý sự cố

### Lỗi "R2_ACCOUNT_ID is not set"
→ Kiểm tra lại file `.env` và Railway Variables

### Lỗi "Access Denied" khi upload
→ Kiểm tra lại API Token có quyền **Object Read & Write** cho đúng bucket

### Ảnh không hiển thị sau khi upload
→ Kiểm tra lại bucket đã bật **Public Access** chưa (Bước 3)

### Upload thành công nhưng URL sai
→ Kiểm tra lại `R2_PUBLIC_URL` - phải đúng URL từ phần Public Access, không có dấu `/` ở cuối
