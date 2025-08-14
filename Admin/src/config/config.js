// Configuration file for backend URLs and image paths
const config = {
  // Backend URL - ưu tiên sử dụng environment variable
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://food-del-backend-4jjf.onrender.com'  // Fallback cho production
      : 'http://localhost:4000'),  // Fallback cho development
  
  // API endpoints
  API_ENDPOINTS: {
    FOOD: '/api/food',
    CATEGORY: '/api/category',
    USER: '/api/user',
    CART: '/api/cart',
    ORDER: '/api/order',
    BLOG: '/api/blog',
    CONTACT: '/api/contact',
    RESERVATION: '/api/reservation',
    ADMIN: '/api/admin'
  },
  
  // Image paths
  IMAGE_PATHS: {
    FOOD: '/images',      // For food images
    BLOG: '/uploads',     // For blog images
    CATEGORY: '/images'   // For category images
  }
};

export default config;
