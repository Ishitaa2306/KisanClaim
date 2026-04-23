/**
 * Mobile App API Routes — /api/v1/mobile
 *
 * All handlers are async and use MongoDB-backed stores.
 */

const { Router } = require('express');
const appStore = require('../models/Store');
const farmStore = require('../models/Farm');
const ApiResponse = require('../utils/ApiResponse');

const router = Router();

// ── FARMER MODULE ────────────────────────────────────────────

router.get('/farmer/:id', async (req, res) => {
  try {
    const farmer = await appStore.getFarmer(req.params.id);
    if (!farmer) return new ApiResponse(404, 'Farmer not found').send(res);

    const linkedFarms = [];
    for (const fid of farmer.linkedFarmIds) {
      const farm = await farmStore.findById(fid);
      if (!farm) continue;
      linkedFarms.push({
        farmId: farm.farmId, cropType: farm.cropType, location: farm.location,
        areaAcres: farm.areaAcres, severity: farm.severity, riskLevel: farm.riskLevel, ndviDrop: farm.ndviDrop,
      });
    }

    const allClaims = await appStore.getClaimsByFarmer(req.params.id);
    const activeClaims = allClaims
      .filter(c => c.status === 'Pending')
      .map(c => ({ claimId: c.claimId, farmId: c.farmId, status: c.status, claimAmount: c.claimAmount, createdAt: c.createdAt }));

    new ApiResponse(200, 'Farmer profile retrieved', {
      ...farmer, farms: linkedFarms, activeClaims, totalClaims: allClaims.length,
    }).send(res);
  } catch (err) {
    console.error('[MOBILE] GET /farmer/:id error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

router.get('/farmers', async (req, res) => {
  try {
    const farmers = (await appStore.getAllFarmers()).map(f => ({
      farmerId: f.farmerId, name: f.name, phone: f.phone, address: f.address,
      linkedFarmCount: f.linkedFarmIds.length,
    }));
    new ApiResponse(200, 'Farmer list retrieved', farmers).send(res);
  } catch (err) {
    console.error('[MOBILE] GET /farmers error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

// ── FARM DETAILS ─────────────────────────────────────────────

router.get('/farm/:id', async (req, res) => {
  try {
    const farm = await farmStore.findById(req.params.id);
    if (!farm) return new ApiResponse(404, 'Farm not found').send(res);

    // Serve stored data directly — NO re-analysis
    new ApiResponse(200, 'Farm details retrieved', {
      farmId: farm.farmId, farmerName: farm.farmerName, cropType: farm.cropType,
      season: farm.season, location: farm.location, areaAcres: farm.areaAcres,
      insuredAmount: farm.insuredAmount, ndviBefore: farm.ndviBefore, ndviAfter: farm.ndviAfter,
      ndviDrop: farm.ndviDrop, severity: farm.severity,
      damagePercentage: farm.ndviDrop,
      fraudScore: farm.fraudScore,
      riskScore: farm.riskScore, riskLevel: farm.riskLevel,
      analytics: farm.analytics, explanation: farm.explanation,
      weather: farm.weather, alerts: farm.alerts,
    }).send(res);
  } catch (err) {
    console.error('[MOBILE] GET /farm/:id error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

// ── CLAIM SYSTEM ─────────────────────────────────────────────

router.post('/claim', async (req, res) => {
  try {
    const { farmerId, farmId, damageType, description, images } = req.body;
    const errors = [];
    if (!farmerId) errors.push({ field: 'farmerId', message: 'Required' });
    if (!damageType) errors.push({ field: 'damageType', message: 'Required' });
    if (errors.length > 0) return new ApiResponse(400, 'Validation failed', null, { errors }).send(res);

    const farmer = await appStore.getFarmer(farmerId);
    if (!farmer) return new ApiResponse(404, `Farmer ${farmerId} not found`).send(res);

    const farm = farmId ? await farmStore.findById(farmId) : null;
    const result = await appStore.createClaim({
      farmerId, farmId, damageType,
      description: description || `${damageType} damage reported${farm ? ` for ${farm.cropType}` : ''}`,
      images: images || [],
    });

    if (result.error) return new ApiResponse(409, result.error).send(res);
    new ApiResponse(201, 'Claim submitted successfully', result).send(res);
  } catch (err) {
    console.error('[MOBILE] POST /claim error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

router.get('/claims', async (req, res) => {
  try {
    const claims = await appStore.getAllClaims();
    new ApiResponse(200, `${claims.length} claims retrieved`, claims).send(res);
  } catch (err) {
    console.error('[MOBILE] GET /claims error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

router.get('/claims/:farmerId', async (req, res) => {
  try {
    const farmer = await appStore.getFarmer(req.params.farmerId);
    if (!farmer) return new ApiResponse(404, 'Farmer not found').send(res);
    const claims = await appStore.getClaimsByFarmer(req.params.farmerId);
    new ApiResponse(200, `${claims.length} claims for farmer ${req.params.farmerId}`, claims).send(res);
  } catch (err) {
    console.error('[MOBILE] GET /claims/:farmerId error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

router.get('/claim/:id', async (req, res) => {
  try {
    const claim = await appStore.getClaim(req.params.id);
    if (!claim) return new ApiResponse(404, 'Claim not found').send(res);
    new ApiResponse(200, 'Claim details retrieved', claim).send(res);
  } catch (err) {
    console.error('[MOBILE] GET /claim/:id error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

// ── WEATHER MODULE ───────────────────────────────────────────

router.get('/weather/:location', async (req, res) => {
  const location = req.params.location;
  const API_KEY = 'c71f7d716e1fd894741b3c1d9d78894d';
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)},IN&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    const apiData = await response.json();
    if (response.ok && apiData.main) {
      return new ApiResponse(200, 'Live weather data retrieved', {
        location, temperature: Math.round(apiData.main.temp),
        rainfall: apiData.rain ? Math.round(apiData.rain['1h'] || apiData.rain['3h'] || 0) : 0,
        humidity: apiData.main.humidity, condition: apiData.weather?.[0]?.main || 'Clear',
        forecast: apiData.weather?.[0]?.description || 'No forecast available',
      }).send(res);
    }
    const fallback = await appStore.getWeather(location);
    return new ApiResponse(200, 'Weather data retrieved (cached)', fallback).send(res);
  } catch (err) {
    console.warn(`[WEATHER] Mobile API call failed for "${location}":`, err.message);
    const fallback = await appStore.getWeather(location);
    return new ApiResponse(200, 'Weather data retrieved (cached)', fallback).send(res);
  }
});

// ── NOTIFICATION SYSTEM ──────────────────────────────────────

router.get('/notifications/:farmerId', async (req, res) => {
  try {
    const farmer = await appStore.getFarmer(req.params.farmerId);
    if (!farmer) return new ApiResponse(404, 'Farmer not found').send(res);
    const notifications = await appStore.getNotifications(req.params.farmerId);
    new ApiResponse(200, `${notifications.length} notifications`, {
      all: notifications,
      claimUpdates: notifications.filter(n => n.type === 'claim_update'),
      alerts: notifications.filter(n => n.type === 'alert' || n.type === 'weather_warning'),
      weatherWarnings: notifications.filter(n => n.type === 'weather_warning'),
      general: notifications.filter(n => n.type === 'info'),
      unreadCount: notifications.filter(n => !n.read).length,
    }).send(res);
  } catch (err) {
    console.error('[MOBILE] GET /notifications/:farmerId error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

router.post('/notifications', async (req, res) => {
  try {
    const { farmerId, type, message } = req.body;
    if (!farmerId || !message) return new ApiResponse(400, 'farmerId and message are required').send(res);
    const farmer = await appStore.getFarmer(farmerId);
    if (!farmer) return new ApiResponse(404, 'Farmer not found').send(res);
    const notif = await appStore.createNotification(farmerId, { type, message });
    new ApiResponse(201, 'Notification created', notif).send(res);
  } catch (err) {
    console.error('[MOBILE] POST /notifications error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

// ── HISTORY MODULE ───────────────────────────────────────────

router.get('/history/:farmerId', async (req, res) => {
  try {
    const farmer = await appStore.getFarmer(req.params.farmerId);
    if (!farmer) return new ApiResponse(404, 'Farmer not found').send(res);
    const history = await appStore.getHistory(req.params.farmerId);
    new ApiResponse(200, `${history.length} historical records`, history).send(res);
  } catch (err) {
    console.error('[MOBILE] GET /history/:farmerId error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

module.exports = router;
