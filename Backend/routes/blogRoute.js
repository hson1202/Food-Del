import express from "express"
import multer from "multer"
import path from "path"
import {
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleBlogStatus,
  toggleFeatured,
  getBlogStats
} from "../controllers/blogController.js"

const router = express.Router()

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('📁 Multer destination called for file:', file.originalname)
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const filename = 'blog_' + uniqueSuffix + path.extname(file.originalname)
    console.log('📝 Generated filename:', filename)
    cb(null, filename)
  }
})

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    console.log('🔍 File filter called for:', file.originalname, 'MIME type:', file.mimetype)
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      console.log('✅ File accepted:', file.originalname)
      cb(null, true)
    } else {
      console.log('❌ File rejected:', file.originalname, 'MIME type:', file.mimetype)
      cb(new Error('Only image files are allowed!'), false)
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  console.log('🔍 Multer error handler called')
  console.log('Error type:', error.constructor.name)
  console.log('Error message:', error.message)
  
  if (error instanceof multer.MulterError) {
    console.log('⚠️ Multer error detected:', error.code)
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' })
    }
    return res.status(400).json({ error: 'File upload error: ' + error.message })
  } else if (error) {
    console.log('⚠️ Non-multer error:', error.message)
    return res.status(400).json({ error: error.message })
  }
  
  console.log('✅ No multer error, proceeding to next middleware')
  next()
}

// Validation middleware for blog creation
const validateBlogData = (req, res, next) => {
  try {
    console.log('🔍 === VALIDATION MIDDLEWARE ===')
    console.log('📝 Request body:', req.body)
    console.log('🔑 Body keys:', Object.keys(req.body))
    console.log('📁 Files:', req.files || req.file || 'No files')
    
    const { title, content, excerpt, author, language } = req.body
    
    if (!title || !title.trim()) {
      console.log('❌ Title validation failed')
      return res.status(400).json({ error: 'Title is required' })
    }
    
    if (!content || !content.trim()) {
      console.log('❌ Content validation failed')
      return res.status(400).json({ error: 'Content is required' })
    }
    
    if (!excerpt || !excerpt.trim()) {
      console.log('❌ Excerpt validation failed')
      return res.status(400).json({ error: 'Excerpt is required' })
    }
    
    if (!author || !author.trim()) {
      console.log('❌ Author validation failed')
      return res.status(400).json({ error: 'Author is required' })
    }
    
    if (!language || !['vi', 'en', 'sk'].includes(language)) {
      console.log('❌ Language validation failed')
      return res.status(400).json({ error: 'Language must be vi, en, or sk' })
    }
    
    console.log('✅ Validation passed')
    next()
  } catch (error) {
    console.error('❌ Validation middleware error:', error)
    res.status(500).json({ error: 'Validation error' })
  }
}

// Blog routes
router.get('/list', getAllBlogs)
router.get('/public', getAllBlogs) // Public route for frontend
router.get('/stats', getBlogStats)
router.get('/slug/:slug', getBlogBySlug) // New route for slug-based lookup
router.get('/:id', getBlogById)
router.post('/add', upload.single('image'), handleMulterError, validateBlogData, createBlog)
router.post('/add-simple', validateBlogData, createBlog) // Route for creating blog without image
router.post('/add-no-image', validateBlogData, createBlog) // Route for creating blog without image validation
router.post('/test', (req, res) => {
    console.log("🧪 === BLOG TEST ROUTE ===")
    console.log("📋 Headers:", req.headers)
    console.log("📝 Body:", req.body)
    console.log("🔍 Body type:", typeof req.body)
    console.log("🔑 Body keys:", Object.keys(req.body))
    console.log("📁 Files:", req.files || req.file || 'No files')
    res.json({
        message: "Blog test route working",
        body: req.body,
        bodyType: typeof req.body,
        bodyKeys: Object.keys(req.body),
        files: req.files || req.file || 'No files'
    })
})

// Test database connection
router.get('/test-db', async (req, res) => {
    try {
        console.log("🔌 === TESTING DATABASE CONNECTION ===")
        const mongoose = await import('mongoose')
        const connectionState = mongoose.connection.readyState
        console.log("🔌 Database connection state:", connectionState)
        
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        }
        
        res.json({
            message: "Database connection test",
            state: connectionState,
            stateName: states[connectionState],
            connected: connectionState === 1
        })
    } catch (error) {
        console.error("❌ Database test error:", error)
        res.status(500).json({
            error: "Database test failed",
            details: error.message
        })
    }
})
router.put('/:id', upload.single('image'), handleMulterError, updateBlog)
router.delete('/:id', deleteBlog)
router.put('/:id/status', toggleBlogStatus)
router.put('/:id/featured', toggleFeatured)

export default router 