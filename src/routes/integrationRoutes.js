const { Router } = require('express');
const farmStore = require('../models/Farm');
const appStore = require('../models/Store');
const ApiResponse = require('../utils/ApiResponse');

const router = Router();

// GET /api/v1/risk
router.get('/risk', async (req, res) => {
  try {
    const { level } = req.query;
    const allFarms = await farmStore.findAll();
    
    // STRICT ACTIVE CASES FILTER: Exclude Approved & Rejected. Everything else is considered active risk.
    const activeRiskFarms = allFarms.filter(f => {
      const decision = (f.explanation?.decision || 'PENDING').toUpperCase();
      return !['APPROVED', 'REJECTED'].includes(decision);
    });

    if (level) {
      // Filter list view
      const filtered = activeRiskFarms.filter(f => f.riskLevel?.toLowerCase() === level.toLowerCase());
      const mappedList = filtered.map(f => ({
        farmId: f.farmId, farmerName: f.farmerName, district: f.location.district,
        state: f.location.state, riskScore: f.riskScore, alerts: f.alerts,
        damagePercentage: f.ndviDrop || 0, fraudScore: f.fraudScore || 0,
        riskLevel: f.riskLevel, status: f.explanation?.decision || 'Pending'
      }));
      return new ApiResponse(200, `Filtered risk list for ${level}`, { farms: mappedList }).send(res);
    }

    const riskStats = { low: 0, medium: 0, high: 0, critical: 0 };
    const targetNodes = [];

    activeRiskFarms.forEach(f => {
      if (riskStats[f.riskLevel] !== undefined) riskStats[f.riskLevel]++;
      if (f.riskLevel === 'critical' || f.riskLevel === 'high') {
        targetNodes.push({
          farmId: f.farmId, farmerName: f.farmerName, district: f.location.district,
          state: f.location.state, riskScore: f.riskScore, alerts: f.alerts,
          damagePercentage: f.ndviDrop || 0, fraudScore: f.fraudScore || 0,
          riskLevel: f.riskLevel, status: f.explanation?.decision || 'Pending'
        });
      }
    });

    new ApiResponse(200, 'Risk distribution map successfully retrieved', {
      distribution: riskStats, 
      totalAssessed: activeRiskFarms.length,
      targetNodes: targetNodes.sort((a, b) => b.riskScore - a.riskScore).slice(0, 20),
    }).send(res);
  } catch (err) {
    console.error('[INT] GET /risk error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

// GET /api/v1/logs
router.get('/logs', async (req, res) => {
  try {
    const allFarms = await farmStore.findAll();
    let systemLogs = [];
    allFarms.forEach(f => {
      if (f.activityLogs && f.activityLogs.length > 0) {
        f.activityLogs.forEach(log => {
          systemLogs.push({
            id: log.id, action: log.action, timestamp: log.timestamp,
            farmId: f.farmId, farmerName: f.farmerName, riskLevel: f.riskLevel,
          });
        });
      }
    });
    systemLogs.push({ id: 'SYS-1', action: 'Global Satellite Telemetry Sync', timestamp: new Date().toISOString(), farmId: 'SYSTEM', farmerName: 'Admin', riskLevel: 'low' });
    systemLogs = systemLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50);
    new ApiResponse(200, 'Recent system logs retrieved', { logs: systemLogs, totalLogs: systemLogs.length }).send(res);
  } catch (err) {
    console.error('[INT] GET /logs error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

// GET /api/v1/weather
router.get('/weather', async (req, res) => {
  try {
    const allFarms = await farmStore.findAll();
    const weatherMap = {};
    allFarms.forEach(f => {
      const dist = f.location.district;
      if (!weatherMap[dist] && f.weather && Object.keys(weatherMap).length < 12) {
        weatherMap[dist] = {
          district: dist, state: f.location.state, condition: f.weather.condition,
          temperature: f.weather.temperature, humidity: f.weather.humidity, alerts: f.alerts || [],
        };
      }
    });
    new ApiResponse(200, 'Regional weather forecasts ready', { regions: Object.values(weatherMap) }).send(res);
  } catch (err) {
    console.error('[INT] GET /weather error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

// GET /api/v1/map
router.get('/map', async (req, res) => {
  try {
    const allFarms = await farmStore.findAll();
    const mapData = allFarms.map(f => ({
      farmId: f.farmId, farmerName: f.farmerName || 'Unknown',
      lat: f.location.latitude, lon: f.location.longitude,
      riskLevel: f.riskLevel, damage: f.ndviDrop || 0, status: f.explanation?.decision || 'Pending',
    }));
    new ApiResponse(200, 'Map coordinates and severity metrics retrieved', mapData).send(res);
  } catch (err) {
    console.error('[INT] GET /map error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

// GET /api/v1/report/:farmId
router.get('/report/:farmId', async (req, res) => {
  try {
    const farm = await farmStore.findById(req.params.farmId);
    if (!farm) return new ApiResponse(404, 'Farm not found', null).send(res);
    new ApiResponse(200, 'Detailed intelligence report generated', {
      farmDetails: { farmId: farm.farmId, farmerName: farm.farmerName, location: farm.location, cropType: farm.cropType, insuredAmount: farm.insuredAmount },
      damageAnalysis: { severity: farm.severity, ndviBefore: farm.ndviBefore, ndviAfter: farm.ndviAfter, ndviDrop: farm.ndviDrop, trend: farm.analytics?.damageTrend || [] },
      fraudAnalysis: { riskScore: farm.riskScore, riskLevel: farm.riskLevel, alerts: farm.alerts || [] },
      finalDecision: farm.explanation || {},
      timeline: farm.activityLogs || [],
    }).send(res);
  } catch (err) {
    console.error('[INT] GET /report/:farmId error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

// GET /api/v1/activity
router.get('/activity', async (req, res) => {
  try {
    const activities = await appStore.getActivities(250);
    new ApiResponse(200, 'Universal activity stream retrieved', activities).send(res);
  } catch (err) {
    console.error('[INT] GET /activity error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

module.exports = router;
