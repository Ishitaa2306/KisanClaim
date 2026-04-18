/**
 * Top-level route registry.
 *
 * Each feature domain gets its own route file; this module stitches
 * them together under a versioned prefix.
 */

const { Router } = require('express');
const farmRoutes = require('./farmRoutes');
const ApiResponse = require('../utils/ApiResponse');

const router = Router();

// ── Health check (no version prefix) ─────────────────────────
router.get('/health', (_req, res) => {
  new ApiResponse(200, 'KisanClaim API is healthy', {
    uptime: `${Math.round(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  }).send(res);
});

// ── v1 API ───────────────────────────────────────────────────
router.use('/api/v1/farms', farmRoutes);

// ── Future route mounting points ─────────────────────────────
// router.use('/api/v1/claims', claimRoutes);
// router.use('/api/v1/fraud',  fraudRoutes);
// router.use('/api/v1/satellite', satelliteRoutes);

module.exports = router;
