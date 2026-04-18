/**
 * Wraps an async route handler so thrown errors are forwarded to
 * the Express error handler instead of crashing the process.
 *
 * Usage:
 *   router.get('/farms', asyncHandler(farmController.getAll));
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
