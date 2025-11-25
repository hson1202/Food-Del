import { useState, useEffect, useContext } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SuccessPopup from '../../components/SuccessPopup/SuccessPopup'
import DeliveryAddressInput from '../../components/DeliveryAddressInput/DeliveryAddressInput'
import DeliveryZoneDisplay from '../../components/DeliveryZoneDisplay/DeliveryZoneDisplay'
import '../../i18n'

const PlaceOrder = () => {
  const { t } = useTranslation();
  const { getTotalCartAmount, token, food_list, cartItems, cartItemsData, url, setCartItems, setToken } = useContext(StoreContext);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    note: "",
    preferredDeliveryTime: ""
  })
  const [orderType, setOrderType] = useState(token ? 'registered' : 'guest'); // Tự động set 'registered' nếu đã login
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState({});
  
  // Delivery state
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [restaurantLocation, setRestaurantLocation] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }))
  }

  // Generate time slots (30-min intervals starting from now)
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const startTime = new Date(now.getTime() + 30 * 60000); // Start from 30 mins later
    
    for (let i = 0; i < 12; i++) { // Generate 12 slots (6 hours)
      const slotTime = new Date(startTime.getTime() + i * 30 * 60000);
      const hours = slotTime.getHours().toString().padStart(2, '0');
      const minutes = slotTime.getMinutes().toString().padStart(2, '0');
      slots.push(`${hours}:${minutes}`);
    }
    
    return slots;
  }

  // Initialize time slots on mount
  useEffect(() => {
    const slots = generateTimeSlots();
    setTimeSlots(slots);
    if (slots.length > 0) {
      setData(prev => ({ ...prev, preferredDeliveryTime: slots[0] }));
    }
  }, []);

  // Simple retry helper for transient errors (e.g., 502/503/network)
  const postWithRetry = async (endpoint, data, options, retries = 2, delayMs = 800) => {
    try {
      return await axios.post(endpoint, data, options)
    } catch (err) {
      const status = err.response?.status
      const isTransient = !status || (status >= 500 && status < 600)
      if (retries > 0 && isTransient) {
        await new Promise(r => setTimeout(r, delayMs))
        return postWithRetry(endpoint, data, options, retries - 1, delayMs * 1.5)
      }
      throw err
    }
  }

  const placeOrder = async (event) => {
    event.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.phone) {
      alert('Please fill in all required fields (Name and Phone)');
      setIsSubmitting(false);
      return;
    }

    // Validate delivery address
    if (!deliveryAddress || !deliveryAddress.address) {
      alert('Please enter a valid delivery address');
      setIsSubmitting(false);
      return;
    }

    // Validate minimum order if delivery info is available
    if (deliveryInfo && deliveryInfo.zone) {
      const subtotal = getTotalCartAmount();
      const minOrder = deliveryInfo.zone.minOrder;
      
      if (subtotal < minOrder) {
        alert(`❌ Minimum order for this delivery zone is €${minOrder.toFixed(2)}. Your current order is €${subtotal.toFixed(2)}. Please add €${(minOrder - subtotal).toFixed(2)} more to proceed.`);
        setIsSubmitting(false);
        return;
      }
    }

    // Phone: chỉ cần có giá trị, chấp nhận ký tự + và các ký tự phổ biến
    
    // Build order items from cart, supporting option-suffixed IDs
    const orderItems = [];
    Object.entries(cartItems).forEach(([cartKey, quantity]) => {
      if (quantity > 0) {
        const actualProductId = cartKey.split('_')[0];
        const baseProduct = food_list.find(p => p._id === actualProductId);
        if (baseProduct) {
          const itemData = cartItemsData[cartKey] || {};
          const itemInfo = {
            ...baseProduct,
            ...itemData,
            quantity
          };
          orderItems.push(itemInfo);
        }
      }
    });

    // Check if cart is empty
    if (orderItems.length === 0) {
      alert('Your cart is empty. Please add some items first.');
      setIsSubmitting(false);
      return;
    }

    // Tạo thông tin khách hàng
    const customerInfo = {
      name: `${data.firstName} ${data.lastName}`,
      phone: data.phone,
      email: data.email || undefined
    };

    // Lấy token từ context hoặc localStorage
    const currentToken = token || localStorage.getItem("token");
    
    const deliveryFee = getDeliveryFee();
    
    let orderData = {
      address: {
        street: deliveryAddress.address,
        houseNumber: deliveryAddress.houseNumber || '',
        city: deliveryAddress.city || '',
        state: deliveryAddress.state || '',
        zipcode: deliveryAddress.zipcode || '',
        country: deliveryAddress.country || '',
        coordinates: deliveryAddress.coordinates
      },
      items: orderItems,
      amount: getTotalCartAmount() + deliveryFee,
      customerInfo: customerInfo,
      orderType: currentToken ? 'registered' : 'guest',
      note: data.note || '',
      preferredDeliveryTime: data.preferredDeliveryTime || '',
      deliveryInfo: deliveryInfo ? {
        zone: deliveryInfo.zone.name,
        distance: deliveryInfo.distance,
        deliveryFee: deliveryInfo.zone.deliveryFee,
        estimatedTime: deliveryInfo.zone.estimatedTime
      } : null
    };

    // KHÔNG gán userId vào orderData - backend sẽ tự động lấy từ token nếu có

    try {
      console.log('Sending order data:', orderData);
      console.log('Token available:', !!currentToken);
      
      let response = await postWithRetry(
        url + "/api/order/place",
        orderData,
        { headers: currentToken ? { token: currentToken } : {} },
        2,
        700
      )

      console.log('Response:', response.data);

      if (response.data.success) {
        const { trackingCode } = response.data;
        
        // Lưu mã tracking vào localStorage để hiển thị sau khi đặt hàng
        if (trackingCode) {
          localStorage.setItem('lastTrackingCode', trackingCode);
          localStorage.setItem('lastPhone', data.phone);
        }
        // Lưu snapshot items để khách xem lại ngay sau khi đặt
        try {
          localStorage.setItem('lastOrderItems', JSON.stringify(orderItems));
        } catch (error) {
          console.error('Error saving last order items:', error);
        }
        
        // Tính toán số tiền trước khi xóa cart
        const finalAmount = getTotalCartAmount() + getDeliveryFee();
        
        // Hiển thị popup thành công
        setOrderSuccessData({
          trackingCode: trackingCode,
          phone: data.phone,
          orderAmount: finalAmount,
          items: orderItems
        });
        
        setShowSuccessPopup(true);
        
        // Không xóa cart ngay lập tức, để popup hiển thị trước
        // Cart sẽ được xóa khi user đóng popup
      } else {
        alert(`❌ Order failed: ${response.data.message || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      
      // Nếu lỗi 401 (Unauthorized) và có token, có thể token đã hết hạn
      // Thử lại như guest order
      if (error.response?.status === 401 && currentToken) {
        console.log('⚠️ Token invalid or expired, retrying as guest order...');
        try {
          // Xóa token khỏi localStorage nếu invalid
          localStorage.removeItem("token");
          setToken("");
          
          // Thử lại như guest order
          const guestOrderData = {
            ...orderData,
            orderType: 'guest'
          };
          
          const retryResponse = await postWithRetry(
            url + "/api/order/place",
            guestOrderData,
            { headers: {} },
            2,
            700
          )
          
          if (retryResponse.data.success) {
            const { trackingCode } = retryResponse.data;
            
            if (trackingCode) {
              localStorage.setItem('lastTrackingCode', trackingCode);
              localStorage.setItem('lastPhone', data.phone);
            }
            try {
              localStorage.setItem('lastOrderItems', JSON.stringify(orderItems));
            } catch (error) {
              console.error('Error saving last order items:', error);
            }
            
            const finalAmount = getTotalCartAmount() + getDeliveryFee();
            
            setOrderSuccessData({
              trackingCode: trackingCode,
              phone: data.phone,
              orderAmount: finalAmount,
              items: orderItems
            });
            
            setShowSuccessPopup(true);
            setIsSubmitting(false);
            return;
          }
        } catch (retryError) {
          console.error('Error retrying as guest:', retryError);
          // Fall through to show error message
        }
      }
      
      let errorMessage = 'An error occurred while placing your order.';
      
      if (error.response) {
        // Server responded with error
        console.log('Error response:', error.response.data);
        errorMessage = error.response.data.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error: Unable to connect to server. Please check your internet connection.';
      } else {
        // Other error
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const navigate = useNavigate();

  // Fetch restaurant location
  useEffect(() => {
    const fetchRestaurantLocation = async () => {
      try {
        const response = await axios.get(`${url}/api/delivery/restaurant-location`);
        if (response.data.success && response.data.data) {
          setRestaurantLocation(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching restaurant location:', error);
      }
    };
    fetchRestaurantLocation();
  }, [url]);

  // Calculate delivery fee
  const getDeliveryFee = () => {
    if (getTotalCartAmount() === 0) return 0;
    if (deliveryInfo && deliveryInfo.zone) {
      return deliveryInfo.zone.deliveryFee;
    }
    return 0;
  };

  // Handle delivery calculation
  const handleDeliveryCalculated = (info) => {
    setDeliveryInfo(info);
  };

  // Handle delivery address change
  const handleDeliveryAddressChange = (addressData) => {
    setDeliveryAddress((prev) => ({
      ...(prev || {}),
      ...addressData
    }));
  };

  const handleHouseNumberChange = (e) => {
    const value = e.target.value;
    setDeliveryAddress((prev) => ({
      ...(prev || {}),
      houseNumber: value
    }));
  };

  useEffect(() => {
    if (getTotalCartAmount() === 0 && !showSuccessPopup) {
      navigate('/')
    }
  }, [getTotalCartAmount, navigate, showSuccessPopup])

  // Auto-focus first input on mobile
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      const firstInput = document.querySelector('.place-order input');
      if (firstInput) {
        firstInput.focus();
      }
    }
  }, []);



  
  return (
    <>
      <form onSubmit={placeOrder} className="place-order">
        <div className="place-order-left">
          <p className="title">{t('placeOrder.title')}</p>
          
                    {/* Order Type Selection - Chỉ hiển thị khi chưa login */}
          {!token && (
            <div className="order-type-section">
              <h3>{t('placeOrder.orderType.title')}</h3>
              <div className="order-type-options">
                <label className="order-type-option">
                  <input
                    type="radio"
                    name="orderType"
                    value="guest"
                    checked={orderType === 'guest'}
                    onChange={(e) => setOrderType(e.target.value)}
                  />
                  <span>{t('placeOrder.orderType.guest')}</span>
                </label>
              </div>
            </div>
          )}

          <div className="multi-fields">
            <input 
              required 
              name='firstName' 
              onChange={onChangeHandler} 
              value={data.firstName} 
              type="text" 
              placeholder={t('placeOrder.form.firstName')}
              autoComplete="given-name"
            />
            <input 
              required 
              name='lastName' 
              onChange={onChangeHandler} 
              value={data.lastName} 
              type="text" 
              placeholder={t('placeOrder.form.lastName')}
              autoComplete="family-name"
            />
          </div>
          <input 
            name='email' 
            onChange={onChangeHandler} 
            value={data.email} 
            type="email" 
            placeholder={t('placeOrder.form.email')}
            autoComplete="email"
          />
          <input 
            required 
            name='phone' 
            onChange={onChangeHandler} 
            value={data.phone} 
            type="tel" 
            placeholder={t('placeOrder.form.phone')}
            title="Phone number"
            autoComplete="tel"
            maxLength="25"
          />
          
          {/* Delivery Address with Mapbox */}
          <div className="delivery-address-section">
              <label className="delivery-label">{t('placeOrder.form.addressLabel')}</label>
            <DeliveryAddressInput
              value={deliveryAddress?.address || ''}
              onChange={handleDeliveryAddressChange}
              onDeliveryCalculated={handleDeliveryCalculated}
              url={url}
              restaurantLocation={restaurantLocation}
            />
            <div className="house-number-field">
              <label>{t('placeOrder.form.houseNumberLabel')}</label>
              <input
                type="text"
                placeholder={t('placeOrder.form.houseNumberPlaceholder')}
                value={deliveryAddress?.houseNumber || ''}
                onChange={handleHouseNumberChange}
              />
              <p className="house-helper">{t('placeOrder.form.houseNumberHint')}</p>
              {!deliveryAddress?.houseNumber && deliveryAddress?.address && !/\d/.test(deliveryAddress.address) && (
                <div className="house-warning">
                  ⚠️ {t('placeOrder.form.houseNumberMapboxMissing')}
                </div>
              )}
            </div>
          </div>

          {/* Delivery Time Slot */}
          <div className="delivery-time-section">
            <label className="delivery-label">🕐 Preferred Delivery Time</label>
            <select
              name='preferredDeliveryTime'
              onChange={onChangeHandler}
              value={data.preferredDeliveryTime}
              className="time-slot-select"
            >
              {timeSlots.map((slot, index) => (
                <option key={index} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Note */}
          <div className="note-section">
            <label className="delivery-label">📝 Note for delivery (Optional)</label>
            <textarea
              name='note'
              onChange={onChangeHandler}
              value={data.note}
              placeholder="E.g., Ring the bell, leave at door, etc."
              className="note-textarea"
              rows="3"
            />
          </div>

          {/* Delivery Zones Info */}
          <DeliveryZoneDisplay url={url} />
          
          {/* Thông báo về dò đơn hàng */}
          <div className="tracking-notice">
            <p>💡 <strong>{t('placeOrder.notice.title')}:</strong> {t('placeOrder.notice.message')}</p>
          </div>
          
          {/* Mobile-friendly submit button for form */}
          <div className="mobile-submit-section">
            <button 
              type='submit' 
              className="mobile-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('placeOrder.cart.submitting') : t('placeOrder.cart.proceedButton')}
            </button>
          </div>
        </div>
        
        <div className="place-order-right">
          <div className="cart-total">
            <h2>{t('placeOrder.cart.title')}</h2>
            <div>
              <div className='cart-total-details'>
                <p>{t('placeOrder.cart.subtotal')}</p>
                <p>€{getTotalCartAmount()}</p>
              </div>
              <hr />
              <div className='cart-total-details'>
                <p>{t('placeOrder.cart.deliveryFee')}</p>
                <p>
                  {deliveryInfo && deliveryInfo.zone
                    ? `€${getDeliveryFee().toFixed(2)}`
                    : '--'}
                </p>
              </div>
              {!deliveryInfo && (
                <div className="min-order-warning">
                  🔔 {t('placeOrder.cart.deliveryFeePrompt')}
                </div>
              )}
              {deliveryInfo && deliveryInfo.zone && (
                <>
                  <div className='cart-total-details delivery-zone-info'>
                    <span className="zone-badge" style={{ color: deliveryInfo.zone.color }}>
                      {deliveryInfo.zone.name} • {deliveryInfo.distance}km • {deliveryInfo.zone.estimatedTime}min
                    </span>
                  </div>
                  {getTotalCartAmount() < deliveryInfo.zone.minOrder && (
                    <div className="min-order-warning">
                      ⚠️ Min. order: €{deliveryInfo.zone.minOrder} (Add €{(deliveryInfo.zone.minOrder - getTotalCartAmount()).toFixed(2)} more)
                    </div>
                  )}
                </>
              )}
              <hr />
              <div className='cart-total-details'>
                <b>{t('placeOrder.cart.total')}</b>
                <b>€{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + getDeliveryFee()}</b>
              </div>
            </div>
            <button type='submit' disabled={isSubmitting}>
              {isSubmitting ? t('placeOrder.cart.submitting') : t('placeOrder.cart.proceedButton')}
            </button>
          </div>
        </div>
      </form>
      
      {/* Success Popup */}
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        trackingCode={orderSuccessData.trackingCode}
        phone={orderSuccessData.phone}
        orderAmount={orderSuccessData.orderAmount}
        items={orderSuccessData.items}
        setCartItems={setCartItems}
      />
    </>
  );
};

export default PlaceOrder;