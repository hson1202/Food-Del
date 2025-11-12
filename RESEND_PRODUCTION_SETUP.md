# 🚀 Resend Production Setup - Verify Domain

## 📊 TÌNH HUỐNG HIỆN TẠI

### ✅ Đã hoạt động:
```
✅ Resend API connected
✅ Email templates ready
✅ Email sent successfully (to owner email)
   Email ID: 742af067-69a2-4694-ad3e-1194df0b7f49
```

### ⚠️ Hạn chế:
```
❌ CHỈ gửi được đến: support@fastshiphu.com (owner email)
❌ KHÔNG gửi được đến: customer emails khác
```

**Lý do:**
- Resend free tier (chưa verify domain)
- Chỉ cho test với email owner
- Production cần verify domain

---

## ✅ FIX: VERIFY DOMAIN

### Có Domain Rồi (VD: `fastshiphu.com`, `vietbowls.com`)?

**Bước 1: Add Domain trên Resend**

1. Login: https://resend.com/dashboard
2. Click **Domains** (sidebar)
3. Click **Add Domain**
4. Enter domain: `fastshiphu.com` (hoặc domain của bạn)
5. Click **Add**

**Bước 2: Copy DNS Records**

Resend sẽ show 3 DNS records:

```
1. SPF Record (TXT):
   Name: @
   Value: v=spf1 include:_spf.resend.com ~all

2. DKIM Record (TXT):
   Name: resend._domainkey
   Value: [long string - copy từ Resend]

3. DMARC Record (TXT) - Optional:
   Name: _dmarc
   Value: v=DMARC1; p=none
```

**Bước 3: Add Records vào Domain Provider**

**Nếu dùng Cloudflare:**
1. Login Cloudflare
2. Select domain
3. Go to **DNS** → **Records**
4. Click **Add record**
5. Add 3 records từ Resend (Type: TXT)
6. Click **Save**

**Nếu dùng Namecheap:**
1. Login Namecheap
2. Domain List → **Manage**
3. **Advanced DNS** tab
4. Add 3 TXT records
5. **Save**

**Nếu dùng GoDaddy:**
1. Login GoDaddy
2. My Products → **DNS**
3. **Add** → TXT records
4. **Save**

**Bước 4: Wait for Verification**

- DNS propagation: 5 phút - 24 giờ
- Check status trong Resend Dashboard
- Khi verified → ✅ Màu xanh

**Bước 5: Update .env**

```env
# File: Backend/.env

# Đổi FROM email sang domain đã verify
EMAIL_USER=orders@fastshiphu.com
# hoặc
EMAIL_USER=noreply@fastshiphu.com

# Keep
RESEND_API_KEY=re_9YZLmTED...
ADMIN_EMAIL=support@fastshiphu.com
```

**Bước 6: Restart & Test**

```bash
# Restart server
Ctrl + C
npm start

# Test
node test-resend-debug.js
```

**Expected:**
```
✅ EMAIL GỬI THÀNH CÔNG!
Từ: orders@fastshiphu.com
Đến: vietbowlssala666@gmail.com  ← Giờ gửi được đến mọi email!
```

---

## ✅ KHÔNG CÓ DOMAIN? DÙNG GMAIL SMTP

Nếu chưa có domain, dùng **Gmail SMTP** thay vì Resend:

### Bước 1: Tạo Gmail App Password

1. Bật 2FA: https://myaccount.google.com/security
2. Tạo App Password: https://myaccount.google.com/apppasswords
3. Copy password 16 ký tự

### Bước 2: Update .env

```env
# File: Backend/.env

# Comment out Resend
# RESEND_API_KEY=re_9YZLmTED...

# Use Gmail SMTP
EMAIL_SERVICE=gmail
EMAIL_USER=vietbowlssala666@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
ADMIN_EMAIL=vietbowlssala666@gmail.com
```

### Bước 3: Restart & Test

```bash
npm start
```

**Logs:**
```
✅ Email transporter configured via gmail
✅ Email service connection verified successfully!
```

**Lưu ý Gmail SMTP:**
- ✅ Gửi được đến mọi email
- ✅ Miễn phí (500 emails/day)
- ⚠️ Có thể timeout trên cloud hosting (Render, Vercel)
- ⚠️ Slower than Resend (2-5s vs <1s)

---

## 📊 SO SÁNH GIẢI PHÁP

| Feature | Resend (No Domain) | Resend (Verified) | Gmail SMTP |
|---------|-------------------|------------------|------------|
| **Gửi đến mọi email** | ❌ Chỉ owner | ✅ Yes | ✅ Yes |
| **Setup time** | ✓ Done | 1-24h | 10 phút |
| **Cost** | Free | Free | Free |
| **Production ready** | ❌ | ✅ | ⚠️ OK |
| **Speed** | Fast | Fast | Slow |
| **Timeout issues** | None | None | On cloud hosting |
| **Khuyến nghị** | Testing only | **BEST** | Alternative |

---

## 🎯 KHUYẾN NGHỊ

### Cho Local Development:
```env
# Dùng Gmail - dễ, nhanh
EMAIL_SERVICE=gmail
EMAIL_USER=vietbowlssala666@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Cho Production:
```env
# Option 1: Resend với domain verified (BEST)
RESEND_API_KEY=re_xxxxx
EMAIL_USER=orders@fastshiphu.com  ← Domain đã verify

# Option 2: Gmail SMTP (nếu không có domain)
EMAIL_SERVICE=gmail
EMAIL_USER=vietbowlssala666@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

## 🧪 TEST PRODUCTION

Sau khi verify domain hoặc đổi sang Gmail:

### Test 1: Debug Script
```bash
node test-resend-debug.js
```

**Expected:**
```
✅ EMAIL GỬI THÀNH CÔNG!
Gửi đến: vietbowlssala666@gmail.com  ← Bất kỳ email nào
```

### Test 2: Place Order
1. Đặt order từ frontend
2. Dùng email bất kỳ: `customer@example.com`
3. Check inbox
4. Should receive: Order Confirmation Email

### Test 3: Check Logs
```
✅ Order confirmation email sent successfully (background)
✅ Admin order notification email sent successfully (background)
```

---

## 📝 QUICK CHECKLIST

**Nếu CÓ DOMAIN:**
- [ ] Login Resend Dashboard
- [ ] Add domain
- [ ] Copy 3 DNS records
- [ ] Add vào domain provider (Cloudflare/Namecheap/GoDaddy)
- [ ] Wait for verification (check status)
- [ ] Update .env: `EMAIL_USER=orders@yourdomain.com`
- [ ] Restart server
- [ ] Test: `node test-resend-debug.js`
- [ ] Place test order
- [ ] ✅ Done!

**Nếu KHÔNG CÓ DOMAIN:**
- [ ] Tạo Gmail App Password
- [ ] Update .env:
  - [ ] Comment out `RESEND_API_KEY`
  - [ ] Set `EMAIL_SERVICE=gmail`
  - [ ] Set `EMAIL_PASSWORD=your-app-password`
- [ ] Restart server
- [ ] Test: `node test-resend-debug.js`
- [ ] Place test order
- [ ] ✅ Done!

---

## 🔗 TÀI LIỆU THAM KHẢO

- Resend Domains: https://resend.com/domains
- Resend Docs: https://resend.com/docs
- DNS Checker: https://dnschecker.org
- Gmail App Password: https://myaccount.google.com/apppasswords

---

## 📞 TROUBLESHOOTING

### "Domain not verified" sau 24h

**Check DNS:**
```bash
# Check SPF
nslookup -type=TXT fastshiphu.com

# Check DKIM
nslookup -type=TXT resend._domainkey.fastshiphu.com
```

**Online tool:**
- https://dnschecker.org
- https://mxtoolbox.com/SuperTool.aspx

### Gmail SMTP timeout

- Chỉ xảy ra trên cloud hosting (Render, Vercel)
- Local development: OK
- Fix: Verify domain và dùng Resend

### Email vào spam

1. Mark as "Not Spam"
2. Add sender to contacts
3. Wait 2-3 emails, Gmail sẽ learn
4. Verify domain giúp giảm spam rate

---

**Questions?**
- Check `EMAIL_SERVICE_STATUS.md`
- Check `FIX_RESEND_DOMAIN_ERROR.md`
- Run: `node test-resend-debug.js`

