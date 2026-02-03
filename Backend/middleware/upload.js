import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import cloudinary from "../config/cloudinary.js"

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Strict MIME type validation
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP images are allowed.`);
    }

    return {
      folder: "food-delivery/uploads",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      use_filename: true,
      unique_filename: true,
      transformation: [{ width: 1600, height: 1600, crop: "limit" }]
    };
  }
})

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
})


