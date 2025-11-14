# 🚀 Quick Start - Delivery Distance Feature

## 5-Minute Setup

### 1. Get Mapbox Token (1 min)
```
1. Visit: https://account.mapbox.com/auth/signup
2. Sign up (FREE)
3. Copy your access token
```

### 2. Configure Backend (2 min)
```bash
# Backend/.env
MAPBOX_ACCESS_TOKEN=pk.your_token_here
```

### 3. Seed Default Data (1 min)
```bash
cd Backend
node scripts/seedDeliveryZones.js
npm run dev
```

### 4. Configure Restaurant (1 min)
```
1. Open: http://localhost:5174/admin/delivery-zones
2. Click "Edit Location"
3. Enter your restaurant coordinates
4. Save
```

### 5. Test on Frontend
```
1. Open: http://localhost:3000/order
2. Add items to cart
3. Enter delivery address
4. See automatic fee calculation! 🎉
```

---

## What You Get

✅ **FREE** 100,000 requests/month from Mapbox  
✅ Automatic address autocomplete  
✅ Distance-based delivery fees  
✅ Minimum order validation  
✅ Admin panel to manage zones  
✅ Beautiful UI components  

---

## Default Zones Created

| Zone | Distance | Fee | Min Order | Time |
|------|----------|-----|-----------|------|
| 1-3 Km | 1-3 km | FREE | €8 | 25 min |
| 3-5 Km | 3-5 km | €2 | €9 | 30 min |
| 5-7 Km | 5-7 km | €3 | €10 | 40 min |
| 7-12 Km | 7-12 km | €3.5 | €10 | 45 min |

Edit these in Admin Panel!

---

## Key Files Created

### Backend:
- `models/deliveryZoneModel.js` - Delivery zones database model
- `models/restaurantLocationModel.js` - Restaurant location model
- `controllers/deliveryController.js` - Main delivery logic
- `routes/deliveryRoute.js` - API routes
- `scripts/seedDeliveryZones.js` - Seed default data

### Frontend:
- `components/DeliveryAddressInput/` - Address autocomplete component
- `components/DeliveryZoneDisplay/` - Display delivery zones
- `pages/PlaceOrder/PlaceOrder.jsx` - Updated checkout with delivery

### Admin:
- `pages/DeliveryZones/` - Admin management panel

---

## Need Help?

📖 Full documentation: `MAPBOX_DELIVERY_SETUP.md`

🐛 Troubleshooting:
- Token not working? Check `.env` and restart server
- No zones? Run `node scripts/seedDeliveryZones.js`
- Location not set? Go to Admin → Delivery Zones → Edit Location

---

**That's it! Enjoy your delivery system! 🚚**

