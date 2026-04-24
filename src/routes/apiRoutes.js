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
 * All delegate to the same MongoDB-backed stores.
 */

const { Router } = require('express');
const appStore = require('../models/Store');
const farmStore = require('../models/Farm');
const ApiResponse = require('../utils/ApiResponse');
const analysisController = require('../controllers/analysisController');
const uploadController = require('../controllers/uploadController');
const multer = require('multer');
const path = require('path');

// Multer Config for Temporary Storage
const upload = multer({ 
  dest: 'temp_uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images (jpg/png) are allowed'));
  }
});

const router = Router();

// ═══════════════════════════════════════════════════════════════
//  FARMER
// ═══════════════════════════════════════════════════════════════

router.get('/farmer/:id', async (req, res) => {
  try {
    const farmer = await appStore.getFarmer(req.params.id);
    if (!farmer) return new ApiResponse(404, 'Farmer not found').send(res);

    const linkedFarms = [];
    for (const fid of farmer.linkedFarmIds) {
      const farm = await farmStore.findById(fid);
      if (!farm) continue;
      linkedFarms.push({
        farmId: farm.farmId,
        cropType: farm.cropType,
        location: farm.location,
        areaAcres: farm.areaAcres,
        severity: farm.severity,
        riskLevel: farm.riskLevel,
        ndviDrop: farm.ndviDrop,
      });
    }

    const activeClaims = (await appStore.getClaimsByFarmer(req.params.id))
      .filter(c => c.status === 'Pending')
      .map(c => ({ claimId: c.claimId, farmId: c.farmId, status: c.status, claimAmount: c.claimAmount }));

    const totalClaims = (await appStore.getClaimsByFarmer(req.params.id)).length;

    new ApiResponse(200, 'Farmer profile retrieved', {
      ...farmer,
      farms: linkedFarms,
      activeClaims,
      totalClaims,
    }).send(res);
  } catch (err) {
    console.error('[API] GET /farmer/:id error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

// ═══════════════════════════════════════════════════════════════
//  FARM (single, with full analysis)
// ═══════════════════════════════════════════════════════════════

router.get('/farm/:id', async (req, res) => {
  try {
    const farm = await farmStore.findById(req.params.id);
    if (!farm) return new ApiResponse(404, 'Farm not found').send(res);

    // Serve stored data directly — NO re-analysis
    new ApiResponse(200, 'Farm details retrieved', {
      farmId: farm.farmId,
      farmerName: farm.farmerName,
      cropType: farm.cropType,
      season: farm.season,
      location: farm.location,
      areaAcres: farm.areaAcres,
      insuredAmount: farm.insuredAmount,
      ndviBefore: farm.ndviBefore,
      ndviAfter: farm.ndviAfter,
      ndviDrop: farm.ndviDrop,
      severity: farm.severity,
      damagePercentage: farm.ndviDrop,
      fraudScore: farm.fraudScore,
      riskScore: farm.riskScore,
      riskLevel: farm.riskLevel,
      analytics: farm.analytics,
      explanation: farm.explanation,
      weather: farm.weather,
      alerts: farm.alerts,
    }).send(res);
  } catch (err) {
    console.error('[API] GET /farm/:id error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

// ═══════════════════════════════════════════════════════════════
//  FARM WEATHER INTELLIGENCE ANALYSIS
// ═══════════════════════════════════════════════════════════════

router.get('/farm/:id/analysis', analysisController.getFarmAnalysis);

// ═══════════════════════════════════════════════════════════════
//  EVIDENCE UPLOAD
// ═══════════════════════════════════════════════════════════════

router.post('/upload/evidence', upload.single('image'), uploadController.uploadEvidence);
router.get('/farm/:id/images', uploadController.getFarmImages);

// ═══════════════════════════════════════════════════════════════
//  FARMS LIST (for dashboard consumption)
// ═══════════════════════════════════════════════════════════════

router.get('/farms', async (req, res) => {
  try {
    const allFarms = await farmStore.findAll();
    const mapped = allFarms.map(f => ({
      farmId: f.farmId,
      farmerName: f.farmerName,
      cropType: f.cropType,
      location: f.location,
      riskLevel: f.riskLevel,
      severity: f.severity,
      ndviDrop: f.ndviDrop,
      insuredAmount: f.insuredAmount,
    }));
    new ApiResponse(200, `${mapped.length} farms retrieved`, mapped).send(res);
  } catch (err) {
    console.error('[API] GET /farms error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

// ═══════════════════════════════════════════════════════════════
//  CLAIM SYSTEM
// ═══════════════════════════════════════════════════════════════

router.post('/claim', async (req, res) => {
  try {
    const { farmerId, farmId, damageType, description, images } = req.body;

    const errors = [];
    if (!farmerId) errors.push({ field: 'farmerId', message: 'Required' });
    if (!damageType) errors.push({ field: 'damageType', message: 'Required' });
    if (errors.length > 0) return new ApiResponse(400, 'Validation failed', null, { errors }).send(res);

    if (!(await appStore.getFarmer(farmerId))) return new ApiResponse(404, `Farmer ${farmerId} not found`).send(res);

    const farm = await farmStore.findById(farmId);
    const result = await appStore.createClaim({
      farmerId, farmId, damageType,
      description: description || `${damageType} damage reported for ${farm?.cropType || 'crop'}`,
      images: images || [],
    });

    if (result.error) return new ApiResponse(409, result.error).send(res);
    new ApiResponse(201, 'Claim submitted successfully', result).send(res);
  } catch (err) {
    console.error('[API] POST /claim error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

router.get('/claims', async (req, res) => {
  try {
    const claims = await appStore.getAllClaims();
    new ApiResponse(200, `${claims.length} claims retrieved`, claims).send(res);
  } catch (err) {
    console.error('[API] GET /claims error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

router.get('/claims/:farmerId', async (req, res) => {
  try {
    if (!(await appStore.getFarmer(req.params.farmerId))) {
      return new ApiResponse(404, 'Farmer not found').send(res);
    }
    const claims = await appStore.getClaimsByFarmer(req.params.farmerId);
    new ApiResponse(200, `${claims.length} claims for farmer`, claims).send(res);
  } catch (err) {
    console.error('[API] GET /claims/:farmerId error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

router.get('/claim/:id', async (req, res) => {
  try {
    const claim = await appStore.getClaim(req.params.id);
    if (!claim) return new ApiResponse(404, 'Claim not found').send(res);
    new ApiResponse(200, 'Claim details retrieved', claim).send(res);
  } catch (err) {
    console.error('[API] GET /claim/:id error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

router.patch('/claim/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return new ApiResponse(400, 'Invalid status update').send(res);
    }

    const result = await appStore.updateClaimStatus(req.params.id, status);
    if (result.error) return new ApiResponse(404, result.error).send(res);

    new ApiResponse(200, `Claim ${status}`, result).send(res);
  } catch (err) {
    console.error('[API] PATCH /claim/:id error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

// ═══════════════════════════════════════════════════════════════
//  PAYMENT STATUS TRACKING (Read-only — NO real payment processing)
// ═══════════════════════════════════════════════════════════════

router.get('/payment-status/:claimId', async (req, res) => {
  try {
    const result = await appStore.getPaymentStatus(req.params.claimId);
    if (!result) return new ApiResponse(404, 'Claim not found').send(res);
    new ApiResponse(200, 'Payment status retrieved', result).send(res);
  } catch (err) {
    console.error('[API] GET /payment-status/:claimId error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

// ═══════════════════════════════════════════════════════════════
//  WEATHER (Real-time via OpenWeatherMap, fallback to seeded)
// ═══════════════════════════════════════════════════════════════

router.get('/weather/:location', async (req, res) => {
  const location = req.params.location;
  const API_KEY = 'c71f7d716e1fd894741b3c1d9d78894d';

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)},IN&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    const apiData = await response.json();

    if (response.ok && apiData.main) {
      const weatherResult = {
        location: location,
        temperature: Math.round(apiData.main.temp),
        rainfall: apiData.rain ? Math.round(apiData.rain['1h'] || apiData.rain['3h'] || 0) : 0,
        humidity: apiData.main.humidity,
        condition: apiData.weather?.[0]?.main || 'Clear',
        forecast: apiData.weather?.[0]?.description || 'No forecast available',
      };
      return new ApiResponse(200, 'Live weather data retrieved', weatherResult).send(res);
    }

    // API returned an error — fall back to seeded data
    const fallback = await appStore.getWeather(location);
    return new ApiResponse(200, 'Weather data retrieved (cached)', fallback).send(res);
  } catch (err) {
    // Network error — fall back to seeded data
    console.warn(`[WEATHER] API call failed for "${location}":`, err.message);
    const fallback = await appStore.getWeather(location);
    return new ApiResponse(200, 'Weather data retrieved (cached)', fallback).send(res);
  }
});

// ═══════════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

router.get('/notifications/:farmerId', async (req, res) => {
  try {
    if (!(await appStore.getFarmer(req.params.farmerId))) {
      return new ApiResponse(404, 'Farmer not found').send(res);
    }
    const notifs = await appStore.getNotifications(req.params.farmerId);
    new ApiResponse(200, `${notifs.length} notifications`, {
      all: notifs,
      claimUpdates: notifs.filter(n => n.type === 'claim_update'),
      alerts: notifs.filter(n => n.type === 'alert' || n.type === 'weather_warning'),
      weatherWarnings: notifs.filter(n => n.type === 'weather_warning'),
      unreadCount: notifs.filter(n => !n.read).length,
    }).send(res);
  } catch (err) {
    console.error('[API] GET /notifications/:farmerId error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

router.post('/notifications', async (req, res) => {
  try {
    const { farmerId, type, message } = req.body;
    if (!farmerId || !message) return new ApiResponse(400, 'farmerId and message are required').send(res);
    if (!(await appStore.getFarmer(farmerId))) return new ApiResponse(404, 'Farmer not found').send(res);

    const notif = await appStore.createNotification(farmerId, { type, message });
    new ApiResponse(201, 'Notification created', notif).send(res);
  } catch (err) {
    console.error('[API] POST /notifications error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

// ═══════════════════════════════════════════════════════════════
//  ACTIVITY LOG
// ═══════════════════════════════════════════════════════════════

router.get('/activity', async (req, res) => {
  try {
    const activities = await appStore.getActivities(75);
    new ApiResponse(200, 'Activity feed retrieved', activities).send(res);
  } catch (err) {
    console.error('[API] GET /activity error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

// ═══════════════════════════════════════════════════════════════
//  MAP
// ═══════════════════════════════════════════════════════════════

router.get('/map', async (req, res) => {
  try {
    const allFarms = await farmStore.findAll();
    const mapData = allFarms.map(f => ({
      farmId: f.farmId,
      lat: f.location.latitude,
      lon: f.location.longitude,
      riskLevel: f.riskLevel,
      damage: f.ndviDrop || 0,
    }));
    new ApiResponse(200, 'Map coordinates retrieved', mapData).send(res);
  } catch (err) {
    console.error('[API] GET /map error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

// ═══════════════════════════════════════════════════════════════
//  REPORT
// ═══════════════════════════════════════════════════════════════

router.get('/report/:farmId', async (req, res) => {
  try {
    const farm = await farmStore.findById(req.params.farmId);
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
  } catch (err) {
    console.error('[API] GET /report/:farmId error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

// ═══════════════════════════════════════════════════════════════
//  HISTORY
// ═══════════════════════════════════════════════════════════════

router.get('/history/:farmerId', async (req, res) => {
  try {
    if (!(await appStore.getFarmer(req.params.farmerId))) {
      return new ApiResponse(404, 'Farmer not found').send(res);
    }
    const history = await appStore.getHistory(req.params.farmerId);
    new ApiResponse(200, `${history.length} historical records`, history).send(res);
  } catch (err) {
    console.error('[API] GET /history/:farmerId error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

// ═══════════════════════════════════════════════════════════════
//  AI CROP ADVISOR
// ═══════════════════════════════════════════════════════════════

router.post('/analyze-crop', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return new ApiResponse(400, 'Crop image is required').send(res);
    }

    // Simulated AI Logic
    const diseases = [
      { 
        disease: 'Healthy', 
        severity: 'Green', 
        suggestions: ['Crop condition is good', 'Maintain current irrigation', 'Monitor for any color changes'] 
      },
      { 
        disease: 'Leaf Blight', 
        severity: 'Yellow', 
        suggestions: ['Remove affected leaves', 'Apply fungicide if spreading', 'Avoid overhead watering'] 
      },
      { 
        disease: 'Pest Attack', 
        severity: 'Red', 
        suggestions: ['Use organic pesticide', 'Inspect affected areas', 'Isolate infested plants'] 
      },
      { 
        disease: 'Nitrogen Deficiency', 
        severity: 'Yellow', 
        suggestions: ['Apply nitrogen-rich fertilizer', 'Improve soil nutrients', 'Check soil pH levels'] 
      }
    ];

    const result = diseases[Math.floor(Math.random() * diseases.length)];
    const confidence = Math.floor(Math.random() * (95 - 70 + 1)) + 70;

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    new ApiResponse(200, 'Crop analysis complete', {
      disease: result.disease,
      severity: result.severity,
      confidence: `${confidence}%`,
      suggestions: result.suggestions
    }).send(res);

  } catch (err) {
    console.error('[API] POST /analyze-crop error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

module.exports = router;
