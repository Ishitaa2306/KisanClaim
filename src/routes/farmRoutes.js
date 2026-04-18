/**
 * Farm routes — /api/v1/farms
 */

const { Router } = require('express');
const farmController = require('../controllers/farmController');
const asyncHandler = require('../middleware/asyncHandler');
const { validatePagination, validateFarmId } = require('../middleware/validators');

const router = Router();

// ── Aggregate endpoints (must be registered BEFORE :farmId) ──
router.get(
  '/stats/intelligence',
  asyncHandler(farmController.getIntelligenceStats),
);

// Legacy alias for backward compatibility
router.get(
  '/stats/damage',
  asyncHandler(farmController.getIntelligenceStats),
);

// ── Collection ───────────────────────────────────────────────
router.get(
  '/',
  validatePagination,
  asyncHandler(farmController.getAll),
);

// ── Single resource ──────────────────────────────────────────
router.get(
  '/:farmId',
  validateFarmId,
  asyncHandler(farmController.getById),
);

module.exports = router;
