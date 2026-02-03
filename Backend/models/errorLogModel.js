import mongoose from "mongoose"

const errorLogSchema = new mongoose.Schema({
    // Error information
    message: { type: String, required: true },
    stack: { type: String, required: false },
    level: {
        type: String,
        enum: ['error', 'warning', 'info'],
        default: 'error'
    },

    // Source information
    source: {
        type: String,
        enum: ['backend', 'frontend', 'admin'],
        default: 'backend'
    },

    // Request information
    url: { type: String, required: false },
    method: { type: String, required: false },

    // User information
    userId: { type: String, required: false },
    userAgent: { type: String, required: false },

    // Additional context
    additionalData: { type: Object, required: false },

    // Status
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date, required: false },
    resolvedBy: { type: String, required: false }
}, {
    timestamps: true
})

// Index for faster queries
errorLogSchema.index({ level: 1, createdAt: -1 })
errorLogSchema.index({ source: 1, createdAt: -1 })
errorLogSchema.index({ resolved: 1, createdAt: -1 })

const errorLogModel = mongoose.models.errorLog || mongoose.model("errorLog", errorLogSchema)
export default errorLogModel
