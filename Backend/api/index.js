// api/index.js
import express from "express"
import cors from "cors"
import "dotenv/config"
import { connectDB } from "../../config/db.js"
import foodRouter from "../../routes/foodRoute.js"
import userRouter from "../../routes/userRoute.js"
import cartRouter from "../../routes/cartRoute.js"
import orderRouter from "../../routes/orderRoute.js"
import adminRouter from "../../routes/adminRoute.js"
import categoryRouter from "../../routes/categoryRoute.js"
import blogRouter from "../../routes/blogRoute.js"
import reservationRouter from "../../routes/reservationRoute.js"
import contactMessageRouter from "../../routes/contactMessageRoute.js"
import authMiddleware from "../../middleware/auth.js"

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

let isConnected = false
const ensureDbConnection = async () => {
  if (!isConnected) {
    await connectDB()
    isConnected = true
  }
}

// đảm bảo DB sẵn sàng; nếu không, trả 503 thay vì crash
app.use(async (req, res, next) => {
  try {
    await ensureDbConnection()
    next()
  } catch (e) {
    return res.status(503).json({ error: "Database unavailable", message: e.message })
  }
})

app.use("/api/food", foodRouter)
// Only serve local uploads in non-production (Vercel filesystem is ephemeral)
if (process.env.NODE_ENV !== "production") {
  app.use("/uploads", express.static("uploads"))
  app.use("/images", express.static("uploads"))
}
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/admin", adminRouter)
app.use("/api/category", categoryRouter)
app.use("/api/blog", blogRouter)
app.use("/api/reservation", reservationRouter)
app.use("/api/contact", contactMessageRouter)

// Cloudinary upload and signature endpoints
import uploadRouter from "../../routes/uploadRoute.js"
import cloudinarySignRouter from "../../routes/cloudinarySignRoute.js"

app.use("/api/upload", uploadRouter)
app.use("/api/cloudinary", cloudinarySignRouter)

app.get("/", (req, res) => res.json({ message: "🚀 Food Delivery API is Working!" }))
app.get("/health", (req, res) => res.json({ status: "healthy", ts: new Date().toISOString() }))

app.use("*", (req, res) => res.status(404).json({ error: "Route not found" }))

// Local dev mới listen; Vercel sẽ gọi app như 1 handler
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 4000
  app.listen(port, () => console.log(`🚀 Local: http://localhost:${port}`))
}

export default (req, res) => app(req, res)
