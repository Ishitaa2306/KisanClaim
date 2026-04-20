/**
 * Mobile App API Routes — /api/v1/mobile
 *
 * Endpoints designed for the KisanClaim mobile application:
 *   - Farmer profile & linked farms
 *   - Claim submission (POST) & retrieval
 *   - Notifications inbox
 *   - Weather by location
 *   - Claim history
 *   - Farm details (single)
 */

const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const appStore = require('../models/Store');
const farmStore = require('../models/Farm');
const ApiResponse = require('../utils/ApiResponse');
const { analyzeOne } = require('../services/analysisService');

const router = Router();

// ═══════════════════════════════════════════════════════════════
//  FARMER MODULE
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/v1/mobile/farmer/:id
 * Returns farmer details + linked farm + current claim status
 */
router.get('/farmer/:id', (req, res) => {
  const farmer = appStore.getFarmer(req.params.id);
  if (!farmer) {
    return new ApiResponse(404, 'Farmer not found').send(res);
  }

  // Resolve linked farms
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

  // Get active claims
  const activeClaims = appStore.getClaimsByFarmer(req.params.id)
    .filter(c => c.status === 'Pending')
    .map(c => ({
      claimId: c.claimId,
      farmId: c.farmId,
      status: c.status,
      claimAmount: c.claimAmount,
      createdAt: c.createdAt,
    }));

  new ApiResponse(200, 'Farmer profile retrieved', {
    ...farmer,
    farms: linkedFarms,
    activeClaims,
    totalClaims: appStore.getClaimsByFarmer(req.params.id).length,
  }).send(res);
});

/**
 * GET /api/v1/mobile/farmers
 * Returns list of all farmers (for admin / search)
 */
router.get('/farmers', (req, res) => {
  const farmers = appStore.getAllFarmers().map(f => ({
    farmerId: f.farmerId,
    name: f.name,
    phone: f.phone,
    address: f.address,
    linkedFarmCount: f.linkedFarmIds.length,
  }));
  new ApiResponse(200, 'Farmer list retrieved', farmers).send(res);
});

// ═══════════════════════════════════════════════════════════════
//  FARM DETAILS (for mobile — simplified single farm view)
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/v1/mobile/farm/:id
 * Returns complete farm intel for mobile display
 */
router.get('/farm/:id', (req, res) => {
  const farm = farmStore.findById(req.params.id);
  if (!farm) {
    return new ApiResponse(404, 'Farm not found').send(res);
  }

  // Run through analysis pipeline
  let analyzed;
  try {
    analyzed = analyzeOne(farm);
  } catch {
    analyzed = farm;
  }

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
//  CLAIM SYSTEM
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/v1/mobile/claim
 * Submit a new claim from the mobile app
 */
router.post('/claim', (req, res) => {
  const { farmerId, farmId, damageType, description, images } = req.body;

  // Validation
  const errors = [];
  if (!farmerId) errors.push({ field: 'farmerId', message: 'Required' });
  if (!damageType) errors.push({ field: 'damageType', message: 'Required' });

  if (errors.length > 0) {
    return new ApiResponse(400, 'Validation failed', null, { errors }).send(res);
  }

  // Verify farmer exists
  const farmer = appStore.getFarmer(farmerId);
  if (!farmer) {
    return new ApiResponse(404, `Farmer ${farmerId} not found`).send(res);
  }

  // Attempt to find farm for extra intel, but don't fail if missing
  const farm = farmId ? farmStore.findById(farmId) : null;

  const result = appStore.createClaim({
    farmerId,
    farmId,
    damageType,
    description: description || `${damageType} damage reported${farm ? ` for ${farm.cropType}` : ''}`,
    images: images || [],
  });

  if (result.error) {
    return new ApiResponse(409, result.error).send(res);
  }

  new ApiResponse(201, 'Claim submitted successfully', result).send(res);
});

/**
 * GET /api/v1/mobile/claims
 * Returns all claims (dashboard view)
 */
router.get('/claims', (req, res) => {
  const claims = appStore.getAllClaims();
  new ApiResponse(200, `${claims.length} claims retrieved`, claims).send(res);
});

/**
 * GET /api/v1/mobile/claims/:farmerId
 * Returns all claims for a specific farmer
 */
router.get('/claims/:farmerId', (req, res) => {
  const farmer = appStore.getFarmer(req.params.farmerId);
  if (!farmer) {
    return new ApiResponse(404, 'Farmer not found').send(res);
  }
  const claims = appStore.getClaimsByFarmer(req.params.farmerId);
  new ApiResponse(200, `${claims.length} claims for farmer ${req.params.farmerId}`, claims).send(res);
});

/**
 * GET /api/v1/mobile/claim/:id
 * Returns full claim details with NDVI, fraud, explanation, timeline
 */
router.get('/claim/:id', (req, res) => {
  const claim = appStore.getClaim(req.params.id);
  if (!claim) {
    return new ApiResponse(404, 'Claim not found').send(res);
  }
  new ApiResponse(200, 'Claim details retrieved', claim).send(res);
});

// ═══════════════════════════════════════════════════════════════
//  WEATHER MODULE
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/v1/mobile/weather/:location
 * Returns weather data for a region/state
 */
router.get('/weather/:location', (req, res) => {
  const weather = appStore.getWeather(req.params.location);
  new ApiResponse(200, 'Weather data retrieved', weather).send(res);
});

// ═══════════════════════════════════════════════════════════════
//  NOTIFICATION SYSTEM
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/v1/mobile/notifications/:farmerId
 * Returns notification inbox for a farmer
 */
router.get('/notifications/:farmerId', (req, res) => {
  const farmer = appStore.getFarmer(req.params.farmerId);
  if (!farmer) {
    return new ApiResponse(404, 'Farmer not found').send(res);
  }
  const notifications = appStore.getNotifications(req.params.farmerId);

  // Group by type
  const grouped = {
    claimUpdates: notifications.filter(n => n.type === 'claim_update'),
    alerts: notifications.filter(n => n.type === 'alert' || n.type === 'weather_warning'),
    weatherWarnings: notifications.filter(n => n.type === 'weather_warning'),
    general: notifications.filter(n => n.type === 'info'),
  };

  new ApiResponse(200, `${notifications.length} notifications`, {
    all: notifications,
    ...grouped,
    unreadCount: notifications.filter(n => !n.read).length,
  }).send(res);
});

/**
 * POST /api/v1/mobile/notifications
 * Create a new notification
 */
router.post('/notifications', (req, res) => {
  const { farmerId, type, message } = req.body;

  if (!farmerId || !message) {
    return new ApiResponse(400, 'farmerId and message are required').send(res);
  }

  const farmer = appStore.getFarmer(farmerId);
  if (!farmer) {
    return new ApiResponse(404, 'Farmer not found').send(res);
  }

  const notif = appStore.createNotification(farmerId, { type, message });
  new ApiResponse(201, 'Notification created', notif).send(res);
});

// ═══════════════════════════════════════════════════════════════
//  HISTORY MODULE
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/v1/mobile/history/:farmerId
 * Returns past claims with timestamps and results
 */
router.get('/history/:farmerId', (req, res) => {
  const farmer = appStore.getFarmer(req.params.farmerId);
  if (!farmer) {
    return new ApiResponse(404, 'Farmer not found').send(res);
  }
  const history = appStore.getHistory(req.params.farmerId);
  new ApiResponse(200, `${history.length} historical records`, history).send(res);
});

module.exports = router;
