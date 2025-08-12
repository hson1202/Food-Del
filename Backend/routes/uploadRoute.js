import express from "express"
import { upload } from "../middleware/upload.js"

const router = express.Router()

// Upload image via server → Cloudinary
router.post("/image", upload.single("image"), (req, res) => {
  // multer-storage-cloudinary returns secure_url and public_id on req.file
  return res.json({
    url: req.file?.path,
    public_id: req.file?.filename
  })
})

export default router


