/**
 * Global error-handling middleware.
 *
 * Catches both operational errors (ApiError) and unexpected exceptions,
 * and returns a consistent JSON error shape.
 */

const config = require('../config');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  // Default to 500 if not an operational error
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  const response = {
    success: false,
    statusCode,
    message: isOperational ? err.message : 'An unexpected error occurred',
    errorCode: err.errorCode || 'INTERNAL_ERROR',
  };

  // Attach field-level errors if present
  if (err.errors && err.errors.length > 0) {
    response.errors = err.errors;
  }

  // Expose stack in development only
  if (!config.isProduction) {
    response.stack = err.stack;
  }

  // Log unexpected errors loudly
  if (!isOperational) {
    console.error('💥 Unexpected error:', err);
  }

  return res.status(statusCode).json(response);
}

module.exports = errorHandler;
