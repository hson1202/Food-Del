import express from "express";
import {
    getAllCategories,
    getAllCategoriesAdmin,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus
} from "../controllers/categoryController.js";
import multer from "multer";

const categoryRouter = express.Router();

// Image storage engine
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Public routes (for frontend)
categoryRouter.get("/", getAllCategories);

// Admin routes
categoryRouter.get("/admin", getAllCategoriesAdmin);
categoryRouter.post("/", upload.single("image"), addCategory);
categoryRouter.put("/:id", upload.single("image"), updateCategory);
categoryRouter.delete("/:id", deleteCategory);
categoryRouter.put("/:id/toggle", toggleCategoryStatus);

export default categoryRouter; 