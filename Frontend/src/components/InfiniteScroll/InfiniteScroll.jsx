import React, { useEffect, useRef, useCallback } from 'react';
import './InfiniteScroll.css';

/**
 * InfiniteScroll Component
 * Tự động load thêm data khi user scroll gần cuối trang
 * 
 * @param {function} onLoadMore - Callback để load thêm data
 * @param {boolean} hasMore - Còn data để load không?
 * @param {boolean} isLoading - Đang load?
 * @param {number} threshold - Khoảng cách từ cuối trang để trigger load (px)
 * @param {ReactNode} children - Nội dung bên trong
 * @param {ReactNode} loader - Custom loader component
 */
const InfiniteScroll = ({ 
  onLoadMore, 
  hasMore = false, 
  isLoading = false, 
  threshold = 300,
  children,
  loader = null
}) => {
  const observerRef = useRef(null);
  const loadingRef = useRef(null);

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      
      // Khi sentinel element vào viewport và còn data + không đang load
      if (target.isIntersecting && hasMore && !isLoading) {
        console.log('🔄 InfiniteScroll: Loading more items...');
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    // Setup Intersection Observer
    const observer = new IntersectionObserver(handleObserver, {
      root: null, // viewport
      rootMargin: `${threshold}px`, // Trigger trước khi đến cuối
      threshold: 0.1 // Trigger khi 10% của element hiển thị
    });

    const currentRef = loadingRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    observerRef.current = observer;

    // Cleanup
    return () => {
      if (observer && currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [handleObserver, threshold]);

  return (
    <div className="infinite-scroll-container">
      {children}
      
      {/* Sentinel element - Observer sẽ watch element này */}
      <div ref={loadingRef} className="infinite-scroll-sentinel">
        {isLoading && hasMore && (
          <div className="infinite-scroll-loader">
            {loader || <DefaultLoader />}
          </div>
        )}
        
        {!hasMore && (
          <div className="infinite-scroll-end">
            <p>🎉 Đã hiển thị tất cả sản phẩm</p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Default Loader Component
 */
const DefaultLoader = () => (
  <div className="default-loader">
    <div className="loader-spinner"></div>
    <p>Đang tải thêm sản phẩm...</p>
  </div>
);

export default InfiniteScroll;

