import React, { useContext, useMemo, memo, useCallback } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../Context/StoreContext';
import { useTranslation } from 'react-i18next';
import LazyImage from '../LazyImage/LazyImage';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

/**
 * FoodItem Component - OPTIMIZED VERSION
 * 
 * Improvements:
 * - React.memo để tránh re-render không cần thiết
 * - useMemo cho expensive calculations
 * - useCallback cho event handlers
 * - LazyImage thay vì <img> thông thường
 * - Optimized image URLs
 */
const FoodItem = memo(({
  id, 
  name, 
  nameVI, 
  nameEN, 
  nameSK, 
  price, 
  description, 
  image, 
  sku, 
  isPromotion, 
  originalPrice, 
  promotionPrice, 
  soldCount = 0, 
  likes = 0, 
  options, 
  onViewDetails, 
  compact = false
}) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
  const { i18n, t } = useTranslation();
  
  const currentLanguage = i18n.language;
  
  // Memoize localized name
  const getLocalizedName = useMemo(() => {
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
  }, [currentLanguage, name, nameVI, nameEN, nameSK]);

  // Memoize format price function
  const formatPrice = useCallback((price) => {
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
  }, []);

  // Memoize price calculations
  const { priceDisplay, discount } = useMemo(() => {
    let display = formatPrice(price);
    let discountPercent = 0;

    // Calculate price range for products with options
    if (options && options.length > 0) {
      const prices = [];
      
      const calculatePriceCombinations = () => {
        const combinations = [];
        
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
        
        display = minPrice === maxPrice 
          ? formatPrice(minPrice)
          : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
      }
    }
    
    // Calculate discount
    if (isPromotion && originalPrice && promotionPrice) {
      discountPercent = Math.round(((originalPrice - promotionPrice) / originalPrice) * 100);
    }

    return { priceDisplay: display, discount: discountPercent };
  }, [price, options, isPromotion, originalPrice, promotionPrice, formatPrice]);

  // Memoize optimized image URL
  const imgSrc = useMemo(() => 
    getOptimizedImageUrl(image, url, { 
      width: compact ? 150 : 400,
      quality: 'auto:good'
    }),
    [image, url, compact]
  );

  // Memoize callback handlers
  const handleCardClick = useCallback((e) => {
    if (e.target.closest('.quantity-controls-overlay') || 
        e.target.closest('.food-item-actions')) {
      return;
    }
    
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
  }, [id, name, nameVI, nameEN, nameSK, description, price, image, sku, 
      isPromotion, originalPrice, promotionPrice, soldCount, likes, options, onViewDetails]);

  const handleAddToCart = useCallback((e) => {
    e?.stopPropagation();
    addToCart(id);
  }, [id, addToCart]);

  const handleRemoveFromCart = useCallback((e) => {
    e?.stopPropagation();
    removeFromCart(id);
  }, [id, removeFromCart]);

  const currentPrice = isPromotion && promotionPrice ? promotionPrice : price;

  // Compact view
  if (compact) {
    return (
      <div className="food-item compact" onClick={handleCardClick}>
        <div className="food-row">
          <div className="thumb">
            <LazyImage 
              src={imgSrc}
              alt={getLocalizedName}
              className="food-item-image-compact"
              width="80px"
              height="80px"
            />
          </div>
          <div className="title">{getLocalizedName}</div>
          <div className="price-now">{formatPrice(currentPrice)}</div>
        </div>

        <div className="price-block">
          {isPromotion && promotionPrice ? (
            <>
              <div className="price-old">{formatPrice(originalPrice || price)}</div>
              <div className="price-new">{formatPrice(promotionPrice)}</div>
            </>
          ) : (
            <div className="price">{formatPrice(price)}</div>
          )}
        </div>
      </div>
    );
  }

  // Normal view
  return (
    <div className="food-item" onClick={handleCardClick}>
      <div className="food-item-img-container">
        <LazyImage 
          src={imgSrc}
          alt={getLocalizedName}
          className="food-item-image"
        />
        
        {/* Promotion Badge */}
        {isPromotion && promotionPrice && discount > 0 && (
          <div className="promotion-badge">
            -{discount}%
          </div>
        )}

        {/* Options Badge */}
        {options && options.length > 0 && (
          <div className="options-badge">
            {t('food.customizable')}
          </div>
        )}
      </div>
       
      <div className="food-item-info">  
        <div className="food-item-name">  
          <p>{getLocalizedName}</p>  
        </div>  
        
        {/* Stats */}
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
        
        {/* Pricing */}
        <div className="food-item-pricing">
          {isPromotion && promotionPrice ? (
            <div className="price-container">
              <span className="original-price">{formatPrice(originalPrice || price)}</span>
              <span className="promotion-price">{formatPrice(promotionPrice)}</span>
            </div>
          ) : (
            <span className="price">{priceDisplay}</span>
          )}
        </div>
        
        {/* Cart Controls */}
        <div className="food-item-actions" onClick={(e) => e.stopPropagation()}>
          {!cartItems[id] ? (
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCart}
            >
              {t('food.addToCart')}
            </button>
          ) : (
            <div className="quantity-controls-bottom">
              <button className="qty-btn" onClick={handleRemoveFromCart}>
                <img src={assets.remove_icon_red} alt="" />
              </button>
              <span className="quantity">{cartItems[id]}</span>
              <button className="qty-btn" onClick={handleAddToCart}>
                <img src={assets.add_icon_green} alt="" />
              </button>
            </div>
          )}
        </div>
      </div>  
    </div>
  );
});

FoodItem.displayName = 'FoodItem';

export default FoodItem;

