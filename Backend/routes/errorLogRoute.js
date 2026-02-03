import express from "express"
import authMiddleware from "../middleware/auth.js"
import {
    createErrorLog,
    listErrorLogs,
    resolveErrorLog,
    deleteErrorLog,
    getErrorStats
} from "../controllers/errorLogController.js"

const errorLogRouter = express.Router()

// Public route - for logging frontend errors
errorLogRouter.post("/", createErrorLog)

// Admin routes - require authentication
errorLogRouter.get("/list", authMiddleware, listErrorLogs)
errorLogRouter.get("/stats", authMiddleware, getErrorStats)
errorLogRouter.patch("/:id/resolve", authMiddleware, resolveErrorLog)
errorLogRouter.delete("/:id", authMiddleware, deleteErrorLog)

export default errorLogRouter
