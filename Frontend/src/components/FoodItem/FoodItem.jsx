import React, { useContext } from 'react'
import './FoodItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import { useTranslation } from 'react-i18next'
import { isFoodAvailable, getAvailabilityStatus } from '../../utils/timeUtils'

const FoodItem = ({id, name, nameVI, nameEN, nameSK, price, description, image, sku, isPromotion, originalPrice, promotionPrice, soldCount = 0, likes = 0, options, onViewDetails, compact = false, availableFrom, availableTo, dailyAvailability}) => {
  const {cartItems, addToCart, removeFromCart, url} = useContext(StoreContext);
  const { i18n, t } = useTranslation();
  
  const currentLanguage = i18n.language;
  
  // Check food availability
  const foodData = { availableFrom, availableTo, dailyAvailability };
  const isAvailable = isFoodAvailable(foodData);
  const availabilityInfo = getAvailabilityStatus(foodData, currentLanguage);
  
  // Function to get the appropriate name based on current language
  const getLocalizedName = () => {
    switch (currentLanguage) {
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
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      return '€0';
    }
    
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Number(price));
    
    return formatted.replace(/\.00$/, '');
  };

  // Calculate price range for products with options
  const getPriceDisplay = () => {
    if (options && options.length > 0) {
      const prices = [];
      
      // Calculate all possible price combinations
      const calculatePriceCombinations = () => {
        const combinations = [];
        
        // Helper function to generate all combinations
        const generateCombinations = (currentOptions, optionIndex) => {
          if (optionIndex === options.length) {
            combinations.push([...currentOptions]);
            return;
          }
          
          const option = options[optionIndex];
          option.choices.forEach(choice => {
            currentOptions[optionIndex] = { option, choice };
            generateCombinations(currentOptions, optionIndex + 1);
          });
        };
        
        generateCombinations(new Array(options.length), 0);
        return combinations;
      };
      
      const combinations = calculatePriceCombinations();
      
      combinations.forEach(combination => {
        let totalPrice = price || 0;
        
        combination.forEach(({ option, choice }) => {
          if (option.pricingMode === 'override') {
            totalPrice = choice.price;
          } else if (option.pricingMode === 'add') {
            totalPrice += choice.price;
          }
        });
        
        prices.push(totalPrice);
      });
      
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        if (minPrice === maxPrice) {
          return formatPrice(minPrice);
        } else {
          return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
        }
      }
    }
    
    // Fallback to regular price display
    if (isPromotion && promotionPrice) {
      return (
        <div className="price-container">
          <span className="original-price">{formatPrice(originalPrice)}</span>
          <span className="promotion-price">{formatPrice(promotionPrice)}</span>
        </div>
      );
    }
    
    return formatPrice(price);
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
    
    // Debug: Log options data
    console.log('🔍 FoodItem - Options data:', options)
    
    onViewDetails({
      _id: id,
      name, 
      nameVI, 
      nameEN, 
      nameSK,
      description, 
      price, 
      image, 
      sku,
      isPromotion, 
      originalPrice, 
      promotionPrice, 
      soldCount, 
      likes,
      options,
      status: 'active',
      language: 'vi'
    });
  };

  // Build image src
  const imgSrc =
    image && image.startsWith('http')
      ? image
      : image
        ? (url + "/images/" + image)
        : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjkwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iOTAiIGZpbGw9IiNmNWY1ZjUiLz48L3N2Zz4=';

  const currentPrice = isPromotion && promotionPrice ? promotionPrice : price;

  if (compact) {
    return (
      <div className="food-item compact" onClick={handleCardClick}>
        <div className="food-row">
          <div className="thumb">
            <img src={imgSrc} alt={getLocalizedName()} loading="lazy" decoding="async" />
          </div>
          <div className="title-section">
            <div className="title">{getLocalizedName()}</div>
            {description && (
              <div className="title-description">{description}</div>
            )}
            <div className="price-now">{getPriceDisplay()}</div>
          </div>
          <div className="compact-controls" onClick={(e) => e.stopPropagation()}>
            {!cartItems[id] ? (
              <button 
                className="add-compact"
                aria-label={t('food.addToCart')}
                onClick={() => addToCart(id)}
              >
                +
              </button>
            ) : (
              <div className="qty-compact">
                <button className="qty-btn-small" onClick={() => removeFromCart(id)} aria-label={t('food.decrease')}>
                  −
                </button>
                <span className="quantity-small">{cartItems[id]}</span>
                <button className="qty-btn-small" onClick={() => addToCart(id)} aria-label={t('food.increase')}>
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="food-item" onClick={handleCardClick}>
      <div className="food-item-img-container">
        <img 
          src={imgSrc}
          alt={getLocalizedName()}
          className="food-item-image"
          loading="lazy"
          decoding="async"
        />
        
        {/* Promotion Badge */}
        {isPromotion && promotionPrice && (
          <div className="promotion-badge">
            -{calculateDiscount()}%
          </div>
        )}

        {/* Options Badge */}
        {options && options.length > 0 && (
          <div className="options-badge">
            {t('food.customizable')}
          </div>
        )}

        {/* Time Availability Badge */}
        {(availableFrom || availableTo || dailyAvailability?.enabled) && (
          <div className={`time-badge ${isAvailable ? 'available' : 'unavailable'}`}>
            <span className="time-icon">⏰</span>
            {availabilityInfo.timeInfo && (
              <span className="time-text">{availabilityInfo.timeInfo}</span>
            )}
          </div>
        )}

        {/* Unavailable Overlay */}
        {!isAvailable && (
          <div className="unavailable-overlay">
            <span className="unavailable-text">{availabilityInfo.message}</span>
          </div>
        )}
      </div>
       
      <div className="food-item-info">  
        <div className="food-item-name">  
          <p>{getLocalizedName()}</p>  
        </div>  
        
        {description && (
          <div className="food-item-description">
            <p>{description}</p>
          </div>
        )}
        
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
              <span className="stat-text">{soldCount}+ {t('food.sold')}</span>
            </div>
          )}
        </div>
        
        <div className="food-item-pricing">
          {getPriceDisplay()}
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

export default FoodItem