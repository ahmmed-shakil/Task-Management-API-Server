"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    console.error("Error:", err);
    // Default error
    let error = {
        success: false,
        message: err.message || "Internal Server Error",
        statusCode: err.statusCode || 500,
    };
    // PostgreSQL errors
    if (err.code) {
        switch (err.code) {
            case "23505": // Unique violation
                error.message = "Resource already exists";
                error.statusCode = 409;
                break;
            case "23503": // Foreign key violation
                error.message = "Referenced resource does not exist";
                error.statusCode = 400;
                break;
            case "23502": // Not null violation
                error.message = "Required field is missing";
                error.statusCode = 400;
                break;
            case "22001": // String data too long
                error.message = "Data too long for field";
                error.statusCode = 400;
                break;
            default:
                error.message = "Database error occurred";
                error.statusCode = 500;
        }
    }
    // JWT errors
    if (err.name === "JsonWebTokenError") {
        error.message = "Invalid token";
        error.statusCode = 401;
    }
    else if (err.name === "TokenExpiredError") {
        error.message = "Token expired";
        error.statusCode = 401;
    }
    // Validation errors
    if (err.name === "ValidationError" && err.errors) {
        error.message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
        error.statusCode = 400;
    }
    // Multer errors
    if (err.code === "LIMIT_FILE_SIZE") {
        error.message = "File size too large";
        error.statusCode = 400;
    }
    // Custom errors
    if (err.isOperational) {
        error.message = err.message;
        error.statusCode = err.statusCode || 500;
    }
    // Send error response
    res.status(error.statusCode).json({
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
// Custom error class
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
