import React, { useContext } from 'react'
import './FoodItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import { useTranslation } from 'react-i18next'

const FoodItem = ({id, name, nameVI, nameEN, nameSK, price, description, image, isPromotion, originalPrice, promotionPrice, soldCount = 0, likes = 0, onViewDetails}) => {
  const {cartItems, addToCart, removeFromCart, url} = useContext(StoreContext);
  const { i18n, t } = useTranslation();
  
  // Function to get the appropriate name based on current language
  const getLocalizedName = () => {
    const currentLang = i18n.language;
    switch (currentLang) {
      case 'vi':
        return nameVI || name;
      case 'en':
        return nameEN || name;
      case 'sk':
        return nameSK || name;
      default:
        return name;
    }
  };
  
  const formatPrice = (price) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
    
    // Remove .00 if it's a whole number
    return formatted.replace(/\.00$/, '');
  };

  const calculateDiscount = () => {
    if (!isPromotion || !originalPrice || !promotionPrice) return 0;
    return Math.round(((originalPrice - promotionPrice) / originalPrice) * 100);
  };

  const handleCardClick = (e) => {
    // Prevent popup when clicking on quantity controls
    if (e.target.closest('.quantity-controls-overlay')) {
      return;
    }
    if (onViewDetails) {
      onViewDetails({ 
        _id: id, 
        name, 
        nameVI, 
        nameEN, 
        nameSK, 
        price, 
        description, 
        image, 
        isPromotion, 
        originalPrice, 
        promotionPrice, 
        soldCount, 
        likes,
        status: 'active',
        language: 'vi',
        sku: id.slice(-8)
      });
    }
  };

  return (
    <div className='food-item' onClick={handleCardClick}>
        <div className="food-item-img-container">
            <img className='food-item-image' src={url+"/images/"+image} alt={getLocalizedName()}/>
            {isPromotion && (
              <div className="promotion-badge">
                -{calculateDiscount()}%
              </div>
            )}

        </div>
      
        <div className="food-item-info">  
          <div className="food-item-name">  
            <p>{getLocalizedName()}</p>  
          </div>  
          
          <div className="food-item-stats">
            {likes > 0 && (
              <div className="stat-item">
                <span className="stat-icon">👍</span>
                <span className="stat-text">{likes}</span>
              </div>
            )}
            {soldCount > 0 && (
              <div className="stat-item">
                <span className="stat-icon">🛒</span>
                <span className="stat-text">{soldCount}+ đã bán</span>
              </div>
            )}
          </div>
          
          <div className="food-item-pricing">
            {isPromotion ? (
              <div className="promotion-pricing">
                <span className="original-price">{formatPrice(originalPrice)}</span>
                <span className="promotion-price">{formatPrice(promotionPrice)}</span>
              </div>
            ) : (
              <span className="regular-price">{formatPrice(price)}</span>
            )}
          </div>

          {/* Bottom quantity controls */}
          <div className="food-item-actions" onClick={(e) => e.stopPropagation()}>
            {!cartItems[id] ? (
              <button 
                className="add-to-cart-btn"
                onClick={() => addToCart(id)}
              >
                 
                {t('food.addToCart')}
              </button>
            ) : (
              <div className="quantity-controls-bottom">
                <button className="qty-btn" onClick={() => removeFromCart(id)}>
                  <img src={assets.remove_icon_red} alt="" />
                </button>
                <span className="quantity">{cartItems[id]}</span>
                <button className="qty-btn" onClick={() => addToCart(id)}>
                  <img src={assets.add_icon_green} alt="" />
                </button>
              </div>
            )}
          </div>
        </div>  
    </div>
  )
}

export default FoodItem;