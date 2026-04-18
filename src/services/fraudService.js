/**
 * Multi-Factor Fraud Detection Engine.
 *
 * Produces a composite fraudScore (0–100) by running multiple independent
 * detection modules ("checks"), each contributing a weighted sub-score.
 *
 * Detection modules:
 *   1. Neighbor Anomaly  — Is this farm's NDVI drop drastically different
 *                          from geographically nearby farms?
 *   2. Statistical Outlier — Does the damage deviate from the dataset-wide
 *                           distribution (z-score based)?
 *   3. Logical Consistency — Are there impossible or highly implausible
 *                           value combinations?
 *   4. Temporal Pattern   — Was the policy enrolled suspiciously close
 *                           to the reported event?
 *   5. Claim-to-Value Ratio — Is the claim disproportionately large
 *                             relative to farm size?
 *
 * Pipeline position:  Claim Engine → [ Fraud Detection ] → Response
 */

const farmStore = require('../models/Farm');
const { calculateDamage } = require('../utils/ndviAnalyzer');

// ── Configuration ─────────────────────────────────────────────

const CHECK_WEIGHTS = {
  neighborAnomaly:    0.30,
  statisticalOutlier: 0.25,
  logicalConsistency: 0.25,
  temporalPattern:    0.10,
  claimValueRatio:    0.10,
};

const FRAUD_THRESHOLDS = {
  low:    30,
  medium: 55,
  high:   75,
};

// Haversine distance in km
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Precomputed dataset statistics (cached on first call) ─────

let _statsCache = null;

function getDatasetStats() {
  if (_statsCache) return _statsCache;

  const farms = farmStore.findAll();
  const damages = farms.map((f) => {
    const d = calculateDamage(f.ndviBefore, f.ndviAfter);
    return { ...f, _dmg: d.damagePercentage, _drop: d.ndviDrop };
  });

  const dmgValues = damages.map((d) => d._dmg);
  const mean = dmgValues.reduce((a, b) => a + b, 0) / dmgValues.length;
  const variance =
    dmgValues.reduce((sum, v) => sum + (v - mean) ** 2, 0) / dmgValues.length;
  const stdDev = Math.sqrt(variance);

  // Per-crop stats
  const cropStats = {};
  for (const d of damages) {
    if (!cropStats[d.cropType]) {
      cropStats[d.cropType] = { values: [], drops: [] };
    }
    cropStats[d.cropType].values.push(d._dmg);
    cropStats[d.cropType].drops.push(d._drop);
  }

  for (const [crop, stats] of Object.entries(cropStats)) {
    const vals = stats.values;
    const m = vals.reduce((a, b) => a + b, 0) / vals.length;
    const sd = Math.sqrt(
      vals.reduce((s, v) => s + (v - m) ** 2, 0) / vals.length,
    );
    cropStats[crop] = { mean: m, stdDev: sd, count: vals.length };
  }

  _statsCache = { mean, stdDev, count: dmgValues.length, cropStats, farms: damages };
  return _statsCache;
}

// ── Check 1: Neighbor Anomaly ─────────────────────────────────

/**
 * Compare this farm's NDVI drop against farms within a radius.
 * If this farm's drop is ≥2× the neighborhood average, it's suspicious.
 *
 * @returns {{ score: number, detail: object }}  score 0–100
 */
function checkNeighborAnomaly(farm, damagePercent) {
  const stats = getDatasetStats();
  const RADIUS_KM = 50;

  const neighbors = stats.farms.filter((f) => {
    if (f.farmId === farm.farmId) return false;
    const dist = haversineKm(
      farm.location.latitude, farm.location.longitude,
      f.location.latitude, f.location.longitude,
    );
    return dist <= RADIUS_KM;
  });

  if (neighbors.length < 3) {
    // Not enough neighbors to make a meaningful comparison
    return {
      score: 0,
      detail: {
        reason: 'INSUFFICIENT_NEIGHBORS',
        neighborsFound: neighbors.length,
        radiusKm: RADIUS_KM,
      },
    };
  }

  const neighborDamages = neighbors.map((n) => n._dmg);
  const neighborMean =
    neighborDamages.reduce((a, b) => a + b, 0) / neighborDamages.length;
  const neighborStdDev = Math.sqrt(
    neighborDamages.reduce((s, v) => s + (v - neighborMean) ** 2, 0) /
      neighborDamages.length,
  );

  // How many std-devs above the neighborhood mean?
  const zNeighbor = neighborStdDev > 0
    ? (damagePercent - neighborMean) / neighborStdDev
    : 0;

  // Deviation ratio: how much higher is this farm's damage vs mean?
  const deviationRatio = neighborMean > 0
    ? damagePercent / neighborMean
    : 1;

  // Score: sigmoid mapping z-score to 0–100
  let score = 0;
  if (zNeighbor > 1.0) {
    score = Math.min(100, Math.round(20 + (zNeighbor - 1) * 30));
  }
  // Boost if damage is 2× neighborhood
  if (deviationRatio > 2.0) {
    score = Math.min(100, score + 20);
  }

  return {
    score,
    detail: {
      neighborsAnalyzed: neighbors.length,
      radiusKm: RADIUS_KM,
      neighborMeanDamage: Math.round(neighborMean * 100) / 100,
      neighborStdDev: Math.round(neighborStdDev * 100) / 100,
      farmDamage: damagePercent,
      zScore: Math.round(zNeighbor * 100) / 100,
      deviationRatio: Math.round(deviationRatio * 100) / 100,
    },
  };
}

// ── Check 2: Statistical Outlier ──────────────────────────────

/**
 * Flag farms whose damage falls in the extreme tail of the
 * dataset-wide distribution (|z| > 2) or the crop-specific distribution.
 */
function checkStatisticalOutlier(farm, damagePercent) {
  const stats = getDatasetStats();

  // Global z-score
  const globalZ = stats.stdDev > 0
    ? (damagePercent - stats.mean) / stats.stdDev
    : 0;

  // Crop-specific z-score
  const cropStat = stats.cropStats[farm.cropType];
  const cropZ = cropStat && cropStat.stdDev > 0
    ? (damagePercent - cropStat.mean) / cropStat.stdDev
    : 0;

  // combined z → the worse of the two
  const effectiveZ = Math.max(globalZ, cropZ);

  let score = 0;
  if (effectiveZ > 1.5) score = 15;
  if (effectiveZ > 2.0) score = 35;
  if (effectiveZ > 2.5) score = 55;
  if (effectiveZ > 3.0) score = 80;

  return {
    score,
    detail: {
      datasetMean: Math.round(stats.mean * 100) / 100,
      datasetStdDev: Math.round(stats.stdDev * 100) / 100,
      globalZScore: Math.round(globalZ * 100) / 100,
      cropMean: cropStat ? Math.round(cropStat.mean * 100) / 100 : null,
      cropStdDev: cropStat ? Math.round(cropStat.stdDev * 100) / 100 : null,
      cropZScore: Math.round(cropZ * 100) / 100,
      effectiveZScore: Math.round(effectiveZ * 100) / 100,
    },
  };
}

// ── Check 3: Logical Consistency ──────────────────────────────

/**
 * Detect physically implausible NDVI combinations:
 *   - ndviBefore very low but massive "damage" claimed
 *   - ndviAfter > ndviBefore (vegetation improved but damage claimed)
 *   - Extreme damage (>90%) on drought-resistant crops
 *   - Tiny farm area with massive insured amount
 */
function checkLogicalConsistency(farm, damagePercent) {
  const flags = [];
  let score = 0;

  // 1. Low baseline — pre-event NDVI was already poor but high damage claimed
  if (farm.ndviBefore < 0.35 && damagePercent > 50) {
    flags.push('LOW_BASELINE_HIGH_DAMAGE');
    score += 30;
  }

  // 2. Vegetation improved but claim filed
  if (farm.ndviAfter >= farm.ndviBefore && damagePercent > 0) {
    flags.push('VEGETATION_IMPROVED');
    score += 40;
  }

  // 3. Extreme damage on resilient crop
  const resilientCrops = ['Bajra', 'Jowar', 'Chickpea', 'Mustard'];
  if (resilientCrops.includes(farm.cropType) && damagePercent > 85) {
    flags.push('EXTREME_DAMAGE_RESILIENT_CROP');
    score += 25;
  }

  // 4. Insured value disproportionate to farm size
  if (farm.areaAcres && farm.areaAcres > 0) {
    const perAcreInsured = farm.insuredAmount / farm.areaAcres;
    // Typical Indian crop insurance: ₹5,000–₹30,000/acre
    if (perAcreInsured > 50000) {
      flags.push('OVER_INSURED');
      score += 20;
    }
  }

  // 5. Damage percentage suspiciously round (exactly thresholds)
  if (damagePercent === 100 || damagePercent === 0) {
    // Not suspicious on its own, but flag if combined with others
    if (flags.length > 0) {
      flags.push('BOUNDARY_VALUE');
      score += 10;
    }
  }

  return {
    score: Math.min(score, 100),
    detail: {
      flagsTriggered: flags,
      flagCount: flags.length,
      ndviBefore: farm.ndviBefore,
      ndviAfter: farm.ndviAfter,
    },
  };
}

// ── Check 4: Temporal Pattern ─────────────────────────────────

/**
 * Flag recently enrolled policies with high damage — potential
 * post-event enrollment fraud.
 */
function checkTemporalPattern(farm, damagePercent) {
  let score = 0;
  const flags = [];

  if (!farm.enrolledAt) {
    return { score: 0, detail: { reason: 'NO_ENROLLMENT_DATE' } };
  }

  const enrollDate = new Date(farm.enrolledAt);
  const now = new Date();
  const daysSinceEnrollment = (now - enrollDate) / (1000 * 60 * 60 * 24);

  // Policy enrolled < 30 days ago with severe damage? Suspicious.
  if (daysSinceEnrollment < 30 && damagePercent > 60) {
    flags.push('RECENT_ENROLLMENT_HIGH_DAMAGE');
    score += 50;
  } else if (daysSinceEnrollment < 60 && damagePercent > 75) {
    flags.push('SHORT_POLICY_EXTREME_DAMAGE');
    score += 35;
  } else if (daysSinceEnrollment < 90 && damagePercent > 85) {
    flags.push('NEW_POLICY_CATASTROPHIC_DAMAGE');
    score += 25;
  }

  return {
    score: Math.min(score, 100),
    detail: {
      enrolledAt: farm.enrolledAt,
      daysSinceEnrollment: Math.round(daysSinceEnrollment),
      flagsTriggered: flags,
    },
  };
}

// ── Check 5: Claim-to-Value Ratio ─────────────────────────────

/**
 * If the payout represents a very high fraction of the insured
 * amount on a very small farm, flag it.
 */
function checkClaimValueRatio(farm, claimAmount) {
  let score = 0;
  const flags = [];

  const ratio = farm.insuredAmount > 0
    ? claimAmount / farm.insuredAmount
    : 0;

  // High payout ratio alone isn't fraud, but combined with small area…
  if (ratio > 0.85 && farm.areaAcres < 3) {
    flags.push('HIGH_PAYOUT_TINY_FARM');
    score += 30;
  }

  if (ratio > 0.95) {
    flags.push('NEAR_TOTAL_CLAIM');
    score += 20;
  }

  // Absolute value check — very large claims get extra scrutiny
  if (claimAmount > 200000) {
    flags.push('HIGH_VALUE_CLAIM');
    score += 15;
  }

  return {
    score: Math.min(score, 100),
    detail: {
      claimAmount,
      insuredAmount: farm.insuredAmount,
      payoutRatio: Math.round(ratio * 10000) / 10000,
      areaAcres: farm.areaAcres,
      flagsTriggered: flags,
    },
  };
}

// ── Composite Scoring ─────────────────────────────────────────

/**
 * Classify overall fraud status from composite score.
 * @param {number} score  0–100
 * @returns {{ status: string, flag: boolean, riskLevel: string }}
 */
function classifyFraud(score) {
  if (score < FRAUD_THRESHOLDS.low) {
    return { status: 'LOW', flag: false, riskLevel: 'CLEAR' };
  }
  if (score < FRAUD_THRESHOLDS.medium) {
    return { status: 'MEDIUM', flag: false, riskLevel: 'REVIEW' };
  }
  if (score < FRAUD_THRESHOLDS.high) {
    return { status: 'HIGH', flag: true, riskLevel: 'INVESTIGATE' };
  }
  return { status: 'CRITICAL', flag: true, riskLevel: 'BLOCK' };
}

/**
 * Run the full fraud analysis pipeline on a farm.
 *
 * @param {object} farm            Raw farm record
 * @param {number} damagePercent   Computed damage percentage
 * @param {number} claimAmount     Computed claim amount
 * @returns {object}               Full fraud assessment
 */
function analyzeFraud(farm, damagePercent, claimAmount) {
  // Run all checks
  const checks = {
    neighborAnomaly:    checkNeighborAnomaly(farm, damagePercent),
    statisticalOutlier: checkStatisticalOutlier(farm, damagePercent),
    logicalConsistency: checkLogicalConsistency(farm, damagePercent),
    temporalPattern:    checkTemporalPattern(farm, damagePercent),
    claimValueRatio:    checkClaimValueRatio(farm, claimAmount),
  };

  // Weighted composite score
  let compositeScore = 0;
  for (const [checkName, result] of Object.entries(checks)) {
    compositeScore += result.score * (CHECK_WEIGHTS[checkName] || 0);
  }
  compositeScore = Math.round(Math.min(compositeScore, 100) * 100) / 100;

  // Classification
  const classification = classifyFraud(compositeScore);

  // Collect all triggered flags across checks
  const allFlags = [];
  for (const result of Object.values(checks)) {
    if (result.detail.flagsTriggered) {
      allFlags.push(...result.detail.flagsTriggered);
    }
  }

  return {
    fraudScore: compositeScore,
    fraudStatus: classification.status,
    flag: classification.flag,
    riskLevel: classification.riskLevel,
    recommendation: classification.flag
      ? 'Manual review recommended before claim approval'
      : 'Automated approval eligible',
    triggeredFlags: allFlags,
    checks,
    assessedAt: new Date().toISOString(),
  };
}

/**
 * Invalidate the stats cache — call when farm data changes.
 */
function clearCache() {
  _statsCache = null;
}

module.exports = {
  analyzeFraud,
  classifyFraud,
  clearCache,
  // Export individual checks for unit testing
  _checks: {
    checkNeighborAnomaly,
    checkStatisticalOutlier,
    checkLogicalConsistency,
    checkTemporalPattern,
    checkClaimValueRatio,
  },
};
