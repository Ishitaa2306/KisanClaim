/**
 * Analysis Controller
 * 
 * Orchestrates the Intelligence Engine workflow:
 * Farm Data -> Weather Data -> Event Detection -> Date Generation -> Final Output.
 */

const farmStore = require('../models/Farm');
const weatherService = require('../services/weatherService');
const weatherIntelligenceEngine = require('../services/weatherIntelligenceEngine');
const dateUtils = require('../utils/dateUtils');
const ApiResponse = require('../utils/ApiResponse');

const analysisController = {
  /**
   * GET /farm/:id/analysis
   * Provides intelligent risk analysis and satellite windows for a given farm.
   */
  async getFarmAnalysis(req, res) {
    try {
      const { id } = req.params;
      
      // 1. Fetch farm using farmId
      const farm = await farmStore.findById(id);
      if (!farm) {
        return new ApiResponse(404, 'Farm not found').send(res);
      }

      // 2. Extract latitude & longitude
      const lat = farm.location?.latitude;
      const lon = farm.location?.longitude;

      if (!lat || !lon) {
        return new ApiResponse(400, 'Farm does not have valid coordinates for weather analysis').send(res);
      }

      // 3. Call Weather API dynamically
      const weatherData = await weatherService.getWeatherByCoordinates(lat, lon);

      // 4. Run event detection engine
      const riskEvent = weatherIntelligenceEngine.analyzeWeatherRisk(weatherData);

      // 5. Generate before/after dates
      const analysisWindow = dateUtils.generateAnalysisWindow(riskEvent.eventDate);

      // 6. Combine with existing NDVI data
      // Ensuring damagePercentage is rounded for clean output
      const damagePercentage = Math.round((farm.ndviDrop || 0) * 10) / 10;

      // 7. Format Final Response Structure
      const finalResponse = {
        farmId: farm.farmId,
        location: farm.location,
        weather: {
          eventType: riskEvent.eventType,
          severity: riskEvent.severity,
          eventDate: analysisWindow.eventDate, // standardizing date format
        },
        analysisWindow: {
          beforeDate: analysisWindow.beforeDate,
          afterDate: analysisWindow.afterDate,
        },
        ndvi: {
          before: farm.ndviBefore,
          after: farm.ndviAfter,
          damagePercentage: damagePercentage,
        }
      };

      return new ApiResponse(200, 'Farm intelligence analysis generated successfully', finalResponse).send(res);

    } catch (error) {
      console.error('[AnalysisController] Error generating farm analysis:', error);
      return new ApiResponse(500, 'Internal server error during analysis generation').send(res);
    }
  }
};

module.exports = analysisController;
