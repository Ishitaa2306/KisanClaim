/**
 * Claim Calculation Engine.
 *
 * Converts a damage assessment into a monetary claim recommendation
 * using a configurable, multi-tier payout model inspired by India's
 * Pradhan Mantri Fasal Bima Yojana (PMFBY) guidelines.
 *
 * The engine applies:
 *   1. Minimum-damage threshold gate (below = no payout)
 *   2. Tiered payout multipliers (not flat — higher damage pays disproportionately more)
 *   3. Sigmoid-smoothed scaling within tiers to avoid cliff-edge jumps
 *   4. Per-crop adjustment factors (crop-specific vulnerability)
 *   5. Policy cap enforcement (maximum payout cannot exceed insured amount)
 *
 * Pipeline position:  Damage Assessment → [ Claim Engine ] → Fraud Analysis
 */

const config = require('../config');

// ── Per-crop vulnerability multipliers ───────────────────────
// Crops with higher inherent fragility get a slightly boosted payout.
// In production these would come from an actuarial database.
const CROP_FACTORS = {
  Rice:       1.10,   // paddy is flood-sensitive
  Cotton:     1.08,
  Sugarcane:  1.05,
  Potato:     1.06,
  Onion:      1.04,
  Turmeric:   1.03,
  Wheat:      1.00,
  Soybean:    1.00,
  Maize:      0.98,
  Groundnut:  0.97,
  Mustard:    0.95,
  Chickpea:   0.95,
  Bajra:      0.93,   // millets are drought-resistant
  Jowar:      0.93,
  Sunflower:  0.96,
};

/**
 * Payout tiers.
 * Each tier defines:
 *   - `upTo`       : upper bound of damage% for this tier
 *   - `base`       : base multiplier (fraction of insuredAmount * damage%)
 *   - `accelerator`: extra weight per percentage point above the previous tier ceiling
 *
 * The design ensures the payout curve is concave-upward — catastrophic
 * losses are covered more aggressively than light ones.
 */
const TIERS = [
  { upTo: 15,  base: 0.00, accelerator: 0.000 },  // below threshold — no payout
  { upTo: 25,  base: 0.20, accelerator: 0.005 },
  { upTo: 40,  base: 0.40, accelerator: 0.008 },
  { upTo: 60,  base: 0.65, accelerator: 0.010 },
  { upTo: 80,  base: 0.80, accelerator: 0.006 },
  { upTo: 100, base: 0.95, accelerator: 0.003 },
];

/**
 * Smooth sigmoid curve centred at `midpoint` with steepness `k`.
 * Maps any value to [0, 1] — used to soften tier transitions.
 */
function sigmoid(x, midpoint, k = 0.15) {
  return 1 / (1 + Math.exp(-k * (x - midpoint)));
}

/**
 * Resolve the effective payout multiplier for a given damage%.
 *
 * @param {number} damagePercent  0–100
 * @returns {{ multiplier: number, tierLabel: string }}
 */
function resolveMultiplier(damagePercent) {
  const { minDamageThreshold } = config.ndvi;

  if (damagePercent < minDamageThreshold) {
    return { multiplier: 0, tierLabel: 'BELOW_THRESHOLD' };
  }

  // Find active tier
  let prevCeiling = 0;
  for (let i = 0; i < TIERS.length; i++) {
    const tier = TIERS[i];
    if (damagePercent <= tier.upTo || i === TIERS.length - 1) {
      const overshoot = damagePercent - prevCeiling;
      const rawMultiplier = tier.base + overshoot * tier.accelerator;
      // Sigmoid-soften the transition from the previous tier
      const blendFactor = sigmoid(damagePercent, prevCeiling + 5);
      const multiplier = Math.min(rawMultiplier * blendFactor + tier.base * (1 - blendFactor), 1);

      const labels = ['BELOW_THRESHOLD', 'MINOR', 'MODERATE', 'SIGNIFICANT', 'HIGH', 'CATASTROPHIC'];
      return {
        multiplier: Math.round(multiplier * 10000) / 10000,
        tierLabel: labels[i] || 'CATASTROPHIC',
      };
    }
    prevCeiling = tier.upTo;
  }

  return { multiplier: 1, tierLabel: 'CATASTROPHIC' };
}

/**
 * Calculate claim amount for a single farm.
 *
 * @param {object} params
 * @param {number} params.damagePercentage    0–100
 * @param {number} params.insuredAmount       INR
 * @param {string} params.cropType            Crop name for vulnerability factor
 * @param {number} [params.areaAcres]         Farm area (for per-acre metrics)
 * @returns {object} Full claim breakdown
 */
function calculateClaim({ damagePercentage, insuredAmount, cropType, areaAcres }) {
  // 1. Resolve tier multiplier
  const { multiplier, tierLabel } = resolveMultiplier(damagePercentage);

  // 2. Crop-specific vulnerability factor
  const cropFactor = CROP_FACTORS[cropType] ?? 1.0;

  // 3. Raw claim = insuredAmount × (damage / 100) × multiplier × cropFactor
  const rawClaim = insuredAmount * (damagePercentage / 100) * multiplier * cropFactor;

  // 4. Hard cap at insured amount (cannot pay more than the policy limit)
  const claimAmount = Math.round(Math.min(rawClaim, insuredAmount) * 100) / 100;

  // 5. Effective payout ratio (what fraction of the insured amount is being paid out)
  const payoutRatio = insuredAmount > 0
    ? Math.round((claimAmount / insuredAmount) * 10000) / 10000
    : 0;

  // 6. Per-acre breakdown (useful for field-level analytics)
  const perAcre = areaAcres && areaAcres > 0
    ? Math.round((claimAmount / areaAcres) * 100) / 100
    : null;

  return {
    claimAmount,
    payoutRatio,
    tierLabel,
    multiplier,
    cropFactor,
    perAcrePayout: perAcre,
    cappedAtPolicy: rawClaim > insuredAmount,
    breakdown: {
      insuredAmount,
      damagePercentage,
      rawCalculated: Math.round(rawClaim * 100) / 100,
      policyCap: insuredAmount,
    },
  };
}

module.exports = {
  calculateClaim,
  resolveMultiplier,
  CROP_FACTORS,
};
