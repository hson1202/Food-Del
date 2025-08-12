import express from "express"
import { addFood, listFood, removeFood, updateFoodStatus, updateFood } from "../controllers/foodController.js"
import multer from "multer"//img storage system

const foodRouter = express.Router();
//img storage engine
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        console.log('=== MULTER FILE FILTER ===')
        console.log('File received:', file)
        console.log('File mimetype:', file.mimetype)
        
        // Accept images only
        if (file.mimetype.startsWith('image/')) {
            console.log('File accepted')
            cb(null, true)
        } else {
            console.log('File rejected - not an image')
            cb(new Error('Only image files are allowed'), false)
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
})

// Add error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
    console.log('=== MULTER ERROR HANDLER ===')
    console.log('Error:', error)
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                success: false, 
                message: 'File too large. Maximum size is 5MB.' 
            })
        }
        return res.status(400).json({ 
            success: false, 
            message: `Upload error: ${error.message}` 
        })
    } else if (error) {
        return res.status(400).json({ 
            success: false, 
            message: error.message 
        })
    }
    next()
}

// Test route for multer
foodRouter.post("/test-upload", upload.single("image"), (req, res) => {
    console.log('=== TEST UPLOAD ROUTE ===')
    console.log('Request body:', req.body)
    console.log('Request file:', req.file)
    res.json({
        message: 'Test upload working',
        body: req.body,
        file: req.file
    })
})

// Test route without image upload
foodRouter.post("/test-no-image", (req, res) => {
    console.log('=== TEST NO IMAGE ROUTE ===')
    console.log('Request body:', req.body)
    console.log('Content-Type:', req.get('Content-Type'))
    res.json({
        message: 'Test no image working',
        body: req.body
    })
})

// Test route for creating minimal food item
foodRouter.post("/test-minimal", async (req, res) => {
    try {
        console.log('=== TEST MINIMAL FOOD CREATION ===')
        console.log('Request body:', req.body)
        
        // Generate unique SKU and slug to avoid conflicts
        const timestamp = Date.now()
        const uniqueSku = `TEST-${timestamp}`
        const uniqueSlug = `test-food-${timestamp}`
        
        const minimalFoodData = {
            sku: req.body.sku || uniqueSku,
            name: req.body.name || 'Test Food',
            slug: req.body.slug || uniqueSlug,
            description: req.body.description || 'Test description',
            price: parseFloat(req.body.price) || 10.00,
            image: '',
            category: req.body.category || 'Test Category',
            language: req.body.language || 'vi'
        }
        
        console.log('Minimal food data:', minimalFoodData)
        
        // Import foodModel here to avoid circular dependency
        const foodModel = (await import('../models/foodModel.js')).default
        
        const food = new foodModel(minimalFoodData)
        console.log('Food model created, attempting to save...')
        
        await food.save()
        console.log('Food saved successfully')
        
        res.json({
            success: true,
            message: 'Minimal food created successfully',
            data: food
        })
    } catch (error) {
        console.error('Error in test minimal food:', error)
        res.status(500).json({
            success: false,
            message: 'Error creating minimal food',
            error: error.message
        })
    }
})

// Test route for creating food with manual slug generation
foodRouter.post("/test-manual-slug", async (req, res) => {
    try {
        console.log('=== TEST MANUAL SLUG CREATION ===')
        console.log('Request body:', req.body)
        
        const timestamp = Date.now()
        const name = req.body.name || 'Test Food'
        
        // Manual slug generation without pre-save middleware
        const manualSlug = name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-') + `-${timestamp}`
        
        const foodData = {
            sku: `MANUAL-${timestamp}`,
            name: name,
            slug: manualSlug,
            description: req.body.description || 'Test description',
            price: parseFloat(req.body.price) || 10.00,
            image: '',
            category: req.body.category || 'Test Category',
            language: req.body.language || 'vi'
        }
        
        console.log('Manual slug food data:', foodData)
        
        // Import foodModel here to avoid circular dependency
        const foodModel = (await import('../models/foodModel.js')).default
        
        const food = new foodModel(foodData)
        console.log('Food model created, attempting to save...')
        
        await food.save()
        console.log('Food saved successfully')
        
        res.json({
            success: true,
            message: 'Manual slug food created successfully',
            data: food
        })
    } catch (error) {
        console.error('Error in test manual slug food:', error)
        res.status(500).json({
            success: false,
            message: 'Error creating manual slug food',
            error: error.message
        })
    }
})

// Test route for creating food with multilingual names
foodRouter.post("/test-multilingual", async (req, res) => {
    try {
        console.log('=== TEST MULTILINGUAL FOOD CREATION ===')
        console.log('Request body:', req.body)
        
        const timestamp = Date.now()
        const name = req.body.name || 'Test Food'
        
        // Manual slug generation
        const manualSlug = name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-') + `-${timestamp}`
        
        const foodData = {
            sku: `MULTI-${timestamp}`,
            name: name,
            nameVI: req.body.nameVI || `Món ăn ${timestamp}`,
            nameEN: req.body.nameEN || `Food ${timestamp}`,
            nameSK: req.body.nameSK || `Jedlo ${timestamp}`,
            slug: manualSlug,
            description: req.body.description || 'Test description',
            price: parseFloat(req.body.price) || 10.00,
            image: '',
            category: req.body.category || 'Test Category',
            language: req.body.language || 'vi'
        }
        
        console.log('Multilingual food data:', foodData)
        
        // Import foodModel here to avoid circular dependency
        const foodModel = (await import('../models/foodModel.js')).default
        
        const food = new foodModel(foodData)
        console.log('Food model created, attempting to save...')
        
        await food.save()
        console.log('Food saved successfully')
        
        res.json({
            success: true,
            message: 'Multilingual food created successfully',
            data: food
        })
    } catch (error) {
        console.error('Error in test multilingual food:', error)
        res.status(500).json({
            success: false,
            message: 'Error creating multilingual food',
            error: error.message
        })
    }
})

foodRouter.post("/add", upload.single("image"), handleMulterError, addFood)
foodRouter.get("/list", listFood)
foodRouter.delete("/remove", removeFood)
foodRouter.put("/status", updateFoodStatus)
foodRouter.put("/edit/:id", upload.single("image"), handleMulterError, updateFood)

export default foodRouter;