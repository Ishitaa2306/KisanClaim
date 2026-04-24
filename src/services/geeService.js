/**
 * Google Earth Engine (GEE) Service — NDVI Computation.
 *
 * Provides live NDVI values for any lat/lng coordinate using
 * Sentinel-2 imagery (COPERNICUS/S2_SR_HARMONIZED) via the
 * official @google/earthengine SDK.
 *
 * Authentication:
 *   Option A — Service Account key file (recommended for servers):
 *     Set env var  GEE_KEY_FILE  to the absolute path of the JSON key,
 *     or place a file named  gee-service-account-key.json  in project root.
 *
 *   Option B — User credentials (interactive / dev machine):
 *     Run `earthengine authenticate` in your terminal once.
 *     The SDK will pick up the persisted token automatically.
 *
 * This module is fully self-contained and does NOT modify any
 * existing KisanClaim service, model, or route.
 */

const ee = require('@google/earthengine');
const path = require('path');
const fs = require('fs');

// ── Singleton state ──────────────────────────────────────────
let _initialized = false;
let _initializing = null;   // holds the in-flight promise
let _initError = null;

// ── GEE configuration ───────────────────────────────────────
const GEE_CONFIG = Object.freeze({
  /** Sentinel-2 Surface Reflectance Harmonized collection */
  COLLECTION: 'COPERNICUS/S2_SR_HARMONIZED',
  /** Maximum cloud cover percentage for scene filtering */
  MAX_CLOUD_PERCENT: 20,
  /** Buffer radius (meters) around the point of interest */
  BUFFER_METERS: 500,
  /** Reduction scale in meters (Sentinel-2 native = 10 m) */
  SCALE: 10,
  /** How many months back from today to look for imagery */
  LOOKBACK_MONTHS: 3,
  /** Bands used: B8 = NIR, B4 = Red */
  BANDS: ['B4', 'B8'],
});

// ══════════════════════════════════════════════════════════════
//  INITIALIZATION
// ══════════════════════════════════════════════════════════════

/**
 * Locate the service-account JSON key file.
 * Returns the parsed JSON object, or null if not found.
 */
function _findServiceAccountKey() {
  // Priority 1: explicit env var
  const envPath = process.env.GEE_KEY_FILE;
  if (envPath && fs.existsSync(envPath)) {
    try { return JSON.parse(fs.readFileSync(envPath, 'utf8')); } catch { /* fall through */ }
  }

  // Priority 2: project-root convention
  const rootPath = path.resolve(__dirname, '../../gee-service-account-key.json');
  if (fs.existsSync(rootPath)) {
    try { return JSON.parse(fs.readFileSync(rootPath, 'utf8')); } catch { /* fall through */ }
  }

  return null;
}

/**
 * Initialize the Earth Engine SDK (singleton — safe to call many times).
 * Resolves when ready, rejects with a descriptive error if auth fails.
 */
function initialize() {
  if (_initialized) return Promise.resolve();
  if (_initError)   return Promise.reject(_initError);
  if (_initializing) return _initializing;

  _initializing = new Promise((resolve, reject) => {
    const serviceKey = _findServiceAccountKey();

    const onInitSuccess = () => {
      _initialized = true;
      _initializing = null;
      console.log('  ✔  GEE Service: Earth Engine initialized successfully');
      resolve();
    };

    const onInitFailure = (err) => {
      _initError = new Error(`GEE initialization failed: ${err?.message || err}`);
      _initializing = null;
      console.error(`  ✖  GEE Service: ${_initError.message}`);
      reject(_initError);
    };

    if (serviceKey) {
      // ── Service Account auth ─────────────────────────────
      console.log('  ⏳ GEE Service: Authenticating via service account...');
      ee.data.authenticateViaPrivateKey(
        serviceKey,
        () => ee.initialize(null, null, onInitSuccess, onInitFailure),
        (authErr) => {
          _initError = new Error(
            `GEE service-account authentication failed: ${authErr?.message || authErr}`
          );
          _initializing = null;
          console.error(`  ✖  GEE Service: ${_initError.message}`);
          reject(_initError);
        },
      );
    } else {
      // ── Default / user credentials (earthengine authenticate) ──
      console.log('  ⏳ GEE Service: Authenticating via default credentials...');
      try {
        ee.initialize(null, null, onInitSuccess, onInitFailure);
      } catch (err) {
        onInitFailure(err);
      }
    }
  });

  return _initializing;
}

// ══════════════════════════════════════════════════════════════
//  NDVI COMPUTATION
// ══════════════════════════════════════════════════════════════

/**
 * Interpret an NDVI value into a human-readable vegetation status.
 *
 * @param {number} ndvi  NDVI value (-1 to 1)
 * @returns {string}
 */
function interpretNdvi(ndvi) {
  if (ndvi === null || ndvi === undefined || isNaN(ndvi)) return 'no data';
  if (ndvi < 0)   return 'water / non-vegetation';
  if (ndvi < 0.1) return 'barren / bare soil';
  if (ndvi < 0.3) return 'low vegetation';
  if (ndvi < 0.6) return 'moderate vegetation';
  return 'healthy vegetation';
}

/**
 * Compute the mean NDVI for a geographic point using Sentinel-2 imagery.
 *
 * This is the PRIMARY exported function — the single gateway for
 * satellite-derived NDVI data.
 *
 * @param {number} lat  Latitude  (WGS 84)
 * @param {number} lng  Longitude (WGS 84)
 * @returns {Promise<object>}
 *   {
 *     ndvi:     number | null,
 *     status:   string,
 *     source:   "SENTINEL",
 *     scenes:   number,
 *     window:   { start: string, end: string },
 *     timestamp: string   // ISO-8601
 *   }
 */
async function getNDVI(lat, lng) {
  // ── Ensure GEE is ready ──────────────────────────────────
  await initialize();

  return new Promise((resolve, reject) => {
    try {
      // ── 1. Geometry ────────────────────────────────────────
      const point    = ee.Geometry.Point([lng, lat]);
      const buffered = point.buffer(GEE_CONFIG.BUFFER_METERS);

      // ── 2. Date window ─────────────────────────────────────
      const endDate   = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - GEE_CONFIG.LOOKBACK_MONTHS);

      const startStr = startDate.toISOString().split('T')[0];
      const endStr   = endDate.toISOString().split('T')[0];

      // ── 3. Load & filter Sentinel-2 collection ─────────────
      const collection = ee.ImageCollection(GEE_CONFIG.COLLECTION)
        .filterDate(startStr, endStr)
        .filterBounds(point)
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', GEE_CONFIG.MAX_CLOUD_PERCENT))
        .select(GEE_CONFIG.BANDS);

      // ── 4. Count available scenes (for diagnostics) ────────
      const countPromise = new Promise((res, rej) => {
        collection.size().evaluate((count, err) => {
          if (err) return rej(err);
          res(count);
        });
      });

      countPromise.then((sceneCount) => {
        if (sceneCount === 0) {
          return resolve({
            ndvi: null,
            status: 'no data',
            source: 'SENTINEL',
            scenes: 0,
            window: { start: startStr, end: endStr },
            timestamp: new Date().toISOString(),
            note: 'No cloud-free Sentinel-2 scenes found for this location and time window.',
          });
        }

        // ── 5. Compute median NDVI ─────────────────────────────
        const ndviImage = collection
          .median()
          .normalizedDifference(['B8', 'B4'])  // (NIR - Red) / (NIR + Red)
          .rename('ndvi');

        // ── 6. Reduce to single value ──────────────────────────
        const reduction = ndviImage.reduceRegion({
          reducer:  ee.Reducer.mean(),
          geometry: buffered,
          scale:    GEE_CONFIG.SCALE,
          maxPixels: 1e8,
        });

        reduction.evaluate((result, err) => {
          if (err) {
            console.error('[GEE] reduceRegion error:', err);
            return reject(new Error(`GEE computation failed: ${err}`));
          }

          const rawNdvi = result?.ndvi ?? null;
          const ndvi    = rawNdvi !== null ? Math.round(rawNdvi * 10000) / 10000 : null;

          resolve({
            ndvi,
            status: interpretNdvi(ndvi),
            source: 'SENTINEL',
            scenes: sceneCount,
            window: { start: startStr, end: endStr },
            timestamp: new Date().toISOString(),
          });
        });
      }).catch((err) => {
        console.error('[GEE] scene count error:', err);
        reject(new Error(`GEE scene query failed: ${err?.message || err}`));
      });

    } catch (err) {
      reject(new Error(`GEE service error: ${err.message}`));
    }
  });
}

// ══════════════════════════════════════════════════════════════
//  STATUS CHECK
// ══════════════════════════════════════════════════════════════

/**
 * Returns the current initialization state of the GEE service.
 * Useful for health-check endpoints.
 */
function getStatus() {
  return {
    initialized: _initialized,
    hasError: !!_initError,
    error: _initError?.message || null,
  };
}

// ══════════════════════════════════════════════════════════════
//  EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  initialize,
  getNDVI,
  interpretNdvi,
  getStatus,
};
