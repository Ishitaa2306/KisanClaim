/**
 * Central Rule-Based Decision Engine
 *
 * SINGLE SOURCE OF TRUTH for all claim decisions.
 * Every claim/farm status flows through this engine ONCE at creation time.
 * The result is stored and never recomputed.
 *
 * Rules:
 * - IF damage < 10:                      → Rejected
 * - IF damage >= 10 AND fraudScore < 50: → Approved
 * - IF fraudScore >= 50:                 → Under Review
 */

function evaluateDecision(damagePercent, fraudScore) {
  let status, reason;

  // Rule 3: High Fraud always goes to Review (checked first — overrides damage)
  if (fraudScore >= 50) {
    status = "Under Review";
    reason = `Anomalous pattern detected. Further validation required.`;
  }
  // Rule 1: Low Damage goes to Rejected
  else if (damagePercent < 10) {
    status = "Rejected";
    reason = `Damage below threshold (${parseFloat(damagePercent).toFixed(1)}%). NDVI variation minimal.`;
  }
  // Rule 2: Sufficient Damage and Low/Medium Fraud goes to Approved
  else {
    status = "Approved";
    reason = `Significant vegetation loss detected (${parseFloat(damagePercent).toFixed(1)}%). No fraud signals.`;
  }

  return { status, reason };
}

module.exports = { evaluateDecision };
