import express from "express"
import authMiddleware, { verifyAdmin } from "../middleware/auth.js"
import {
  getRestaurantInfo,
  updateRestaurantInfo,
  resetToDefaults,
  uploadLogo
} from "../controllers/restaurantInfoController.js"
import { upload } from "../middleware/upload.js"

const router = express.Router()

// Public: Get restaurant information
router.get("/", getRestaurantInfo)

// Admin: Upload logo image → returns URL
router.post("/upload-logo", authMiddleware, verifyAdmin, upload.single("logo"), uploadLogo)

// Admin: Update + reset
router.put("/", authMiddleware, verifyAdmin, updateRestaurantInfo)
router.post("/reset", authMiddleware, verifyAdmin, resetToDefaults)

export default router

