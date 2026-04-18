/**
 * Centralized application configuration.
 * All environment variables are parsed and validated here — no raw
 * `process.env` access should happen elsewhere in the codebase.
 */

require('dotenv').config();

const config = Object.freeze({
  port: parseInt(process.env.PORT, 10) || 3000,
  env: process.env.NODE_ENV || 'development',

  /** True when running in production */
  isProduction: process.env.NODE_ENV === 'production',

  // ── Future integrations ────────────────────────────────────
  // database: { url: process.env.DATABASE_URL },
  // sentinel: {
  //   clientId: process.env.SENTINEL_HUB_CLIENT_ID,
  //   clientSecret: process.env.SENTINEL_HUB_CLIENT_SECRET,
  // },
  // ml: { serviceUrl: process.env.ML_SERVICE_URL },

  /** NDVI thresholds — centralised so they can be tuned without code changes */
  ndvi: {
    /** Below this drop-percentage we consider the crop undamaged */
    minDamageThreshold: 5,
    /** Severity classification breakpoints */
    severity: {
      low: 20,
      moderate: 40,
      high: 60,
      severe: 80,
    },
  },

  /** Claim engine configuration */
  claim: {
    /** Maximum payout capped at 100% of insured amount */
    maxPayoutRatio: 1.0,
    /** Minimum damage % required to qualify for any payout */
    minDamageForPayout: 15,
  },

  /** Fraud detection configuration */
  fraud: {
    /** Neighbor comparison radius in km */
    neighborRadiusKm: 50,
    /** Minimum neighbors required for neighbor-based analysis */
    minNeighborsRequired: 3,
    /** Score thresholds for classification */
    thresholds: {
      low: 30,
      medium: 55,
      high: 75,
    },
  },
});

module.exports = config;
