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

// Debug ENV (in ra KEY, không in value)
console.log("🔍 === ENVIRONMENT VARIABLES DEBUG ===")
console.log("MONGODB_URL:", process.env.MONGODB_URL ? "✅ Found" : "❌ Not found")
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Found" : "❌ Not found")
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("All env keys:", Object.keys(process.env).filter(k => !k.startsWith("_")))
console.log("=======================================")

const app = express()
const port = process.env.PORT || 4000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Khởi tạo DB + routes
const startServer = async () => {
  try {
    await connectDB()
    console.log("✅ DB Connected Successfully")

    // Routes
    app.use("/api/food", foodRouter)
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

    // Health check route for Vercel
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

    // Only listen on local development
    if (process.env.NODE_ENV !== "production") {
      app.listen(port, () => {
        console.log(`🚀 Server started on http://localhost:${port}`)
      })
    } else {
      console.log("🚀 Server running on Vercel (serverless mode)")
    }
  } catch (error) {
    console.error("❌ Failed to start server:", error.message)
    // Don't exit on Vercel, just log the error
    if (process.env.NODE_ENV !== "production") {
      process.exit(1)
    }
  }
}

// Always call startServer for both local and Vercel
startServer()

// Export for Vercel serverless
export default app
