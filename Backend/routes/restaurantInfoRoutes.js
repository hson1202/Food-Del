import express from "express"
import authMiddleware, { verifyAdmin } from "../middleware/auth.js"
import {
  getRestaurantInfo,
  updateRestaurantInfo,
  resetToDefaults
} from "../controllers/restaurantInfoController.js"

const router = express.Router()

// Public: Get restaurant information
router.get("/", getRestaurantInfo)

// Admin: Update + reset
router.put("/", authMiddleware, verifyAdmin, updateRestaurantInfo)
router.post("/reset", authMiddleware, verifyAdmin, resetToDefaults)

export default router

