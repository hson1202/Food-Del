import express from "express"
import { 
    loginUser, 
    registerUser, 
    verifyToken,
    getProfile,
    updateProfile,
    changePassword,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} from "../controllers/userController.js"
import { userOrders } from "../controllers/orderController.js"
import authMiddleware from "../middleware/auth.js"


const userRouter = express.Router()

// Public routes (no auth required)
userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)

// Protected routes (auth required)
userRouter.get("/verify", authMiddleware, verifyToken)

// Profile routes
userRouter.get("/profile", authMiddleware, getProfile)
userRouter.put("/profile", (req, res, next) => {
    console.log("=== PUT /profile route hit ===");
    console.log("Method:", req.method);
    console.log("Path:", req.path);
    console.log("Original URL:", req.originalUrl);
    next();
}, authMiddleware, updateProfile)

// Password route
userRouter.post("/change-password", authMiddleware, changePassword)

// Address routes
userRouter.get("/addresses", authMiddleware, getAddresses)
userRouter.post("/addresses", authMiddleware, addAddress)
userRouter.put("/addresses/:id", authMiddleware, updateAddress)
userRouter.delete("/addresses/:id", authMiddleware, deleteAddress)
userRouter.post("/addresses/:id/set-default", authMiddleware, setDefaultAddress)

// Orders route (reuse existing logic, but as GET endpoint)
userRouter.get("/orders", authMiddleware, userOrders)

export default userRouter;