/**
 * Image Optimization Utilities
 * Tối ưu hóa hình ảnh cho performance tốt hơn
 */

/**
 * Optimize Cloudinary image URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {object} options - Transform options
 * @returns {string} - Optimized URL
 */
export const optimizeCloudinaryImage = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width = 400,
    height = null,
    quality = 'auto:good', // auto:good, auto:best, auto:eco, or 1-100
    format = 'auto', // auto, webp, jpg, png
    crop = 'fill', // fill, scale, fit, limit, pad
    gravity = 'auto', // auto, center, face, etc.
    dpr = 'auto' // Device Pixel Ratio - auto or 1.0, 2.0, 3.0
  } = options;

  // Build transformation string
  const transforms = [
    `w_${width}`,
    height ? `h_${height}` : null,
    `c_${crop}`,
    `q_${quality}`,
    `f_${format}`,
    `g_${gravity}`,
    `dpr_${dpr}`,
    'fl_progressive', // Progressive loading
    'fl_lossy' // Lossy compression for smaller size
  ].filter(Boolean).join(',');

  // Insert transformation params before '/upload/'
  return url.replace('/upload/', `/upload/${transforms}/`);
};

/**
 * Get image URL with proper optimization based on environment
 * @param {string} image - Image path/URL
 * @param {string} backendUrl - Backend URL
 * @param {object} options - Transform options
 * @returns {string} - Final image URL
 */
export const getOptimizedImageUrl = (image, backendUrl, options = {}) => {
  // Return placeholder if no image
  if (!image) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  }

  // If it's a Cloudinary URL, optimize it
  if (image.startsWith('http') && image.includes('cloudinary.com')) {
    return optimizeCloudinaryImage(image, options);
  }

  // If it's already a full URL (but not Cloudinary), return as is
  if (image.startsWith('http')) {
    return image;
  }

  // Local backend image
  return `${backendUrl}/images/${image}`;
};

/**
 * Generate responsive image srcSet for different screen sizes
 * @param {string} image - Image path/URL
 * @param {string} backendUrl - Backend URL
 * @returns {object} - Object with src and srcSet
 */
export const getResponsiveImageSet = (image, backendUrl) => {
  if (!image) return { src: '', srcSet: '' };

  const sizes = [
    { width: 400, descriptor: '400w' },
    { width: 800, descriptor: '800w' },
    { width: 1200, descriptor: '1200w' }
  ];

  const srcSet = sizes
    .map(size => {
      const url = getOptimizedImageUrl(image, backendUrl, { width: size.width });
      return `${url} ${size.descriptor}`;
    })
    .join(', ');

  return {
    src: getOptimizedImageUrl(image, backendUrl, { width: 800 }),
    srcSet,
    sizes: '(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px'
  };
};

/**
 * Preload image for better UX
 * @param {string} src - Image URL to preload
 * @returns {Promise} - Resolves when image is loaded
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Convert image to WebP if browser supports
 * @returns {boolean} - Whether WebP is supported
 */
export const supportsWebP = () => {
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
};

/**
 * Get placeholder blur image (tiny base64 version)
 * Useful for blur-up effect
 */
export const getBlurPlaceholder = () => {
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Cfilter id="b" color-interpolation-filters="sRGB"%3E%3CfeGaussianBlur stdDeviation=".5"/%3E%3C/filter%3E%3Crect width="400" height="300" fill="%23f5f5f5" filter="url(%23b)"/%3E%3C/svg%3E';
};

/**
 * Calculate optimal image dimensions based on viewport
 * @param {number} containerWidth - Container width in px
 * @param {number} aspectRatio - Image aspect ratio (width/height)
 * @returns {object} - Optimal width and height
 */
export const calculateOptimalDimensions = (containerWidth, aspectRatio = 4/3) => {
  // Get device pixel ratio for retina displays
  const dpr = window.devicePixelRatio || 1;
  
  // Calculate width considering DPR but cap at 2x for performance
  const width = Math.round(containerWidth * Math.min(dpr, 2));
  const height = Math.round(width / aspectRatio);
  
  return { width, height };
};

