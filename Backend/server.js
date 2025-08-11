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

// Debug ENV
console.log("🔍 === ENVIRONMENT VARIABLES DEBUG ===")
console.log("MONGODB_URL:", process.env.MONGODB_URL ? "✅ Found" : "❌ Not found")
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Found" : "❌ Not found")
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("All env keys:", Object.keys(process.env).filter(k => !k.startsWith("_")))
console.log("=======================================")

const app = express()
const port = 4000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Khởi tạo DB + routes
const startServer = async () => {
  try {
    await connectDB()
    console.log("DB Connected")

    // Routes
    app.use("/api/food", foodRouter)
    app.use("/images", express.static("uploads"))
    app.use("/api/user", userRouter)
    app.use("/api/cart", cartRouter)
    app.use("/api/order", orderRouter)
    app.use("/api/admin", adminRouter)
    app.use("/api/category", categoryRouter)
    app.use("/api/blog", blogRouter)
    app.use("/api/reservation", reservationRouter)
    app.use("/api/contact", contactMessageRouter)

    app.get("/", (req, res) => {
      res.send("API Working")
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

<<<<<<< HEAD
    app.get("/test-auth", authMiddleware, (req, res) => {
      res.json({
        message: "Auth middleware working",
        userId: req.body?.userId,
        isAdmin: req.body?.isAdmin,
        headers: req.headers
      })
    })

    app.get("/test-simple", (req, res) => {
      res.json({ message: "Simple route working", headers: req.headers })
    })

    app.post("/test-multipart", (req, res) => {
      res.json({
        message: "Test multipart route working",
        body: req.body,
        files: req.files
      })
    })

    // 404
    app.use("*", (req, res) => {
      res.status(404).json({ error: "Route not found" })
    })

    // Error handler (đặt cuối)
    app.use((error, req, res, next) => {
      console.error("🚨 Global error handler triggered")
      console.error("❌ Error:", error)
      console.error("📋 Request URL:", req.url)
      console.error("📋 Request method:", req.method)
      const isDev = process.env.NODE_ENV === "development"
      res.status(500).json({
        error: "Internal server error",
        message: isDev ? error.message : "Something went wrong",
        stack: isDev ? error.stack : undefined
      })
    })

    // Chỉ listen khi chạy local
    if (process.env.NODE_ENV !== "production") {
      app.listen(port, () => {
        console.log(`Server started on http://localhost:${port}`)
      })
    } else {
      console.log("🚀 Server running on Vercel (serverless mode)")
=======

    // Vercel serverless: export app thay vì listen port
    if (process.env.NODE_ENV !== 'production') {
      app.listen(port,()=>{
          console.log(`Server started on http://localhost:${port}`)
      })
    } else {
      console.log("🚀 Server running on Vercel (serverless mode)")

  // Chỉ listen khi local
    if (process.env.NODE_ENV !== "production") {
      app.listen(port, () => {
        console.log(`Server started on http://localhost:${port}`);
      });

>>>>>>> af73d3b2da2e0ff4a4be72599ffa5f32bff50bac
    }
  } catch (error) {
    console.error("Failed to start server:", error)
  }
}

<<<<<<< HEAD
// Luôn gọi để init (cả trên Vercel)
startServer()

// Export cho Vercel serverless (Express app là 1 request handler hợp lệ)
export default app
=======

startServer();



// Export app cho Vercel serverless
export default app;

//mongodb+srv://greatstack:186312@cluster0.ovanjzw.mongodb.net/?
//retryWrites=true&w=majority&appName=Cluster0
>>>>>>> af73d3b2da2e0ff4a4be72599ffa5f32bff50bac
