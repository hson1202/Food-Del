import React, { useContext, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'
import CartPopup from '../CartPopup/CartPopup'
import './FloatingCartBtn.css'

const FloatingCartBtn = () => {
  const { cartItems, getTotalCartAmount, isMobileMenuOpen } = useContext(StoreContext)
  const [showCartPopup, setShowCartPopup] = useState(false)
  const location = useLocation()
  
  // Ẩn button khi đang ở trang order
  const isOnOrderPage = location.pathname === '/order'

  const getTotalCartItems = () => {
    let totalItems = 0
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalItems += cartItems[item]
      }
    }
    return totalItems
  }

  const handleCartClick = () => {
    setShowCartPopup(true)
  }

  const closeCartPopup = () => {
    setShowCartPopup(false)
  }

  const formatPrice = (price) => {
    const n = Number(price);
    if (isNaN(n) || n < 0) return '€0';
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(n);
    return formatted.replace(/\.00$/, '');
  }

  // Chỉ hiển thị khi có items trong cart, mobile menu không mở, và không ở trang order
  if (getTotalCartItems() === 0 || isOnOrderPage) {
    return null
  }

  return (
    <>
      <button 
        className={`floating-cart-btn ${showCartPopup ? 'cart-popup-open' : ''}`}
        onClick={handleCartClick}
      >
        <div className="cart-icon">
          🛒
        </div>
        <div className="cart-info">
          <span className="cart-count">{getTotalCartItems()}</span>
          <span className="cart-total">{formatPrice(getTotalCartAmount())}</span>
        </div>
      </button>

      {/* Cart Popup */}
      {showCartPopup && (
        <CartPopup 
          onClose={closeCartPopup}
        />
      )}
    </>
  )
}

export default FloatingCartBtn
