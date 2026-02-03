import errorLogModel from "../models/errorLogModel.js"

// Create a new error log
const createErrorLog = async (req, res) => {
    try {
        const { message, stack, level, source, url, method, additionalData } = req.body

        // Extract user info if available
        const userId = req.body.userId || (req.user ? req.user.id : null)
        const userAgent = req.headers['user-agent']

        const errorLog = new errorLogModel({
            message,
            stack,
            level: level || 'error',
            source: source || 'frontend',
            url,
            method,
            userId,
            userAgent,
            additionalData
        })

        await errorLog.save()

        res.json({
            success: true,
            message: "Error logged successfully",
            logId: errorLog._id
        })
    } catch (error) {
        console.error("Failed to create error log:", error)
        res.status(500).json({
            success: false,
            message: "Failed to log error"
        })
    }
}

// List error logs with pagination and filters
const listErrorLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            level,
            source,
            resolved,
            startDate,
            endDate,
            search
        } = req.query

        // Build query
        const query = {}

        if (level) {
            query.level = level
        }

        if (source) {
            query.source = source
        }

        if (resolved !== undefined) {
            query.resolved = resolved === 'true'
        }

        if (startDate || endDate) {
            query.createdAt = {}
            if (startDate) {
                query.createdAt.$gte = new Date(startDate)
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate)
            }
        }

        if (search) {
            query.$or = [
                { message: { $regex: search, $options: 'i' } },
                { url: { $regex: search, $options: 'i' } }
            ]
        }

        // Execute query with pagination
        const total = await errorLogModel.countDocuments(query)
        const errorLogs = await errorLogModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        res.json({
            success: true,
            data: errorLogs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error("Failed to list error logs:", error)
        res.status(500).json({
            success: false,
            message: "Failed to retrieve error logs"
        })
    }
}

// Mark an error log as resolved
const resolveErrorLog = async (req, res) => {
    try {
        const { id } = req.params
        const adminId = req.user ? req.user.id : null

        const errorLog = await errorLogModel.findByIdAndUpdate(
            id,
            {
                resolved: true,
                resolvedAt: new Date(),
                resolvedBy: adminId
            },
            { new: true }
        )

        if (!errorLog) {
            return res.status(404).json({
                success: false,
                message: "Error log not found"
            })
        }

        res.json({
            success: true,
            message: "Error log marked as resolved",
            data: errorLog
        })
    } catch (error) {
        console.error("Failed to resolve error log:", error)
        res.status(500).json({
            success: false,
            message: "Failed to resolve error log"
        })
    }
}

// Delete an error log
const deleteErrorLog = async (req, res) => {
    try {
        const { id } = req.params

        const errorLog = await errorLogModel.findByIdAndDelete(id)

        if (!errorLog) {
            return res.status(404).json({
                success: false,
                message: "Error log not found"
            })
        }

        res.json({
            success: true,
            message: "Error log deleted successfully"
        })
    } catch (error) {
        console.error("Failed to delete error log:", error)
        res.status(500).json({
            success: false,
            message: "Failed to delete error log"
        })
    }
}

// Get error statistics
const getErrorStats = async (req, res) => {
    try {
        const { days = 7 } = req.query
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - parseInt(days))

        // Get total errors
        const total = await errorLogModel.countDocuments({
            createdAt: { $gte: startDate }
        })

        // Get errors by level
        const byLevel = await errorLogModel.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: "$level", count: { $sum: 1 } } }
        ])

        // Get errors by source
        const bySource = await errorLogModel.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: "$source", count: { $sum: 1 } } }
        ])

        // Get unresolved count
        const unresolved = await errorLogModel.countDocuments({
            resolved: false,
            createdAt: { $gte: startDate }
        })

        res.json({
            success: true,
            stats: {
                total,
                unresolved,
                byLevel: byLevel.reduce((acc, item) => {
                    acc[item._id] = item.count
                    return acc
                }, {}),
                bySource: bySource.reduce((acc, item) => {
                    acc[item._id] = item.count
                    return acc
                }, {})
            }
        })
    } catch (error) {
        console.error("Failed to get error stats:", error)
        res.status(500).json({
            success: false,
            message: "Failed to retrieve error statistics"
        })
    }
}

export {
    createErrorLog,
    listErrorLogs,
    resolveErrorLog,
    deleteErrorLog,
    getErrorStats
}
