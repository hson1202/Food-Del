# ⚡ QUICK FIX: Email không gửi trên Render

## 🚨 PROBLEM: "Email k gửi cho khách khi up lên Render"

## ✅ GIẢI PHÁP NHANH (5 phút)

### Bước 1: Check xem có lỗi không

**Vào Render Dashboard → Logs**, tìm dòng:

```
📧 Checking email service configuration...
```

Nếu thấy:
- ✅ **"Email service is configured and working"** → OK, không có vấn đề
- ⚠️ **"Email service NOT configured"** → Chưa set env vars (làm Bước 2)
- ❌ **"verification FAILED: Invalid login"** → Sai password (làm Bước 3)

### Bước 2: Set Environment Variables

1. Vào **Render Dashboard** → Chọn Web Service → Tab **Environment**
2. Click **Add Environment Variable**
3. Thêm 4 biến này:

```
EMAIL_SERVICE=gmail
EMAIL_USER=vietbowlssala666@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
ADMIN_EMAIL=vietbowlssala666@gmail.com
```

**LƯU Ý:** 
- EMAIL_PASSWORD phải là **Gmail App Password** 16 ký tự
- KHÔNG dùng password Gmail thường!

4. Click **Save Changes** → Render tự động redeploy

### Bước 3: Tạo Gmail App Password (nếu chưa có)

1. Vào: https://myaccount.google.com/apppasswords
2. Đăng nhập Gmail của bạn
3. Bật **2-Step Verification** (nếu chưa bật)
4. Click **App passwords**
5. Chọn **Mail** và **Other (Custom name)**
6. Nhập tên: `Viet Bowls Backend`
7. Click **Generate**
8. Copy **16 ký tự** (bỏ khoảng trắng: `abcdwxyzabcdwxyz`)
9. Paste vào EMAIL_PASSWORD trong Render

### Bước 4: Verify

**Cách 1: Check Logs**
```
Render Dashboard → Logs → Sau khi redeploy xong, tìm:
✅ Email service is configured and working!
```

**Cách 2: Admin Panel**
```
1. Vào Admin Panel
2. Click "Email Test" trong sidebar (icon ✉️)
3. Click "Test Connection"
4. Nhập email và "Send Test Email"
5. Check inbox
```

**Cách 3: Browser**
```
https://your-app.onrender.com/api/email/test
```

Nếu thấy `"success": true` → OK!

## 🧪 TEST THẬT

1. Đặt order từ Frontend với **email thật**
2. Check Render logs có dòng:
   ```
   ✅ Order confirmation email sent successfully
   ✅ Admin order notification email sent successfully
   ```
3. Check inbox email customer
4. Check inbox email admin
5. **Nhớ check spam folder!**

## 🐛 VẪN KHÔNG ĐƯỢC?

### Debug Checklist:

- [ ] Đã bật 2-Step Verification trong Gmail?
- [ ] App Password có 16 ký tự?
- [ ] Đã bỏ khoảng trắng trong App Password?
- [ ] Tên biến viết đúng? (EMAIL_USER, không phải EMAIL_USERNAME)
- [ ] Đã Save changes và redeploy?
- [ ] Đã check spam folder?

### Try This:

```bash
# Test từ browser
https://your-app.onrender.com/api/email/status

# Hoặc Admin Panel
/admin/email-test
```

## 📝 COMMON ERRORS

| Error | Fix |
|-------|-----|
| "Invalid login: 535" | Tạo App Password mới, đảm bảo copy đúng |
| "Email service NOT configured" | Set EMAIL_USER và EMAIL_PASSWORD trong Render Environment |
| "ETIMEDOUT" | Network issue, đợi vài phút và thử lại |
| Email vào Spam | Mark as "Not Spam", add sender vào contacts |

## 🎯 NEW FEATURES

Giờ bạn có **Email Test Tool** trong Admin Panel:

- ✅ Real-time status check
- ✅ One-click connection test
- ✅ Send test email
- ✅ Chi tiết recommendations

**Vào:** `/admin/email-test`

## 📚 CHI TIẾT HƠN

- **Setup đầy đủ:** `RENDER_EMAIL_SETUP.md`
- **Debug system:** `EMAIL_DEBUG_AND_TEST_SUMMARY.md`
- **Gmail App Password:** `Backend/EMAIL_SETUP_GUIDE.md`

## 💬 STILL STUCK?

1. Screenshot Render Logs
2. Screenshot Environment Variables (che password)
3. Screenshot `/api/email/status` response
4. Share với team

---

**TL;DR:**
1. Vào Render → Environment
2. Set EMAIL_USER, EMAIL_PASSWORD, ADMIN_EMAIL
3. EMAIL_PASSWORD = Gmail App Password 16 ký tự
4. Save → Redeploy
5. Check logs → ✅ Email service is configured
6. Done! ✨

