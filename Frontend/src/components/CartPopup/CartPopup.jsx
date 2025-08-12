import React, { useContext, useState, useEffect } from 'react'
import './CartPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const CartPopup = ({ onClose }) => {
  const { cartItems, food_list, addToCart, removeFromCart, getTotalCartAmount, url } = useContext(StoreContext)
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [recommendedItems, setRecommendedItems] = useState([])

  // Function to get localized name
  const getLocalizedName = (food) => {
    const currentLang = i18n.language;
    switch (currentLang) {
      case 'vi':
        return food.nameVI || food.name;
      case 'en':
        return food.nameEN || food.name;
      case 'sk':
        return food.nameSK || food.name;
      default:
        return food.name;
    }
  };

  const formatPrice = (price) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
    
    return formatted.replace(/\.00$/, '');
  };

  // Get cart items with details
  const getCartItems = () => {
    const items = []
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        const itemInfo = food_list.find((product) => product._id === itemId)
        if (itemInfo) {
          items.push({
            ...itemInfo,
            quantity: cartItems[itemId]
          })
        }
      }
    }
    return items
  }

  // Smart upsale algorithm
  const generateRecommendations = () => {
    const cartItems = getCartItems()
    if (cartItems.length === 0) return []

    const cartCategories = [...new Set(cartItems.map(item => item.category))]
    const cartItemIds = cartItems.map(item => item._id)
    
    // Find complementary items
    const recommendations = food_list.filter(item => {
      // Don't recommend items already in cart
      if (cartItemIds.includes(item._id)) return false
      
      // Recommend from same categories
      if (cartCategories.includes(item.category)) return true
      
      // Smart pairing logic
      if (cartCategories.includes('Noodles') && ['Drinks', 'Appetizers'].includes(item.category)) return true
      if (cartCategories.includes('Main Course') && ['Drinks', 'Desserts'].includes(item.category)) return true
      if (cartCategories.includes('Pizza') && ['Drinks', 'Sides'].includes(item.category)) return true
      
      return false
    })
    .filter(item => item.status === 'active')
    .sort((a, b) => {
      // Prioritize promoted items and popular items
      if (a.isPromotion && !b.isPromotion) return -1
      if (!a.isPromotion && b.isPromotion) return 1
      return (b.soldCount || 0) - (a.soldCount || 0)
    })
    .slice(0, 3) // Limit to 3 recommendations

    return recommendations
  }

  useEffect(() => {
    setRecommendedItems(generateRecommendations())
  }, [cartItems, food_list])

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleCheckout = () => {
    onClose()
    navigate('/order')
  }

  const getTotalItems = () => {
    return Object.values(cartItems).reduce((total, count) => total + count, 0)
  }

  const cartItemsList = getCartItems()

  return (
    <div className="cart-popup-overlay" onClick={handleOverlayClick}>
      <div className="cart-popup-modal">
        <div className="cart-popup-header">
          <h2>
            🛒 {t('cart.title')} 
            <span className="cart-badge">{getTotalItems()}</span>
          </h2>
          <button className="close-btn" onClick={onClose}>
            <img src={assets.cross_icon} alt="Close" />
          </button>
        </div>

        <div className="cart-popup-content">
          {cartItemsList.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-icon">🛒</div>
              <h3>{t('cart.empty')}</h3>
              <p>{t('cart.continueShopping')}</p>
              <button className="continue-btn" onClick={onClose}>
                {t('menu.explore')}
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="cart-items-section">
                <h3>{t('cart.items')} ({cartItemsList.length})</h3>
                <div className="cart-items-list">
                  {cartItemsList.map((item) => (
                    <div key={item._id} className="cart-item">
                      <div className="cart-item-image">
                        <img src={(item.image && item.image.startsWith('http')) ? item.image : (url + "/images/" + item.image)} alt={getLocalizedName(item)} />
                      </div>
                      <div className="cart-item-info">
                        <h4>{getLocalizedName(item)}</h4>
                        <div className="cart-item-price">
                          {item.isPromotion ? (
                            <div className="promotion-pricing">
                              <span className="original-price">{formatPrice(item.originalPrice)}</span>
                              <span className="promotion-price">{formatPrice(item.promotionPrice)}</span>
                            </div>
                          ) : (
                            <span className="regular-price">{formatPrice(item.price)}</span>
                          )}
                        </div>
                      </div>
                      <div className="cart-item-controls">
                        <button onClick={() => removeFromCart(item._id)}>
                          <img src={assets.remove_icon_red} alt="" />
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button onClick={() => addToCart(item._id)}>
                          <img src={assets.add_icon_green} alt="" />
                        </button>
                      </div>
                      <div className="cart-item-total">
                        {formatPrice((item.isPromotion ? item.promotionPrice : item.price) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Items */}
              {recommendedItems.length > 0 && (
                <div className="recommendations-section">
                  <h3>💡 {t('cartPopup.recommendedForYou')}</h3>
                  <p className="recommendations-subtitle">{t('cartPopup.perfectWith')}</p>
                  <div className="recommended-items">
                    {recommendedItems.map((item) => (
                      <div key={item._id} className="recommended-item">
                        <div className="recommended-image">
                          <img src={(item.image && item.image.startsWith('http')) ? item.image : (url + "/images/" + item.image)} alt={getLocalizedName(item)} />
                          {item.isPromotion && (
                            <div className="promo-badge">-{Math.round(((item.originalPrice - item.promotionPrice) / item.originalPrice) * 100)}%</div>
                          )}
                        </div>
                        <div className="recommended-info">
                          <h5>{getLocalizedName(item)}</h5>
                          <div className="recommended-price">
                            {item.isPromotion ? (
                              <>
                                <span className="old-price">{formatPrice(item.originalPrice)}</span>
                                <span className="new-price">{formatPrice(item.promotionPrice)}</span>
                              </>
                            ) : (
                              <span className="price">{formatPrice(item.price)}</span>
                            )}
                          </div>
                          {item.soldCount > 0 && (
                            <div className="popularity">⭐ {item.soldCount}+ {t('productDetail.sold')}</div>
                          )}
                        </div>
                        <button 
                          className="add-recommended-btn"
                          onClick={() => addToCart(item._id)}
                        >
                          +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cart Summary */}
              <div className="cart-summary">
                <div className="summary-row">
                  <span>{t('cart.subtotal')}</span>
                  <span>{formatPrice(getTotalCartAmount())}</span>
                </div>
                <div className="summary-row">
                  <span>{t('cart.delivery')}</span>
                  <span>{formatPrice(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>{t('cart.total')}</span>
                  <span>{formatPrice(getTotalCartAmount() + 2)}</span>
                </div>
                
                <button className="checkout-btn" onClick={handleCheckout}>
                  🚀 {t('cart.checkout')} ({formatPrice(getTotalCartAmount() + 2)})
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CartPopup
