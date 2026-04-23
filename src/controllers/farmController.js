/**
 * Farm controller — thin HTTP-handling layer.
 * All methods are now async for MongoDB-backed services.
 */

const farmService = require('../services/farmService');
const ApiResponse = require('../utils/ApiResponse');

const farmController = {
  /** GET /api/v1/farms */
  async getAll(req, res) {
    const { page, limit, cropType, state, severity, fraudStatus, flaggedOnly, sortBy, order } = req.query;
    const result = await farmService.getAllFarms({
      page, limit, cropType, state, severity, fraudStatus,
      flaggedOnly: flaggedOnly === 'true', sortBy, order,
    });
    return new ApiResponse(200, 'Farms retrieved with full intelligence analysis',
      result.farms, { ...result.meta, aggregates: result.aggregates }).send(res);
  },

  /** GET /api/v1/farms/:farmId */
  async getById(req, res) {
    const farm = await farmService.getFarmById(req.params.farmId);
    return new ApiResponse(200, 'Farm intelligence analysis complete', farm).send(res);
  },

  /** GET /api/v1/farms/stats/intelligence */
  async getIntelligenceStats(req, res) {
    const { cropType, state } = req.query;
    const stats = await farmService.getIntelligenceStats({ cropType, state });
    return new ApiResponse(200, 'Intelligence statistics computed successfully', stats).send(res);
  },
};

module.exports = farmController;
