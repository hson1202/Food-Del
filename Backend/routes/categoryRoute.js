import express from "express";
import {
    getAllCategories,
    getAllCategoriesAdmin,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus
} from "../controllers/categoryController.js";
import { localUpload } from "../middleware/localUpload.js";

const categoryRouter = express.Router();

// Using Cloudinary-backed multer storage from middleware

// Public routes (for frontend)
categoryRouter.get("/", getAllCategories);

// Admin routes
categoryRouter.get("/admin", getAllCategoriesAdmin);
categoryRouter.post("/", localUpload.single("image"), addCategory);
categoryRouter.put("/:id", localUpload.single("image"), updateCategory);
categoryRouter.delete("/:id", deleteCategory);
categoryRouter.put("/:id/toggle", toggleCategoryStatus);

export default categoryRouter; 