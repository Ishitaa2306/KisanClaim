/**
 * Central In-Memory Data Store for KisanClaim.
 *
 * Manages: farmers, claims, notifications, activities, weatherData.
 * Farm data is managed separately by FarmStore (Farm.js).
 *
 * Singleton — shared across the entire application.
 */

const { v4: uuidv4 } = require('uuid');
const farmStore = require('./Farm');

class AppStore {
  constructor() {
    this.farmers = new Map();
    this.claims = new Map();
    this.notifications = new Map();   // key = farmerId, value = array
    this.activities = [];
    this.weatherData = new Map();     // key = location string
    this._claimCounter = 0;

    this._seedFarmers();
    this._seedWeather();
    console.log(`  ✔  AppStore initialised: ${this.farmers.size} farmers, ${this.claims.size} claims`);
  }

  // ═══════════════════════════════════════════════════════════════
  //  SEED: Create a farmer for every farm
  // ═══════════════════════════════════════════════════════════════

  _seedFarmers() {
    const allFarms = farmStore.findAll();
    allFarms.forEach((farm, idx) => {
      const farmerId = `FMR-${String(idx + 1).padStart(4, '0')}`;
      const farmer = {
        farmerId,
        name: farm.farmerName,
        phone: `+91${String(7000000000 + idx * 37 + (idx * idx) % 9999)}`,
        aadhaar: `XXXX-XXXX-${String(1000 + idx).slice(-4)}`,
        linkedFarmIds: [farm.farmId],
        address: `${farm.location.district}, ${farm.location.state}`,
        registeredAt: farm.enrolledAt,
      };
      this.farmers.set(farmerId, farmer);

      // Also store a reverse lookup: farmId → farmerId
      if (!this._farmToFarmer) this._farmToFarmer = {};
      this._farmToFarmer[farm.farmId] = farmerId;

      // Initialize notification inbox
      this.notifications.set(farmerId, [
        {
          id: uuidv4(),
          type: 'info',
          message: `Welcome to KisanClaim, ${farm.farmerName}. Your farm ${farm.farmId} is now enrolled.`,
          read: false,
          timestamp: farm.enrolledAt,
        },
      ]);
    });

    // Seed a handful of pre-existing claims for dashboard data
    const sampleFarms = allFarms.filter(f => f.riskLevel === 'high' || f.riskLevel === 'critical').slice(0, 15);
    sampleFarms.forEach(farm => {
      const farmerId = this._farmToFarmer[farm.farmId];
      this._createClaimInternal({
        farmerId,
        farmId: farm.farmId,
        damageType: farm.severity === 'severe' ? 'Flood' : farm.severity === 'high' ? 'Drought' : 'Pest Attack',
        description: `Reported ${farm.severity} damage to ${farm.cropType} crop in ${farm.location.district}.`,
        images: [farm.afterImage || ''],
      }, false); // silent = no push to activity during seed
    });

    // Also create some approved/processed claims from low-risk farms
    const lowRiskFarms = allFarms.filter(f => f.riskLevel === 'low').slice(0, 10);
    lowRiskFarms.forEach(farm => {
      const farmerId = this._farmToFarmer[farm.farmId];
      const claim = this._createClaimInternal({
        farmerId,
        farmId: farm.farmId,
        damageType: 'Weather',
        description: `Minor weather impact on ${farm.cropType}. Verified by satellite.`,
        images: [farm.afterImage || ''],
      }, false);
      // Mark as processed
      claim.status = 'Approved';
      claim.processedAt = new Date(Date.now() - 86400000 * 2).toISOString();
      claim.timeline.push({
        action: 'Claim Approved',
        timestamp: claim.processedAt,
        detail: 'Automated approval — low fraud risk, verified satellite data.',
      });
    });
  }

  _seedWeather() {
    const locations = [
      { location: 'Punjab', temperature: 34, rainfall: 12, humidity: 55, condition: 'Partly Cloudy', forecast: 'Light rain expected' },
      { location: 'Haryana', temperature: 38, rainfall: 3, humidity: 40, condition: 'Clear', forecast: 'Dry spell continues' },
      { location: 'Uttar Pradesh', temperature: 36, rainfall: 45, humidity: 72, condition: 'Heavy Rain', forecast: 'Flood warning active' },
      { location: 'Madhya Pradesh', temperature: 33, rainfall: 8, humidity: 58, condition: 'Partly Cloudy', forecast: 'Normal conditions' },
      { location: 'Rajasthan', temperature: 42, rainfall: 0, humidity: 22, condition: 'Clear', forecast: 'Drought advisory' },
      { location: 'Maharashtra', temperature: 31, rainfall: 25, humidity: 68, condition: 'Light Rain', forecast: 'Monsoon approaching' },
      { location: 'Gujarat', temperature: 37, rainfall: 5, humidity: 45, condition: 'Clear', forecast: 'Stable weather' },
      { location: 'Karnataka', temperature: 29, rainfall: 18, humidity: 65, condition: 'Cloudy', forecast: 'Intermittent showers' },
      { location: 'Andhra Pradesh', temperature: 35, rainfall: 10, humidity: 60, condition: 'Partly Cloudy', forecast: 'Normal conditions' },
      { location: 'Tamil Nadu', temperature: 32, rainfall: 30, humidity: 75, condition: 'Heavy Rain', forecast: 'Cyclone watch' },
      { location: 'Bihar', temperature: 36, rainfall: 40, humidity: 78, condition: 'Heavy Rain', forecast: 'Flooding risk' },
      { location: 'West Bengal', temperature: 33, rainfall: 35, humidity: 80, condition: 'Thunderstorm', forecast: 'Severe weather alert' },
      { location: 'Telangana', temperature: 34, rainfall: 15, humidity: 62, condition: 'Cloudy', forecast: 'Moderate rain expected' },
      { location: 'Odisha', temperature: 32, rainfall: 28, humidity: 70, condition: 'Light Rain', forecast: 'Post-cyclone recovery' },
      { location: 'Chhattisgarh', temperature: 35, rainfall: 20, humidity: 64, condition: 'Partly Cloudy', forecast: 'Normal monsoon activity' },
      { location: 'Jharkhand', temperature: 34, rainfall: 22, humidity: 66, condition: 'Cloudy', forecast: 'Moderate precipitation' },
      { location: 'Assam', temperature: 28, rainfall: 55, humidity: 85, condition: 'Heavy Rain', forecast: 'Flash flood warning' },
    ];
    locations.forEach(w => {
      this.weatherData.set(w.location.toLowerCase(), w);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  FARMER OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  getFarmer(farmerId) {
    return this.farmers.get(farmerId) || null;
  }

  getFarmerByFarmId(farmId) {
    const farmerId = this._farmToFarmer?.[farmId];
    return farmerId ? this.farmers.get(farmerId) : null;
  }

  getAllFarmers() {
    return Array.from(this.farmers.values());
  }

  // ═══════════════════════════════════════════════════════════════
  //  CLAIM OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  _createClaimInternal(input, pushActivity = true) {
    const { farmerId, farmId, damageType, description, images } = input;
    const farm = farmId ? farmStore.findById(farmId) : null;
    const farmer = this.getFarmer(farmerId);

    this._claimCounter++;
    const claimId = `CLM-${String(this._claimCounter).padStart(5, '0')}`;

    // ── Calculate damage ──
    // If farm exists, use real NDVI. If not, use synthetic 45% damage for demo
    const ndviBefore = farm?.ndviBefore || 0.70;
    const ndviAfter = farm?.ndviAfter || (farm ? 0.40 : 0.38);
    const ndviDrop = farm 
      ? parseFloat((((ndviBefore - ndviAfter) / ndviBefore) * 100).toFixed(1))
      : 45.0; // Synthetic damage for naked claims

    // Damage level
    let damageLevel = 'low';
    if (ndviDrop >= 50) damageLevel = 'severe';
    else if (ndviDrop >= 30) damageLevel = 'high';
    else if (ndviDrop >= 10) damageLevel = 'moderate';

    // Claim amount calculation
    const insuredAmount = farm?.insuredAmount || 125000;
    const claimAmount = Math.round(insuredAmount * (ndviDrop / 100) * 0.85);

    // Fraud scoring
    // Randomize slightly for dynamic users to avoid "same values everywhere"
    const baseScore = farm?.riskScore || 25;
    let fraudScore = Math.min(100, Math.max(0, baseScore + Math.floor(Math.random() * 20 - 10)));
    
    let fraudRisk = 'low';
    if (fraudScore >= 70) fraudRisk = 'high';
    else if (fraudScore >= 40) fraudRisk = 'medium';

    const now = new Date().toISOString();

    const claim = {
      claimId,
      farmerId,
      farmerName: farmer?.name || 'Unknown Farmer',
      farmId: farmId || 'NEW-REG',
      damageType,
      description,
      images: images || [],
      status: 'Pending',
      claimAmount,
      ndviAnalysis: {
        ndviBefore,
        ndviAfter,
        ndviDrop,
        damageLevel,
      },
      fraudAnalysis: {
        fraudScore,
        fraudRisk,
        flags: farm?.alerts || (fraudScore > 40 ? ['Dynamic Registration Anomaly'] : []),
      },
      explanation: {
        ndviDrop,
        damageLevel,
        fraudRisk,
        reason: 'Claim submitted via Mobile Portal. Processing dynamic registration verification.',
        decision: 'Pending',
      },
      timeline: [
        { action: 'Claim Submitted', timestamp: now, detail: `Damage type: ${damageType}` },
        { action: 'Identity Verified', timestamp: now, detail: `Farmer: ${farmer?.name || 'Dynamic'}` },
        { action: 'Automated NDVI Check', timestamp: now, detail: `Estimated Drop: ${ndviDrop}%` },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.claims.set(claimId, claim);

    // Link claim to farm
    if (farm) {
      if (!farm.claimIds) farm.claimIds = [];
      farm.claimIds.push(claimId);
    }

    // Push notification
    this._pushNotification(farmerId, {
      type: 'claim_update',
      message: `Your claim ${claimId} has been submitted. Estimated amount: ₹${claimAmount.toLocaleString()}.`,
    });

    // Log activity
    if (pushActivity) {
      this.logActivity({
        type: 'claim_submitted',
        desc: `New claim ${claimId} by ${farmer?.name || 'Farmer'} — ${damageType} (${damageLevel})`,
        farmId: farmId || null,
        farmerId,
      });
    }

    return claim;
  }

  createClaim(input) {
    // Validate no duplicate farmerId+farmId pending claim
    const existing = this.getClaimsByFarmer(input.farmerId).find(
      c => c.farmId === input.farmId && c.status === 'Pending'
    );
    if (existing) {
      return { error: `A pending claim (${existing.claimId}) already exists for farm ${input.farmId}` };
    }
    return this._createClaimInternal(input, true);
  }

  updateClaimStatus(claimId, status) {
    const claim = this.getClaim(claimId);
    if (!claim) return { error: `Claim ${claimId} not found` };

    const now = new Date().toISOString();
    claim.status = status;
    claim.processedAt = now;
    claim.updatedAt = now;
    claim.explanation.decision = status;
    
    claim.timeline.push({
      action: `Claim ${status}`,
      timestamp: now,
      detail: `Status manually updated via Dashboard.`,
    });

    // Notify farmer
    this._pushNotification(claim.farmerId, {
      type: 'claim_update',
      message: `Your claim ${claimId} has been ${status}.`,
    });

    return claim;
  }

  getClaim(claimId) {
    return this.claims.get(claimId) || null;
  }

  getAllClaims() {
    return Array.from(this.claims.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  getClaimsByFarmer(farmerId) {
    return Array.from(this.claims.values())
      .filter(c => c.farmerId === farmerId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // ═══════════════════════════════════════════════════════════════
  //  NOTIFICATION OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  _pushNotification(farmerId, { type, message }) {
    const notif = {
      id: uuidv4(),
      type,
      message,
      read: false,
      timestamp: new Date().toISOString(),
    };
    const inbox = this.notifications.get(farmerId) || [];
    inbox.unshift(notif);
    this.notifications.set(farmerId, inbox);
    return notif;
  }

  getNotifications(farmerId) {
    return this.notifications.get(farmerId) || [];
  }

  createNotification(farmerId, { type, message }) {
    return this._pushNotification(farmerId, { type: type || 'info', message });
  }

  // ═══════════════════════════════════════════════════════════════
  //  WEATHER OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  getWeather(location) {
    // Try exact match first, then partial
    const key = (location || '').toLowerCase().trim();
    if (this.weatherData.has(key)) return this.weatherData.get(key);
    // Partial match
    for (const [k, v] of this.weatherData.entries()) {
      if (k.includes(key) || key.includes(k)) return v;
    }
    // Fallback — generate plausible data
    return {
      location: location,
      temperature: 30 + Math.floor(Math.random() * 12),
      rainfall: Math.floor(Math.random() * 50),
      humidity: 40 + Math.floor(Math.random() * 40),
      condition: 'Partly Cloudy',
      forecast: 'Data limited for this region',
    };
  }

  // ═══════════════════════════════════════════════════════════════
  //  ACTIVITY LOG OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  logActivity({ type, desc, farmId, farmerId }) {
    this.activities.unshift({
      id: uuidv4(),
      type: type || 'system',
      desc,
      farmId: farmId || null,
      farmerId: farmerId || null,
      timestamp: new Date().toISOString(),
    });
    // Keep capped at 500
    if (this.activities.length > 500) this.activities.length = 500;
  }

  getActivities(limit = 75) {
    // Merge store activities with farm-level logs for a complete feed
    const claimEvents = [];
    const fraudAlerts = [];
    const ndviUpdates = [];
    const allFarms = farmStore.findAll();
    let ndviIdx = 0;

    allFarms.forEach(f => {
      if (f.activityLogs) {
        f.activityLogs.forEach(log => {
          claimEvents.push({
            id: log.id,
            type: 'claim event',
            desc: log.action,
            farmId: f.farmId,
            timestamp: log.timestamp,
          });
        });
      }
      if (f.alerts && f.alerts.length > 0) {
        fraudAlerts.push({
          type: 'fraud alert',
          desc: `High risk anomaly triggered: ${f.alerts[0]}`,
          farmId: f.farmId,
          timestamp: f.enrolledAt,
        });
      }
      if (f.analytics && f.ndviDrop > 20) {
        // Stagger timestamps so they don't all sort to the top
        const offset = ndviIdx * 120000; // 2 minutes apart
        ndviUpdates.push({
          type: 'ndvi update',
          desc: `NDVI scanned dropping by ${f.ndviDrop}%`,
          farmId: f.farmId,
          timestamp: new Date(Date.now() - offset).toISOString(),
        });
        ndviIdx++;
      }
    });

    // Take proportional samples from each type to ensure diversity
    const maxPerType = Math.floor(limit / 4);
    const sampledClaims = claimEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, maxPerType);
    const sampledFraud = fraudAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, maxPerType);
    const sampledNdvi = ndviUpdates.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, maxPerType);

    // AppStore activities (claim_submitted, etc.) always included first
    const merged = [...this.activities, ...sampledClaims, ...sampledFraud, ...sampledNdvi];
    return merged
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // ═══════════════════════════════════════════════════════════════
  //  HISTORY (past claims for a farmer)
  // ═══════════════════════════════════════════════════════════════

  getHistory(farmerId) {
    return this.getClaimsByFarmer(farmerId).map(c => ({
      claimId: c.claimId,
      farmId: c.farmId,
      damageType: c.damageType,
      claimAmount: c.claimAmount,
      status: c.status,
      result: c.explanation?.decision || c.status,
      createdAt: c.createdAt,
      processedAt: c.processedAt || null,
    }));
  }
}

// Singleton
module.exports = new AppStore();
