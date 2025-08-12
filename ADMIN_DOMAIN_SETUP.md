# 🛡️ Setup Domain cho Admin Panel

## 🎯 **Tổng quan**
Admin panel cần subdomain riêng để bảo mật và dễ quản lý. Thường dùng `admin.yourdomain.com`

## 🔗 **Cấu trúc domain khuyến nghị:**
```
Main Website: https://vietbowls.com
Admin Panel:  https://admin.vietbowls.com
API Backend:  https://api.vietbowls.com
```

## 🚀 **Các bước setup**

### **Bước 1: Vào Vercel Dashboard**
1. Login [vercel.com](https://vercel.com)
2. Chọn **Admin project** (không phải Frontend project)
3. Click tab **"Domains"**

### **Bước 2: Add subdomain**
1. Click **"Add Domain"**
2. Nhập: `admin.yourdomain.com` (thay `yourdomain.com` bằng domain thực tế)
3. Click **"Add"**

### **Bước 3: Cấu hình DNS (nếu cần)**

#### **Nếu domain mua từ Vercel:**
- ✅ Tự động setup, không cần làm gì

#### **Nếu domain từ GoDaddy/Namecheap:**
Thêm CNAME record:
```
Type: CNAME
Name: admin
Value: cname.vercel-dns.com
TTL: 600 (hoặc Auto)
```

#### **Cụ thể theo nhà cung cấp:**

**GoDaddy:**
1. My Products → DNS → Manage
2. Add Record → CNAME
3. Name: `admin`, Value: `cname.vercel-dns.com`

**Namecheap:**
1. Domain List → Manage → Advanced DNS
2. Add New Record → CNAME Record
3. Host: `admin`, Value: `cname.vercel-dns.com`

**Cloudflare:**
1. DNS → Records → Add record
2. Type: CNAME, Name: `admin`, Target: `cname.vercel-dns.com`

### **Bước 4: Verify domain**
1. Quay lại Vercel Dashboard
2. Click **"Verify"** bên cạnh domain vừa thêm
3. Đợi vài phút để domain active

## 🔧 **Cập nhật Backend CORS**

Sau khi có admin domain, cần cập nhật CORS trong Backend:

```javascript
// Backend/server.js
app.use(cors({
  origin: [
    'https://vietbowls.com',           // Frontend
    'https://www.vietbowls.com',      // Frontend with www
    'https://admin.vietbowls.com',    // ← Admin domain mới
    'http://localhost:3000',          // Development Frontend
    'http://localhost:5173'           // Development Admin (Vite)
  ],
  credentials: true
}))
```

**Commit và push:**
```bash
cd Backend
# Sửa file server.js như trên
git add .
git commit -m "Add admin domain to CORS whitelist"
git push origin main
```

## 🧪 **Test Admin domain**

### **1. Kiểm tra domain resolve:**
```bash
nslookup admin.vietbowls.com
# Hoặc online: https://www.whatsmydns.net/
```

### **2. Test website access:**
- Vào `https://admin.vietbowls.com`
- Kiểm tra login page hiển thị đúng
- Test login với admin account

### **3. Test API calls:**
- Mở DevTools → Network tab
- Login admin → kiểm tra API calls có gọi đúng backend không

## 🛡️ **Bảo mật Admin domain**

### **1. Restrict access (optional):**
```javascript
// Admin/src/App.jsx - thêm IP whitelist hoặc VPN check
const allowedIPs = ['your-office-ip'];
// Hoặc dùng basic auth
```

### **2. Strong admin passwords:**
- Đảm bảo admin accounts có password mạnh
- Enable 2FA nếu có

### **3. HTTPS only:**
- Vercel tự động force HTTPS
- Đảm bảo không có mixed content

## 📋 **Checklist hoàn thành**

- [ ] Thêm `admin.yourdomain.com` vào Vercel Admin project
- [ ] Cấu hình DNS CNAME record (nếu cần)
- [ ] Verify domain trong Vercel
- [ ] Cập nhật CORS trong Backend
- [ ] Test admin domain access
- [ ] Test admin login functionality
- [ ] Test API calls từ admin panel

## 🚨 **Troubleshooting**

### **Domain không resolve:**
- Đợi DNS propagate (1-24h)
- Check CNAME record đã đúng chưa
- Clear browser cache/DNS cache

### **CORS errors:**
- Đảm bảo đã thêm admin domain vào CORS whitelist
- Redeploy backend sau khi sửa CORS

### **SSL certificate pending:**
- Đợi Vercel generate SSL (vài phút)
- Refresh page và thử lại

### **404 errors:**
- Check Vercel project có deploy thành công không
- Check routing config trong admin app

## 💡 **Tips**

### **Development vs Production:**
```javascript
// Admin/src/App.jsx - đã có sẵn logic này
const url = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_BACKEND_URL || 'https://api.vietbowls.com'
  : 'http://localhost:4000'
```

### **Environment variables:**
Trong Vercel Admin project settings:
```
REACT_APP_BACKEND_URL=https://api.vietbowls.com
NODE_ENV=production
```

### **Custom admin path (optional):**
Thay vì `admin.domain.com`, có thể dùng `domain.com/admin` bằng cách:
1. Deploy admin như một route trong main project
2. Hoặc dùng Vercel rewrites

---
**🎯 Ready to go!** Admin panel sẽ có domain riêng và hoạt động độc lập với Frontend.
