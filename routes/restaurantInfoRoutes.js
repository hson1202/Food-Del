import express from 'express';
import {
  getRestaurantInfo,
  updateRestaurantInfo,
  resetToDefaults
} from '../controllers/restaurantInfoController.js';
import authMiddleware from '../middleware/auth.js';

const restaurantInfoRouter = express.Router();

// Public route - Get restaurant information
restaurantInfoRouter.get('/', getRestaurantInfo);

// Admin routes - require authentication
restaurantInfoRouter.put('/', authMiddleware, updateRestaurantInfo);
restaurantInfoRouter.post('/reset', authMiddleware, resetToDefaults);

export default restaurantInfoRouter;
