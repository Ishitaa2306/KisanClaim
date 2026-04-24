/**
 * Central Data Store for KisanClaim — JSON File backed.
 *
 * Manages: farmers, claims, notifications, activities, weatherData.
 */

const { v4: uuidv4 } = require('uuid');
const dbManager = require('../data/dbManager');
const farmStore = require('./Farm');

const appStore = {

  // ═══════════════════════════════════════════════════════════════
  //  INITIALIZATION
  // ═══════════════════════════════════════════════════════════════

  async initialize() {
    const db = await dbManager.getData();
    
    // Initialize arrays if missing
    if (!db.farmers) db.farmers = [];
    if (!db.claims) db.claims = [];
    if (!db.notifications) db.notifications = [];
    if (!db.activities) db.activities = [];
    if (!db.weather) db.weather = [];
    if (!db.images) db.images = [];

    if (db.farmers.length > 0) {
      console.log(`  ✔  AppStore: ${db.farmers.length} farmers, ${db.claims.length} claims already in JSON DB`);
      return;
    }

    console.log('  ⏳ AppStore: Seeding farmers, claims, weather...');
    await this._seedFarmers(db);
    await this._seedWeather(db);

    await dbManager.saveData();
    console.log(`  ✔  AppStore initialised: ${db.farmers.length} farmers, ${db.claims.length} claims`);
  },

  async _seedFarmers(db) {
    const allFarms = await farmStore.findAll();
    const farmToFarmerMap = {};

    allFarms.forEach((farm, idx) => {
      const farmerId = `FMR-${String(idx + 1).padStart(4, '0')}`;
      
      db.farmers.push({
        farmerId,
        name: farm.farmerName,
        phone: `+91${String(7000000000 + idx * 37 + (idx * idx) % 9999)}`,
        aadhaar: `XXXX-XXXX-${String(1000 + idx).slice(-4)}`,
        linkedFarmIds: [farm.farmId],
        address: `${farm.location.district}, ${farm.location.state}`,
        registeredAt: farm.enrolledAt,
      });

      db.notifications.push({
        notificationId: uuidv4(),
        farmerId,
        type: 'info',
        message: `Welcome to KisanClaim, ${farm.farmerName}. Your farm ${farm.farmId} is now enrolled.`,
        read: false,
        timestamp: farm.enrolledAt,
      });

      farmToFarmerMap[farm.farmId] = farmerId;
    });

    await dbManager.saveData(); // Save to make them available for claims

    // Seed claims — use the stored farm decision, DO NOT override
    const sampleFarms = allFarms.filter(f => f.riskLevel === 'high' || f.riskLevel === 'critical').slice(0, 15);
    for (const farm of sampleFarms) {
      const farmerId = farmToFarmerMap[farm.farmId];
      await this._createClaimInternal({
        farmerId,
        farmId: farm.farmId,
        damageType: farm.severity === 'severe' ? 'Flood' : farm.severity === 'high' ? 'Drought' : 'Pest Attack',
        description: `Reported ${farm.severity} damage to ${farm.cropType} crop in ${farm.location.district}.`,
        images: [farm.afterImage || ''],
      }, false);
      // NO override — claim and farm keep their stored decision
    }

    const lowRiskFarms = allFarms.filter(f => f.riskLevel === 'low').slice(0, 10);
    for (const [idx, farm] of lowRiskFarms.entries()) {
      const farmerId = farmToFarmerMap[farm.farmId];
      
      const damageTypes = ['Cyclonic Storm', 'Flash Flood', 'Locust Infestation', 'Monsoon Delay', 'Unseasonal Rain', 'Heat Wave', 'Pest Attack', 'Drought', 'Soil Salinity', 'Wild Animal Entry'];
      const dt = damageTypes[idx % damageTypes.length];
      
      await this._createClaimInternal({
        farmerId, farmId: farm.farmId, damageType: dt,
        description: `Impact assessment for ${dt.toLowerCase()} on ${farm.cropType}. Statistical verify pending.`,
        images: [farm.afterImage || ''],
      }, false);
      // NO override — claim keeps whatever status the engine determined
    }
  },

  async _seedWeather(db) {
    const locations = [
      { location: 'punjab', temperature: 34, rainfall: 12, humidity: 55, condition: 'Partly Cloudy', forecast: 'Light rain expected' },
      { location: 'haryana', temperature: 38, rainfall: 3, humidity: 40, condition: 'Clear', forecast: 'Dry spell continues' },
      { location: 'uttar pradesh', temperature: 36, rainfall: 45, humidity: 72, condition: 'Heavy Rain', forecast: 'Flood warning active' },
      { location: 'madhya pradesh', temperature: 33, rainfall: 8, humidity: 58, condition: 'Partly Cloudy', forecast: 'Normal conditions' },
      { location: 'rajasthan', temperature: 42, rainfall: 0, humidity: 22, condition: 'Clear', forecast: 'Drought advisory' },
      { location: 'maharashtra', temperature: 31, rainfall: 25, humidity: 68, condition: 'Light Rain', forecast: 'Monsoon approaching' },
      { location: 'gujarat', temperature: 37, rainfall: 5, humidity: 45, condition: 'Clear', forecast: 'Stable weather' },
      { location: 'karnataka', temperature: 29, rainfall: 18, humidity: 65, condition: 'Cloudy', forecast: 'Intermittent showers' },
      { location: 'andhra pradesh', temperature: 35, rainfall: 10, humidity: 60, condition: 'Partly Cloudy', forecast: 'Normal conditions' },
      { location: 'tamil nadu', temperature: 32, rainfall: 30, humidity: 75, condition: 'Heavy Rain', forecast: 'Cyclone watch' },
      { location: 'bihar', temperature: 36, rainfall: 40, humidity: 78, condition: 'Heavy Rain', forecast: 'Flooding risk' },
      { location: 'west bengal', temperature: 33, rainfall: 35, humidity: 80, condition: 'Thunderstorm', forecast: 'Severe weather alert' },
      { location: 'telangana', temperature: 34, rainfall: 15, humidity: 62, condition: 'Cloudy', forecast: 'Moderate rain expected' },
      { location: 'odisha', temperature: 32, rainfall: 28, humidity: 70, condition: 'Light Rain', forecast: 'Post-cyclone recovery' },
      { location: 'chhattisgarh', temperature: 35, rainfall: 20, humidity: 64, condition: 'Partly Cloudy', forecast: 'Normal monsoon activity' },
      { location: 'jharkhand', temperature: 34, rainfall: 22, humidity: 66, condition: 'Cloudy', forecast: 'Moderate precipitation' },
      { location: 'assam', temperature: 28, rainfall: 55, humidity: 85, condition: 'Heavy Rain', forecast: 'Flash flood warning' },
    ];
    db.weather.push(...locations);
  },

  // ═══════════════════════════════════════════════════════════════
  //  FARMER OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  async getFarmer(farmerId) {
    const db = await dbManager.getData();
    return db.farmers.find(f => f.farmerId === farmerId) || null;
  },

  async getFarmerByPhone(phone) {
    const db = await dbManager.getData();
    return db.farmers.find(f => f.phone === phone || f.phone === `+91${phone}`) || null;
  },

  async getFarmerByFarmId(farmId) {
    const db = await dbManager.getData();
    return db.farmers.find(f => f.linkedFarmIds && f.linkedFarmIds.includes(farmId)) || null;
  },

  async getAllFarmers() {
    const db = await dbManager.getData();
    return [...(db.farmers || [])];
  },

  async createFarmer(farmerData) {
    const db = await dbManager.getData();
    db.farmers.push(farmerData);
    await dbManager.saveData();
    return farmerData;
  },

  // ═══════════════════════════════════════════════════════════════
  //  CLAIM OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  async _createClaimInternal(input, pushActivity = true) {
    const { farmerId, farmId, damageType, description, images } = input;
    const db = await dbManager.getData();
    
    const farm = farmId ? await farmStore.findById(farmId) : null;
    const farmer = await this.getFarmer(farmerId);

    const seq = await dbManager.getNextSequence('claim');
    const claimId = `CLM-${String(seq).padStart(5, '0')}`;

    // ══════════════════════════════════════════════════════════════
    //  READ from the farm's single source of truth — NEVER recompute
    // ══════════════════════════════════════════════════════════════
    const ndviBefore = farm?.ndviBefore || 0.70;
    const ndviAfter = farm?.ndviAfter || (farm ? 0.40 : 0.38);
    const ndviDrop = farm?.ndviDrop || parseFloat((((ndviBefore - ndviAfter) / ndviBefore) * 100).toFixed(1));

    let damageLevel = 'low';
    if (ndviDrop >= 50) damageLevel = 'severe';
    else if (ndviDrop >= 30) damageLevel = 'high';
    else if (ndviDrop >= 10) damageLevel = 'moderate';

    const insuredAmount = farm?.insuredAmount || 125000;
    const claimAmount = Math.round(insuredAmount * (ndviDrop / 100) * 0.85);

    // Use farm's stored fraudScore as the SINGLE SOURCE OF TRUTH
    // For new farms without a stored score, generate one
    let fraudScore;
    if (farm && farm.fraudScore !== undefined) {
      fraudScore = farm.fraudScore;
    } else if (farm) {
      fraudScore = farm.riskScore || 25;
    } else {
      fraudScore = Math.floor(Math.random() * 40) + 5; // 5-44 for new claims
    }

    let fraudRisk = 'low';
    if (fraudScore >= 60) fraudRisk = 'high';
    else if (fraudScore >= 25) fraudRisk = 'medium';

    // Use the farm's stored decision if available, otherwise run engine ONCE
    let initialStatus, reason;
    if (farm && farm.explanation && farm.explanation.decision && farm.explanation.reason) {
      initialStatus = farm.explanation.decision;
      reason = farm.explanation.reason;
    } else {
      const { evaluateDecision } = require('../utils/decisionEngine');
      const result = evaluateDecision(ndviDrop, fraudScore);
      initialStatus = result.status;
      reason = result.reason;
    }

    const now = new Date().toISOString();

    const claimData = {
      claimId, farmerId, farmerName: farmer?.name || 'Unknown Farmer',
      farmId: farmId || 'NEW-REG', damageType, description, images: images || [],
      status: 'Pending', // New claims always start as Pending to allow manual Approve/Reject option
      claimAmount,
      ndviAnalysis: { ndviBefore, ndviAfter, ndviDrop, damageLevel },
      fraudAnalysis: { fraudScore, fraudRisk, flags: farm?.alerts || (fraudScore > 40 ? ['Dynamic Registration Anomaly'] : []) },
      explanation: {
        ndviDrop, damageLevel, fraudScore, fraudRisk,
        reason: reason,
        decision: initialStatus,
      },
      timeline: [
        { action: 'Claim Submitted', timestamp: now, detail: `Damage type: ${damageType}` },
        { action: 'Identity Verified', timestamp: now, detail: `Farmer: ${farmer?.name || 'Dynamic'}` },
        { action: 'Automated NDVI Check', timestamp: now, detail: `Estimated Drop: ${ndviDrop}%` },
      ],
      createdAt: now, updatedAt: now,
    };

    db.claims.push(claimData);
    await dbManager.saveData();

    // Sync farm profile with the claim decision immediately
    if (farmId) {
      const farmDoc = await farmStore.findById(farmId);
      if (farmDoc) {
        await farmStore.updateById(farmId, { 
          'explanation.decision': initialStatus,
          'explanation.reason': reason
        });
      }
    }

    if (farm) {
      await farmStore.updateById(farmId, { $addToSet: { claimIds: claimId } });
    }

    await this._pushNotification(farmerId, {
      type: 'claim_update',
      message: `Your claim ${claimId} has been submitted. Estimated amount: ₹${claimAmount.toLocaleString()}.`,
    });

    if (pushActivity) {
      await this.logActivity({
        type: 'claim_submitted',
        desc: `New claim ${claimId} by ${farmer?.name || 'Farmer'} — ${damageType} (${damageLevel})`,
        farmId: farmId || null, farmerId,
      });
    }

    return claimData;
  },

  async createClaim(input) {
    const db = await dbManager.getData();
    const existing = db.claims.find(c => c.farmerId === input.farmerId && c.farmId === input.farmId && c.status === 'Pending');
    if (existing) return { error: `A pending claim (${existing.claimId}) already exists for farm ${input.farmId}` };
    return this._createClaimInternal(input, true);
  },

  // Helper for seed scripts
  async updateClaimStatusRaw(claimId, updates) {
    const db = await dbManager.getData();
    const claim = db.claims.find(c => c.claimId === claimId);
    if (!claim) return;
    
    if (updates.status) claim.status = updates.status;
    if (updates.processedAt) claim.processedAt = updates.processedAt;
    if (updates['explanation.decision']) claim.explanation.decision = updates['explanation.decision'];
    if (updates.newTimelineEvent) claim.timeline.push(updates.newTimelineEvent);
    
    await dbManager.saveData();

    // Sync farm
    if (claim.farmId) {
      const farm = await farmStore.findById(claim.farmId);
      if (farm && farm.explanation) {
        farm.explanation.decision = claim.status;
        await farmStore.updateById(claim.farmId, { explanation: farm.explanation });
      }
    }
  },

  async updateClaimStatus(claimId, status) {
    const db = await dbManager.getData();
    const claim = db.claims.find(c => c.claimId === claimId);
    if (!claim) return { error: `Claim ${claimId} not found` };

    const now = new Date().toISOString();
    claim.status = status;
    claim.processedAt = now;
    claim.updatedAt = now;
    claim.explanation.decision = status;

    // ── Payment Status: auto-set to PROCESSING when approved ──
    if (status === 'Approved') {
      claim.paymentStatus = 'PROCESSING';
      claim.paymentUpdatedAt = now;
    } else {
      // Non-approved statuses reset payment tracking
      claim.paymentStatus = 'NOT_INITIATED';
      claim.paymentUpdatedAt = now;
    }

    claim.timeline.push({
      action: `Claim ${status}`,
      timestamp: now,
      detail: `Status manually updated via Dashboard.`,
    });

    await dbManager.saveData();

    // Sync farm
    if (claim.farmId) {
      const farm = await farmStore.findById(claim.farmId);
      if (farm && farm.explanation) {
        farm.explanation.decision = status;
        await farmStore.updateById(claim.farmId, { explanation: farm.explanation });
      }
    }

    await this._pushNotification(claim.farmerId, {
      type: 'claim_update',
      message: `Your claim ${claimId} has been ${status}.`,
    });

    return claim;
  },

  async getClaim(claimId) {
    const db = await dbManager.getData();
    return db.claims.find(c => c.claimId === claimId) || null;
  },

  async getAllClaims() {
    const db = await dbManager.getData();
    return [...(db.claims || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getClaimsByFarmer(farmerId) {
    const db = await dbManager.getData();
    return db.claims.filter(c => c.farmerId === farmerId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // ═══════════════════════════════════════════════════════════════
  //  NOTIFICATION OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  async _pushNotification(farmerId, { type, message }) {
    const db = await dbManager.getData();
    const notif = {
      notificationId: uuidv4(),
      farmerId, type, message, read: false,
      timestamp: new Date().toISOString(),
    };
    db.notifications.push(notif);
    await dbManager.saveData();
    return notif;
  },

  async getNotifications(farmerId) {
    const db = await dbManager.getData();
    return db.notifications.filter(n => n.farmerId === farmerId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async createNotification(farmerId, { type, message }) {
    return this._pushNotification(farmerId, { type: type || 'info', message });
  },

  // ═══════════════════════════════════════════════════════════════
  //  WEATHER OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  async getWeather(location) {
    const db = await dbManager.getData();
    const key = (location || '').toLowerCase().trim();

    let weather = db.weather.find(w => w.location === key);
    if (weather) return weather;

    weather = db.weather.find(w => w.location.includes(key) || key.includes(w.location));
    if (weather) return weather;

    return {
      location: location,
      temperature: 30 + Math.floor(Math.random() * 12),
      rainfall: Math.floor(Math.random() * 50),
      humidity: 40 + Math.floor(Math.random() * 40),
      condition: 'Partly Cloudy',
      forecast: 'Data limited for this region',
    };
  },

  // ═══════════════════════════════════════════════════════════════
  //  ACTIVITY LOG OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  async logActivity({ type, desc, farmId, farmerId }) {
    const db = await dbManager.getData();
    db.activities.push({
      activityId: uuidv4(),
      type: type || 'system',
      desc, farmId: farmId || null, farmerId: farmerId || null,
      timestamp: new Date().toISOString(),
    });
    await dbManager.saveData();
  },

  async getActivities(limit = 100) {
    const allFarms = await farmStore.findAll();
    const allEvents = [];
    const now = new Date();

    allFarms.forEach((f, idx) => {
      // 1. WEATHER EVENTS (T-5 days)
      if (f.weather && f.weather.condition !== 'Clear') {
        allEvents.push({
          activityId: `evt-wth-${f.farmId}-${idx}`,
          eventType: 'WEATHER',
          title: `${f.weather.condition} detected in ${f.location.district}`,
          description: `Localized ${f.weather.condition.toLowerCase()} affecting agricultural output.`,
          referenceId: f.farmId,
          severity: f.weather.condition === 'Drought' || f.weather.condition === 'Flood' ? 'High' : 'Medium',
          timestamp: new Date(now.getTime() - (5 * 60 * 60 * 1000) - (idx * 60000)).toISOString()
        });
      }

      // 2. NDVI EVENTS (T-4 hours)
      if (f.ndviDrop > 15) {
        allEvents.push({
          activityId: `evt-ndvi-${f.farmId}-${idx}`,
          eventType: 'NDVI',
          title: `Significant NDVI drop: ${f.ndviDrop}%`,
          description: `Satellite telemetry indicates major biomass reduction in ${f.cropType} canopy.`,
          referenceId: f.farmId,
          severity: f.ndviDrop > 50 ? 'High' : 'Medium',
          timestamp: new Date(now.getTime() - (4 * 60 * 60 * 1000) - (idx * 60000)).toISOString()
        });
      }

      // 3. RISK EVENTS (T-3 hours)
      if (f.riskLevel === 'critical' || f.riskLevel === 'high') {
        allEvents.push({
          activityId: `evt-risk-${f.farmId}-${idx}`,
          eventType: 'RISK',
          title: `Risk Escalated: ${f.riskLevel.toUpperCase()}`,
          description: `Asset flagged as ${f.riskLevel} due to multi-modal anomaly intersection.`,
          referenceId: f.farmId,
          severity: f.riskLevel === 'critical' ? 'High' : 'Medium',
          timestamp: new Date(now.getTime() - (3 * 60 * 60 * 1000) - (idx * 60000)).toISOString()
        });
      }

      // 4. FRAUD EVENTS (T-2 hours)
      if (f.fraudScore > 40) {
        allEvents.push({
          activityId: `evt-frd-${f.farmId}-${idx}`,
          eventType: 'FRAUD',
          title: `Suspicious Pattern Detected`,
          description: `Claim anomaly score: ${f.fraudScore}. Neighboring farm correlation mismatch.`,
          referenceId: f.farmId,
          severity: f.fraudScore > 70 ? 'High' : 'Medium',
          timestamp: new Date(now.getTime() - (2 * 60 * 60 * 1000) - (idx * 60000)).toISOString()
        });
      }

      // 5. CLAIM EVENTS (T-1 hour to Now)
      const decision = f.explanation?.decision || 'Pending';
      if (decision !== 'Pending') {
        allEvents.push({
          activityId: `evt-clm-${f.farmId}-${idx}`,
          eventType: 'CLAIM',
          title: `Claim ${decision}`,
          description: `Formal claim lifecycle reached terminal state: ${decision}.`,
          referenceId: f.farmId,
          severity: decision === 'Rejected' ? 'High' : 'Low',
          timestamp: new Date(now.getTime() - (1 * 60 * 60 * 1000) - (idx * 60000)).toISOString()
        });
      }
    });

    // Merge with any manual store activities (mapped to new schema)
    const db = await dbManager.getData();
    const manualActivities = (db.activities || []).map(act => ({
      activityId: act.activityId,
      eventType: (act.type || 'SYSTEM').toUpperCase(),
      title: act.desc,
      description: 'Manual system log entry.',
      referenceId: act.farmId || 'SYSTEM',
      severity: 'Low',
      timestamp: act.timestamp
    }));

    const merged = [...manualActivities, ...allEvents];
    return merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 500);
  },

  async getHistory(farmerId) {
    const claims = await this.getClaimsByFarmer(farmerId);
    return claims.map(c => ({
      claimId: c.claimId, farmId: c.farmId, damageType: c.damageType,
      claimAmount: c.claimAmount, status: c.status,
      result: c.explanation?.decision || c.status,
      createdAt: c.createdAt, processedAt: c.processedAt || null,
    }));
  },

  // ═══════════════════════════════════════════════════════════════
  //  PAYMENT STATUS TRACKING (Simulated — NO real payment API)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Returns the current payment status for a claim.
   * Uses lazy evaluation: on each read, checks elapsed time since
   * approval and simulates progression through the payment pipeline.
   *
   * Timeline (from approval moment):
   *   0 – 2 min  →  PROCESSING
   *   2 – 5 min  →  DELAYED  (only if fraudScore ≥ 35)
   *   > 2 min    →  COMPLETED (low-risk claims)
   *   > 5 min    →  COMPLETED (all claims, including delayed)
   */
  async getPaymentStatus(claimId) {
    const db = await dbManager.getData();
    const claim = db.claims.find(c => c.claimId === claimId);
    if (!claim) return null;

    // Only approved claims enter the payment pipeline
    if (claim.status !== 'Approved') {
      return {
        claimId: claim.claimId,
        status: 'NOT_INITIATED',
        lastUpdated: claim.updatedAt || claim.createdAt,
      };
    }

    // Bootstrap: seeded claims that were approved before this feature existed
    if (!claim.paymentStatus || claim.paymentStatus === 'NOT_INITIATED') {
      claim.paymentStatus = 'PROCESSING';
      claim.paymentUpdatedAt = claim.processedAt || claim.updatedAt || claim.createdAt;
    }

    // Simulate time-based progression
    const approvalTime = new Date(claim.processedAt || claim.updatedAt || claim.createdAt).getTime();
    const elapsed = Date.now() - approvalTime;
    const MINUTE = 60 * 1000;
    const fraudScore = claim.fraudAnalysis?.fraudScore ?? 0;
    const isHighRisk = fraudScore >= 35;

    let dirty = false;

    if (claim.paymentStatus === 'PROCESSING') {
      if (elapsed > 5 * MINUTE) {
        // All claims complete after 5 minutes
        claim.paymentStatus = 'COMPLETED';
        claim.paymentUpdatedAt = new Date().toISOString();
        dirty = true;
      } else if (elapsed > 2 * MINUTE && isHighRisk) {
        // High-risk claims get delayed between 2-5 min
        claim.paymentStatus = 'DELAYED';
        claim.paymentUpdatedAt = new Date().toISOString();
        dirty = true;
      } else if (elapsed > 2 * MINUTE && !isHighRisk) {
        // Low-risk claims complete after 2 min
        claim.paymentStatus = 'COMPLETED';
        claim.paymentUpdatedAt = new Date().toISOString();
        dirty = true;
      }
    } else if (claim.paymentStatus === 'DELAYED') {
      if (elapsed > 5 * MINUTE) {
        claim.paymentStatus = 'COMPLETED';
        claim.paymentUpdatedAt = new Date().toISOString();
        dirty = true;
      }
    }

    if (dirty) {
      await dbManager.saveData();
    }

    return {
      claimId: claim.claimId,
      status: claim.paymentStatus,
      lastUpdated: claim.paymentUpdatedAt,
    };
  },

  async getImagesByFarmId(farmId) {
    const db = await dbManager.getData();
    if (!db.images) return [];
    return db.images
      .filter(img => img.farmId === farmId)
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  },

  async saveFarmImage(imageData) {
    const db = await dbManager.getData();
    if (!db.images) db.images = [];
    db.images.push(imageData);
    await dbManager.saveData();
    return imageData;
  }
};

module.exports = appStore;
