# Tổng Hợp: Hệ Thống Lấy Địa Chỉ và Tính Phí Giao Hàng

## 📋 Tổng Quan

Hệ thống sử dụng **Mapbox API** để:
- Tự động gợi ý địa chỉ (autocomplete)
- Chuyển đổi địa chỉ thành tọa độ (geocoding)
- Chuyển đổi tọa độ thành địa chỉ (reverse geocoding)
- Hiển thị bản đồ để chọn vị trí thủ công

Sau đó tính phí giao hàng dựa trên khoảng cách từ nhà hàng đến địa chỉ khách hàng.

---

## 🔧 Các Dịch Vụ/API Được Sử Dụng

### 1. **Mapbox Geocoding API**
- **Mục đích**: Chuyển đổi địa chỉ ↔ tọa độ
- **Endpoints sử dụng**:
  - `https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json` - Geocoding (địa chỉ → tọa độ)
  - `https://api.mapbox.com/geocoding/v5/mapbox.places/{lng},{lat}.json` - Reverse Geocoding (tọa độ → địa chỉ)
- **Token cần thiết**: `MAPBOX_ACCESS_TOKEN` (backend) và `VITE_MAPBOX_ACCESS_TOKEN` hoặc `VITE_MAPBOX_TOKEN` (frontend)

### 2. **Mapbox GL JS** (Frontend)
- **Mục đích**: Hiển thị bản đồ tương tác để chọn vị trí
- **Package**: `mapbox-gl`
- **Sử dụng trong**: Component `ManualLocationPicker`

### 3. **Haversine Formula** (Backend)
- **Mục đích**: Tính khoảng cách đường thẳng giữa 2 điểm trên Trái Đất
- **Công thức**: Tính toán dựa trên tọa độ latitude/longitude
- **Đơn vị**: Kilomet (km)

### 4. **MongoDB** (Database)
- **Models sử dụng**:
  - `deliveryZoneModel` - Lưu các zone giao hàng (minDistance, maxDistance, deliveryFee, minOrder, estimatedTime)
  - `restaurantLocationModel` - Lưu vị trí nhà hàng (latitude, longitude)
  - `userModel` - Lưu địa chỉ đã lưu của user (addresses array)

---

## 📁 Cấu Trúc Code

### **Frontend Components**

#### 1. `PlaceOrder.jsx` (Trang đặt hàng)
- **Vị trí**: `Frontend/src/pages/PlaceOrder/PlaceOrder.jsx`
- **Chức năng**:
  - Quản lý form đặt hàng
  - Lấy địa chỉ đã lưu của user (nếu đã đăng nhập)
  - Gọi API tính phí giao hàng
  - Hiển thị thông tin zone và phí ship

#### 2. `DeliveryAddressInput.jsx` (Input địa chỉ)
- **Vị trí**: `Frontend/src/components/DeliveryAddressInput/DeliveryAddressInput.jsx`
- **Chức năng**:
  - Input autocomplete địa chỉ (gọi API `/api/delivery/autocomplete`)
  - Hiển thị dropdown gợi ý
  - Gọi API tính phí khi chọn địa chỉ (`/api/delivery/calculate`)
  - Hiển thị thông tin zone, khoảng cách, phí ship
  - Tích hợp `ManualLocationPicker` để chọn vị trí trên bản đồ

#### 3. `ManualLocationPicker.jsx` (Chọn vị trí trên bản đồ)
- **Vị trí**: `Frontend/src/components/ManualLocationPicker/ManualLocationPicker.jsx`
- **Chức năng**:
  - Hiển thị bản đồ Mapbox
  - Cho phép kéo thả marker hoặc click để chọn vị trí
  - Tìm kiếm địa chỉ trực tiếp trên Mapbox API
  - Trả về tọa độ (latitude, longitude) khi confirm

#### 4. `DeliveryZoneDisplay.jsx` (Hiển thị các zone)
- **Vị trí**: `Frontend/src/components/DeliveryZoneDisplay/DeliveryZoneDisplay.jsx`
- **Chức năng**: Hiển thị danh sách các zone giao hàng và thông tin (phí, min order, thời gian)

---

### **Backend APIs**

#### 1. `deliveryController.js`
- **Vị trí**: `Backend/controllers/deliveryController.js`
- **Các functions chính**:

##### `geocodeAddress(address)`
- Gọi Mapbox API để chuyển địa chỉ → tọa độ
- Trả về: `{ latitude, longitude, formattedAddress, components }`

##### `reverseGeocodeCoordinates(latitude, longitude)`
- Gọi Mapbox API để chuyển tọa độ → địa chỉ
- Trả về: `{ latitude, longitude, formattedAddress, components }`

##### `calculateHaversineDistance(lat1, lon1, lat2, lon2)`
- Tính khoảng cách giữa 2 điểm (km)
- Sử dụng công thức Haversine

##### `calculateDeliveryFee(req, res)`
- **Endpoint**: `POST /api/delivery/calculate`
- **Input**: `{ address }` hoặc `{ latitude, longitude }`
- **Flow**:
  1. Geocode địa chỉ (nếu có) hoặc reverse geocode tọa độ
  2. Lấy vị trí nhà hàng từ database
  3. Tính khoảng cách bằng Haversine
  4. Tìm zone phù hợp dựa trên khoảng cách (minDistance ≤ distance ≤ maxDistance)
  5. Trả về thông tin zone, phí ship, khoảng cách, thời gian ước tính

##### `autocompleteAddress(req, res)`
- **Endpoint**: `GET /api/delivery/autocomplete?query=...&proximity=lng,lat`
- **Input**: Query string (tối thiểu 3 ký tự)
- **Flow**:
  1. Gọi Mapbox Geocoding API với query
  2. Thêm proximity nếu có (ưu tiên kết quả gần nhà hàng)
  3. Parse và format kết quả
  4. Trả về danh sách gợi ý với tọa độ

##### `getDeliveryZones(req, res)`
- **Endpoint**: `GET /api/delivery/zones`
- Trả về danh sách các zone giao hàng đang active

##### `getRestaurantLocation(req, res)`
- **Endpoint**: `GET /api/delivery/restaurant-location`
- Trả về vị trí nhà hàng (latitude, longitude)

---

## 🔄 Flow Hoạt Động

### **Scenario 1: User nhập địa chỉ mới**

1. **User gõ vào input** (`DeliveryAddressInput`)
   - Debounce 500ms
   - Gọi `GET /api/delivery/autocomplete?query=...`
   - Backend gọi Mapbox API → trả về danh sách gợi ý
   - Frontend hiển thị dropdown

2. **User chọn một địa chỉ**
   - Gọi `POST /api/delivery/calculate` với `{ address: "..." }`
   - Backend:
     - Geocode địa chỉ → lấy tọa độ
     - Lấy vị trí nhà hàng từ DB
     - Tính khoảng cách (Haversine)
     - Tìm zone phù hợp
     - Trả về zone, phí, khoảng cách, thời gian
   - Frontend hiển thị thông tin zone và cập nhật phí ship

### **Scenario 2: User chọn địa chỉ đã lưu**

1. **User đã đăng nhập và có địa chỉ đã lưu**
   - `PlaceOrder` fetch địa chỉ từ `/api/user/addresses`
   - Hiển thị card địa chỉ mặc định
   - Tự động gọi `POST /api/delivery/calculate` với địa chỉ đã lưu
   - Tính phí ship ngay

2. **User chọn địa chỉ khác từ modal**
   - Gọi `POST /api/delivery/calculate` với địa chỉ mới
   - Cập nhật phí ship

### **Scenario 3: User chọn vị trí trên bản đồ**

1. **User click nút "Chọn trên bản đồ"**
   - Mở `ManualLocationPicker`
   - Hiển thị bản đồ Mapbox
   - User kéo marker hoặc click trên bản đồ

2. **User confirm vị trí**
   - Lấy tọa độ (lat, lng)
   - Gọi `POST /api/delivery/calculate` với `{ latitude, longitude }`
   - Backend reverse geocode tọa độ → lấy địa chỉ
   - Tính phí ship như bình thường

---

## 🔑 Environment Variables Cần Thiết

### **Backend (.env)**
```env
MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoi...
```

### **Frontend (.env)**
```env
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoi...
# hoặc
VITE_MAPBOX_TOKEN=pk.eyJ1Ijoi...
```

---

## 📊 Database Models

### **DeliveryZone**
```javascript
{
  name: String,              // Tên zone (ví dụ: "Zone 1", "Zone 2")
  minDistance: Number,       // Khoảng cách tối thiểu (km)
  maxDistance: Number,       // Khoảng cách tối đa (km)
  deliveryFee: Number,       // Phí giao hàng (€)
  minOrder: Number,          // Đơn hàng tối thiểu (€)
  estimatedTime: Number,     // Thời gian ước tính (phút)
  color: String,             // Màu hiển thị
  isActive: Boolean,         // Zone có đang active không
  order: Number              // Thứ tự hiển thị
}
```

### **RestaurantLocation**
```javascript
{
  name: String,              // Tên nhà hàng
  address: String,           // Địa chỉ nhà hàng
  latitude: Number,          // Vĩ độ
  longitude: Number,         // Kinh độ
  isActive: Boolean,         // Có đang active không
  isPrimary: Boolean         // Có phải vị trí chính không
}
```

---

## 🎯 Các API Endpoints

### **Public APIs** (Không cần authentication)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/delivery/zones` | Lấy danh sách zone giao hàng |
| POST | `/api/delivery/calculate` | Tính phí giao hàng |
| GET | `/api/delivery/autocomplete` | Autocomplete địa chỉ |
| GET | `/api/delivery/restaurant-location` | Lấy vị trí nhà hàng |

### **Admin APIs** (Cần authentication)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/delivery/zones/create` | Tạo zone mới |
| PUT | `/api/delivery/zones/:id` | Cập nhật zone |
| DELETE | `/api/delivery/zones/:id` | Xóa zone |
| PUT | `/api/delivery/restaurant-location` | Cập nhật vị trí nhà hàng |

---

## 💰 Cách Tính Phí Giao Hàng

1. **Lấy tọa độ địa chỉ khách hàng**
   - Từ địa chỉ text → geocode → tọa độ
   - Hoặc từ tọa độ trực tiếp

2. **Lấy tọa độ nhà hàng**
   - Từ database (`restaurantLocationModel`)

3. **Tính khoảng cách**
   - Sử dụng công thức Haversine
   - Kết quả: km

4. **Tìm zone phù hợp**
   - Duyệt các zone theo thứ tự `minDistance` tăng dần
   - Tìm zone có: `minDistance ≤ distance ≤ maxDistance`
   - Nếu distance < minDistance của zone đầu tiên → dùng zone đầu tiên
   - Nếu không tìm thấy → trả về lỗi "out of range"

5. **Trả về thông tin**
   - Zone name
   - Delivery fee
   - Min order
   - Estimated time
   - Distance

---

## 📝 Lưu Ý Quan Trọng

1. **Mapbox Token**: Cần có token hợp lệ, nếu không sẽ không hoạt động
2. **Địa chỉ đã lưu**: Khi user chọn địa chỉ đã lưu, hệ thống chỉ gửi địa chỉ text (không có tọa độ), backend sẽ tự geocode
3. **Reverse Geocoding**: Khi user chọn vị trí trên bản đồ, backend sẽ reverse geocode để lấy địa chỉ chính xác
4. **Proximity**: Khi autocomplete, nếu có vị trí nhà hàng, sẽ ưu tiên kết quả gần nhà hàng
5. **Debounce**: Autocomplete có debounce 500ms để tránh gọi API quá nhiều

---

## 🔍 Files Liên Quan

### Frontend
- `Frontend/src/pages/PlaceOrder/PlaceOrder.jsx`
- `Frontend/src/components/DeliveryAddressInput/DeliveryAddressInput.jsx`
- `Frontend/src/components/ManualLocationPicker/ManualLocationPicker.jsx`
- `Frontend/src/components/DeliveryZoneDisplay/DeliveryZoneDisplay.jsx`

### Backend
- `Backend/controllers/deliveryController.js`
- `Backend/routes/deliveryRoute.js`
- `Backend/models/deliveryZoneModel.js`
- `Backend/models/restaurantLocationModel.js`

---

## ✅ Checklist Review Code với PM

- [ ] Xác nhận sử dụng Mapbox API (có phí sau khi hết free tier)
- [ ] Xác nhận logic tính khoảng cách (Haversine - đường thẳng, không phải đường đi thực tế)
- [ ] Xác nhận cách xử lý địa chỉ đã lưu (chỉ có text, không có tọa độ)
- [ ] Xác nhận cách xử lý khi không tìm thấy zone (out of range)
- [ ] Xác nhận cách xử lý khi Mapbox API lỗi
- [ ] Xác nhận cách hiển thị phí ship (€0.00 hoặc FREE)
- [ ] Xác nhận validation địa chỉ trước khi đặt hàng
- [ ] Xác nhận cách lưu địa chỉ vào order (có đầy đủ components: street, city, state, zipcode, country)









