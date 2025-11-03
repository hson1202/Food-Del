import { useEffect, useRef, useState } from 'react';

/**
 * useIntersectionObserver Hook
 * Track khi một element vào/ra khỏi viewport
 * 
 * @param {object} options - IntersectionObserver options
 * @returns {[ref, isIntersecting]} - Ref và intersection state
 * 
 * @example
 * const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5 });
 * 
 * return (
 *   <div ref={ref}>
 *     {isVisible ? 'I am visible!' : 'Scroll down to see me'}
 *   </div>
 * );
 */
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, {
      threshold: 0.1,
      rootMargin: '0px',
      ...options
    });

    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [options]);

  return [targetRef, isIntersecting];
};

/**
 * useInViewOnce Hook
 * Track khi element vào viewport lần đầu tiên (không track lại khi ra khỏi viewport)
 * Useful cho lazy loading images, animations
 */
export const useInViewOnce = (options = {}) => {
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target || hasBeenInView) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHasBeenInView(true);
        observer.disconnect(); // Disconnect sau khi trigger lần đầu
      }
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasBeenInView, options]);

  return [targetRef, hasBeenInView];
};

/**
 * useScrollDirection Hook
 * Detect scroll direction (up/down)
 */
export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState('down');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      if (Math.abs(scrollY - lastScrollY) < 5) {
        ticking = false;
        return;
      }

      setScrollDirection(scrollY > lastScrollY ? 'down' : 'up');
      setLastScrollY(scrollY);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [lastScrollY]);

  return scrollDirection;
};

export default useIntersectionObserver;

