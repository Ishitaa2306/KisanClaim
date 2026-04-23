/**
 * Multi-Factor Fraud Detection Engine.
 *
 * Produces a composite fraudScore (0–100) by running multiple independent
 * detection modules ("checks"), each contributing a weighted sub-score.
 *
 * Pipeline position:  Claim Engine → [ Fraud Detection ] → Response
 */

const farmStore = require('../models/Farm');
const { calculateDamage } = require('../utils/ndviAnalyzer');

// ── Configuration ─────────────────────────────────────────────

const CHECK_WEIGHTS = {
  neighborAnomaly:    0.35,
  logicalConsistency: 0.35,
  temporalPattern:    0.15,
  statisticalOutlier: 0.10,
  claimValueRatio:    0.05,
};

const FRAUD_THRESHOLDS = { low: 30.0, medium: 60.0 };

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Precomputed dataset statistics (cached) ───────────────────

let _statsCache = null;

/**
 * Build dataset stats. Now accepts an optional pre-fetched farms array
 * to avoid async issues in the sync analysis pipeline.
 */
function buildStats(farms) {
  const damages = farms.map(f => {
    const d = calculateDamage(f.ndviBefore, f.ndviAfter);
    return { ...f, _dmg: d.damagePercentage, _drop: d.ndviDrop };
  });

  const dmgValues = damages.map(d => d._dmg);
  const mean = dmgValues.reduce((a, b) => a + b, 0) / dmgValues.length;
  const variance = dmgValues.reduce((sum, v) => sum + (v - mean) ** 2, 0) / dmgValues.length;
  const stdDev = Math.sqrt(variance);

  const cropStats = {};
  for (const d of damages) {
    if (!cropStats[d.cropType]) cropStats[d.cropType] = { values: [], drops: [] };
    cropStats[d.cropType].values.push(d._dmg);
    cropStats[d.cropType].drops.push(d._drop);
  }
  for (const [crop, stats] of Object.entries(cropStats)) {
    const vals = stats.values;
    const m = vals.reduce((a, b) => a + b, 0) / vals.length;
    const sd = Math.sqrt(vals.reduce((s, v) => s + (v - m) ** 2, 0) / vals.length);
    cropStats[crop] = { mean: m, stdDev: sd, count: vals.length };
  }

  _statsCache = { mean, stdDev, count: dmgValues.length, cropStats, farms: damages };
  return _statsCache;
}

function getDatasetStats() {
  if (_statsCache) return _statsCache;
  // If cache is not populated yet, return empty stats (will be populated on first analyzeMany call)
  return { mean: 0, stdDev: 1, count: 0, cropStats: {}, farms: [] };
}

/**
 * Pre-warm the stats cache with all farms. 
 * Called from analysisService.analyzeMany before running fraud checks.
 */
function warmCache(farms) {
  if (!_statsCache) {
    buildStats(farms);
  }
}

// ── Check 1: Neighbor Anomaly ─────────────────────────────────

function checkNeighborAnomaly(farm, damagePercent) {
  const stats = getDatasetStats();
  const RADIUS_KM = 50;

  const neighbors = stats.farms.filter(f => {
    if (f.farmId === farm.farmId) return false;
    return haversineKm(farm.location.latitude, farm.location.longitude, f.location.latitude, f.location.longitude) <= RADIUS_KM;
  });

  if (neighbors.length < 3) return 0; // Not enough neighbors to judge

  const neighborMean = neighbors.reduce((a, b) => a + b._dmg, 0) / neighbors.length;
  // If my damage is vastly higher than neighbors, score goes up
  if (damagePercent > neighborMean + 20) return 30;
  if (damagePercent > neighborMean + 10) return 15;
  return 0;
}

// ── Check 2: Abnormal NDVI Drop ──────────────────────────────

function checkAbnormalNdviDrop(farm, damagePercent) {
  const stats = getDatasetStats();
  const cropStat = stats.cropStats[farm.cropType];
  
  if (!cropStat || cropStat.stdDev === 0) return 0;

  const zScore = (damagePercent - cropStat.mean) / cropStat.stdDev;
  
  // If the drop is a massive statistical outlier for this crop
  if (zScore > 2.5) return 40;
  if (zScore > 1.5) return 20;
  return 0;
}

// ── Check 3: Claim Frequency ───────────────────────────────

function checkClaimFrequency(farm) {
  // Since we don't have historical claim DB access here synchronously,
  // we simulate frequency score based on farm alerts and risk score mapping,
  // or we can use the existing 'farm.alerts' array if it mentions "Registration Anomaly"
  
  if (farm.alerts && farm.alerts.includes('Multiple Claims')) return 30;
  if (farm.alerts && farm.alerts.includes('Dynamic Registration Anomaly')) return 20;
  return 0;
}

// ── Composite Scoring ─────────────────────────────────────────

function analyzeFraud(farm, damagePercent) {
  const c1 = checkNeighborAnomaly(farm, damagePercent);
  const c2 = checkAbnormalNdviDrop(farm, damagePercent);
  const c3 = checkClaimFrequency(farm);

  let compositeScore = c1 + c2 + c3;
  
  // Bound the score 0-100
  compositeScore = Math.min(100, Math.max(0, compositeScore));

  // The classification is now handled by the central decision engine, 
  // but we return the raw score and checks.
  return {
    fraudScore: compositeScore,
    assessedAt: new Date().toISOString(),
    details: { neighborAnomalyScore: c1, abnormalNdviScore: c2, claimFrequencyScore: c3 }
  };
}

function clearCache() { _statsCache = null; }

module.exports = {
  analyzeFraud, clearCache, warmCache
};
