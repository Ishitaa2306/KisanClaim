/**
 * NDVI (Normalized Difference Vegetation Index) analysis utilities.
 *
 * This module encapsulates all vegetation-health math so the rest of
 * the codebase never manipulates raw NDVI numbers directly.
 *
 * NDVI ranges from -1 to +1:
 *   0.2–0.4  → sparse vegetation
 *   0.4–0.6  → moderate vegetation
 *   0.6–0.9  → dense healthy vegetation
 */

const config = require('../config');
const ApiError = require('./ApiError');

const { severity: SEV } = config.ndvi;

/**
 * Validate that an NDVI value is within the physically meaningful range.
 * @param {number} value
 * @param {string} label  Human-readable name for error messages
 */
function validateNdvi(value, label) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw ApiError.badRequest(
      `${label} must be a valid number`,
      'INVALID_NDVI',
    );
  }
  if (value < -1 || value > 1) {
    throw ApiError.badRequest(
      `${label} must be between -1 and 1 (received ${value})`,
      'NDVI_OUT_OF_RANGE',
    );
  }
}

/**
 * Classify damage severity into a human-readable tier.
 * @param {number} damagePercent  0–100
 * @returns {string}
 */
function classifySeverity(damagePercent) {
  if (damagePercent < config.ndvi.minDamageThreshold) return 'none';
  if (damagePercent < SEV.low) return 'minimal';
  if (damagePercent < SEV.moderate) return 'low';
  if (damagePercent < SEV.high) return 'moderate';
  if (damagePercent < SEV.severe) return 'high';
  return 'severe';
}

/**
 * Core damage calculation.
 *
 * Formula:
 *   damagePercentage = ((ndviBefore - ndviAfter) / ndviBefore) × 100
 *
 * Edge cases handled:
 *   - ndviBefore ≤ 0 → cannot compute meaningful drop → returns 0
 *   - negative drop (vegetation improved) → clamped to 0
 *   - drop > 100 % (ndviAfter negative) → capped at 100
 *
 * @param {number} ndviBefore  NDVI value before the insured event
 * @param {number} ndviAfter   NDVI value after the insured event
 * @returns {{ damagePercentage: number, severity: string, ndviDrop: number }}
 */
function calculateDamage(ndviBefore, ndviAfter) {
  validateNdvi(ndviBefore, 'ndviBefore');
  validateNdvi(ndviAfter, 'ndviAfter');

  // If pre-event vegetation was already non-positive, no meaningful % drop
  if (ndviBefore <= 0) {
    return {
      damagePercentage: 0,
      severity: 'none',
      ndviDrop: 0,
      note: 'Pre-event NDVI was non-positive; damage percentage not computable.',
    };
  }

  const rawDrop = ndviBefore - ndviAfter;
  const rawPercent = (rawDrop / ndviBefore) * 100;

  // Clamp to [0, 100]
  const damagePercentage = Math.round(Math.min(Math.max(rawPercent, 0), 100) * 100) / 100;
  const ndviDrop = Math.round(rawDrop * 1000) / 1000;

  return {
    damagePercentage,
    severity: classifySeverity(damagePercentage),
    ndviDrop,
  };
}

/**
 * Estimate a payout recommendation based on damage and insured amount.
 * This is a simplified model — a production system would integrate
 * actuarial tables and policy terms.
 *
 * @param {number} damagePercentage  0–100
 * @param {number} insuredAmount     INR
 * @returns {{ recommendedPayout: number, payoutRatio: number }}
 */
function estimatePayout(damagePercentage, insuredAmount) {
  if (damagePercentage < config.ndvi.minDamageThreshold) {
    return { recommendedPayout: 0, payoutRatio: 0 };
  }

  // Graduated payout curve: light damage pays proportionally less
  let payoutRatio;
  if (damagePercentage < SEV.low) {
    payoutRatio = 0.25;
  } else if (damagePercentage < SEV.moderate) {
    payoutRatio = 0.50;
  } else if (damagePercentage < SEV.high) {
    payoutRatio = 0.75;
  } else {
    payoutRatio = 1.0;
  }

  const rawPayout = insuredAmount * (damagePercentage / 100) * payoutRatio;
  const recommendedPayout = Math.round(rawPayout * 100) / 100;

  return { recommendedPayout, payoutRatio };
}

module.exports = {
  validateNdvi,
  classifySeverity,
  calculateDamage,
  estimatePayout,
};
