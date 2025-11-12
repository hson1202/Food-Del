# Email Service Configuration

## Hiện tại (Chưa cấu hình email)

Hệ thống đã được sửa để **không crash** khi chưa có cấu hình email. Thay vào đó:

- ✅ **Reservation form** vẫn hoạt động bình thường
- ✅ **Contact form** vẫn hoạt động bình thường
- ✅ **Order placement** vẫn hoạt động bình thường
- ✅ **Dữ liệu vẫn được lưu vào database**
- ⚠️ **Email confirmation sẽ không được gửi**
- 📝 **Console sẽ hiển thị thông báo**: "Email service not configured"

## Console Logs

Khi submit form, bạn sẽ thấy:
```
⚠️ Email configuration not found. Emails will not be sent.
⚠️ Email not sent: Email service not configured
```

## Để bật email service sau này

### 1. Tạo file `.env` trong thư mục Backend
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@vietbowls.com
```

### 2. Cấu hình Gmail
- Bật 2-factor authentication
- Tạo App Password (không dùng password thường)
- Sử dụng App Password trong `.env`

### 3. Restart server
```bash
npm run dev
```

## Các function email đã được bảo vệ

### Customer Emails:
- `sendReservationConfirmation()` - Gửi email xác nhận đặt bàn cho khách
- `sendStatusUpdateEmail()` - Gửi email cập nhật trạng thái reservation cho khách
- `sendContactConfirmation()` - Gửi email xác nhận liên hệ cho khách
- `sendOrderConfirmation()` - **NEW!** Gửi email xác nhận đơn hàng cho khách

### Admin Emails:
- `sendAdminNotification()` - Gửi thông báo cho admin khi có contact message
- `sendAdminOrderNotification()` - **NEW!** Gửi thông báo cho admin khi có order mới

## Lợi ích của cách thiết kế này

1. **Không crash** khi chưa có email
2. **Dữ liệu vẫn được lưu** bình thường
3. **Dễ dàng bật email** sau này
4. **Log rõ ràng** để debug
5. **Graceful degradation** - hệ thống vẫn hoạt động

## Test hiện tại

Bạn có thể test:
- Submit reservation form → Dữ liệu được lưu, không có email
- Submit contact form → Dữ liệu được lưu, không có email
- Place order → Đơn hàng được lưu, không có email
- Không có lỗi crash nào

## Khi bật email service

Sau khi cấu hình `.env` đúng và restart server, hệ thống sẽ:

### Order Flow:
1. ✅ Khách đặt hàng
2. 📧 **Email tự động gửi cho khách** với tracking code và chi tiết đơn hàng
3. 📧 **Email tự động gửi cho admin** thông báo có order mới, bao gồm:
   - Thông tin khách hàng
   - Chi tiết đơn hàng
   - Địa chỉ giao hàng
   - Tổng tiền

### Reservation Flow:
1. ✅ Khách đặt bàn
2. 📧 Email xác nhận gửi cho khách
3. 👨‍💼 Admin cập nhật trạng thái (confirmed/cancelled)
4. 📧 Email cập nhật trạng thái gửi cho khách

### Contact Flow:
1. ✅ Khách gửi contact message
2. 📧 Email xác nhận gửi cho khách
3. 📧 Email thông báo gửi cho admin

Khi nào cần email, chỉ cần cấu hình `.env` và restart server là xong!
