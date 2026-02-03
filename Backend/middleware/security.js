import xss from 'xss';

/**
 * Sanitize input to prevent XSS attacks
 * Removes dangerous HTML/JavaScript from user input
 */
export const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        return xss(input.trim());
    }

    if (typeof input === 'object' && input !== null) {
        if (Array.isArray(input)) {
            return input.map(item => sanitizeInput(item));
        }

        const sanitized = {};
        for (const key in input) {
            if (input.hasOwnProperty(key)) {
                sanitized[key] = sanitizeInput(input[key]);
            }
        }
        return sanitized;
    }

    return input;
};

/**
 * Middleware to sanitize request body, query, and params
 * Apply this to routes that accept user input
 */
export const sanitizeRequest = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeInput(req.body);
    }

    if (req.query) {
        req.query = sanitizeInput(req.query);
    }

    if (req.params) {
        req.params = sanitizeInput(req.params);
    }

    next();
};

/**
 * Safe error response formatter for production
 * Hides sensitive error details in production
 */
export const formatErrorResponse = (error, req) => {
    const isProduction = process.env.NODE_ENV === 'production';

    // Log full error internally
    console.error('Error:', {
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Return safe error to client
    if (isProduction) {
        return {
            success: false,
            message: 'An error occurred. Please try again later.',
            code: error.code || 'INTERNAL_ERROR'
        };
    } else {
        return {
            success: false,
            message: error.message,
            stack: error.stack,
            code: error.code || 'INTERNAL_ERROR'
        };
    }
};

/**
 * Global error handler middleware
 * Should be added at the end of all routes in server.js
 */
export const errorHandler = (error, req, res, next) => {
    const response = formatErrorResponse(error, req);

    // Determine status code
    const statusCode = error.statusCode || error.status || 500;

    res.status(statusCode).json(response);
};

/**
 * Validate required fields in request body
 */
export const validateRequiredFields = (fields) => {
    return (req, res, next) => {
        const missingFields = [];

        for (const field of fields) {
            if (!req.body[field]) {
                missingFields.push(field);
            }
        }

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        next();
    };
};

/**
 * XSS options configuration
 * Customizable whitelist for allowed HTML tags
 */
export const xssOptions = {
    whiteList: {}, // No HTML tags allowed by default
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style']
};
