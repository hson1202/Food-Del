/**
 * Enhanced error logging middleware
 * Logs errors to the database for admin review
 */
export const logErrorToDatabase = async (error, req) => {
    try {
        const errorLogModel = (await import('../models/errorLogModel.js')).default;

        // Determine status code
        const statusCode = error.statusCode || error.status || 500;

        // Create error log entry
        await errorLogModel.create({
            message: error.message || 'Unknown error',
            stack: error.stack,
            level: statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warning' : 'info',
            source: 'backend',
            url: req.originalUrl || req.url,
            method: req.method,
            userId: req.user ? req.user.id : null,
            userAgent: req.headers['user-agent'],
            additionalData: {
                statusCode,
                body: req.body,
                query: req.query,
                params: req.params
            }
        });
    } catch (logError) {
        // Don't let logging errors break the error response
        console.error('Failed to log error to database:', logError.message);
    }
};

/**
 * Global error handler middleware with database logging
 * Should be added at the end of all routes in server.js
 */
export const errorHandlerWithLogging = async (error, req, res, next) => {
    // Import the existing errorHandler
    const { errorHandler } = await import('./security.js');

    // Log error to database (non-blocking)
    await logErrorToDatabase(error, req);

    // Call the original error handler
    errorHandler(error, req, res, next);
};
