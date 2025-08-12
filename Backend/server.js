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
      const connected = await connectDB()
      if (connected) {
        isConnected = true
        console.log("✅ DB Connected Successfully")
      } else {
        console.log("⚠️ DB connection failed, but continuing...")
      }
    } catch (error) {
      console.error("❌ DB Connection failed:", error.message)
      // Don't throw error on Vercel, just log it
      if (process.env.NODE_ENV === "production") {
        console.error("Production mode: Continuing without DB connection")
        return
      }
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
    // On Vercel, don't crash the function
    if (process.env.NODE_ENV === "production") {
      console.error("DB connection failed, but continuing:", error.message)
      next()
    } else {
      res.status(500).json({
        error: "Database connection failed",
        message: error.message
      })
    }
  }
})

// Routes with error handling
app.use("/api/food", (req, res, next) => {
  try {
    foodRouter(req, res, next)
  } catch (error) {
    console.error("Food route error:", error)
    res.status(500).json({ error: "Food route error" })
  }
})

// Serve static images - always enable on local
console.log("🔍 NODE_ENV:", process.env.NODE_ENV)
console.log("🔍 Setting up /images route with uploads directory")
app.use("/images", express.static("uploads"))
console.log("✅ /images route configured")

app.use("/api/user", (req, res, next) => {
  try {
    userRouter(req, res, next)
  } catch (error) {
    console.error("User route error:", error)
    res.status(500).json({ error: "User route error" })
  }
})

app.use("/api/cart", (req, res, next) => {
  try {
    cartRouter(req, res, next)
  } catch (error) {
    console.error("Cart route error:", error)
    res.status(500).json({ error: "Cart route error" })
  }
})

app.use("/api/order", (req, res, next) => {
  try {
    orderRouter(req, res, next)
  } catch (error) {
    console.error("Order route error:", error)
    res.status(500).json({ error: "Order route error" })
  }
})

app.use("/api/admin", (req, res, next) => {
  try {
    adminRouter(req, res, next)
  } catch (error) {
    console.error("Admin route error:", error)
    res.status(500).json({ error: "Admin route error" })
  }
})

app.use("/api/category", (req, res, next) => {
  try {
    categoryRouter(req, res, next)
  } catch (error) {
    console.error("Category route error:", error)
    res.status(500).json({ error: "Category route error" })
  }
})

app.use("/api/blog", (req, res, next) => {
  try {
    blogRouter(req, res, next)
  } catch (error) {
    console.error("Blog route error:", error)
    res.status(500).json({ error: "Blog route error" })
  }
})

app.use("/api/reservation", (req, res, next) => {
  try {
    reservationRouter(req, res, next)
  } catch (error) {
    console.error("Reservation route error:", error)
    res.status(500).json({ error: "Reservation route error" })
  }
})

app.use("/api/contact", (req, res, next) => {
  try {
    contactMessageRouter(req, res, next)
  } catch (error) {
    console.error("Contact route error:", error)
    res.status(500).json({ error: "Contact route error" })
  }
})

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
    // Don't exit on Vercel
    if (process.env.NODE_ENV !== "production") {
      process.exit(1)
    }
  }
}

// Start server for both local and Vercel
startServer()

// Export for Vercel serverless
export default app
