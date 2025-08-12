// server.js
import express from "express"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import morgan from "morgan"
import mongoose from "mongoose"
import rateLimit from "express-rate-limit"
import "dotenv/config"

import { connectDB } from "./config/db.js"

// Routers
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import adminRouter from "./routes/adminRoute.js"
import categoryRouter from "./routes/categoryRoute.js"
import blogRouter from "./routes/blogRoute.js"
import reservationRouter from "./routes/reservationRoute.js"
import contactMessageRouter from "./routes/contactMessageRoute.js"
import uploadRouter from "./routes/uploadRoute.js"
import cloudinarySignRouter from "./routes/cloudinarySignRoute.js"

// Middleware
import authMiddleware from "./middleware/auth.js"

const app = express()

// ===== Global Middleware =====
app.use(helmet())
app.use(compression())
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"))
}
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true, limit: "1mb" }))

// CORS (chỉ mở cho front-end được phép)
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(",") || "*",
    credentials: true,
  })
)
app.set("trust proxy", 1) // nếu deploy sau proxy (Vercel, Heroku, etc.)

// Rate limit API
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 })
app.use("/api", limiter)

// ===== Health Check (trước khi ép DB) =====
app.get("/health", (req, res) =>
  res.json({ status: "healthy", ts: new Date().toISOString() })
)

// ===== DB Connection Helper =====
let isConnected = false
const ensureDbConnection = async () => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB()
    isConnected = true
  }
}

// ===== Middleware ép DB cho các route cần =====
app.use(async (req, res, next) => {
  try {
    await ensureDbConnection()
    next()
  } catch (e) {
    return res.status(503).json({
      error: "Database unavailable",
      message: e.message,
    })
  }
})

// ===== Routes =====
app.get("/", (req, res) =>
  res.json({ message: "🚀 Food Delivery API is Working!" })
)
app.get("/debug", async (req, res) => {
  try {
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    res.json({
      db: dbStatus,
      env: process.env.NODE_ENV,
      mongoUrl: process.env.MONGODB_URL ? "set" : "missing",
    })
  } catch (error) {
    res.json({ error: error.message })
  }
})

// Static uploads (dev only)
if (process.env.NODE_ENV !== "production") {
  app.use("/uploads", express.static("uploads"))
  app.use("/images", express.static("uploads"))
}

app.use("/api/food", foodRouter)
app.use("/api/user", userRouter)
app.use("/api/cart", authMiddleware, cartRouter)
app.use("/api/order", authMiddleware, orderRouter)
app.use("/api/admin", authMiddleware, adminRouter)
app.use("/api/category", categoryRouter)
app.use("/api/blog", blogRouter)
app.use("/api/reservation", reservationRouter)
app.use("/api/contact", contactMessageRouter)
app.use("/api/upload", uploadRouter)
app.use("/api/cloudinary", cloudinarySignRouter)

// ===== 404 =====
app.use("*", (req, res) => res.status(404).json({ error: "Route not found" }))

// ===== Error Handler =====
app.use((err, req, res, next) => {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({ error: err.message || "Internal Server Error" })
})

// ===== Local Dev Listen =====
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 4000
  const server = app.listen(port, () =>
    console.log(`🚀 Local: http://localhost:${port}`)
  )

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("Shutting down...")
    await mongoose.connection.close()
    server.close(() => process.exit(0))
  })
  process.on("SIGTERM", async () => {
    console.log("Shutting down...")
    await mongoose.connection.close()
    server.close(() => process.exit(0))
  })
}

// ===== Export for Vercel =====
export default (req, res) => {
  return app(req, res)
}
