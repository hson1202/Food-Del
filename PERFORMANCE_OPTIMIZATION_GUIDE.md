# 🚀 Hướng Dẫn Tối Ưu Hiệu Suất - Làm Mượt Cuộn & Load Nhanh

## 📋 Mục Lục
1. [Vấn Đề Hiện Tại](#vấn-đề-hiện-tại)
2. [Giải Pháp Tổng Thể](#giải-pháp-tổng-thể)
3. [Image Optimization](#1-image-optimization)
4. [Lazy Loading & Virtual Scrolling](#2-lazy-loading--virtual-scrolling)
5. [Data Fetching Optimization](#3-data-fetching-optimization)
6. [Skeleton Loading](#4-skeleton-loading)
7. [React Performance](#5-react-performance)
8. [Implementation Steps](#implementation-steps)

---

## Vấn Đề Hiện Tại

### Tại Sao Lag Khi Cuộn?
1. ❌ **Tải tất cả hình ảnh cùng lúc** (không lazy load)
2. ❌ **Fetch toàn bộ sản phẩm** (noPagination=true)
3. ❌ **Không có loading state** cho hình ảnh
4. ❌ **Không optimize kích thước ảnh** (full resolution)
5. ❌ **Re-render không cần thiết** trong React
6. ❌ **Không cache data** đã load

### Cách Các Website Lớn Giải Quyết

**Shopee/Lazada/Amazon:**
- ✅ Lazy load images (chỉ load ảnh khi scroll gần)
- ✅ Intersection Observer API
- ✅ Blur placeholder hoặc skeleton
- ✅ WebP format + responsive images
- ✅ Virtual scrolling (chỉ render items trong viewport)
- ✅ Infinite scroll với pagination
- ✅ Image CDN (Cloudinary) với transform
- ✅ Debounce scroll events
- ✅ React.memo & useMemo
- ✅ Prefetch data khi hover

---

## Giải Pháp Tổng Thể

### Architecture Overview
```
┌─────────────────────────────────────────┐
│  User Scrolls Down                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Intersection Observer                   │
│  (Detect items entering viewport)        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Lazy Load Images                        │
│  (Show blur → Load actual image)         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Fetch More Data (if needed)            │
│  (Infinite scroll pagination)            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Virtual Scrolling (Optional)            │
│  (Only render visible items)             │
└─────────────────────────────────────────┘
```

---

## 1. Image Optimization

### 1.1 LazyImage Component (Quan Trọng Nhất!)

Tạo component này để thay thế tất cả `<img>` tags:

**File: `Frontend/src/components/LazyImage/LazyImage.jsx`**
```jsx
import React, { useState, useEffect, useRef } from 'react';
import './LazyImage.css';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  style = {},
  onError,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjkwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iOTAiIGZpbGw9IiNmNWY1ZjUiLz48L3N2Zz4='
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Intersection Observer để detect khi ảnh vào viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect(); // Chỉ load 1 lần
          }
        });
      },
      {
        rootMargin: '50px', // Load trước 50px (tối ưu UX)
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isInView && src) {
      // Preload image
      const img = new Image();
      img.src = src;
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      
      img.onerror = (e) => {
        if (onError) onError(e);
      };
    }
  }, [isInView, src, onError]);

  return (
    <div 
      ref={imgRef} 
      className={`lazy-image-wrapper ${className}`}
      style={{ width, height, ...style }}
    >
      <img
        src={imageSrc}
        alt={alt}
        className={`lazy-image ${isLoaded ? 'loaded' : 'loading'}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {!isLoaded && <div className="lazy-image-spinner"></div>}
    </div>
  );
};

export default LazyImage;
```

**File: `Frontend/src/components/LazyImage/LazyImage.css`**
```css
.lazy-image-wrapper {
  position: relative;
  overflow: hidden;
  background-color: #f5f5f5;
}

.lazy-image {
  transition: opacity 0.3s ease-in-out, filter 0.3s ease-in-out;
  display: block;
}

.lazy-image.loading {
  opacity: 0.7;
  filter: blur(10px);
}

.lazy-image.loaded {
  opacity: 1;
  filter: blur(0);
}

.lazy-image-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ff6b6b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}
```

### 1.2 Cloudinary Image Optimization

Nếu dùng Cloudinary, thêm transform params:

**File: `Frontend/src/utils/imageUtils.js`**
```javascript
/**
 * Optimize Cloudinary image URL
 * @param {string} url - Original image URL
 * @param {object} options - Transform options
 * @returns {string} - Optimized URL
 */
export const optimizeCloudinaryImage = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width = 400,
    quality = 'auto',
    format = 'auto'
  } = options;

  // Insert transformation params before '/upload/'
  const transformParams = `w_${width},q_${quality},f_${format},c_fill`;
  return url.replace('/upload/', `/upload/${transformParams}/`);
};

/**
 * Get image URL with proper optimization
 * @param {string} image - Image path/URL
 * @param {string} backendUrl - Backend URL
 * @param {object} options - Transform options
 */
export const getOptimizedImageUrl = (image, backendUrl, options = {}) => {
  if (!image) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjkwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iOTAiIGZpbGw9IiNmNWY1ZjUiLz48L3N2Zz4=';
  }

  if (image.startsWith('http')) {
    return optimizeCloudinaryImage(image, options);
  }

  return `${backendUrl}/images/${image}`;
};
```

---

## 2. Lazy Loading & Virtual Scrolling

### 2.1 Infinite Scroll Component

**File: `Frontend/src/components/InfiniteScroll/InfiniteScroll.jsx`**
```jsx
import React, { useEffect, useRef, useCallback } from 'react';

const InfiniteScroll = ({ 
  onLoadMore, 
  hasMore, 
  isLoading, 
  threshold = 200,
  children 
}) => {
  const observerRef = useRef(null);
  const loadingRef = useRef(null);

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: `${threshold}px`,
      threshold: 0.1
    });

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [handleObserver, threshold]);

  return (
    <>
      {children}
      <div ref={loadingRef} style={{ height: '20px' }}>
        {isLoading && hasMore && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div className="loading-spinner">Đang tải...</div>
          </div>
        )}
      </div>
    </>
  );
};

export default InfiniteScroll;
```

---

## 3. Data Fetching Optimization

### 3.1 Update Backend Controller - Enable Pagination

**File: `Backend/controllers/foodController.js`**

Thêm vào hoặc update:
```javascript
// Get list with pagination
const listFood = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            category, 
            status,
            noPagination = false,
            forUser = false
        } = req.query;

        // Build query
        let query = {};
        
        if (forUser) {
            query.status = 'active';
        } else if (status) {
            query.status = status;
        }
        
        if (category && category !== 'All') {
            query.category = category;
        }

        // No pagination - return all (for frontend filtering)
        if (noPagination === 'true') {
            const foods = await foodModel.find(query)
                .sort({ createdAt: -1 })
                .lean(); // Use lean() for better performance
            
            return res.json({ 
                success: true, 
                data: foods,
                count: foods.length
            });
        }

        // With pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [foods, totalCount] = await Promise.all([
            foodModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            foodModel.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalCount / limitNum);

        res.json({ 
            success: true, 
            data: foods,
            pagination: {
                page: pageNum,
                limit: limitNum,
                totalPages,
                totalCount,
                hasMore: pageNum < totalPages
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};
```

### 3.2 Update StoreContext with Improved Fetching

**File: `Frontend/src/Context/StoreContext.jsx`**

Update `fetchFoodList`:
```javascript
const fetchFoodList = async (page = 1, append = false, filterOptions = {}) => {
    setIsLoadingFood(true);
    try {
        const params = new URLSearchParams({
            forUser: 'true',
            page: page.toString(),
            limit: '20', // Load 20 items at a time
            ...filterOptions
        });

        const response = await axios.get(`${url}/api/food/list?${params.toString()}`);
        
        if (append) {
            setFoodList(prev => [...prev, ...(response.data.data || [])]);
        } else {
            setFoodList(response.data.data || []);
        }
        
        setFoodPagination(response.data.pagination || null);
    } catch (error) {
        console.error('Error fetching food list:', error);
        setFoodList([]);
    } finally {
        setIsLoadingFood(false);
    }
};
```

---

## 4. Skeleton Loading

### 4.1 Skeleton Component

**File: `Frontend/src/components/Skeleton/Skeleton.jsx`**
```jsx
import React from 'react';
import './Skeleton.css';

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-price"></div>
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 8 }) => (
  <div className="skeleton-grid">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);
```

**File: `Frontend/src/components/Skeleton/Skeleton.css`**
```css
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.skeleton-image {
  width: 100%;
  height: 200px;
}

.skeleton-content {
  padding: 15px;
}

.skeleton-title {
  height: 20px;
  margin-bottom: 10px;
  width: 80%;
}

.skeleton-text {
  height: 14px;
  margin-bottom: 10px;
  width: 100%;
}

.skeleton-price {
  height: 18px;
  width: 60%;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
}
```

---

## 5. React Performance

### 5.1 Memoize FoodItem Component

**Update: `Frontend/src/components/FoodItem/FoodItem.jsx`**
```jsx
import React, { useContext, useMemo, memo } from 'react';
import LazyImage from '../LazyImage/LazyImage';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

const FoodItem = memo(({ 
  id, name, nameVI, nameEN, nameSK, price, description, image, 
  sku, isPromotion, originalPrice, promotionPrice, soldCount = 0, 
  likes = 0, options, onViewDetails, compact = false 
}) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
  const { i18n, t } = useTranslation();

  // Memoize expensive calculations
  const imgSrc = useMemo(() => 
    getOptimizedImageUrl(image, url, { width: 400 }),
    [image, url]
  );

  const localizedName = useMemo(() => {
    switch (i18n.language) {
      case 'vi': return nameVI || name;
      case 'en': return nameEN || name;
      case 'sk': return nameSK || name;
      default: return name;
    }
  }, [i18n.language, name, nameVI, nameEN, nameSK]);

  // Memoize callbacks
  const handleCardClick = useCallback((e) => {
    if (e.target.closest('.quantity-controls-overlay')) return;
    onViewDetails({
      _id: id, name, nameVI, nameEN, nameSK, description, 
      price, image, sku, isPromotion, originalPrice, 
      promotionPrice, soldCount, likes, options
    });
  }, [id, name, nameVI, nameEN, nameSK, description, price, image, sku, 
      isPromotion, originalPrice, promotionPrice, soldCount, likes, options, onViewDetails]);

  return (
    <div className="food-item" onClick={handleCardClick}>
      <div className="food-item-img-container">
        <LazyImage 
          src={imgSrc}
          alt={localizedName}
          className="food-item-image"
        />
        {/* Rest of component... */}
      </div>
    </div>
  );
});

FoodItem.displayName = 'FoodItem';

export default FoodItem;
```

### 5.2 Debounce Scroll & Search

**File: `Frontend/src/hooks/useDebounce.js`**
```javascript
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

---

## Implementation Steps

### Phase 1: Quick Wins (1-2 giờ) ⚡
1. ✅ Thêm `loading="lazy"` cho tất cả images
2. ✅ Enable pagination trong API (đổi noPagination=false)
3. ✅ Thêm Skeleton loading
4. ✅ Optimize Cloudinary URLs

### Phase 2: Core Optimization (3-4 giờ) 🎯
1. ✅ Implement LazyImage component
2. ✅ Replace tất cả `<img>` với `<LazyImage>`
3. ✅ Add InfiniteScroll component
4. ✅ Memoize FoodItem với React.memo

### Phase 3: Advanced (4-6 giờ) 🚀
1. ✅ Implement Virtual Scrolling (nếu có > 100 items)
2. ✅ Add image prefetching on hover
3. ✅ Implement service worker caching
4. ✅ Add requestIdleCallback for non-critical tasks

---

## Testing Performance

### Before & After Metrics

Sử dụng Chrome DevTools:

```javascript
// Test script - paste vào Console
console.time('Page Load');
window.addEventListener('load', () => {
  console.timeEnd('Page Load');
  
  // Measure paint metrics
  const perfData = performance.getEntriesByType('paint');
  console.table(perfData);
  
  // Measure images
  const images = document.querySelectorAll('img');
  console.log(`Total images: ${images.length}`);
  
  // Check if images are lazy loaded
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  console.log(`Lazy loaded: ${lazyImages.length}`);
});
```

### Target Metrics
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.5s
- **Total Blocking Time (TBT):** < 300ms
- **Cumulative Layout Shift (CLS):** < 0.1

---

## Additional Tips

### 1. Image Best Practices
```javascript
// Use responsive images
<img 
  srcSet={`
    ${url}/images/small/${image} 400w,
    ${url}/images/medium/${image} 800w,
    ${url}/images/large/${image} 1200w
  `}
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  src={`${url}/images/medium/${image}`}
  alt={name}
  loading="lazy"
/>
```

### 2. Preload Critical Images
```html
<!-- Trong index.html -->
<link rel="preload" as="image" href="/hero-image.webp" />
```

### 3. Use WebP Format
```javascript
// Backend - Convert to WebP when uploading
const sharp = require('sharp');

await sharp(inputPath)
  .webp({ quality: 80 })
  .toFile(outputPath);
```

### 4. Add will-change for Smooth Animations
```css
.food-item {
  will-change: transform;
  transform: translateZ(0); /* Force GPU acceleration */
}

.food-item:hover {
  transform: translateY(-4px) translateZ(0);
}
```

---

## Troubleshooting

### Issue: Images still load slowly
**Solution:** Check Cloudinary transformations, reduce image quality

### Issue: Scroll still janky
**Solution:** Check if you have heavy JavaScript in scroll events, use passive listeners

### Issue: Memory leaks
**Solution:** Clean up observers in useEffect cleanup

---

## Resources & References

- [Web.dev - Optimize Images](https://web.dev/fast/#optimize-your-images)
- [React Performance Optimization](https://reactjs.org/docs/optimizing-performance.html)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Cloudinary Image Optimization](https://cloudinary.com/documentation/image_optimization)

---

**🎉 Sau khi implement xong, website sẽ mượt như Shopee/Lazada!**

