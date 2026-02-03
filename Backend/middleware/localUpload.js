import multer from "multer"
import path from "path"
import fs from "fs"

// Ensure uploads directory exists
const uploadsDir = "./uploads"
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Local storage configuration
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    const filename = file.fieldname + '-' + uniqueSuffix + ext
    cb(null, filename)
  }
})

// File filter for images only with enhanced security
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  // Check MIME type
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WebP images are allowed'), false);
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Invalid file extension. Only .jpg, .jpeg, .png, and .webp are allowed'), false);
  }

  // Sanitize filename - prevent path traversal
  const sanitizedFilename = path.basename(file.originalname);
  if (sanitizedFilename !== file.originalname) {
    return cb(new Error('Invalid filename. Path traversal detected'), false);
  }

  cb(null, true);
}

export const localUpload = multer({
  storage: localStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
})

// Helper function to delete file
export const deleteLocalFile = (filename) => {
  try {
    const filePath = path.join(uploadsDir, filename)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`✅ Deleted local file: ${filename}`)
      return true
    }
  } catch (error) {
    console.error(`❌ Error deleting file ${filename}:`, error)
    return false
  }
}
