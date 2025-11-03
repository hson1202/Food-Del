/**
 * Image Optimization Utilities for Admin Panel
 */

export const optimizeCloudinaryImage = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width = 300,
    height = null,
    quality = 'auto:good',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
    dpr = 'auto'
  } = options;

  const transforms = [
    `w_${width}`,
    height ? `h_${height}` : null,
    `c_${crop}`,
    `q_${quality}`,
    `f_${format}`,
    `g_${gravity}`,
    `dpr_${dpr}`,
    'fl_progressive',
    'fl_lossy'
  ].filter(Boolean).join(',');

  return url.replace('/upload/', `/upload/${transforms}/`);
};

export const getOptimizedImageUrl = (image, backendUrl, options = {}) => {
  if (!image) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  }

  if (image.startsWith('http') && image.includes('cloudinary.com')) {
    return optimizeCloudinaryImage(image, options);
  }

  if (image.startsWith('http')) {
    return image;
  }

  return `${backendUrl}/images/${image}`;
};

export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

