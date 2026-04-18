/**
 * Farm controller — thin HTTP-handling layer.
 *
 * Each method:
 *  1. Extracts and normalises input from req
 *  2. Delegates to the service layer
 *  3. Wraps the result in ApiResponse
 *
 * NO business logic lives here.
 */

const farmService = require('../services/farmService');
const ApiResponse = require('../utils/ApiResponse');

const farmController = {
  /**
   * GET /api/v1/farms
   *
   * Query params:
   *   page, limit, cropType, state, severity,
   *   fraudStatus, flaggedOnly, sortBy, order
   */
  getAll(req, res) {
    const {
      page,
      limit,
      cropType,
      state,
      severity,
      fraudStatus,
      flaggedOnly,
      sortBy,
      order,
    } = req.query;

    const result = farmService.getAllFarms({
      page,
      limit,
      cropType,
      state,
      severity,
      fraudStatus,
      flaggedOnly: flaggedOnly === 'true',
      sortBy,
      order,
    });

    return new ApiResponse(
      200,
      'Farms retrieved with full intelligence analysis',
      result.farms,
      { ...result.meta, aggregates: result.aggregates },
    ).send(res);
  },

  /**
   * GET /api/v1/farms/:farmId
   *
   * Returns full analysis pipeline output:
   *   damage assessment + claim assessment + fraud assessment
   */
  getById(req, res) {
    const farm = farmService.getFarmById(req.params.farmId);

    return new ApiResponse(
      200,
      'Farm intelligence analysis complete',
      farm,
    ).send(res);
  },

  /**
   * GET /api/v1/farms/stats/intelligence
   *
   * Aggregate statistics for dashboards.
   * Query params: cropType, state
   */
  getIntelligenceStats(req, res) {
    const { cropType, state } = req.query;
    const stats = farmService.getIntelligenceStats({ cropType, state });

    return new ApiResponse(
      200,
      'Intelligence statistics computed successfully',
      stats,
    ).send(res);
  },
};

module.exports = farmController;
