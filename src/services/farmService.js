/**
 * Farm service layer — business logic between controllers and data.
 *
 * SINGLE SOURCE OF TRUTH: All farm data (fraudScore, status, reason,
 * explanation) is pre-computed at seed time and stored on the farm record.
 * This service NEVER recomputes those values. It reads and serves stored data.
 */

const farmStore = require('../models/Farm');
const ApiError = require('../utils/ApiError');

/**
 * Build a summary block from stored farm data (no recomputation).
 */
function buildStoredSummary(farm) {
  const damagePercentage = farm.ndviDrop || 0;
  const fraudScore = farm.fraudScore !== undefined ? farm.fraudScore : (farm.riskScore || 0);
  const status = farm.explanation?.decision || 'Pending';

  let fraudStatus = 'LOW';
  if (fraudScore >= 50) fraudStatus = 'CRITICAL';
  else if (fraudScore >= 25) fraudStatus = 'MEDIUM';

  let severity = farm.severity || 'none';

  // Claim amount estimation (same formula used at seed/claim creation)
  const insuredAmount = farm.insuredAmount || 125000;
  const claimAmount = Math.round(insuredAmount * (damagePercentage / 100) * 0.85);

  return {
    damagePercentage,
    severity,
    claimAmount,
    fraudScore,
    fraudStatus,
    flagged: fraudScore >= 50,
    recommendation: status === 'Approved' ? 'Automated approval eligible' : 'Requires manual review',
  };
}

/**
 * Enrich a farm with the summary and analysis blocks for API compatibility,
 * but using ONLY stored data — no recomputation.
 */
function enrichFarm(farm) {
  const summary = buildStoredSummary(farm);

  return {
    ...farm,
    // Backward-compatible fields for frontend consumption
    consistentDecision: {
      damage: summary.damagePercentage,
      fraudScore: summary.fraudScore,
      status: farm.explanation?.decision || 'Pending',
      reason: farm.explanation?.reason || '',
    },
    analysis: {
      damageAssessment: {
        damagePercentage: summary.damagePercentage,
        severity: summary.severity,
        ndviDrop: farm.ndviBefore - farm.ndviAfter,
      },
      claimAssessment: { claimAmount: summary.claimAmount },
      fraudAssessment: {
        fraudScore: summary.fraudScore,
        details: {
          neighborAnomalyScore: 0,
          abnormalNdviScore: 0,
          claimFrequencyScore: 0,
        },
      },
      pipeline: {
        version: '1.0.0',
        stages: ['STORED_SEED_DATA'],
        completedAt: farm.enrolledAt,
      },
    },
    summary,
  };
}

/**
 * Get all farms with stored intelligence data (no re-analysis).
 */
async function getAllFarms({
  cropType, state, severity, fraudStatus,
  flaggedOnly = false, sortBy, order = 'desc', page = 1, limit = 20,
} = {}) {
  let farms = await farmStore.findAll();

  if (cropType) farms = farms.filter(f => f.cropType.toLowerCase() === cropType.toLowerCase());
  if (state) farms = farms.filter(f => f.location.state.toLowerCase() === state.toLowerCase());

  const enriched = farms.map(enrichFarm);

  let filtered = enriched;
  if (severity) filtered = filtered.filter(f => f.summary.severity.toLowerCase() === severity.toLowerCase());
  if (fraudStatus) filtered = filtered.filter(f => f.summary.fraudStatus.toLowerCase() === fraudStatus.toLowerCase());
  if (flaggedOnly) filtered = filtered.filter(f => f.summary.flagged);

  if (sortBy) {
    const sortMap = {
      damage: f => f.summary.damagePercentage, claim: f => f.summary.claimAmount,
      fraudscore: f => f.summary.fraudScore, insured: f => f.insuredAmount,
    };
    const accessor = sortMap[sortBy.toLowerCase()];
    if (accessor) {
      const dir = order.toLowerCase() === 'asc' ? 1 : -1;
      filtered.sort((a, b) => (accessor(a) - accessor(b)) * dir);
    }
  }

  const totalRecords = filtered.length;
  const totalPages = Math.ceil(totalRecords / limit);
  const startIdx = (page - 1) * limit;

  // Compute aggregates from enriched data
  const aggregates = computeAggregates(enriched);

  return {
    farms: filtered.slice(startIdx, startIdx + limit),
    aggregates,
    meta: { totalRecords, totalPages, currentPage: page, perPage: limit },
  };
}

/**
 * Get a single farm by ID with stored intelligence data (no re-analysis).
 */
async function getFarmById(farmId) {
  const farm = await farmStore.findById(farmId);
  if (!farm) throw ApiError.notFound(`Farm with ID '${farmId}' not found`, 'FARM_NOT_FOUND');
  return enrichFarm(farm);
}

/**
 * Aggregate intelligence statistics across all farms.
 */
async function getIntelligenceStats({ cropType, state } = {}) {
  let farms = await farmStore.findAll();
  if (cropType) farms = farms.filter(f => f.cropType.toLowerCase() === cropType.toLowerCase());
  if (state) farms = farms.filter(f => f.location.state.toLowerCase() === state.toLowerCase());
  const enriched = farms.map(enrichFarm);
  return computeAggregates(enriched);
}

/**
 * Build dashboard-ready aggregate statistics from enriched farms.
 */
function computeAggregates(enrichedFarms) {
  if (enrichedFarms.length === 0) {
    return {
      totalFarms: 0, totalInsuredValue: 0, totalClaimAmount: 0,
      totalFlagged: 0, averageDamage: 0, averageFraudScore: 0,
    };
  }

  const summaries = enrichedFarms.map(f => f.summary);

  const totalInsured = enrichedFarms.reduce((s, f) => s + f.insuredAmount, 0);
  const totalClaim = summaries.reduce((s, d) => s + d.claimAmount, 0);
  const totalFlagged = summaries.filter(d => d.flagged).length;
  const damages = summaries.map(d => d.damagePercentage);
  const fraudScores = summaries.map(d => d.fraudScore);

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
  for (const f of enrichedFarms) {
    const crop = f.cropType;
    if (!cropBreakdown[crop]) {
      cropBreakdown[crop] = { farmCount: 0, totalDamage: 0, totalClaim: 0, flaggedCount: 0 };
    }
    cropBreakdown[crop].farmCount += 1;
    cropBreakdown[crop].totalDamage += f.summary.damagePercentage;
    cropBreakdown[crop].totalClaim += f.summary.claimAmount;
    if (f.summary.flagged) cropBreakdown[crop].flaggedCount += 1;
  }
  const cropAverages = Object.entries(cropBreakdown).map(([crop, data]) => ({
    cropType: crop, farmCount: data.farmCount,
    avgDamage: Math.round((data.totalDamage / data.farmCount) * 100) / 100,
    totalClaim: Math.round(data.totalClaim * 100) / 100, flaggedCount: data.flaggedCount,
  }));

  // State-wise breakdown
  const stateBreakdown = {};
  for (const f of enrichedFarms) {
    const st = f.location.state;
    if (!stateBreakdown[st]) { stateBreakdown[st] = { farmCount: 0, totalClaim: 0, flaggedCount: 0 }; }
    stateBreakdown[st].farmCount += 1;
    stateBreakdown[st].totalClaim += f.summary.claimAmount;
    if (f.summary.flagged) stateBreakdown[st].flaggedCount += 1;
  }

  return {
    totalFarms: enrichedFarms.length,
    totalInsuredValue: Math.round(totalInsured * 100) / 100,
    totalClaimAmount: Math.round(totalClaim * 100) / 100,
    claimRatio: Math.round((totalClaim / totalInsured) * 10000) / 10000,
    totalFlagged,
    flagRate: Math.round((totalFlagged / enrichedFarms.length) * 10000) / 10000,
    damage: {
      average: Math.round((damages.reduce((a, b) => a + b, 0) / damages.length) * 100) / 100,
      max: Math.max(...damages), min: Math.min(...damages),
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

module.exports = { getAllFarms, getFarmById, getIntelligenceStats };
