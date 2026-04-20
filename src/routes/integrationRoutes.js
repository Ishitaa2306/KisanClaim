const { Router } = require('express');
const farmStore = require('../models/Farm');
const ApiResponse = require('../utils/ApiResponse');

const router = Router();

// GET /api/v1/risk
router.get('/risk', (req, res) => {
  const allFarms = farmStore.findAll();
  
  const riskStats = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  const topRisks = [];

  allFarms.forEach(f => {
    if (riskStats[f.riskLevel] !== undefined) {
      riskStats[f.riskLevel]++;
    }
    
    // Collect criticals for display list
    if (f.riskLevel === 'critical' && topRisks.length < 10) {
      topRisks.push({
        farmId: f.farmId,
        farmerName: f.farmerName,
        district: f.location.district,
        state: f.location.state,
        riskScore: f.riskScore,
        alerts: f.alerts,
        damagePercentage: f.analysis?.damageAssessment?.damagePercentage || 0,
        fraudScore: f.analysis?.fraudAssessment?.fraudScore || 0,
      });
    }
  });

  new ApiResponse(200, 'Risk distribution map successfully retrieved', {
    distribution: riskStats,
    totalAssessed: allFarms.length,
    criticalFarms: topRisks.sort((a,b) => b.riskScore - a.riskScore)
  }).send(res);
});

// GET /api/v1/logs
router.get('/logs', (req, res) => {
  const allFarms = farmStore.findAll();
  let systemLogs = [];

  allFarms.forEach(f => {
    if (f.activityLogs && f.activityLogs.length > 0) {
      f.activityLogs.forEach(log => {
        systemLogs.push({
          id: log.id,
          action: log.action,
          timestamp: log.timestamp,
          farmId: f.farmId,
          farmerName: f.farmerName,
          riskLevel: f.riskLevel
        });
      });
    }
  });

  // Additional mock generic logs
  systemLogs.push({ id: 'SYS-1', action: 'Global Satellite Telemetry Sync', timestamp: new Date().toISOString(), farmId: 'SYSTEM', farmerName: 'Admin', riskLevel: 'low' });

  // Sort latest first
  systemLogs = systemLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50);

  new ApiResponse(200, 'Recent system logs retrieved', {
    logs: systemLogs,
    totalLogs: systemLogs.length,
  }).send(res);
});

// GET /api/v1/weather
router.get('/weather', (req, res) => {
  const allFarms = farmStore.findAll();
  const weatherMap = {}; // Group by district

  allFarms.forEach(f => {
    const dist = f.location.district;
    if (!weatherMap[dist] && f.weather && Object.keys(weatherMap).length < 12) {
      weatherMap[dist] = {
        district: dist,
        state: f.location.state,
        condition: f.weather.condition,
        temperature: f.weather.temperature,
        humidity: f.weather.humidity,
        alerts: f.alerts || [],
      };
    }
  });

  new ApiResponse(200, 'Regional weather forecasts ready', {
    regions: Object.values(weatherMap)
  }).send(res);
});

// GET /api/v1/map
router.get('/map', (req, res) => {
  const allFarms = farmStore.findAll();
  const mapData = allFarms.map(f => ({
    farmId: f.farmId,
    lat: f.location.latitude,
    lon: f.location.longitude,
    riskLevel: f.riskLevel,
    damage: f.ndviDrop || 0
  }));
  
  new ApiResponse(200, 'Map coordinates and severity metrics retrieved', mapData).send(res);
});

// GET /api/v1/report/:farmId
router.get('/report/:farmId', (req, res) => {
  const farm = farmStore.findById(req.params.farmId);
  if (!farm) {
    return new ApiResponse(404, 'Farm not found', null).send(res);
  }
  
  const report = {
    farmDetails: {
      farmId: farm.farmId,
      farmerName: farm.farmerName,
      location: farm.location,
      cropType: farm.cropType,
      insuredAmount: farm.insuredAmount
    },
    damageAnalysis: {
      severity: farm.severity,
      ndviBefore: farm.ndviBefore,
      ndviAfter: farm.ndviAfter,
      ndviDrop: farm.ndviDrop,
      trend: farm.analytics?.damageTrend || []
    },
    fraudAnalysis: {
      riskScore: farm.riskScore,
      riskLevel: farm.riskLevel,
      alerts: farm.alerts || []
    },
    finalDecision: farm.explanation || {},
    timeline: farm.activityLogs || []
  };
  
  new ApiResponse(200, 'Detailed intelligence report generated', report).send(res);
});

// GET /api/v1/activity
router.get('/activity', (req, res) => {
  const appStore = require('../models/Store');
  const activities = appStore.getActivities(75);
  new ApiResponse(200, 'Universal activity stream retrieved', activities).send(res);
});

module.exports = router;

