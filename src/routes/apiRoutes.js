/**
 * Top-Level Unversioned API Routes — /api/*
 *
 * These are the exact endpoints specified for mobile app integration:
 *   GET  /api/farmer/:id
 *   GET  /api/farm/:id
 *   POST /api/claim
 *   GET  /api/claims
 *   GET  /api/claims/:farmerId
 *   GET  /api/claim/:id
 *   GET  /api/weather/:location
 *   GET  /api/notifications/:farmerId
 *   POST /api/notifications
 *   GET  /api/activity
 *   GET  /api/map
 *   GET  /api/report/:farmId
 *   GET  /api/history/:farmerId
 *
 * All delegate to the same shared in-memory stores as the v1 API.
 */

const { Router } = require('express');
const appStore = require('../models/Store');
const farmStore = require('../models/Farm');
const ApiResponse = require('../utils/ApiResponse');
const { analyzeOne } = require('../services/analysisService');

const router = Router();

// ═══════════════════════════════════════════════════════════════
//  FARMER
// ═══════════════════════════════════════════════════════════════

router.get('/farmer/:id', (req, res) => {
  const farmer = appStore.getFarmer(req.params.id);
  if (!farmer) return new ApiResponse(404, 'Farmer not found').send(res);

  const linkedFarms = farmer.linkedFarmIds.map(fid => {
    const farm = farmStore.findById(fid);
    if (!farm) return null;
    return {
      farmId: farm.farmId,
      cropType: farm.cropType,
      location: farm.location,
      areaAcres: farm.areaAcres,
      severity: farm.severity,
      riskLevel: farm.riskLevel,
      ndviDrop: farm.ndviDrop,
    };
  }).filter(Boolean);

  const activeClaims = appStore.getClaimsByFarmer(req.params.id)
    .filter(c => c.status === 'Pending')
    .map(c => ({ claimId: c.claimId, farmId: c.farmId, status: c.status, claimAmount: c.claimAmount }));

  new ApiResponse(200, 'Farmer profile retrieved', {
    ...farmer,
    farms: linkedFarms,
    activeClaims,
    totalClaims: appStore.getClaimsByFarmer(req.params.id).length,
  }).send(res);
});

// ═══════════════════════════════════════════════════════════════
//  FARM (single, with full analysis)
// ═══════════════════════════════════════════════════════════════

router.get('/farm/:id', (req, res) => {
  const farm = farmStore.findById(req.params.id);
  if (!farm) return new ApiResponse(404, 'Farm not found').send(res);

  let analyzed;
  try { analyzed = analyzeOne(farm); } catch { analyzed = farm; }

  new ApiResponse(200, 'Farm details retrieved', {
    farmId: analyzed.farmId,
    farmerName: analyzed.farmerName,
    cropType: analyzed.cropType,
    season: analyzed.season,
    location: analyzed.location,
    areaAcres: analyzed.areaAcres,
    insuredAmount: analyzed.insuredAmount,
    ndviBefore: analyzed.ndviBefore,
    ndviAfter: analyzed.ndviAfter,
    ndviDrop: analyzed.ndviDrop,
    severity: analyzed.severity,
    damagePercentage: analyzed.summary?.damagePercentage || analyzed.ndviDrop,
    riskScore: analyzed.riskScore,
    riskLevel: analyzed.riskLevel,
    analytics: analyzed.analytics,
    explanation: analyzed.explanation,
    weather: analyzed.weather,
    alerts: analyzed.alerts,
  }).send(res);
});

// ═══════════════════════════════════════════════════════════════
//  FARMS LIST (for dashboard consumption)
// ═══════════════════════════════════════════════════════════════

router.get('/farms', (req, res) => {
  const allFarms = farmStore.findAll().map(f => ({
    farmId: f.farmId,
    farmerName: f.farmerName,
    cropType: f.cropType,
    location: f.location,
    riskLevel: f.riskLevel,
    severity: f.severity,
    ndviDrop: f.ndviDrop,
    insuredAmount: f.insuredAmount,
  }));
  new ApiResponse(200, `${allFarms.length} farms retrieved`, allFarms).send(res);
});

// ═══════════════════════════════════════════════════════════════
//  CLAIM SYSTEM
// ═══════════════════════════════════════════════════════════════

router.post('/claim', (req, res) => {
  const { farmerId, farmId, damageType, description, images } = req.body;

  const errors = [];
  if (!farmerId) errors.push({ field: 'farmerId', message: 'Required' });
  if (!damageType) errors.push({ field: 'damageType', message: 'Required' });
  if (errors.length > 0) return new ApiResponse(400, 'Validation failed', null, { errors }).send(res);

  if (!appStore.getFarmer(farmerId)) return new ApiResponse(404, `Farmer ${farmerId} not found`).send(res);

  const farm = farmStore.findById(farmId);
  const result = appStore.createClaim({
    farmerId, farmId, damageType,
    description: description || `${damageType} damage reported for ${farm.cropType}`,
    images: images || [],
  });

  if (result.error) return new ApiResponse(409, result.error).send(res);
  new ApiResponse(201, 'Claim submitted successfully', result).send(res);
});

router.get('/claims', (req, res) => {
  const claims = appStore.getAllClaims();
  new ApiResponse(200, `${claims.length} claims retrieved`, claims).send(res);
});

router.get('/claims/:farmerId', (req, res) => {
  if (!appStore.getFarmer(req.params.farmerId)) {
    return new ApiResponse(404, 'Farmer not found').send(res);
  }
  const claims = appStore.getClaimsByFarmer(req.params.farmerId);
  new ApiResponse(200, `${claims.length} claims for farmer`, claims).send(res);
});

router.get('/claim/:id', (req, res) => {
  const claim = appStore.getClaim(req.params.id);
  if (!claim) return new ApiResponse(404, 'Claim not found').send(res);
  new ApiResponse(200, 'Claim details retrieved', claim).send(res);
});

router.patch('/claim/:id', (req, res) => {
  const { status } = req.body;
  if (!['Approved', 'Rejected'].includes(status)) {
    return new ApiResponse(400, 'Invalid status update').send(res);
  }

  const result = appStore.updateClaimStatus(req.params.id, status);
  if (result.error) return new ApiResponse(404, result.error).send(res);

  new ApiResponse(200, `Claim ${status}`, result).send(res);
});

// ═══════════════════════════════════════════════════════════════
//  WEATHER
// ═══════════════════════════════════════════════════════════════

router.get('/weather/:location', (req, res) => {
  const weather = appStore.getWeather(req.params.location);
  new ApiResponse(200, 'Weather data retrieved', weather).send(res);
});

// ═══════════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

router.get('/notifications/:farmerId', (req, res) => {
  if (!appStore.getFarmer(req.params.farmerId)) {
    return new ApiResponse(404, 'Farmer not found').send(res);
  }
  const notifs = appStore.getNotifications(req.params.farmerId);
  new ApiResponse(200, `${notifs.length} notifications`, {
    all: notifs,
    claimUpdates: notifs.filter(n => n.type === 'claim_update'),
    alerts: notifs.filter(n => n.type === 'alert' || n.type === 'weather_warning'),
    weatherWarnings: notifs.filter(n => n.type === 'weather_warning'),
    unreadCount: notifs.filter(n => !n.read).length,
  }).send(res);
});

router.post('/notifications', (req, res) => {
  const { farmerId, type, message } = req.body;
  if (!farmerId || !message) return new ApiResponse(400, 'farmerId and message are required').send(res);
  if (!appStore.getFarmer(farmerId)) return new ApiResponse(404, 'Farmer not found').send(res);

  const notif = appStore.createNotification(farmerId, { type, message });
  new ApiResponse(201, 'Notification created', notif).send(res);
});

// ═══════════════════════════════════════════════════════════════
//  ACTIVITY LOG
// ═══════════════════════════════════════════════════════════════

router.get('/activity', (req, res) => {
  const activities = appStore.getActivities(75);
  new ApiResponse(200, 'Activity feed retrieved', activities).send(res);
});

// ═══════════════════════════════════════════════════════════════
//  MAP
// ═══════════════════════════════════════════════════════════════

router.get('/map', (req, res) => {
  const allFarms = farmStore.findAll();
  const mapData = allFarms.map(f => ({
    farmId: f.farmId,
    lat: f.location.latitude,
    lon: f.location.longitude,
    riskLevel: f.riskLevel,
    damage: f.ndviDrop || 0,
  }));
  new ApiResponse(200, 'Map coordinates retrieved', mapData).send(res);
});

// ═══════════════════════════════════════════════════════════════
//  REPORT
// ═══════════════════════════════════════════════════════════════

router.get('/report/:farmId', (req, res) => {
  const farm = farmStore.findById(req.params.farmId);
  if (!farm) return new ApiResponse(404, 'Farm not found').send(res);

  new ApiResponse(200, 'Intelligence report generated', {
    farmDetails: {
      farmId: farm.farmId,
      farmerName: farm.farmerName,
      location: farm.location,
      cropType: farm.cropType,
      insuredAmount: farm.insuredAmount,
    },
    damageAnalysis: {
      severity: farm.severity,
      ndviBefore: farm.ndviBefore,
      ndviAfter: farm.ndviAfter,
      ndviDrop: farm.ndviDrop,
      trend: farm.analytics?.damageTrend || [],
    },
    fraudAnalysis: {
      riskScore: farm.riskScore,
      riskLevel: farm.riskLevel,
      alerts: farm.alerts || [],
    },
    finalDecision: farm.explanation || {},
    timeline: farm.activityLogs || [],
  }).send(res);
});

// ═══════════════════════════════════════════════════════════════
//  HISTORY
// ═══════════════════════════════════════════════════════════════

router.get('/history/:farmerId', (req, res) => {
  if (!appStore.getFarmer(req.params.farmerId)) {
    return new ApiResponse(404, 'Farmer not found').send(res);
  }
  const history = appStore.getHistory(req.params.farmerId);
  new ApiResponse(200, `${history.length} historical records`, history).send(res);
});

module.exports = router;
