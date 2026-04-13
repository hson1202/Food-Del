import express from "express"
import { r2Upload } from "../middleware/r2Upload.js"

const router = express.Router()

// Upload image → Cloudflare R2 (compressed via sharp to WebP)
router.post("/image", (req, res) => {
  const uploadSingle = r2Upload.single("image")

  uploadSingle(req, res, (err) => {
    if (err) {
      console.error("=== R2 UPLOAD ERROR ===", err)
      return res.status(500).json({
        success: false,
        error: "Upload failed: " + err.message,
        details: process.env.NODE_ENV === "development" ? err : undefined,
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      })
    }

    console.log("=== R2 UPLOAD SUCCESS ===")
    console.log("File uploaded:", req.file.path)

    return res.json({
      success: true,
      url: req.file.path,
      key: req.file.key,
      message: "Upload successful",
    })
  })
})

export default router
