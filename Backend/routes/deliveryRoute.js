import express from "express";
import {
  getDeliveryZones,
  calculateDeliveryFee,
  autocompleteAddress,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
  getRestaurantLocation,
  updateRestaurantLocation
} from "../controllers/deliveryController.js";
import authMiddleware from "../middleware/auth.js";

const deliveryRouter = express.Router();

// ========== PUBLIC ROUTES ==========
// Lấy danh sách zones (để hiển thị cho khách)
deliveryRouter.get("/zones", getDeliveryZones);

// Tính phí ship dựa trên địa chỉ
deliveryRouter.post("/calculate", calculateDeliveryFee);

// Autocomplete địa chỉ
deliveryRouter.get("/autocomplete", autocompleteAddress);

// Lấy thông tin vị trí nhà hàng
deliveryRouter.get("/restaurant-location", getRestaurantLocation);

// ========== ADMIN ROUTES (Protected) ==========
// CRUD delivery zones
deliveryRouter.post("/zones/create", authMiddleware, createDeliveryZone);
deliveryRouter.put("/zones/:id", authMiddleware, updateDeliveryZone);
deliveryRouter.delete("/zones/:id", authMiddleware, deleteDeliveryZone);

// Update restaurant location
deliveryRouter.put("/restaurant-location", authMiddleware, updateRestaurantLocation);

export default deliveryRouter;

