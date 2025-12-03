import express from "express"
import { loginUser, registerUser, verifyToken } from "../controllers/userController.js"
import authMiddleware from "../middleware/auth.js"


const userRouter=express.Router()

userRouter.post("/register",registerUser)
userRouter.post("/login",loginUser)
userRouter.get("/verify", authMiddleware, verifyToken)

export default userRouter;