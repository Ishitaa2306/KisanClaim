const { Router } = require('express');
const ApiResponse = require('../utils/ApiResponse');
const appStore = require('../models/Store');
const farmStore = require('../models/Farm');
const { v4: uuidv4 } = require('uuid');
const { clearCache: clearFraudCache } = require('../services/fraudService');

const router = Router();

// In-memory OTP storage (short-lived, no DB needed)
const otpStore = {};

router.post('/send-otp', (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return new ApiResponse(400, 'Name and phone number are required').send(res);
  }
  const otp = '123456';
  otpStore[phone] = { otp, name, expires: Date.now() + 10 * 60 * 1000 };
  console.log(`[AUTH] OTP requested for ${name} (${phone}). Demo OTP: ${otp}`);
  return new ApiResponse(200, 'OTP sent successfully', {
    success: true, message: 'OTP sent to registered mobile number', otp
  }).send(res);
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return new ApiResponse(400, 'Phone number and OTP are required').send(res);

    const storedData = otpStore[phone];
    if (!storedData) return new ApiResponse(400, 'OTP not requested or expired. Please request a new one.').send(res);
    if (Date.now() > storedData.expires) { delete otpStore[phone]; return new ApiResponse(400, 'OTP has expired').send(res); }
    if (storedData.otp !== String(otp).trim()) return new ApiResponse(400, 'Invalid OTP provided. Please check and try again.').send(res);

    const farmerName = storedData.name;
    delete otpStore[phone];

    let farmer = await appStore.getFarmerByPhone(phone);

    if (!farmer) {
      farmer = await _createNewFarmer(farmerName, phone);
    }

    console.log(`[AUTH] Login successful for ${farmer.name} (${farmer.farmerId})`);
    return new ApiResponse(200, 'Authentication successful', {
      success: true, farmerId: farmer.farmerId, name: farmer.name, state: farmer.address
    }).send(res);
  } catch (err) {
    console.error('[AUTH] verify-otp error:', err.message);
    new ApiResponse(500, 'Internal server error').send(res);
  }
});

async function _createNewFarmer(farmerName, phone) {
  const farmerId = `FMR-${uuidv4().substring(0, 8).toUpperCase()}`;
  const crops = [
    { name: 'Wheat', season: 'Rabi' }, { name: 'Rice', season: 'Kharif' },
    { name: 'Cotton', season: 'Kharif' }, { name: 'Sugarcane', season: 'Annual' },
    { name: 'Maize', season: 'Kharif' },
  ];
  const states = ['Punjab', 'Haryana', 'Gujarat', 'Uttar Pradesh', 'Maharashtra'];
  const districts = ['Bathinda', 'Karnal', 'Surat', 'Kanpur', 'Pune'];

  const randCropObj = crops[Math.floor(Math.random() * crops.length)];
  const si = Math.floor(Math.random() * states.length);
  const randState = states[si], randDistrict = districts[si];
  const areaAcres = parseFloat((Math.random() * 19 + 1).toFixed(1));
  const insuredAmount = Math.floor(areaAcres * 22000);
  const ndviBefore = parseFloat((Math.random() * 0.4 + 0.5).toFixed(2));
  const ndviAfter = parseFloat((Math.random() * 0.5 + 0.1).toFixed(2));
  const ndviDrop = parseFloat(Math.max(0, ((ndviBefore - ndviAfter) / ndviBefore) * 100).toFixed(1));
  const riskScore = Math.floor(Math.random() * 50 + 10);

  let severity = 'minimal';
  if (ndviDrop >= 50) severity = 'severe';
  else if (ndviDrop >= 30) severity = 'high';
  else if (ndviDrop >= 10) severity = 'moderate';

  let riskLevel = 'low';
  if (riskScore >= 76) riskLevel = 'critical';
  else if (riskScore >= 51) riskLevel = 'high';
  else if (riskScore >= 26) riskLevel = 'medium';

  let decision = 'Approved', reason = 'Claim verified. NDVI drop and field data match reported damage.';
  if (riskLevel === 'high' || riskLevel === 'critical') { decision = 'Flagged'; reason = `Flagged for manual review due to anomalous damage pattern in ${randDistrict}.`; }
  else if (severity === 'minimal') { decision = 'Rejected'; reason = 'Rejected because satellite evidence shows minimal to no damage.'; }

  const fraudRisk = riskLevel === 'critical' ? 'high' : riskLevel;
  const now = new Date().toISOString();

  // Generate unique farm ID
  let kcfId = `KCF-${String(Math.floor(1000 + Math.random() * 9000))}`;
  if (await farmStore.findById(kcfId)) {
    kcfId = `KCF-${String(Math.floor(1000 + Math.random() * 9000))}-${uuidv4().slice(0, 4).toUpperCase()}`;
  }

  const defaultFarm = await farmStore.create({
    farmId: kcfId, farmerName, cropType: randCropObj.name, season: randCropObj.season,
    location: { state: randState, district: randDistrict, latitude: parseFloat((Math.random() * 10 + 20).toFixed(4)), longitude: parseFloat((Math.random() * 15 + 70).toFixed(4)) },
    areaAcres, insuredAmount, policyId: `POL-${uuidv4().slice(0, 8).toUpperCase()}`, enrolledAt: now,
    ndviBefore, ndviAfter, ndviDrop, riskScore, riskLevel, severity,
    alerts: riskLevel === 'high' ? ['Drought Warning'] : riskLevel === 'critical' ? ['Drought Warning', 'Pest Attack'] : [],
    activityLogs: [{ id: uuidv4(), action: 'Farm Registered', timestamp: now }, { id: uuidv4(), action: 'Data Synced', timestamp: now }],
    weather: { temperature: Math.floor(Math.random() * 17 + 25), humidity: Math.floor(Math.random() * 60 + 30), condition: severity === 'severe' || severity === 'high' ? 'Heavy Rain' : 'Partly Cloudy' },
    beforeImage: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6',
    afterImage: ndviDrop > 10 ? 'https://images.unsplash.com/photo-1583245553131-0e7d36409271' : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef',
    analytics: {
      ndviHistory: [parseFloat((ndviBefore + 0.05).toFixed(2)), parseFloat((ndviBefore + 0.02).toFixed(2)), parseFloat(Math.max(0.01, ndviBefore - 0.01).toFixed(2)), parseFloat(Math.max(0.01, ndviAfter + 0.04).toFixed(2)), parseFloat(ndviAfter.toFixed(2))],
      damageTrend: [Math.max(0, Math.floor(ndviDrop - 40)), Math.max(0, Math.floor(ndviDrop - 20)), Math.max(0, Math.floor(ndviDrop - 10)), Math.floor(ndviDrop), Math.floor(ndviDrop + Math.random() * 5)],
      riskScore, region: `${randState}/${randDistrict}`,
    },
    explanation: { ndviDrop, damageLevel: severity, fraudRisk, reason, decision },
  });

  clearFraudCache();

  const farmer = await appStore.createFarmer({
    farmerId, name: farmerName, phone, aadhaar: `XXXX-XXXX-${String(Math.floor(1000 + Math.random() * 9000))}`,
    linkedFarmIds: [defaultFarm.farmId], address: `${randDistrict}, ${randState}`, registeredAt: now,
  });

  await appStore.createNotification(farmerId, { type: 'info', message: `Welcome to KisanClaim, ${farmerName}. Your farm ${defaultFarm.farmId} is now enrolled.` });
  console.log(`[AUTH] New farmer registered: ${farmerName} (${farmerId}) with farm ${defaultFarm.farmId}`);
  return farmer;
}

module.exports = router;
