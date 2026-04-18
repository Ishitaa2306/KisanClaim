/**
 * Request-level validation middleware.
 *
 * Validates query params and path params before they reach the controller.
 * Returns structured 400 errors with per-field details.
 */

const ApiError = require('../utils/ApiError');

/**
 * Validate pagination query params.
 */
function validatePagination(req, _res, next) {
  const errors = [];
  const { page, limit } = req.query;

  if (page !== undefined) {
    const p = parseInt(page, 10);
    if (Number.isNaN(p) || p < 1) {
      errors.push({ field: 'page', message: 'Must be a positive integer' });
    }
  }

  if (limit !== undefined) {
    const l = parseInt(limit, 10);
    if (Number.isNaN(l) || l < 1 || l > 100) {
      errors.push({ field: 'limit', message: 'Must be an integer between 1 and 100' });
    }
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest('Invalid query parameters', 'VALIDATION_ERROR', errors));
  }

  // Normalise parsed values
  req.query.page = parseInt(page, 10) || 1;
  req.query.limit = parseInt(limit, 10) || 20;

  return next();
}

/**
 * Validate the farm ID path parameter format.
 */
function validateFarmId(req, _res, next) {
  const { farmId } = req.params;

  if (!farmId || !/^KCF-\d{4}$/.test(farmId)) {
    return next(
      ApiError.badRequest(
        `Invalid farm ID format '${farmId}'. Expected KCF-XXXX (e.g. KCF-0042)`,
        'INVALID_FARM_ID',
      ),
    );
  }

  return next();
}

module.exports = {
  validatePagination,
  validateFarmId,
};
