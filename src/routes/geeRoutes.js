/**
 * GEE Routes — Google Earth Engine NDVI API.
 *
 * Provides a NEW, isolated endpoint for fetching live NDVI values
 * from Sentinel-2 imagery via Google Earth Engine.
 *
 * Mount point: /api/v1/gee
 *
 * Endpoints:
 *   GET /api/v1/gee/ndvi?lat=xx&lng=xx   — Compute NDVI for a coordinate
 *   GET /api/v1/gee/status                — Check GEE initialization state
 *
 * This module does NOT modify any existing route, controller, or service.
 */

const { Router } = require('express');
const geeService = require('../services/geeService');
const ApiResponse = require('../utils/ApiResponse');

const router = Router();

// ═══════════════════════════════════════════════════════════════
//  GET /ndvi?lat=xx&lng=xx
//  Compute live NDVI for a geographic coordinate
// ═══════════════════════════════════════════════════════════════

router.get('/ndvi', async (req, res) => {
  try {
    const { lat, lng } = req.query;

    // ── Validate inputs ──────────────────────────────────────
    if (lat === undefined || lng === undefined) {
      return new ApiResponse(400, 'Missing required query parameters: lat and lng').send(res);
    }

    const latitude  = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return new ApiResponse(400, 'lat and lng must be valid numbers').send(res);
    }

    if (latitude < -90 || latitude > 90) {
      return new ApiResponse(400, 'lat must be between -90 and 90').send(res);
    }

    if (longitude < -180 || longitude > 180) {
      return new ApiResponse(400, 'lng must be between -180 and 180').send(res);
    }

    // ── Compute NDVI via GEE ─────────────────────────────────
    const result = await geeService.getNDVI(latitude, longitude);

    return new ApiResponse(200, 'NDVI computed successfully via Google Earth Engine', result).send(res);

  } catch (error) {
    console.error('[GEE Route] /ndvi error:', error.message);

    // Distinguish auth/init errors from computation errors
    if (error.message.includes('initialization') || error.message.includes('authentication')) {
      return new ApiResponse(503, 'Google Earth Engine is not available. Check server authentication setup.', {
        error: error.message,
        help: 'Run "earthengine authenticate" on the server, or provide a service account key file.',
      }).send(res);
    }

    return new ApiResponse(500, 'Failed to compute NDVI', { error: error.message }).send(res);
  }
});

// ═══════════════════════════════════════════════════════════════
//  GET /status
//  Check whether GEE is initialized and ready
// ═══════════════════════════════════════════════════════════════

router.get('/status', (_req, res) => {
  const status = geeService.getStatus();

  const httpCode = status.initialized ? 200 : (status.hasError ? 503 : 202);
  const message  = status.initialized
    ? 'Google Earth Engine is initialized and ready'
    : status.hasError
      ? 'Google Earth Engine initialization failed'
      : 'Google Earth Engine has not been initialized yet';

  return new ApiResponse(httpCode, message, status).send(res);
});

module.exports = router;
