# 📧 Hướng dẫn Cấu hình và Test Email Service

## ✅ WHAT'S BEEN FIXED

### Vấn đề trước đây:
- ❌ Chỉ gửi email cho khách hàng khi có order mới
- ❌ Admin KHÔNG nhận được email thông báo
- ❌ Không biết có order mới nếu không mở admin panel

### Vấn đề đã được sửa:
- ✅ Tạo function `sendAdminOrderNotification()` để gửi email cho admin
- ✅ Tự động gửi email cho cả khách hàng VÀ admin khi có order mới
- ✅ Email admin có thiết kế rõ ràng với:
  - 🚨 Alert nổi bật về order mới
  - 👤 Thông tin khách hàng đầy đủ
  - 🍽️ Chi tiết món ăn và số lượng
  - 📍 Địa chỉ giao hàng
  - 💰 Tổng tiền thanh toán

## 🔧 CÁCH CÀI ĐẶT EMAIL SERVICE

### Bước 1: Tạo Gmail App Password

1. Truy cập [Google Account Security](https://myaccount.google.com/security)
2. Bật **2-Step Verification** (bắt buộc)
3. Vào **App passwords** → Chọn **Mail** và **Other (Custom name)**
4. Đặt tên: `VIET BOWLS Backend`
5. Click **Generate** → Copy mật khẩu 16 ký tự (dạng: xxxx xxxx xxxx xxxx)

### Bước 2: Tạo file `.env` trong thư mục Backend

```bash
cd Backend
touch .env
```

### Bước 3: Thêm cấu hình vào file `.env`

```env
# Database
MONGODB_URI=mongodb://localhost:27017/food-delivery
JWT_SECRET=your-secret-key

# Server
PORT=4000

# 📧 EMAIL CONFIGURATION (QUAN TRỌNG!)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
ADMIN_EMAIL=admin@vietbowls.com

# Cloudinary (nếu có)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Lưu ý:**
- `EMAIL_USER`: Email Gmail của bạn (VD: vietbowlssala666@gmail.com)
- `EMAIL_PASSWORD`: App Password 16 ký tự (KHÔNG PHẢI password thường!)
- `ADMIN_EMAIL`: Email admin sẽ nhận thông báo (có thể giống EMAIL_USER)

### Bước 4: Restart Backend Server

```bash
cd Backend
npm run dev
```

Khi email service hoạt động, bạn sẽ thấy:
```
✅ Email transporter configured via service: gmail
```

Nếu chưa cấu hình, sẽ thấy:
```
⚠️ Email configuration not found. Emails will not be sent.
```

## 🧪 CÁCH TEST EMAIL

### Test 1: Đặt hàng (Order)

1. Mở Frontend/Admin/User app
2. Thêm món ăn vào giỏ hàng
3. Điền thông tin:
   - Name: Nguyễn Văn A
   - Email: customer@example.com (EMAIL THẬT để nhận email)
   - Phone: 0123456789
   - Address: Đầy đủ
4. Click **Place Order**

**Kết quả mong đợi:**

#### Console Backend sẽ hiển thị:
```
✅ Order created successfully with ID: ...
✅ Order confirmation email sent successfully (background)
✅ Admin order notification email sent successfully (background)
```

#### Email cho KHÁCH HÀNG (customer@example.com):
- Subject: `Order Confirmation #[TRACKING_CODE] - VIET BOWLS`
- Nội dung:
  - ✅ Tracking code để theo dõi
  - ✅ Chi tiết món ăn
  - ✅ Tổng tiền
  - ✅ Địa chỉ giao hàng
  - ✅ Thông tin liên hệ

#### Email cho ADMIN (ADMIN_EMAIL):
- Subject: `🚨 New Order #[TRACKING_CODE] - [Customer Name] - VIET BOWLS`
- Nội dung:
  - 🚨 Alert nổi bật "ACTION REQUIRED"
  - 👤 Thông tin khách hàng đầy đủ
  - 🍽️ Chi tiết món ăn
  - 📍 Địa chỉ giao hàng
  - 💰 Tổng tiền
  - ⏰ Thời gian giao hàng ước tính

### Test 2: Đặt bàn (Reservation)

1. Truy cập Reservation form
2. Điền thông tin và email
3. Submit

**Kết quả:** Email xác nhận gửi cho khách

### Test 3: Contact Form

1. Truy cập Contact form
2. Điền thông tin và email
3. Submit

**Kết quả:** 
- Email xác nhận gửi cho khách
- Email thông báo gửi cho admin

## 🐛 TROUBLESHOOTING

### Lỗi 1: "Email not sent: Email service not configured"

**Nguyên nhân:** Chưa có file `.env` hoặc thiếu EMAIL_USER/EMAIL_PASSWORD

**Giải pháp:**
```bash
cd Backend
ls -la | grep .env  # Kiểm tra có file .env không
cat .env  # Kiểm tra nội dung (nếu có)
```

Đảm bảo có đầy đủ:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@example.com
```

### Lỗi 2: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Nguyên nhân:** 
- Sử dụng password thường thay vì App Password
- Chưa bật 2-Step Verification

**Giải pháp:**
1. Bật 2-Step Verification ở Google Account
2. Tạo App Password mới
3. Copy chính xác 16 ký tự (bỏ khoảng trắng nếu cần)
4. Restart server

### Lỗi 3: Email gửi cho khách nhưng không gửi cho admin

**Nguyên nhân:** Lỗi code (đã được sửa!)

**Giải pháp:** 
- Đảm bảo đã cập nhật code mới nhất
- Check console log có thấy "Admin order notification email sent" không
- Kiểm tra ADMIN_EMAIL trong .env có đúng không

### Lỗi 4: Email vào spam

**Giải pháp:**
- Check spam folder trong Gmail
- Mark email as "Not Spam"
- Thêm sender vào contacts

## 📊 MONITORING

### Console Logs Quan Trọng

**Khi order thành công:**
```
📦 Placing order with userId: ...
✅ Order created successfully with ID: ...
✅ Order confirmation email sent successfully (background)
✅ Admin order notification email sent successfully (background)
```

**Khi email chưa cấu hình:**
```
⚠️ Email configuration not found. Emails will not be sent.
⚠️ Order confirmation email not sent (background): email_not_configured
⚠️ Admin order notification email not sent (background): email_not_configured
```

**Khi có lỗi email:**
```
❌ Error sending order confirmation email: [error message]
❌ Error sending admin order notification email: [error message]
```

## 🎯 CHECKLIST HOÀN CHỈNH

- [ ] Tạo Gmail App Password
- [ ] Tạo file `.env` trong Backend
- [ ] Cấu hình EMAIL_USER, EMAIL_PASSWORD, ADMIN_EMAIL
- [ ] Restart backend server
- [ ] Test đặt hàng với email thật
- [ ] Kiểm tra email khách hàng
- [ ] Kiểm tra email admin
- [ ] Check console logs không có error
- [ ] Check spam folder nếu không thấy email

## 📝 LƯU Ý QUAN TRỌNG

1. **Bảo mật:** 
   - KHÔNG commit file `.env` lên Git
   - File `.env` đã được thêm vào `.gitignore`
   
2. **Production:**
   - Sử dụng email domain riêng thay vì Gmail
   - Cân nhắc dịch vụ email chuyên nghiệp (SendGrid, AWS SES, etc.)
   
3. **Rate Limits:**
   - Gmail có giới hạn: ~500 emails/day
   - Nếu nhiều orders, nên chuyển sang dịch vụ email chuyên nghiệp

4. **Email Format:**
   - Hỗ trợ cả HTML và Plain Text
   - Responsive design cho mobile
   - Professional templates

## 🚀 NEXT STEPS

Sau khi email hoạt động:
1. Customize email templates trong `Backend/services/emailService.js`
2. Thêm logo và branding
3. Thêm email tracking cho analytics
4. Setup email notifications cho các events khác (order status update, etc.)

---

**Mọi thắc mắc, vui lòng kiểm tra console logs và email spam folder trước!** 📧

