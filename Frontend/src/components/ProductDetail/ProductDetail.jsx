import React, { useContext } from 'react'
import './ProductDetail.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import { useTranslation } from 'react-i18next'

const ProductDetail = ({ product, onClose }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext)
  const { t, i18n } = useTranslation()

  if (!product) return null

  // Function to get the appropriate name based on current language
  const getLocalizedName = () => {
    const currentLang = i18n.language;
    switch (currentLang) {
      case 'vi':
        return product.nameVI || product.name;
      case 'en':
        return product.nameEN || product.name;
      case 'sk':
        return product.nameSK || product.name;
      default:
        return product.name;
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
    if (!product.isPromotion || !product.originalPrice || !product.promotionPrice) return 0;
    return Math.round(((product.originalPrice - product.promotionPrice) / product.originalPrice) * 100);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="product-detail-overlay" onClick={handleOverlayClick}>
      <div className="product-detail-modal">
        <button className="close-btn" onClick={onClose}>
          <img src={assets.cross_icon} alt="Close" />
        </button>

        <div className="product-detail-content">
          <div className="product-detail-image">
            <img 
              src={
                product.image && product.image.startsWith('http') 
                  ? product.image 
                  : product.image 
                    ? (url + "/images/" + product.image) 
                    : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn42dIE5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
              }
              alt={getLocalizedName()}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5qrIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                e.target.onerror = null;
              }}
            />
            {product.isPromotion && (
              <div className="promotion-badge">
                -{calculateDiscount()}% {t('food.promotion')}
              </div>
            )}
          </div>

          <div className="product-detail-info">
            <div className="product-header">
              <h2>{getLocalizedName()}</h2>
              <div className="product-sku">
                SKU: <span className="sku">{product.sku || 'N/A'}</span>
              </div>
            </div>

          

            <div className="product-description">
              <p>{product.description || t('productDetail.noDescription')}</p>
            </div>

            <div className="product-stats">
              {product.likes > 0 && (
                <div className="stat-item">
                  <span className="stat-icon">👍</span>
                  <span className="stat-text">{product.likes} {t('productDetail.likes')}</span>
                </div>
              )}
              {product.soldCount > 0 && (
                <div className="stat-item">
                  <span className="stat-icon">🛒</span>
                  <span className="stat-text">{product.soldCount}+ {t('productDetail.sold')}</span>
                </div>
              )}
            </div>

            <div className="product-pricing">
              {product.isPromotion ? (
                <div className="promotion-pricing">
                  <div className="price-row">
                    <span className="label">{t('food.originalPrice')}:</span>
                    <span className="original-price">{formatPrice(product.originalPrice)}</span>
                  </div>
                  <div className="price-row main-price">
                    <span className="label">{t('food.promotionPrice')}:</span>
                    <span className="promotion-price">{formatPrice(product.promotionPrice)}</span>
                  </div>
                  <div className="savings">
                    {t('productDetail.youSave')}: {formatPrice(product.originalPrice - product.promotionPrice)}
                  </div>
                </div>
              ) : (
                <div className="regular-pricing">
                  <div className="price-row main-price">
                    <span className="label">{t('common.price')}:</span>
                    <span className="regular-price">{formatPrice(product.price)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="product-actions">
              <div className="quantity-control">
                {!cartItems[product._id] ? (
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product._id)}
                  >
                     
                    {t('food.addToCart')}
                  </button>
                ) : (
                  <div className="quantity-controls">
                    <button 
                      className="qty-btn decrease"
                      onClick={() => removeFromCart(product._id)}
                    >
                      <img src={assets.remove_icon_red} alt="" />
                    </button>
                    <span className="quantity">{cartItems[product._id]}</span>
                    <button 
                      className="qty-btn increase"
                      onClick={() => addToCart(product._id)}
                    >
                      <img src={assets.add_icon_green} alt="" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Additional product information */}
            <div className="product-additional-info">
              <div className="info-section">
                <h4>{t('productDetail.additionalInfo')}</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">{t('productDetail.status')}:</span>
                    <span className={`info-value status-${product.status}`}>
                      {product.status === 'active' ? t('productDetail.available') : t('productDetail.unavailable')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
