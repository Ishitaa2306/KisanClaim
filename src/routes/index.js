/**
 * Top-level route registry.
 *
 * Each feature domain gets its own route file; this module stitches
 * them together under a versioned prefix.
 */

const { Router } = require('express');
const farmRoutes = require('./farmRoutes');
const integrationRoutes = require('./integrationRoutes');
const mobileRoutes = require('./mobileRoutes');
const apiRoutes = require('./apiRoutes');
const authRoutes = require('./authRoutes');
const geeRoutes = require('./geeRoutes');
const ApiResponse = require('../utils/ApiResponse');

const router = Router();

// ── Health check (no version prefix) ─────────────────────────
router.get('/health', (_req, res) => {
  new ApiResponse(200, 'KisanClaim API is healthy', {
    uptime: `${Math.round(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    modules: ['farms', 'claims', 'farmers', 'notifications', 'weather', 'map', 'reports', 'activity', 'history'],
  }).send(res);
});

// ── v1 API (dashboard) ───────────────────────────────────────
router.use('/api/v1/farms', farmRoutes);
router.use('/api/v1', integrationRoutes);

// ── v1 Mobile API ────────────────────────────────────────────
router.use('/api/v1/mobile', mobileRoutes);

// ── Unversioned /api/* endpoints (mobile app spec) ───────────
router.use('/api', apiRoutes);

// ── Auth API ───────────────────────────────────────────────────
router.use('/api/auth', authRoutes);

// ── GEE (Google Earth Engine) API ────────────────────────────
router.use('/api/v1/gee', geeRoutes);

module.exports = router;

