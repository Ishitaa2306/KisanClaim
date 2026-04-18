/**
 * Farm service layer — business logic between controllers and data.
 *
 * Controllers should never touch the model or analysis engines directly.
 * This service orchestrates: fetch data → run pipeline → filter → paginate.
 *
 * All intelligence flows through the analysis pipeline:
 *   NDVI Data → Damage Calculation → Claim Engine → Fraud Analysis → Response
 */

const farmStore = require('../models/Farm');
const { analyzeOne, analyzeMany } = require('./analysisService');
const ApiError = require('../utils/ApiError');

/**
 * Get all farms with full intelligence pipeline.
 *
 * @param {object} options
 * @param {string}  [options.cropType]
 * @param {string}  [options.state]
 * @param {string}  [options.severity]
 * @param {string}  [options.fraudStatus]   Filter by fraud status (LOW/MEDIUM/HIGH/CRITICAL)
 * @param {boolean} [options.flaggedOnly]   Only return fraud-flagged farms
 * @param {string}  [options.sortBy]        Sort field: 'damage', 'claim', 'fraudScore'
 * @param {string}  [options.order]         Sort order: 'asc' or 'desc'
 * @param {number}  [options.page=1]
 * @param {number}  [options.limit=20]
 */
function getAllFarms({
  cropType,
  state,
  severity,
  fraudStatus,
  flaggedOnly = false,
  sortBy,
  order = 'desc',
  page = 1,
  limit = 20,
} = {}) {
  let farms = farmStore.findAll();

  // ── Pre-analysis filtering (on raw data) ───────────────────
  if (cropType) {
    farms = farms.filter(
      (f) => f.cropType.toLowerCase() === cropType.toLowerCase(),
    );
  }
  if (state) {
    farms = farms.filter(
      (f) => f.location.state.toLowerCase() === state.toLowerCase(),
    );
  }

  // ── Run full pipeline ──────────────────────────────────────
  const { farms: analyzed, aggregates } = analyzeMany(farms);

  // ── Post-analysis filtering (on computed fields) ───────────
  let filtered = analyzed;

  if (severity) {
    filtered = filtered.filter(
      (f) => f.summary.severity.toLowerCase() === severity.toLowerCase(),
    );
  }
  if (fraudStatus) {
    filtered = filtered.filter(
      (f) => f.summary.fraudStatus.toLowerCase() === fraudStatus.toLowerCase(),
    );
  }
  if (flaggedOnly) {
    filtered = filtered.filter((f) => f.summary.flagged);
  }

  // ── Sorting ────────────────────────────────────────────────
  if (sortBy) {
    const sortMap = {
      damage: (f) => f.summary.damagePercentage,
      claim: (f) => f.summary.claimAmount,
      fraudscore: (f) => f.summary.fraudScore,
      insured: (f) => f.insuredAmount,
    };
    const accessor = sortMap[sortBy.toLowerCase()];
    if (accessor) {
      const dir = order.toLowerCase() === 'asc' ? 1 : -1;
      filtered.sort((a, b) => (accessor(a) - accessor(b)) * dir);
    }
  }

  // ── Pagination ─────────────────────────────────────────────
  const totalRecords = filtered.length;
  const totalPages = Math.ceil(totalRecords / limit);
  const startIdx = (page - 1) * limit;
  const paginatedFarms = filtered.slice(startIdx, startIdx + limit);

  return {
    farms: paginatedFarms,
    aggregates,
    meta: {
      totalRecords,
      totalPages,
      currentPage: page,
      perPage: limit,
    },
  };
}

/**
 * Get a single farm by ID with full intelligence analysis.
 *
 * @param {string} farmId
 * @returns {object}  Fully analyzed farm record
 */
function getFarmById(farmId) {
  const farm = farmStore.findById(farmId);
  if (!farm) {
    throw ApiError.notFound(
      `Farm with ID '${farmId}' not found`,
      'FARM_NOT_FOUND',
    );
  }
  return analyzeOne(farm);
}

/**
 * Aggregate intelligence statistics across all farms.
 * Powers dashboard summary cards.
 *
 * @param {object} [filters]
 * @param {string} [filters.cropType]
 * @param {string} [filters.state]
 * @returns {object}  Full aggregate statistics
 */
function getIntelligenceStats({ cropType, state } = {}) {
  let farms = farmStore.findAll();

  if (cropType) {
    farms = farms.filter(
      (f) => f.cropType.toLowerCase() === cropType.toLowerCase(),
    );
  }
  if (state) {
    farms = farms.filter(
      (f) => f.location.state.toLowerCase() === state.toLowerCase(),
    );
  }

  const { aggregates } = analyzeMany(farms);
  return aggregates;
}

module.exports = {
  getAllFarms,
  getFarmById,
  getIntelligenceStats,
};
