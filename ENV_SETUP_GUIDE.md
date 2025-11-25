# 🔧 Environment Variables Setup Guide

## 📁 Files

- `Backend/env.example` - Template đầy đủ tất cả options
- File này - Hướng dẫn setup nhanh

## 🚀 QUICK START (Local Development)

### Bước 1: Tạo file `.env`

```bash
cd Backend
cp env.example .env
```

Hoặc tạo file mới: `Backend/.env`

### Bước 2: Paste config vào `.env`

**Option A: Dùng Gmail (Nhanh - Cho local)**

```env
# Database
MONGODB_URI=mongodb://localhost:27017/food-delivery

# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=local-dev-secret-123

# Email - Gmail
EMAIL_SERVICE=gmail
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
ADMIN_EMAIL=your-gmail@gmail.com

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Gmail App Password:**
1. Vào: https://myaccount.google.com/apppasswords
2. Tạo App Password
3. Copy 16 ký tự → Paste vào EMAIL_PASSWORD

**Option B: Dùng Resend (Tốt hơn - Cho cả local và production)**

```env
# Database
MONGODB_URI=mongodb://localhost:27017/food-delivery

# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=local-dev-secret-123

# Email - Resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_USER=noreply@resend.dev
ADMIN_EMAIL=your-real-email@gmail.com

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Resend API Key:**
1. Signup: https://resend.com/signup
2. Dashboard → API Keys → Create
3. Copy key → Paste vào RESEND_API_KEY

### Bước 3: Start server

```bash
npm run dev
```

### Bước 4: Verify

Check console phải thấy:

**Nếu dùng Gmail:**
```
✅ Email transporter configured via gmail
   From: your-gmail@gmail.com
```

**Nếu dùng Resend:**
```
✅ Email configured via Resend
   API Key: re_xxxxxxxx...
```

**Nếu không thấy:**
```
⚠️ Email configuration not found
```
→ Check lại file `.env`

### Bước 5: Test

```bash
# Browser:
http://localhost:4000/api/email/test

# Hoặc đặt order từ frontend
```

## 🌐 PRODUCTION SETUP (Render/Vercel)

### Render Environment Variables

**Dashboard → Service → Environment tab:**

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/food-delivery
PORT=10000
NODE_ENV=production
JWT_SECRET=super-strong-random-production-secret-xyz
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_USER=orders@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CORS_ORIGIN=https://your-frontend.vercel.app
```

**⚠️ QUAN TRỌNG:**
- **PHẢI dùng RESEND** trên Render (Gmail sẽ timeout!)
- Đổi JWT_SECRET thành random string mạnh
- Dùng MongoDB Atlas (không phải local)

## 📋 CHECKLIST

### Local Development:
- [ ] Tạo file `Backend/.env`
- [ ] Copy config từ `env.example`
- [ ] Chọn Gmail hoặc Resend
- [ ] Điền credentials
- [ ] `npm run dev`
- [ ] Check logs có "✅ Email configured"
- [ ] Test: http://localhost:4000/api/email/test

### Production (Render):
- [ ] Render Dashboard → Environment
- [ ] Set MONGODB_URI (MongoDB Atlas)
- [ ] Set JWT_SECRET (random strong string)
- [ ] Set RESEND_API_KEY
- [ ] Set EMAIL_USER và ADMIN_EMAIL
- [ ] Set CLOUDINARY credentials
- [ ] Set CORS_ORIGIN (frontend URL)
- [ ] Save → Redeploy
- [ ] Check logs: "✅ Email configured via Resend"
- [ ] Test: https://your-app.onrender.com/api/email/test

## ❓ TROUBLESHOOTING

### "Email configuration not found"

**Check:**
- File `.env` có tồn tại trong `Backend/` không?
- Có typo trong tên biến không? (EMAIL_USRE vs EMAIL_USER)
- Đã restart server chưa?

**Fix:**
```bash
# Check file
ls Backend/.env

# Nếu không có
cp Backend/env.example Backend/.env

# Edit .env
# Restart server
npm run dev
```

### "Invalid login" (Gmail)

**Reasons:**
- Dùng password Gmail thường (phải dùng App Password!)
- Chưa bật 2-Step Verification
- App Password không đúng

**Fix:**
1. https://myaccount.google.com/apppasswords
2. Tạo App Password mới
3. Update EMAIL_PASSWORD trong .env
4. Restart server

### "Connection timeout" (Production)

**Reason:** Gmail bị block trên Render

**Fix:** Chuyển sang Resend
- Follow `RESEND_SETUP.md`
- Update RESEND_API_KEY trong Render Environment
- Redeploy

## 🔐 SECURITY

**DO:**
- ✅ Keep `.env` in `.gitignore`
- ✅ Use App Passwords (not real passwords)
- ✅ Use different secrets for dev/production
- ✅ Rotate secrets regularly
- ✅ Use environment variables in hosting

**DON'T:**
- ❌ Commit `.env` to git
- ❌ Share `.env` publicly
- ❌ Use same JWT_SECRET everywhere
- ❌ Use weak passwords
- ❌ Hardcode secrets in code

## 📚 RELATED DOCS

- Email Setup: `Backend/EMAIL_SETUP_GUIDE.md`
- Resend Setup: `RESEND_SETUP.md`
- Render Deploy: `RENDER_EMAIL_SETUP.md`
- Quick Fix: `QUICK_EMAIL_FIX_GUIDE.md`

## 🎯 QUICK REFERENCE

### Minimum Required (Local):
```env
MONGODB_URI=mongodb://localhost:27017/food-delivery
JWT_SECRET=local-dev-secret
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
ADMIN_EMAIL=your@gmail.com
```

### Minimum Required (Production):
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=strong-random-secret
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_USER=noreply@resend.dev
ADMIN_EMAIL=admin@gmail.com
```

---

**Questions?**
- Check logs: `npm run dev` hoặc Render Logs
- Test API: `/api/email/status` hoặc `/api/email/test`
- Admin Panel: `/admin/email-test`












