/**
 * Custom operational error class for the application.
 *
 * Thrown in controllers / services and caught by the global error handler
 * to produce structured JSON error responses.
 */
class ApiError extends Error {
  /**
   * @param {number}   statusCode  HTTP status code
   * @param {string}   message     Human-readable explanation
   * @param {string}   [errorCode] Machine-readable error code (e.g. 'FARM_NOT_FOUND')
   * @param {object[]} [errors]    Optional array of field-level validation errors
   */
  constructor(statusCode, message, errorCode = 'UNKNOWN_ERROR', errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    this.isOperational = true; // distinguishes expected errors from bugs

    Error.captureStackTrace(this, this.constructor);
  }

  // ── Factory methods for common cases ─────────────────────────

  static badRequest(message, errorCode = 'BAD_REQUEST', errors = []) {
    return new ApiError(400, message, errorCode, errors);
  }

  static notFound(message = 'Resource not found', errorCode = 'NOT_FOUND') {
    return new ApiError(404, message, errorCode);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, 'INTERNAL_ERROR');
  }

  static conflict(message, errorCode = 'CONFLICT') {
    return new ApiError(409, message, errorCode);
  }
}

module.exports = ApiError;
