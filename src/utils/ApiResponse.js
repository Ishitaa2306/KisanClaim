/**
 * Standardised success response wrapper.
 *
 * Every API response follows the shape:
 * {
 *   success: true,
 *   statusCode: 200,
 *   message: '...',
 *   data: { ... },
 *   meta: { ... }          // optional pagination / count info
 * }
 */
class ApiResponse {
  /**
   * @param {number} statusCode  HTTP status code
   * @param {string} message     Human-readable summary
   * @param {*}      data        Response payload
   * @param {object} [meta]      Optional metadata (pagination, counts, etc.)
   */
  constructor(statusCode, message, data = null, meta = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;

    if (meta) {
      this.meta = meta;
    }
  }

  /** Convenience: send this response through an Express `res` object */
  send(res) {
    return res.status(this.statusCode).json(this);
  }
}

module.exports = ApiResponse;
