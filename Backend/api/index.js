// api/index.js
import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import "dotenv/config"
import { connectDB } from "../config/db.js"
import foodRouter from "../routes/foodRoute.js"
import userRouter from "../routes/userRoute.js"
import cartRouter from "../routes/cartRoute.js"
import orderRouter from "../routes/orderRoute.js"
import adminRouter from "../routes/adminRoute.js"
import categoryRouter from "../routes/categoryRoute.js"
import blogRouter from "../routes/blogRoute.js"
import reservationRouter from "../routes/reservationRoute.js"
import contactMessageRouter from "../routes/contactMessageRoute.js"
import uploadRouter from "../routes/uploadRoute.js"
import cloudinarySignRouter from "../routes/cloudinarySignRoute.js"

const app = express()

// Middleware
app.use(cors({
  origin: ["https://yourdomain.com", "http://localhost:3000", "http://localhost:5173"],
  credentials: true
}))
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Database connection state
let isConnected = false

const ensureDbConnection = async () => {
  if (!isConnected) {
    try {
      await connectDB()
      isConnected = true
      console.log("✅ Database connected successfully")
    } catch (error) {
      console.error("❌ Database connection failed:", error.message)
      throw error
    }
  }
}

// Database middleware - ensure connection before processing requests
app.use(async (req, res, next) => {
  try {
    await ensureDbConnection()
    next()
  } catch (error) {
    console.error("Database middleware error:", error.message)
    return res.status(503).json({ 
      success: false,
      error: "Database unavailable", 
      message: error.message 
    })
  }
})

// API Routes
app.use("/api/food", foodRouter)
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/admin", adminRouter)
app.use("/api/category", categoryRouter)
app.use("/api/blog", blogRouter)
app.use("/api/reservation", reservationRouter)
app.use("/api/contact", contactMessageRouter)
app.use("/api/upload", uploadRouter)
app.use("/api/cloudinary", cloudinarySignRouter)

// Health check endpoints
app.get("/", (req, res) => {
  res.json({ 
    success: true,
    message: "🚀 Food Delivery API is Working!",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development"
  })
})

app.get("/api", (req, res) => {
  res.json({ 
    success: true,
    message: "🍕 Food Delivery API v1.0",
    endpoints: [
      "/api/food",
      "/api/user", 
      "/api/cart",
      "/api/order",
      "/api/admin",
      "/api/category",
      "/api/blog",
      "/api/reservation",
      "/api/contact"
    ]
  })
})

app.get("/health", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    res.json({ 
      success: true,
      status: "healthy",
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      status: "unhealthy",
      error: error.message 
    })
  }
})

app.get("/debug", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    res.json({
      success: true,
      database: dbStatus,
      environment: process.env.NODE_ENV,
      mongoUrl: process.env.MONGODB_URL ? "configured" : "missing",
      nodeVersion: process.version,
      platform: process.platform
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    })
  }
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ 
    success: false,
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    availableRoutes: ["/api/food", "/api/user", "/api/cart", "/api/order"]
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Global error handler:", error)
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: error.message
  })
})

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  })
}

// Export for Vercel serverless
export default app