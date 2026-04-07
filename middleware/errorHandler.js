// Error handling middleware for the Resume Builder application

/**
 * Global error handler middleware
 * Must be the last middleware in the application
 */
const errorHandler = (err, req, res, next) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Log error details
    console.error('❌ Error occurred:', {
        message: err.message,
        stack: isDevelopment ? err.stack : undefined,
        url: req.originalUrl,
        method: req.method,
    });

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;
    
    // Determine error message
    let message = err.message || 'Internal Server Error';
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: isDevelopment ? Object.values(err.errors).map(e => e.message) : undefined,
            message: 'Invalid input data'
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            error: 'Invalid ID format',
            message: 'The provided ID is invalid'
        });
    }

    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        return res.status(500).json({
            error: 'Database Error',
            message: isDevelopment ? err.message : 'Database operation failed'
        });
    }

    // Hide sensitive information in production
    if (!isDevelopment) {
        message = statusCode === 500 ? 'Internal Server Error' : message;
    }

    // Send error response
    res.status(statusCode).json({
        error: true,
        statusCode,
        message,
        ...(isDevelopment && { stack: err.stack })
    });
};

/**
 * Async error wrapper for route handlers
 * Wraps async route handlers to catch errors and pass them to error handler
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Not Found handler
 * Should be used as a catch-all route
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: true,
        statusCode: 404,
        message: 'Route not found',
        url: req.originalUrl
    });
};

module.exports = {
    errorHandler,
    asyncHandler,
    notFoundHandler
};
