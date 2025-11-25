import express from "express";
import {
    getAllParentCategories,
    getAllParentCategoriesAdmin,
    getParentCategoryById,
    addParentCategory,
    updateParentCategory,
    deleteParentCategory,
    toggleParentCategoryStatus
} from "../controllers/parentCategoryController.js";
import { upload } from "../middleware/upload.js";

const parentCategoryRouter = express.Router();

// Public routes (for frontend)
parentCategoryRouter.get("/", getAllParentCategories);
parentCategoryRouter.get("/:id", getParentCategoryById);

// Admin routes
parentCategoryRouter.get("/admin/all", getAllParentCategoriesAdmin);
parentCategoryRouter.post("/", upload.single("image"), addParentCategory);
parentCategoryRouter.put("/:id", upload.single("image"), updateParentCategory);
parentCategoryRouter.delete("/:id", deleteParentCategory);
parentCategoryRouter.put("/:id/toggle", toggleParentCategoryStatus);

export default parentCategoryRouter;

