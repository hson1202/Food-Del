# 🔧 FIX: Resend Domain Not Verified Error

## ❌ LỖI HIỆN TẠI

```
Error: The gmail.com domain is not verified.
Please, add and verify your domain on https://resend.com/domains
```

**Nguyên nhân:**
- Bạn đang dùng `EMAIL_USER=vietbowlssala666@gmail.com`
- Resend không cho phép gửi từ domain `gmail.com` vì bạn không sở hữu domain này
- Cần verify domain hoặc dùng email mặc định của Resend

**Quota:**
```
x-resend-daily-quota: "0"
x-resend-monthly-quota: "0"
```
→ Chưa gửi email nào, vì bị lỗi domain validation

---

## ✅ GIẢI PHÁP 1: Dùng Email Mặc Định Resend (NHANH - 2 phút)

### Bước 1: Update Backend/.env

Mở file **`Backend/.env`** và sửa dòng `EMAIL_USER`:

**Từ:**
```env
EMAIL_USER=vietbowlssala666@gmail.com
```

**Đổi thành:**
```env
EMAIL_USER=onboarding@resend.dev
```

**Giữ nguyên:**
```env
RESEND_API_KEY=re_9YZLmTED_8hVfYixT...
ADMIN_EMAIL=vietbowlssala666@gmail.com
```

### Bước 2: Restart Server

```bash
# Nếu server đang chạy, restart
Ctrl + C
npm start

# Hoặc
cd Backend
node server.js
```

### Bước 3: Test Lại

```bash
node test-resend-debug.js
```

**Expected:**
```
✅ EMAIL GỬI THÀNH CÔNG!
Email ID: abc123...
Gửi đến: vietbowlssala666@gmail.com
```

### Bước 4: Check Inbox

- Email FROM: `onboarding@resend.dev`
- Email TO: `vietbowlssala666@gmail.com`
- Check inbox và spam folder

---

## ✅ GIẢI PHÁP 2: Verify Custom Domain (NẾU CÓ DOMAIN RIÊNG)

Nếu bạn có domain riêng (VD: `vietbowls.com`), bạn có thể verify để gửi từ `orders@vietbowls.com`

### Bước 1: Add Domain trên Resend

1. Login: https://resend.com/dashboard
2. Go to: **Domains** (sidebar)
3. Click: **Add Domain**
4. Enter domain: `vietbowls.com` (hoặc domain của bạn)
5. Click **Add**

### Bước 2: Add DNS Records

Resend sẽ cho bạn 3 DNS records để add:

```
SPF Record:
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

DKIM Record:
Type: TXT
Name: resend._domainkey
Value: [giá trị Resend cung cấp]

DMARC Record (optional):
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none
```

### Bước 3: Add vào Domain Provider

- Nếu dùng Cloudflare: DNS → Add Record
- Nếu dùng Namecheap: Domain List → Manage → Advanced DNS
- Nếu dùng GoDaddy: DNS Management → Add Record

### Bước 4: Wait for Verification

- Thường mất 24-48h để DNS propagate
- Check status trong Resend Dashboard
- Khi verified → Có ✅ màu xanh

### Bước 5: Update .env

```env
EMAIL_USER=orders@vietbowls.com
```

Restart server và test.

---

## 📊 SO SÁNH 2 GIẢI PHÁP

| Feature | onboarding@resend.dev | Custom Domain |
|---------|---------------------|---------------|
| **Setup time** | 2 phút | 1-2 ngày |
| **Cost** | Free | Free (nếu đã có domain) |
| **Professional** | ⚠️ OK | ✅ Better |
| **Deliverability** | ✅ Good | ✅ Better |
| **Branding** | "onboarding@resend.dev" | "orders@vietbowls.com" |
| **Khuyến nghị** | Development & Testing | Production |

---

## 🧪 TEST SAU KHI FIX

### Test 1: Debug Script
```bash
node test-resend-debug.js
```

**Expected output:**
```
✅ EMAIL GỬI THÀNH CÔNG!
Email ID: abc123-def456-...
Gửi đến: vietbowlssala666@gmail.com

📬 CHECK INBOX:
   1. Check inbox: vietbowlssala666@gmail.com
   2. Check spam folder
   3. Đợi 1-2 phút
```

### Test 2: API Endpoint
```bash
GET http://localhost:4000/api/email/test
```

### Test 3: Send Test Email
```bash
POST http://localhost:4000/api/email/send-test
Body: { "email": "vietbowlssala666@gmail.com" }
```

### Test 4: Place Order
1. Đặt order từ frontend
2. Dùng email: `vietbowlssala666@gmail.com`
3. Check inbox

**Email sẽ trông như:**
```
From: onboarding@resend.dev
To: vietbowlssala666@gmail.com
Subject: Order Confirmation #ABC123 - VIET BOWLS

[HTML Template đẹp với logo, tracking code, order details...]
```

---

## 📝 FILE CẦN SỬA: Backend/.env

### BEFORE (LỖI):
```env
RESEND_API_KEY=re_9YZLmTED_8hVfYixT...
EMAIL_USER=vietbowlssala666@gmail.com  ← gmail.com không được verify
ADMIN_EMAIL=vietbowlssala666@gmail.com
```

### AFTER (FIX):
```env
RESEND_API_KEY=re_9YZLmTED_8hVfYixT...
EMAIL_USER=onboarding@resend.dev  ← Dùng email mặc định của Resend
ADMIN_EMAIL=vietbowlssala666@gmail.com
```

**Lưu ý:**
- `ADMIN_EMAIL` giữ nguyên (vì đây là email NHẬN, không phải gửi)
- Chỉ đổi `EMAIL_USER` (email FROM)

---

## ⚠️ LƯU Ý

### Email FROM vs Email TO

| Role | Variable | Current Value | Can Use |
|------|----------|---------------|---------|
| **FROM** (gửi đi) | `EMAIL_USER` | ~~vietbowlssala666@gmail.com~~ ❌ | `onboarding@resend.dev` ✅ |
| **TO** (nhận về) | `ADMIN_EMAIL` | vietbowlssala666@gmail.com ✅ | Any valid email |

- **FROM email** phải là domain đã verify hoặc `onboarding@resend.dev`
- **TO email** có thể là bất kỳ email nào (Gmail, Yahoo, etc.)

### Resend Onboarding Email

- `onboarding@resend.dev` là email testing của Resend
- **FREE** để dùng
- **Không cần verify**
- **Suitable** cho development & testing
- ⚠️ Có thể vào spam lần đầu (mark as "Not Spam")

---

## 🎯 QUICK FIX CHECKLIST

- [ ] Mở `Backend/.env`
- [ ] Đổi `EMAIL_USER=onboarding@resend.dev`
- [ ] Save file
- [ ] Restart server (Ctrl+C → npm start)
- [ ] Run: `node test-resend-debug.js`
- [ ] Check kết quả: ✅ EMAIL GỬI THÀNH CÔNG
- [ ] Check inbox: `vietbowlssala666@gmail.com`
- [ ] Nếu thấy email → **DONE!** ✨

---

## 📚 TÀI LIỆU THAM KHẢO

- Resend Domains: https://resend.com/domains
- Resend Docs: https://resend.com/docs/send-with-nodejs
- Domain Verification: https://resend.com/docs/dashboard/domains/introduction
- Troubleshooting: https://resend.com/docs/dashboard/domains/troubleshooting

---

**Có vấn đề?** Run debug script:
```bash
node test-resend-debug.js
```

