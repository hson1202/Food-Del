# 🚀 Resend Setup Guide - RECOMMENDED for Production

## ✅ TẠI SAO DÙNG RESEND?

- ✅ **3,000 emails/month FREE** (100/ngày)
- ✅ **Modern API** - Developer-friendly
- ✅ **Built cho devs** - Tối ưu transactional emails
- ✅ **KHÔNG BỊ TIMEOUT** trên Render/Vercel/hosting cloud
- ✅ **Email analytics** built-in
- ✅ **Domain verification** dễ dàng

## 🚀 SETUP 10 PHÚT

### Bước 1: Đăng ký Resend

1. Vào: **https://resend.com/signup**
2. Đăng ký với email (hoặc GitHub)
3. Verify email

### Bước 2: Tạo API Key

1. Đăng nhập Resend Dashboard
2. Vào **API Keys** (sidebar)
3. Click **Create API Key**
4. Đặt tên: `Production - Viet Bowls`
5. Permission: **Full Access** (hoặc **Sending Access**)
6. Click **Create**
7. **COPY API KEY NGAY** (chỉ hiện 1 lần!): `re_xxxxxxxxxxxxx`

### Bước 3: Config Render Environment Variables

1. Vào **Render Dashboard** → Your Service → **Environment** tab
2. **XÓA/DISABLE** các biến Gmail cũ (nếu có):
   ```
   ❌ EMAIL_SERVICE
   ❌ EMAIL_PASSWORD
   ❌ EMAIL_HOST
   ❌ EMAIL_PORT
   ```
3. **THÊM MỚI** 3 biến này:

```
RESEND_API_KEY=re_xxxxxxxxxxxxx    (API key vừa copy)
EMAIL_USER=noreply@vietbowls.com   (email gửi đi - tùy ý)
ADMIN_EMAIL=admin@vietbowls.com    (email admin nhận notification)
```

**LƯU Ý:**
- `EMAIL_USER` có thể là email gì cũng được (VD: `orders@yourdomain.com`)
- Nếu chưa có domain, dùng: `noreply@resend.dev` (Resend cung cấp sẵn)
- `ADMIN_EMAIL` là email THẬT để nhận thông báo

4. Click **Save Changes** → Render tự động redeploy

### Bước 4: Verify

Sau khi redeploy xong (2-3 phút), check logs:

**Tìm dòng:**
```
📧 Checking email service configuration...
```

**Phải thấy:**
```
✅ Email configured via Resend
   API Key: re_xxxxxxxx...
   From: noreply@vietbowls.com
✅ Resend email service ready!
```

**Nếu thấy vậy = XONG!** ✨

## 🧪 TEST

### Test 1: Qua API

```
https://your-app.onrender.com/api/email/test
```

Response:
```json
{
  "success": true,
  "configured": true,
  "provider": "Resend",
  "message": "Resend email service is configured correctly"
}
```

### Test 2: Admin Panel

1. Vào Admin Panel → **Email Test**
2. Click **Test Connection** → Thấy ✅
3. Nhập email của bạn → **Send Test Email**
4. Check inbox (và spam folder)

### Test 3: Production Test

1. Đặt order từ Frontend với **email thật**
2. Check Render logs:
   ```
   ✅ Order confirmation email sent successfully
   ✅ Admin order notification email sent successfully
   ```
3. Check inbox của customer
4. Check inbox của admin

## 📊 RESEND FREE TIER

```
3,000 emails/month = 100 emails/day
```

**Tính toán:**
- 1 order = 2 emails (customer + admin) = **2 quota**
- 3,000 emails/month ÷ 2 = **1,500 orders/month**
- 1,500 orders/month ÷ 30 days = **50 orders/day**

**Đủ xài cho:**
- Small to medium business
- Startup phase
- Testing và early production

**Nếu vượt quota:**
- Paid plan: $20/month cho 50,000 emails
- Hoặc dùng kết hợp nhiều providers

## 🎯 BEST PRACTICES

### 1. Verify Domain (Khuyến nghị)

Nếu có domain riêng (VD: `vietbowls.com`):

1. Resend Dashboard → **Domains**
2. Click **Add Domain**
3. Nhập domain: `vietbowls.com`
4. Copy DNS records
5. Thêm DNS records vào domain provider (Cloudflare, Namecheap, etc.)
6. Wait 24-48h → Verified ✅

**Lợi ích:**
- Email gửi từ `orders@vietbowls.com` thay vì `noreply@resend.dev`
- Professional hơn
- Ít bị spam filter
- Email analytics chi tiết hơn

### 2. Use Different Emails

```
EMAIL_USER=orders@vietbowls.com      (Gửi order confirmations)
ADMIN_EMAIL=admin@vietbowls.com      (Nhận admin notifications)
```

Hoặc nếu chưa có domain:
```
EMAIL_USER=noreply@resend.dev        (Resend's default)
ADMIN_EMAIL=your-real@gmail.com      (Email thật của bạn)
```

### 3. Monitor Usage

Resend Dashboard → **Logs**:
- Xem emails đã gửi
- Success rate
- Bounce rate
- Open rate (nếu enable tracking)

## 🆚 SO SÁNH

| Feature | Gmail SMTP | Resend |
|---------|-----------|--------|
| Free tier | ~500/day | 3,000/month (100/day) |
| Production ready | ❌ | ✅ |
| Timeout issues | ✅ Có | ❌ Không |
| API | SMTP only | Modern REST API |
| Analytics | ❌ | ✅ |
| Domain verification | Khó | Dễ |
| Setup time | 15 phút | 10 phút |
| Recommended | Development | Production |

## 🐛 TROUBLESHOOTING

### Error: "API key is invalid"

**Fix:**
- Tạo API key mới trong Resend Dashboard
- Đảm bảo copy full key: `re_xxxxxxxxxxxxx`
- Update `RESEND_API_KEY` trong Render
- Redeploy

### Error: "Domain not verified"

**2 options:**

**Option 1: Dùng email mặc định của Resend**
```
EMAIL_USER=noreply@resend.dev
```

**Option 2: Verify domain**
- Resend Dashboard → Domains → Add domain
- Follow DNS setup
- Wait 24-48h

### Email vào Spam

**Fix:**
1. Verify domain (nếu có)
2. Add proper email headers (code đã setup sẵn)
3. Mark as "Not Spam" lần đầu
4. Encourage users to add sender to contacts

### Quota exceeded

**Check usage:**
- Resend Dashboard → Usage
- Xem còn bao nhiêu emails

**Solutions:**
- Upgrade plan ($20/month for 50k)
- Optimize: Chỉ gửi email quan trọng
- Batch emails: Gộp nhiều notifications

## 📝 ENV VARIABLES CHEAT SHEET

### Minimum (Required):
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_USER=noreply@resend.dev
ADMIN_EMAIL=your-real@gmail.com
```

### With Custom Domain:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_USER=orders@vietbowls.com
ADMIN_EMAIL=admin@vietbowls.com
```

### Fallback to Gmail (Development):
```env
# Resend cho production
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Gmail cho local dev (nếu không có RESEND_API_KEY)
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=your-app-password
```

## ✅ CHECKLIST

Setup Resend:
- [ ] Đăng ký Resend account
- [ ] Tạo API Key
- [ ] Set RESEND_API_KEY trong Render Environment
- [ ] Set EMAIL_USER và ADMIN_EMAIL
- [ ] Remove/disable Gmail env vars cũ
- [ ] Save changes → Redeploy
- [ ] Check logs: "✅ Email configured via Resend"
- [ ] Test với /api/email/test
- [ ] Send test email từ Admin Panel
- [ ] Place test order và check inbox
- [ ] Monitor first 10 orders để ensure stable

Optional (Recommended):
- [ ] Verify custom domain
- [ ] Setup email analytics
- [ ] Create separate email addresses (orders@, support@, admin@)
- [ ] Setup monitoring/alerts for quota

## 🎉 KẾT QUẢ

Sau khi setup Resend:

**Before (Gmail):**
```
❌ Error: Connection timeout (ETIMEDOUT)
❌ Error sending order confirmation email
```

**After (Resend):**
```
✅ Email configured via Resend
✅ Order confirmation email sent successfully
✅ Admin order notification email sent successfully
```

**Performance:**
- Email gửi trong < 1 giây
- 99.9% deliverability
- Không bị timeout
- Production-ready ✨

## 📚 LINKS

- Resend Signup: https://resend.com/signup
- Resend Docs: https://resend.com/docs
- API Reference: https://resend.com/docs/api-reference
- Dashboard: https://resend.com/dashboard

---

**TL;DR:**
1. Signup Resend → Get API key
2. Render Environment: `RESEND_API_KEY=re_xxx...`
3. Deploy → Check logs
4. Done! ✨

**Questions?** Check `/api/email/status` hoặc Admin Panel → Email Test!

