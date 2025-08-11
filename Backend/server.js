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
import authMiddleware, { verifyAdmin } from "./middleware/auth.js"

// Thêm debug này
console.log("🔍 === ENVIRONMENT VARIABLES DEBUG ===")
console.log("MONGODB_URL:", process.env.MONGODB_URL ? "✅ Found" : "❌ Not found")
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Found" : "❌ Not found")
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("All env keys:", Object.keys(process.env).filter(key => !key.startsWith('_')))
console.log("=======================================")
//app config
const app=express()
const port =4000

//middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // Add this for form data

//db connection and server startup
const startServer = async () => {
  try {
    await connectDB();
    console.log("DB Connected");
    
    //api endpoints
    app.use("/api/food",foodRouter)
    app.use("/images",express.static('uploads'))
    app.use("/api/user",userRouter )
    app.use("/api/cart",cartRouter)
    app.use("/api/order",orderRouter)
    app.use("/api/admin",adminRouter)
    app.use("/api/category",categoryRouter)
    app.use("/api/blog",blogRouter)
    app.use("/api/reservation",reservationRouter)
    app.use("/api/contact",contactMessageRouter)

    app.get("/",(req,res)=>{
        res.send("API Working")
    })
    
    // Test route to check JSON parsing
    app.post("/test-json", (req, res) => {
        console.log("🧪 === TEST JSON ROUTE ===")
        console.log("📋 Headers:", req.headers)
        console.log("📝 Body:", req.body)
        console.log("🔍 Body type:", typeof req.body)
        console.log("🔑 Body keys:", Object.keys(req.body))
        res.json({
            message: "Test JSON route working",
            body: req.body,
            bodyType: typeof req.body,
            bodyKeys: Object.keys(req.body)
        })
    })

    // Test route for auth middleware
    app.get("/test-auth", authMiddleware, (req, res) => {
        console.log("🔐 === TEST AUTH ROUTE ===")
        console.log("📋 Headers:", req.headers)
        console.log("📝 Body after auth:", req.body)
        console.log("🔑 User ID:", req.body.userId)
        console.log("👑 Is Admin:", req.body.isAdmin)
        res.json({
            message: "Auth middleware working",
            userId: req.body.userId,
            isAdmin: req.body.isAdmin,
            headers: req.headers
        })
    })

    // Simple test route without auth
    app.get("/test-simple", (req, res) => {
        console.log("🧪 === TEST SIMPLE ROUTE ===")
        console.log("📋 Headers:", req.headers)
        console.log("📝 Body:", req.body)
        res.json({
            message: "Simple route working",
            body: req.body,
            headers: req.headers
        })
    })

    // Test route for multipart form data
    app.post("/test-multipart", (req, res) => {
        console.log("🧪 === TEST MULTIPART ROUTE ===")
        console.log("📋 Headers:", req.headers)
        console.log("📝 Body:", req.body)
        console.log("🔍 Body type:", typeof req.body)
        console.log("🔑 Body keys:", Object.keys(req.body))
        console.log("📁 Files:", req.files)
        res.json({
            message: "Test multipart route working",
            body: req.body,
            bodyType: typeof req.body,
            bodyKeys: Object.keys(req.body),
            files: req.files
        })
    })

    // 404 handler for unmatched routes
    app.use('*', (req, res) => {
      res.status(404).json({ error: 'Route not found' })
    })

    // Global error handling middleware - MUST BE LAST
    app.use((error, req, res, next) => {
      console.error('🚨 Global error handler triggered')
      console.error('❌ Error:', error)
      console.error('❌ Error stack:', error.stack)
      console.error('📋 Request URL:', req.url)
      console.error('📋 Request method:', req.method)
      
      // Don't send error details in production
      const isDevelopment = process.env.NODE_ENV === 'development'
      
      res.status(500).json({ 
        error: 'Internal server error',
        message: isDevelopment ? error.message : 'Something went wrong',
        stack: isDevelopment ? error.stack : undefined
      })
    })


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

    }
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};


startServer();



// Export app cho Vercel serverless
export default app;

//mongodb+srv://greatstack:186312@cluster0.ovanjzw.mongodb.net/?
//retryWrites=true&w=majority&appName=Cluster0
