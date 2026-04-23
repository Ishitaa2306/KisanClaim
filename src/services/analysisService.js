/**
 * Analysis Pipeline Orchestrator.
 *
 * This is the central intelligence layer that wires together:
 *
 *   NDVI Data → Damage Calculation → Claim Engine → Fraud Analysis → Response
 *
 * All downstream consumers (controllers, future WebSocket handlers,
 * batch processors) should call this service — NOT the individual
 * engines directly. This ensures every analysis goes through the
 * same validated pipeline.
 */

const { calculateDamage } = require('../utils/ndviAnalyzer');
const { calculateClaim } = require('./claimService');
const { analyzeFraud, warmCache } = require('./fraudService');
const { evaluateDecision } = require('../utils/decisionEngine');

/**
 * Run the full analysis pipeline on a single farm record.
 *
 * @param {object} farm  Raw farm record from the store
 * @returns {object}     Farm data enriched with the full intelligence block
 */
function analyzeOne(farm) {
  // ── Stage 1: Damage Assessment ────────────────────────────
  const damageResult = calculateDamage(farm.ndviBefore, farm.ndviAfter);

  // ── Stage 2: Claim Calculation ────────────────────────────
  const claimResult = calculateClaim({
    damagePercentage: damageResult.damagePercentage,
    insuredAmount: farm.insuredAmount,
    cropType: farm.cropType,
    areaAcres: farm.areaAcres,
  });

  // ── Stage 3: Fraud Analysis ───────────────────────────────
  const fraudResult = analyzeFraud(
    farm,
    damageResult.damagePercentage,
    claimResult.claimAmount,
  );

  // ── Compose final response ────────────────────────────────
  const { status, reason } = evaluateDecision(damageResult.damagePercentage, fraudResult.fraudScore);
  
  // Format fraudStatus based on the strict engine logic for UI compatibility
  let fraudStatus = 'LOW';
  if (fraudResult.fraudScore >= 50) fraudStatus = 'CRITICAL';
  else if (fraudResult.fraudScore >= 30) fraudStatus = 'MEDIUM';
  
  const flagged = fraudResult.fraudScore >= 50;

  return {
    ...farm,
    // Provide the exact requested fields in the payload explicitly
    consistentDecision: {
      damage: damageResult.damagePercentage,
      fraudScore: fraudResult.fraudScore,
      status: status,
      reason: reason
    },
    analysis: {
      damageAssessment: {
        ...damageResult,
        computedAt: new Date().toISOString(),
      },
      claimAssessment: claimResult,
      fraudAssessment: fraudResult,
      pipeline: {
        version: '1.0.0',
        stages: ['NDVI_DAMAGE', 'CLAIM_ENGINE', 'FRAUD_DETECTION'],
        completedAt: new Date().toISOString(),
      },
    },
    explanation: {
      ndviDrop: damageResult.damagePercentage.toFixed(1),
      damageLevel: status === 'Rejected' ? 'Low' : 'High',
      fraudRisk: fraudStatus.toLowerCase(),
      reason: reason,
      decision: status,
    },
    summary: {
      damagePercentage: damageResult.damagePercentage,
      severity: damageResult.severity,
      claimAmount: claimResult.claimAmount,
      fraudScore: fraudResult.fraudScore,
      fraudStatus: fraudStatus,
      flagged: flagged,
      recommendation: status === 'Approved' ? 'Automated approval eligible' : 'Requires manual review',
    },
  };
}

/**
 * Run the pipeline on multiple farms and return aggregate metrics.
 *
 * @param {object[]} farms  Array of raw farm records
 * @returns {{ farms: object[], aggregates: object }}
 */
function analyzeMany(farms) {
  // Pre-warm fraud stats cache with all farms to ensure stable global statistics
  warmCache(farms);

  const analyzed = farms.map(analyzeOne);

  // ── Compute aggregates ──────────────────────────────────────
  const aggregates = computeAggregates(analyzed);

  return { farms: analyzed, aggregates };
}

/**
 * Build dashboard-ready aggregate statistics from analyzed farms.
 *
 * @param {object[]} analyzedFarms  Farms that have been through analyzeOne
 * @returns {object}
 */
function computeAggregates(analyzedFarms) {
  if (analyzedFarms.length === 0) {
    return {
      totalFarms: 0,
      totalInsuredValue: 0,
      totalClaimAmount: 0,
      totalFlagged: 0,
      averageDamage: 0,
      averageFraudScore: 0,
    };
  }

  const summaries = analyzedFarms.map((f) => f.summary);

  const totalInsured = analyzedFarms.reduce((s, f) => s + f.insuredAmount, 0);
  const totalClaim = summaries.reduce((s, d) => s + d.claimAmount, 0);
  const totalFlagged = summaries.filter((d) => d.flagged).length;
  const damages = summaries.map((d) => d.damagePercentage);
  const fraudScores = summaries.map((d) => d.fraudScore);

  // Severity distribution
  const severityBreakdown = {};
  for (const s of summaries) {
    severityBreakdown[s.severity] = (severityBreakdown[s.severity] || 0) + 1;
  }

  // Fraud status distribution
  const fraudBreakdown = {};
  for (const s of summaries) {
    fraudBreakdown[s.fraudStatus] = (fraudBreakdown[s.fraudStatus] || 0) + 1;
  }

  // Crop-wise breakdown
  const cropBreakdown = {};
  for (const f of analyzedFarms) {
    const crop = f.cropType;
    if (!cropBreakdown[crop]) {
      cropBreakdown[crop] = {
        farmCount: 0,
        totalDamage: 0,
        totalClaim: 0,
        flaggedCount: 0,
      };
    }
    cropBreakdown[crop].farmCount += 1;
    cropBreakdown[crop].totalDamage += f.summary.damagePercentage;
    cropBreakdown[crop].totalClaim += f.summary.claimAmount;
    if (f.summary.flagged) cropBreakdown[crop].flaggedCount += 1;
  }
  // Convert totals to averages
  const cropAverages = Object.entries(cropBreakdown).map(([crop, data]) => ({
    cropType: crop,
    farmCount: data.farmCount,
    avgDamage: Math.round((data.totalDamage / data.farmCount) * 100) / 100,
    totalClaim: Math.round(data.totalClaim * 100) / 100,
    flaggedCount: data.flaggedCount,
  }));

  // State-wise breakdown
  const stateBreakdown = {};
  for (const f of analyzedFarms) {
    const st = f.location.state;
    if (!stateBreakdown[st]) {
      stateBreakdown[st] = { farmCount: 0, totalClaim: 0, flaggedCount: 0 };
    }
    stateBreakdown[st].farmCount += 1;
    stateBreakdown[st].totalClaim += f.summary.claimAmount;
    if (f.summary.flagged) stateBreakdown[st].flaggedCount += 1;
  }

  return {
    totalFarms: analyzedFarms.length,
    totalInsuredValue: Math.round(totalInsured * 100) / 100,
    totalClaimAmount: Math.round(totalClaim * 100) / 100,
    claimRatio: Math.round((totalClaim / totalInsured) * 10000) / 10000,
    totalFlagged,
    flagRate: Math.round((totalFlagged / analyzedFarms.length) * 10000) / 10000,
    damage: {
      average: Math.round((damages.reduce((a, b) => a + b, 0) / damages.length) * 100) / 100,
      max: Math.max(...damages),
      min: Math.min(...damages),
      severityBreakdown,
    },
    fraud: {
      averageScore: Math.round((fraudScores.reduce((a, b) => a + b, 0) / fraudScores.length) * 100) / 100,
      maxScore: Math.max(...fraudScores),
      statusBreakdown: fraudBreakdown,
    },
    cropAverages,
    stateBreakdown,
  };
}

module.exports = {
  analyzeOne,
  analyzeMany,
  computeAggregates,
};
