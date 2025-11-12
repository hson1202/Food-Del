# 📧 Hướng dẫn Cấu hình Email trên Render

## 🚨 VẤN ĐỀ: Email không gửi trên Render

Nếu email không được gửi khi deploy lên Render, có thể do:
1. ❌ Chưa set environment variables trên Render
2. ❌ Set sai tên biến môi trường
3. ❌ Gmail App Password không hợp lệ
4. ❌ Firewall/Security settings của Render

## ✅ GIẢI PHÁP: Cấu hình từng bước

### Bước 1: Tạo Gmail App Password (nếu chưa có)

1. Truy cập: https://myaccount.google.com/security
2. Bật **2-Step Verification** (bắt buộc!)
3. Vào **App passwords** (phía dưới 2-Step Verification)
4. Click **Select app** → chọn **Mail**
5. Click **Select device** → chọn **Other (Custom name)**
6. Nhập tên: `VIET BOWLS Render Backend`
7. Click **Generate**
8. Copy mật khẩu 16 ký tự (dạng: `xxxx xxxx xxxx xxxx`)
   - **LƯU Ý:** Copy toàn bộ, bao gồm cả khoảng trắng (hoặc bỏ khoảng trắng đi)

### Bước 2: Set Environment Variables trên Render

1. Đăng nhập vào Render Dashboard: https://dashboard.render.com
2. Chọn Web Service của bạn (Backend)
3. Vào tab **Environment**
4. Click **Add Environment Variable**

Thêm các biến sau:

```
Key: EMAIL_SERVICE
Value: gmail

Key: EMAIL_USER  
Value: vietbowlssala666@gmail.com
(hoặc email Gmail của bạn)

Key: EMAIL_PASSWORD
Value: xxxxxxxxxxxxxxxx
(App Password 16 ký tự, BỎ khoảng trắng)

Key: ADMIN_EMAIL
Value: admin@vietbowls.com
(hoặc email bạn muốn nhận thông báo)
```

**Ví dụ:**
```
EMAIL_SERVICE=gmail
EMAIL_USER=vietbowlssala666@gmail.com
EMAIL_PASSWORD=abcdwxyzabcdwxyz
ADMIN_EMAIL=vietbowlssala666@gmail.com
```

**LƯU Ý QUAN TRỌNG:**
- ✅ EMAIL_PASSWORD phải là App Password 16 ký tự (KHÔNG phải password Gmail thường!)
- ✅ Bỏ tất cả khoảng trắng trong App Password
- ✅ Viết chính xác tên biến (phân biệt hoa thường)
- ✅ ADMIN_EMAIL có thể giống EMAIL_USER

### Bước 3: Redeploy Service

Sau khi thêm environment variables:
1. Click **Save Changes**
2. Render sẽ tự động redeploy
3. Hoặc click **Manual Deploy** → **Deploy latest commit**

### Bước 4: Kiểm tra Logs

1. Vào tab **Logs** trong Render Dashboard
2. Tìm các dòng log sau khi server start:

**Nếu thành công:**
```
📧 Checking email service configuration...
✅ Email service is configured and working!
   From: vietbowlssala666@gmail.com
   Admin: vietbowlssala666@gmail.com
   Orders and notifications will be sent via email.
```

**Nếu chưa cấu hình:**
```
⚠️ Email service NOT configured!
   Order/reservation/contact emails will NOT be sent.
   To fix:
   1. Set EMAIL_USER in environment variables
   2. Set EMAIL_PASSWORD (or EMAIL_APP_PASSWORD) in environment variables
   ...
```

**Nếu có lỗi:**
```
❌ Email service configured but verification FAILED!
   Error: Invalid login: 535-5.7.8 Username and Password not accepted
   Please check your email credentials.
```

## 🧪 TEST EMAIL SERVICE

### Cách 1: Qua API Endpoints

Sau khi deploy, truy cập các URL sau (thay `your-app` bằng tên app của bạn):

**1. Kiểm tra status:**
```
GET https://your-app.onrender.com/api/email/status
```

Response nếu thành công:
```json
{
  "success": true,
  "configured": true,
  "config": {
    "EMAIL_USER": "✓ Set",
    "EMAIL_PASSWORD": "✓ Set",
    "ADMIN_EMAIL": "✓ Set (vietbowlssala666@gmail.com)",
    "EMAIL_SERVICE": "gmail"
  }
}
```

**2. Test connection:**
```
GET https://your-app.onrender.com/api/email/test
```

Response nếu thành công:
```json
{
  "success": true,
  "configured": true,
  "message": "Email service is working correctly",
  "from": "vietbowlssala666@gmail.com",
  "adminEmail": "vietbowlssala666@gmail.com"
}
```

**3. Gửi test email:**
```bash
curl -X POST https://your-app.onrender.com/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test@gmail.com"}'
```

Response nếu thành công:
```json
{
  "success": true,
  "message": "Test email sent successfully to your-test@gmail.com",
  "details": {
    "success": true,
    "messageId": "...",
    "to": "your-test@gmail.com"
  }
}
```

### Cách 2: Qua Admin Panel (sau khi cài đặt UI)

1. Đăng nhập Admin Panel
2. Vào **Settings** → **Email Configuration**
3. Click **Test Email Service**
4. Nhập email của bạn và click **Send Test Email**
5. Kiểm tra inbox (và spam folder)

## 🐛 TROUBLESHOOTING

### Lỗi 1: "Email service NOT configured"

**Nguyên nhân:** Chưa set environment variables hoặc set sai

**Giải pháp:**
1. Kiểm tra lại Environment Variables trong Render Dashboard
2. Đảm bảo có đủ: `EMAIL_USER`, `EMAIL_PASSWORD`, `ADMIN_EMAIL`
3. Kiểm tra không có typo (viết sai tên biến)
4. Save changes và redeploy

### Lỗi 2: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Nguyên nhân:** 
- Sử dụng password thường thay vì App Password
- App Password không đúng
- Chưa bật 2-Step Verification

**Giải pháp:**
1. Kiểm tra đã bật 2-Step Verification chưa
2. Tạo App Password mới
3. Copy chính xác 16 ký tự (bỏ khoảng trắng)
4. Update EMAIL_PASSWORD trong Render Environment Variables
5. Redeploy

### Lỗi 3: "Connection timeout" hoặc "ETIMEDOUT"

**Nguyên nhân:** Render không thể kết nối đến Gmail SMTP

**Giải pháp:**
1. Đợi vài phút và thử lại (có thể do network temporary issue)
2. Check Render service status: https://status.render.com
3. Thử set explicit SMTP settings:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   ```
4. Nếu vẫn lỗi, cân nhắc dùng dịch vụ email khác (SendGrid, AWS SES)

### Lỗi 4: Email gửi nhưng vào Spam

**Giải pháp:**
1. Check Spam folder
2. Mark email as "Not Spam"
3. Add sender (EMAIL_USER) vào contacts
4. Nếu production, nên dùng custom domain và email service chuyên nghiệp

### Lỗi 5: "Cannot find module emailService"

**Nguyên nhân:** Lỗi import hoặc file không tồn tại

**Giải pháp:**
1. Check file `Backend/services/emailService.js` có tồn tại không
2. Check git commits, đảm bảo file đã được push
3. Redeploy from latest commit

## 📊 MONITORING

### Check logs thường xuyên:

**Khi có order mới thành công:**
```
📦 Placing order with userId: ...
✅ Order created successfully with ID: ...
✅ Order confirmation email sent successfully (background)
✅ Admin order notification email sent successfully (background)
```

**Khi email failed:**
```
❌ Error sending order confirmation email: [error details]
❌ Error sending admin order notification email: [error details]
```

### Dashboard URLs để monitor:

```
Health Check:
https://your-app.onrender.com/health

Email Status:
https://your-app.onrender.com/api/email/status

Debug Email:
https://your-app.onrender.com/debug-email
```

## 🔐 BẢO MẬT

### Best Practices:

1. ✅ **KHÔNG BAO GIỜ** hardcode email credentials trong code
2. ✅ Luôn dùng Environment Variables
3. ✅ Dùng App Password, không dùng password thường
4. ✅ Rotate App Password định kỳ
5. ✅ Set Admin Email riêng, không dùng chung với system email
6. ✅ Monitor logs để phát hiện unauthorized access

### Revoke App Password nếu:
- Không dùng nữa
- Bị lộ credentials
- Có hoạt động bất thường

Revoke tại: https://myaccount.google.com/apppasswords

## 🚀 PRODUCTION RECOMMENDATIONS

Khi production, cân nhắc:

### 1. Dùng Email Service chuyên nghiệp:

**SendGrid:**
- Free tier: 100 emails/day
- Setup: https://sendgrid.com
- Config:
  ```
  EMAIL_SERVICE=SendGrid
  EMAIL_USER=apikey
  EMAIL_PASSWORD=your_sendgrid_api_key
  ```

**AWS SES:**
- Rất rẻ: $0.10 per 1000 emails
- Setup: https://aws.amazon.com/ses/
- Cần verify domain

**Mailgun:**
- Free tier: 5000 emails/month
- Setup: https://www.mailgun.com

### 2. Custom Email Domain:

Thay vì `@gmail.com`, dùng `@vietbowls.com`:
- Professional hơn
- Tránh spam filter
- Tăng deliverability

### 3. Email Analytics:

Implement:
- Open rate tracking
- Click rate tracking
- Bounce rate monitoring
- Unsubscribe handling

## 📝 CHECKLIST HOÀN CHỈNH

Setup Email trên Render:

- [ ] Tạo Gmail App Password
- [ ] Set EMAIL_USER trong Render Environment
- [ ] Set EMAIL_PASSWORD trong Render Environment
- [ ] Set EMAIL_SERVICE=gmail trong Render Environment
- [ ] Set ADMIN_EMAIL trong Render Environment
- [ ] Save changes và redeploy
- [ ] Check logs xem có message "✅ Email service is configured"
- [ ] Test với `/api/email/test`
- [ ] Gửi test email với `/api/email/send-test`
- [ ] Place test order và check inbox
- [ ] Check admin inbox có nhận được notification không
- [ ] Check spam folder nếu không thấy email
- [ ] Monitor logs trong vài ngày đầu

## 🆘 NẾU VẪN KHÔNG ĐƯỢC

1. **Share logs với team:**
   - Copy toàn bộ logs từ Render
   - Bao gồm error messages
   - Screenshot Environment Variables (che password)

2. **Double check:**
   ```bash
   # Local test (nếu có .env local)
   cd Backend
   npm run dev
   
   # Xem console logs có "✅ Email service is configured" không
   # Test với curl:
   curl http://localhost:4000/api/email/test
   curl -X POST http://localhost:4000/api/email/send-test \
     -H "Content-Type: application/json" \
     -d '{"email":"your@gmail.com"}'
   ```

3. **Temporary workaround:**
   - Nếu cần gấp, có thể tạm thời disable email
   - System vẫn hoạt động bình thường
   - Chi tiết order vẫn được lưu trong database
   - Admin vẫn thấy orders trong admin panel

## 📞 SUPPORT RESOURCES

- Render Documentation: https://render.com/docs
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- Nodemailer Documentation: https://nodemailer.com/about/
- Email Testing Tool: https://www.mail-tester.com/

---

**Good luck! 🍀**

Sau khi setup xong, nhớ test kỹ và monitor logs trong vài ngày đầu để đảm bảo mọi thứ hoạt động ổn định.

