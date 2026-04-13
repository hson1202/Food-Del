# Hướng Dẫn Sử Dụng Trang Quản Trị Hệ Thống (Admin Panel)

Chào mừng bạn đến với hệ thống Quản trị của Website Đặt Đồ Ăn Trực Tuyến. Tài liệu này sẽ hướng dẫn bạn cách sử dụng các tính năng có trong Admin Panel để vận hành và quản lý cửa hàng một cách trơn tru, hiệu quả.

---

## 1. Đăng Nhập Hệ Thống

- **Truy cập**: Điền đường dẫn trang quản trị trên trình duyệt (thường là `tên-miền-của-bạn/admin` hoặc `tên-miền-của-bạn/admin/login`).
- **Thao tác**: Nhập thông tin Email/Tài khoản và Mật khẩu được cấp.
- Khi đăng nhập thành công, hệ thống sẽ tự động chuyển hướng bạn tới giao diện **Tổng quan (Dashboard)**.

---

## 2. Các Chức Năng Chính

Sau khi đăng nhập, cột menu bên trái (Sidebar) sẽ hiển thị toàn bộ thanh công cụ quản lý. Dưới đây là giải thích chi tiết cho từng chức năng:

### 2.1. Dashboard (Tổng Quan)
- **Mục đích**: Mang đến cho quản trị viên (Admin) cái nhìn bao quát về tình trạng kinh doanh.
- **Các thông tin cung cấp**: Xem biến động tổng doanh thu, đếm lượng đơn hàng mới, số lượng khách hàng cũng như các biểu đồ vận hành theo thời gian (ngày, tháng).

### 2.2. Orders (Quản Lý Đơn Hàng)
- **Mục đích**: Nơi tiếp nhận và xử lý tất cả các đơn đặt món từ khách hàng trên Website.
- **Các thao tác khả dụng**:
  - Xem danh sách và chi tiết các món ăn mà khách đã đặt, bao gồm ghi chú, địa chỉ giao hàng và thông tin liên lạc.
  - **Cập nhật trạng thái đơn**: Bạn có thể thay đổi trạng thái từ *Food Processing (Đang chế biến)* -> *Out for delivery (Đang giao)* -> *Delivered (Đã giao)*. Hệ thống sẽ để khách hàng theo dõi được trạng thái này.

### 2.3. Parent Category & Category (Quản Lý Danh Mục)
- **Parent Category (Danh mục Cha)**: Dùng để gộp các nhóm món ăn lớn (Ví dụ: *Đồ Ăn, Thức Uống, Ăn Vặt*).
- **Category (Danh mục Cụ thể)**: Dùng để phân loại chi tiết hơn nằm dưới Danh mục Cha (Ví dụ: *Cà phê, Trà sữa, Bún/Phở, Cơm phần*).
- **Các thao tác khả dụng**: Thêm mới danh mục, tải lên logo/hình ảnh minh họa cho danh mục, đổi tên hoặc xóa. Danh mục càng rõ ràng thì khách hàng càng dễ tìm món.

### 2.4. Products & Add (Sản Phẩm & Thêm Món Ưng Ý)
- **Products**: Bảng liệt kê toàn bộ các món ăn/sản phẩm đang có trên website. Có thể ẩn, sửa giá, hoặc xóa những món không còn kinh doanh.
- **Add**: Nơi thêm món mới vào menu. Bạn cần tải lên Hình ảnh món ăn, điền Tên món, Mô tả hấp dẫn, chọn đúng Danh mục và thiết lập Giá bán. 

### 2.5. Users & Permissions (Người Dùng & Phân Quyền)
- **Users**: Hiển thị danh sách khách hàng đã đăng ký tài khoản trên website. Admin có thể xem được lịch sử thông tin cơ bản để chăm sóc khách hàng. Có thể khoá tài khoản trong trường hợp người dùng vi phạm chính sách.
- **Permissions**: Chức năng dành cho Chủ cửa hàng để tạo thêm các tài khoản Quản trị cho Nhân viên (Ví dụ: Nhân viên Bếp, Nhân viên Chăm sóc khách hàng,...). Bạn có thể giới hạn quyền, chỉ cho nhân viên thao tác với **Orders** mà không được thay đổi **Products** hay xem **Doanh thu**.

### 2.6. Reservations (Đặt Bàn)
- **Mục đích**: Quản lý các yêu cầu đặt bàn ăn tại quán (nhà hàng) trước khi khách đến.
- **Các thao tác khả dụng**: Xem thông tin do nhà hàng nhận được (Tên, SDT, Số lượng người, Giờ ăn). Admin có thể xét duyệt (Chấp nhận/Từ chối) và báo lại cho khách.

### 2.7. Blog (Bài Viết / Tin Tức)
- **Mục đích**: Gây dựng các chiến dịch Marketing, thông báo khuyến mãi, và các bài đọc ẩm thực thu hút khách hàng.
- **Các thao tác khả dụng**: Đăng/sửa bài viết mới. Bao gồm tải ảnh bìa và soạn thảo nội dung. Các bài blog sẽ hiển thị trên hệ thống Website Frontend.

### 2.8. Delivery Zones (Khu Vực Giao Hàng)
- **Mục đích**: Định cấu hình các vị trí hỗ trợ dịch vụ giao hàng tận nơi.
- **Các thao tác khả dụng**: Thêm các vùng lân cận, đặt mức giá giao hàng (phí ship) linh hoạt cho từng khu vực hoặc từng bán kính khoảng cách.

### 2.9. Restaurant Info (Thông Tin Cửa Hàng)
- **Mục đích**: Lưu trữ thông tin định vị thương hiệu, cho phép thay đổi cấu hình gốc của chuỗi cửa hàng.
- **Các thao tác khả dụng**: Tùy chỉnh trực tiếp Tên cửa hàng, thay đổi kích cỡ Logo, cập nhật Địa chỉ, Số điện thoại hỗ trợ, cũng như Giờ mở/đóng cửa hiện hiển thị cho khách hàng biết.

### 2.10. Messages (Tin Nhắn & Phản Hồi)
- **Mục đích**: Trực tiếp nhận tin nhắn hỗ trợ từ mục "Liên Hệ" ngoài trang chủ.
- **Các thao tác khả dụng**: Quản trị viên theo dõi các góp ý, phàn nàn và các yêu cầu gọi hỗ trợ từ khách và tiến hành liên lạc trở lại để hậu mãi khách hàng tốt hơn.

### 2.11. Email Test & Error Logs (Kỹ Thuật Hệ Thống)
*(Mục này thường dùng cho dân kỹ thuật hoặc bảo trì Web)*
- **Email Test**: Chức năng kiểm tra công cụ gửi Email tự động trong hệ thống (Email hóa đơn, Đặt lại mật khẩu) có đang hoạt động tốt hay không.
- **Error Logs**: Bảng nhật ký ghi lại các thông báo kỹ thuật, các cảnh báo hoặc lỗi ngầm sinh ra để thuận tiện báo với phía Dev hỗ trợ sửa lỗi.

---

## 3. Lưu Ý Vận Hành
1. **Hình ảnh sản phẩm**: Hãy chọn những định dạng hình ảnh rõ ràng, có kích thước được căn đều (vd: Tỉ lệ 1:1, 500x500px) để website có giao diện nhìn món ăn ngon mắt nhất. Cố gắng nén dung lượng ảnh để web giúp khách hàng tải nhanh hơn.
2. **Quy trình đơn hàng an toàn**: Hãy nhớ cập nhật trạng thái các đơn hàng kịp thời mỗi khi bộ phận bếp hay đội shipper hoàn thành khâu của mình để khách hàng không bị hoang mang.
3. **Bảo mật và Thoát tài khoản**: Hãy tạo mật khẩu khó đoán cho tài khoản Admin cấp cao thuật toán. Nếu đăng nhập bằng thiết bị công cộng, đừng quên **Đăng Xuất (Logout)** trước khi rời đi.

*Cảm ơn đã sử dụng phiên bản hệ thống Food-Del! Chúc công việc Kinh doanh và Quản lý Nhà hàng luôn Hồng Phát!*
