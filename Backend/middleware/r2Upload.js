import multer from "multer"
import sharp from "sharp"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import r2Client from "../config/r2.js"

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]

const generateKey = (fieldname, ext) => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  return `food-delivery/uploads/${fieldname}-${timestamp}-${random}.${ext}`
}

class R2Storage {
  _handleFile(req, file, cb) {
    const chunks = []

    file.stream.on("data", (chunk) => chunks.push(chunk))

    file.stream.on("end", async () => {
      try {
        const inputBuffer = Buffer.concat(chunks)
        const isSvg = file.mimetype === "image/svg+xml"

        let uploadBuffer
        let contentType
        let ext

        if (isSvg) {
          uploadBuffer = inputBuffer
          contentType = "image/svg+xml"
          ext = "svg"
        } else {
          uploadBuffer = await sharp(inputBuffer)
            .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer()
          contentType = "image/webp"
          ext = "webp"
        }

        const key = generateKey(file.fieldname, ext)
        const bucket = process.env.R2_BUCKET_NAME

        await r2Client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: uploadBuffer,
            ContentType: contentType,
            CacheControl: "public, max-age=31536000, immutable",
          })
        )

        const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`

        cb(null, {
          fieldname: file.fieldname,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: contentType,
          size: uploadBuffer.length,
          key,
          path: publicUrl,
          filename: key,
          location: publicUrl,
        })
      } catch (error) {
        console.error("R2 upload error:", error)
        cb(error)
      }
    })

    file.stream.on("error", (error) => {
      console.error("File stream error:", error)
      cb(error)
    })
  }

  _removeFile(req, file, cb) {
    cb(null)
  }
}

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP, and SVG are allowed.`
      ),
      false
    )
  }
  cb(null, true)
}

export const r2Upload = multer({
  storage: new R2Storage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
})
