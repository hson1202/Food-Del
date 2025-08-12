import express from "express"
import cors from "cors"
import "dotenv/config"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import adminRouter from "./routes/adminRoute.js"
import categoryRouter from "./routes/categoryRoute.js"
import blogRouter from "./routes/blogRoute.js"
import reservationRouter from "./routes/reservationRoute.js"
import contactMessageRouter from "./routes/contactMessageRoute.js"
import authMiddleware from "./middleware/auth.js"

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Connect DB (for serverless, connection should be established per request)
let isConnected = false

const ensureDbConnection = async () => {
  if (!isConnected) {
    try {
      await connectDB()
      isConnected = true
      console.log("✅ DB Connected Successfully")
    } catch (error) {
      console.error("❌ DB Connection failed:", error.message)
      throw error
    }
  }
}

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await ensureDbConnection()
    next()
  } catch (error) {
    res.status(500).json({
      error: "Database connection failed",
      message: error.message
    })
  }
})

// Routes
app.use("/api/food", foodRouter)
app.use("/images", express.static("uploads")) // Serve static images
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/admin", adminRouter)
app.use("/api/category", categoryRouter)
app.use("/api/blog", blogRouter)
app.use("/api/reservation", reservationRouter)
app.use("/api/contact", contactMessageRouter)

// Root route
app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 Food Delivery API is Working!",
    status: "success",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  })
})

// Health check route
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Test routes
app.post("/test-json", (req, res) => {
  res.json({
    message: "Test JSON route working",
    body: req.body,
    bodyType: typeof req.body,
    bodyKeys: Object.keys(req.body || {})
  })
})

app.get("/test-auth", authMiddleware, (req, res) => {
  res.json({
    message: "Auth middleware working",
    userId: req.body?.userId,
    isAdmin: req.body?.isAdmin,
    headers: req.headers
  })
})

app.get("/test-simple", (req, res) => {
  res.json({ 
    message: "Simple route working", 
    headers: req.headers,
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    path: req.originalUrl,
    method: req.method
  })
})

// Global error handler
app.use((error, req, res, next) => {
  console.error("🚨 Global error handler triggered")
  console.error("❌ Error:", error.message)
  console.error("📋 Request URL:", req.url)
  console.error("📋 Request method:", req.method)
  
  const isDev = process.env.NODE_ENV === "development"
  res.status(500).json({
    error: "Internal server error",
    message: isDev ? error.message : "Something went wrong",
    timestamp: new Date().toISOString()
  })
})

// Start server function
const startServer = async () => {
  try {
    // For local development
    if (process.env.NODE_ENV !== "production") {
      const port = process.env.PORT || 4000
      app.listen(port, () => {
        console.log(`🚀 Server started on http://localhost:${port}`)
      })
    } else {
      console.log("🚀 Server running on Vercel (serverless mode)")
    }
  } catch (error) {
    console.error("❌ Failed to start server:", error.message)
  }
}

// Start server for both local and Vercel
startServer()

// Export for Vercel serverless
export default app
