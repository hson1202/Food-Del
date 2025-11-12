# 📧 Gmail SMTP Setup Guide

## 🔄 ĐỔI TỪ RESEND SANG GMAIL SMTP

### BƯỚC 1: Tạo Gmail App Password

1. **Bật 2-Factor Authentication** (bắt buộc):
   - Vào: https://myaccount.google.com/security
   - Tìm **"2-Step Verification"**
   - Click **"Get Started"** và làm theo hướng dẫn
   - Verify bằng phone

2. **Tạo App Password**:
   - Vào: https://myaccount.google.com/apppasswords
   - Hoặc search Google: "gmail app password"
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Nhập tên: `Food Delivery Backend`
   - Click **Generate**
   - Sẽ hiện password 16 ký tự: `abcd efgh ijkl mnop`
   - **Copy password này** (không có dấu cách)

### BƯỚC 2: Update Backend/.env

Mở file **`Backend/.env`** và sửa như sau:

**OPTION A: Disable Resend, dùng Gmail**

```env
# ============================================
# EMAIL SERVICE - GMAIL SMTP
# ============================================

# Comment out Resend để dùng Gmail
# RESEND_API_KEY=re_xxxxxxxxxxxxx

# Enable Gmail SMTP
EMAIL_SERVICE=gmail
EMAIL_USER=vietbowlssala666@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
ADMIN_EMAIL=vietbowlssala666@gmail.com
```

**OPTION B: Giữ cả hai (dùng Gmail cho dev, Resend cho prod)**

```env
# Production: Resend
# RESEND_API_KEY=re_xxxxxxxxxxxxx

# Development: Gmail (nếu không có RESEND_API_KEY)
EMAIL_SERVICE=gmail
EMAIL_USER=vietbowlssala666@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
ADMIN_EMAIL=vietbowlssala666@gmail.com
```

**Lưu ý:**
- Replace `abcdefghijklmnop` bằng App Password 16 ký tự từ Gmail
- Không có dấu cách trong password
- Case-sensitive

### BƯỚC 3: Restart Server

Sau khi save `.env`:

```bash
# Nếu đang chạy server, restart lại
Ctrl + C
npm start

# Hoặc
cd Backend
node server.js
```

### BƯỚC 4: Check Logs

Khi server khởi động, kiểm tra logs:

**Nếu dùng Gmail thành công:**
```
✅ Email transporter configured via gmail
   From: vietbowlssala666@gmail.com
✅ Email service connection verified successfully!
```

**Nếu có lỗi:**
```
❌ Email service verification failed: Invalid login
   Error details: [chi tiết lỗi]
```

## 🧪 TEST GMAIL SMTP

Chạy test script:

```bash
node Backend/test-gmail-smtp.js
```

Hoặc test qua API:

```bash
GET http://localhost:4000/api/email/test
```

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Gmail SMTP Limitations

| Feature | Gmail SMTP | Resend |
|---------|-----------|--------|
| **Sending limit** | ~500 emails/day | 3,000/month (100/day) |
| **Timeout issues** | ✅ Có (on Render/cloud) | ❌ Không |
| **Speed** | Slower (2-5s) | Fast (<1s) |
| **Deliverability** | Good | Better |
| **Production ready** | ⚠️ Not recommended | ✅ Recommended |
| **Free** | ✅ Yes | ✅ Yes |

### 2. Timeout trên Hosting Cloud

**Vấn đề:**
- Render, Vercel, Netlify có thể block Gmail SMTP port 587
- Connection timeout: `ETIMEDOUT`
- Email không gửi được

**Giải pháp:**
- ✅ **Local development:** Gmail SMTP OK
- ⚠️ **Production (Render/cloud):** Nên dùng Resend
- 🔧 **Alternative:** Dùng SendGrid, Mailgun, AWS SES

### 3. Security

Gmail App Password:
- ✅ An toàn hơn password thường
- ✅ Có thể revoke bất cứ lúc nào
- ❌ Không share public
- ❌ Không commit vào git

## 🐛 TROUBLESHOOTING

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Nguyên nhân:**
- App Password sai
- Chưa bật 2FA
- Đang dùng password thường thay vì App Password

**Fix:**
1. Bật 2-Step Verification
2. Tạo App Password mới
3. Copy đúng 16 ký tự (không có dấu cách)
4. Paste vào `EMAIL_PASSWORD` trong `.env`

### Error: "Connection timeout ETIMEDOUT"

**Nguyên nhân:**
- Port 587 bị block (trên hosting cloud)
- Firewall chặn outgoing SMTP
- Network issues

**Fix:**
1. Try port 465: Set `EMAIL_PORT=465` và `EMAIL_SECURE=true`
2. Switch to Resend (khuyến nghị cho production)
3. Check firewall settings

### Error: "self signed certificate in certificate chain"

**Fix:**
```env
# Thêm vào .env
NODE_TLS_REJECT_UNAUTHORIZED=0
```

⚠️ **Chỉ dùng cho development, không dùng production!**

### Email vào Spam

**Fix:**
1. Mark as "Not Spam" trong Gmail
2. Add sender to contacts
3. Verify SPF/DKIM records (nếu dùng custom domain)

## 📊 SO SÁNH: GMAIL vs RESEND

### Khi nào dùng Gmail SMTP:

✅ **Phù hợp:**
- Local development
- Testing/debugging
- Small projects (<100 emails/day)
- Không deploy lên cloud hosting

❌ **Không phù hợp:**
- Production trên Render/Vercel/cloud
- High volume (>500 emails/day)
- Cần reliability cao
- Cần analytics/tracking

### Khi nào dùng Resend:

✅ **Phù hợp:**
- Production deployment
- Cloud hosting (Render, Vercel, Netlify)
- Professional emails
- Need analytics
- Transactional emails

❌ **Không phù hợp:**
- Nếu không muốn đăng ký service mới
- Nếu cần >3,000 emails/month (free tier)

## 🔄 SWITCH BACK TO RESEND

Nếu muốn quay lại dùng Resend:

```env
# Enable Resend
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Comment out Gmail (optional, sẽ không dùng nếu có Resend)
# EMAIL_SERVICE=gmail
# EMAIL_PASSWORD=abcdefghijklmnop

# Keep these (dùng cho cả 2 providers)
EMAIL_USER=vietbowlssala666@gmail.com
ADMIN_EMAIL=vietbowlssala666@gmail.com
```

Restart server → Tự động dùng Resend.

## ✅ CHECKLIST

Setup Gmail SMTP:
- [ ] Bật 2-Factor Authentication cho Gmail
- [ ] Tạo Gmail App Password (16 ký tự)
- [ ] Update `Backend/.env`:
  - [ ] Comment out `RESEND_API_KEY`
  - [ ] Set `EMAIL_SERVICE=gmail`
  - [ ] Set `EMAIL_PASSWORD=your-app-password`
- [ ] Restart server
- [ ] Check logs: "✅ Email transporter configured via gmail"
- [ ] Test gửi email: `GET /api/email/test`
- [ ] Send test email từ Admin Panel
- [ ] Place test order và check inbox

Verify:
- [ ] Email received in inbox (not spam)
- [ ] Template HTML render đúng
- [ ] No timeout errors in logs

## 🎯 KHUYẾN NGHỊ

**Cho Development (Local):**
```env
# Dùng Gmail - dễ setup, miễn phí
EMAIL_SERVICE=gmail
EMAIL_USER=vietbowlssala666@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Cho Production (Render/Cloud):**
```env
# Dùng Resend - reliable, không timeout
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_USER=vietbowlssala666@gmail.com
```

## 📚 TÀI LIỆU THAM KHẢO

- Gmail App Password: https://myaccount.google.com/apppasswords
- Gmail SMTP Settings: https://support.google.com/mail/answer/7126229
- Nodemailer Gmail: https://nodemailer.com/usage/using-gmail/
- Resend (Alternative): https://resend.com

---

**Có câu hỏi?** Test với:
```bash
node Backend/test-gmail-smtp.js
```

