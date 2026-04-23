/**
 * Programmatic seed generator for 200 realistic Indian farm records.
 *
 * Deterministic (seeded PRNG) — identical results on every restart.
 *
 * Geographic isolation:
 *   Regions 0-11:  HIGH-suspicion farms + low-damage clean farms only
 *   Regions 12-17: MEDIUM-suspicion farms + low-damage clean farms only
 *   Regions 18-24: Clean farms with moderate/high/severe damage (extra regions)
 *
 * This ensures max neighbor contrast for both tiers without cross-contamination.
 */

const { v4: uuidv4 } = require('uuid');

const FIRST_NAMES = [
  'Rajesh', 'Suresh', 'Mahesh', 'Ramesh', 'Dinesh',
  'Amit', 'Anil', 'Vijay', 'Sunil', 'Prakash',
  'Sanjay', 'Ravi', 'Mohan', 'Deepak', 'Ashok',
  'Ganesh', 'Harish', 'Kishore', 'Manoj', 'Naresh',
  'Baldev', 'Chandra', 'Devendra', 'Govind', 'Jagdish',
  'Lakshman', 'Narayan', 'Pawan', 'Rajendra', 'Shivam',
  'Arjun', 'Bharat', 'Dharmendra', 'Girish', 'Hemant',
  'Kailash', 'Manish', 'Omprakash', 'Pradeep', 'Satish',
  'Vikram', 'Yogesh', 'Ajay', 'Brijesh', 'Dilip',
  'Gaurav', 'Indrajit', 'Jitendra', 'Kapil', 'Lalit',
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Singh', 'Yadav',
  'Reddy', 'Nair', 'Joshi', 'Mishra', 'Gupta',
  'Kumar', 'Tiwari', 'Chauhan', 'Thakur', 'Rajput',
  'Deshmukh', 'Patil', 'Kulkarni', 'Iyer', 'Menon',
  'Malik', 'Saini', 'Meena', 'Bhat', 'Hegde',
  'Pandey', 'Dubey', 'Srivastava', 'Rawat', 'Bhatt',
];

const CROPS = [
  { name: 'Wheat',     season: 'Rabi',   avgInsured: 150000 },
  { name: 'Rice',      season: 'Kharif', avgInsured: 180000 },
  { name: 'Cotton',    season: 'Kharif', avgInsured: 220000 },
  { name: 'Sugarcane', season: 'Annual', avgInsured: 250000 },
  { name: 'Soybean',   season: 'Kharif', avgInsured: 130000 },
  { name: 'Maize',     season: 'Kharif', avgInsured: 120000 },
  { name: 'Groundnut', season: 'Kharif', avgInsured: 140000 },
  { name: 'Mustard',   season: 'Rabi',   avgInsured: 110000 },
  { name: 'Turmeric',  season: 'Kharif', avgInsured: 160000 },
  { name: 'Chickpea',  season: 'Rabi',   avgInsured: 100000 },
  { name: 'Bajra',     season: 'Kharif', avgInsured: 95000  },
  { name: 'Jowar',     season: 'Kharif', avgInsured: 90000  },
  { name: 'Sunflower', season: 'Rabi',   avgInsured: 125000 },
  { name: 'Onion',     season: 'Rabi',   avgInsured: 175000 },
  { name: 'Potato',    season: 'Rabi',   avgInsured: 165000 },
];

const RESILIENT_CROPS = [
  { name: 'Bajra',    season: 'Kharif', avgInsured: 95000  },
  { name: 'Jowar',    season: 'Kharif', avgInsured: 90000  },
  { name: 'Chickpea', season: 'Rabi',   avgInsured: 100000 },
  { name: 'Mustard',  season: 'Rabi',   avgInsured: 110000 },
];

const NON_RESILIENT_CROPS = CROPS.filter(
  c => !['Bajra', 'Jowar', 'Chickpea', 'Mustard'].includes(c.name),
);

// 25 regions total for geographic spread
const REGIONS = [
  // 0-11: HIGH territory
  { state: 'Punjab',         district: 'Ludhiana',    latMin: 30.80, latMax: 31.00, lngMin: 75.80, lngMax: 76.00 },
  { state: 'Punjab',         district: 'Amritsar',    latMin: 31.58, latMax: 31.68, lngMin: 74.83, lngMax: 74.93 },
  { state: 'Haryana',        district: 'Karnal',      latMin: 29.65, latMax: 29.75, lngMin: 76.95, lngMax: 77.05 },
  { state: 'Haryana',        district: 'Hisar',       latMin: 29.10, latMax: 29.20, lngMin: 75.70, lngMax: 75.80 },
  { state: 'Uttar Pradesh',  district: 'Lucknow',     latMin: 26.80, latMax: 26.92, lngMin: 80.90, lngMax: 81.05 },
  { state: 'Uttar Pradesh',  district: 'Varanasi',    latMin: 25.30, latMax: 25.38, lngMin: 82.98, lngMax: 83.05 },
  { state: 'Madhya Pradesh', district: 'Indore',      latMin: 22.68, latMax: 22.78, lngMin: 75.82, lngMax: 75.92 },
  { state: 'Madhya Pradesh', district: 'Bhopal',      latMin: 23.22, latMax: 23.32, lngMin: 77.38, lngMax: 77.48 },
  { state: 'Rajasthan',      district: 'Jaipur',      latMin: 26.85, latMax: 26.95, lngMin: 75.75, lngMax: 75.85 },
  { state: 'Rajasthan',      district: 'Jodhpur',     latMin: 26.25, latMax: 26.33, lngMin: 73.00, lngMax: 73.10 },
  { state: 'Maharashtra',    district: 'Nagpur',      latMin: 21.10, latMax: 21.20, lngMin: 79.05, lngMax: 79.15 },
  { state: 'Maharashtra',    district: 'Pune',        latMin: 18.50, latMax: 18.56, lngMin: 73.83, lngMax: 73.90 },
  // 12-17: MEDIUM territory
  { state: 'Gujarat',        district: 'Ahmedabad',   latMin: 23.00, latMax: 23.10, lngMin: 72.55, lngMax: 72.65 },
  { state: 'Gujarat',        district: 'Rajkot',      latMin: 22.28, latMax: 22.35, lngMin: 70.78, lngMax: 70.85 },
  { state: 'Karnataka',      district: 'Belgaum',     latMin: 15.83, latMax: 15.90, lngMin: 74.48, lngMax: 74.55 },
  { state: 'Karnataka',      district: 'Mysore',      latMin: 12.28, latMax: 12.35, lngMin: 76.62, lngMax: 76.68 },
  { state: 'Andhra Pradesh', district: 'Guntur',      latMin: 16.28, latMax: 16.35, lngMin: 80.42, lngMax: 80.50 },
  { state: 'Tamil Nadu',     district: 'Thanjavur',   latMin: 10.75, latMax: 10.82, lngMin: 79.12, lngMax: 79.18 },
  // 18-24: clean varied damage zones
  { state: 'Bihar',          district: 'Patna',       latMin: 25.58, latMax: 25.65, lngMin: 85.10, lngMax: 85.18 },
  { state: 'West Bengal',    district: 'Bardhaman',   latMin: 23.22, latMax: 23.28, lngMin: 87.82, lngMax: 87.90 },
  { state: 'Telangana',      district: 'Warangal',    latMin: 17.95, latMax: 18.02, lngMin: 79.55, lngMax: 79.62 },
  { state: 'Odisha',         district: 'Cuttack',     latMin: 20.45, latMax: 20.52, lngMin: 85.85, lngMax: 85.92 },
  { state: 'Chhattisgarh',   district: 'Raipur',      latMin: 21.23, latMax: 21.30, lngMin: 81.62, lngMax: 81.70 },
  { state: 'Jharkhand',      district: 'Ranchi',      latMin: 23.34, latMax: 23.40, lngMin: 85.30, lngMax: 85.37 },
  { state: 'Assam',          district: 'Guwahati',    latMin: 26.14, latMax: 26.20, lngMin: 91.70, lngMax: 91.78 },
];

// ── PRNG ──────────────────────────────────────────────────────

function createRng(seed) {
  let s = seed | 0;
  return function next() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randFloat(rng, min, max, dec = 4) {
  const v = min + rng() * (max - min);
  const f = 10 ** dec;
  return Math.round(v * f) / f;
}

function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

function ndviForDmg(rng, minD, maxD) {
  const dmg = minD + rng() * (maxD - minD);
  const before = randFloat(rng, 0.60, 0.85, 3);
  const after = Math.round(before * (1 - dmg / 100) * 1000) / 1000;
  return { ndviBefore: before, ndviAfter: Math.max(0.01, after) };
}

const BAND = {
  none: [0, 4], minimal: [6, 18], low: [22, 38],
  moderate: [42, 58], high: [62, 78], severe: [82, 96],
};

function shuffle(rng, arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function cleanFarm(rng, region, bandName) {
  const crop = pick(rng, CROPS);
  const [minD, maxD] = BAND[bandName];
  const ndvi = ndviForDmg(rng, minD, maxD);
  const v = crop.avgInsured * 0.25;
  return {
    farmerName: `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`,
    location: {
      latitude: randFloat(rng, region.latMin, region.latMax, 6),
      longitude: randFloat(rng, region.lngMin, region.lngMax, 6),
      state: region.state, district: region.district,
    },
    cropType: crop.name, season: crop.season,
    areaAcres: randFloat(rng, 5, 25, 1),
    insuredAmount: Math.round(randFloat(rng, crop.avgInsured - v, crop.avgInsured + v, 0)),
    ndviBefore: ndvi.ndviBefore, ndviAfter: ndvi.ndviAfter,
    policyId: `POL-${uuidv4().slice(0, 8).toUpperCase()}`,
    enrolledAt: new Date(2024, 6 + Math.floor(rng() * 12), 1 + Math.floor(rng() * 28)).toISOString(),
  };
}

// ── Generator ─────────────────────────────────────────────────

function generateFarms(count = 200, seed = 42) {
  const rng = createRng(seed);
  const farms = [];

  // ── A) 60 clean farms in regions 0-11 (LOW damage only) ────
  // ~5/region → HIGH farms have 5 low-damage neighbors + 1 other HIGH
  const bandsA = shuffle(rng, [
    ...Array(15).fill('none'),
    ...Array(25).fill('minimal'),
    ...Array(20).fill('low'),
  ]);
  for (let i = 0; i < 60; i++) {
    farms.push({ _s: i * 6, ...cleanFarm(rng, REGIONS[i % 12], bandsA[i]) });
  }

  // ── B) 60 clean farms in regions 12-17 (LOW damage only) ───
  // ~10/region → MEDIUM farms have 10 low-damage neighbors
  const bandsB = shuffle(rng, [
    ...Array(10).fill('none'),
    ...Array(20).fill('minimal'),
    ...Array(24).fill('low'),
    ...Array(6).fill('none'),
  ]);
  for (let i = 0; i < 60; i++) {
    farms.push({ _s: (60 + i) * 6, ...cleanFarm(rng, REGIONS[12 + (i % 6)], bandsB[i]) });
  }

  // ── C) 30 clean farms in regions 18-24 (varied damage) ─────
  const bandsC = shuffle(rng, [
    ...Array(20).fill('moderate'),
    ...Array(5).fill('high'),
    ...Array(5).fill('severe'),
  ]);
  for (let i = 0; i < 30; i++) {
    farms.push({ _s: (120 + i) * 6, ...cleanFarm(rng, REGIONS[18 + (i % 7)], bandsC[i]) });
  }

  // Total clean: 72 + 42 + 36 = 150 ✓

  // ── D) 25 MEDIUM farms in regions 12-17 ────────────────────
  // 62-78% damage, non-resilient crops, normal NDVI baseline
  // Over-insured + recent enrollment (< 30 days) + damage > 60%
  // → RECENT_ENROLLMENT_HIGH_DAMAGE + OVER_INSURED
  // → strong neighbor anomaly (surrounded by ~15% damage)
  // Expected: ~30-50 (MEDIUM)
  for (let s = 0; s < 25; s++) {
    const region = REGIONS[12 + (s % 6)];
    const crop = pick(rng, NON_RESILIENT_CROPS);
    const ndvi = ndviForDmg(rng, 62, 78);
    farms.push({
      _s: (s * 6) + 2,
      farmerName: `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`,
      location: {
        latitude: randFloat(rng, region.latMin, region.latMax, 6),
        longitude: randFloat(rng, region.lngMin, region.lngMax, 6),
        state: region.state, district: region.district,
      },
      cropType: crop.name, season: crop.season,
      areaAcres: randFloat(rng, 3.0, 5.0, 1),
      insuredAmount: Math.round(randFloat(rng, 200000, 280000, 0)),
      ndviBefore: ndvi.ndviBefore, ndviAfter: ndvi.ndviAfter,
      policyId: `POL-${uuidv4().slice(0, 8).toUpperCase()}`,
      enrolledAt: new Date(2026, 2, 22 + Math.floor(rng() * 18)).toISOString(),
    });
  }

  // ── E) 25 HIGH farms in regions 0-11 ───────────────────────
  // 93-97% damage, LOW baseline NDVI, resilient crops
  // All fraud triggers: LOW_BASELINE + RESILIENT_CROP + OVER_INSURED
  //   + RECENT_ENROLLMENT + massive neighbor anomaly
  // 2 per region (12 regions × 2 = 24, +1 in region 0)
  const highPlan = [];
  for (let r = 0; r < 12; r++) highPlan.push(r, r);
  highPlan.push(0); // 25th
  for (let s = 0; s < 25; s++) {
    const region = REGIONS[highPlan[s]];
    const crop = pick(rng, RESILIENT_CROPS);
    farms.push({
      _s: (s * 6) + 4,
      farmerName: `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`,
      location: {
        latitude: randFloat(rng, region.latMin, region.latMax, 6),
        longitude: randFloat(rng, region.lngMin, region.lngMax, 6),
        state: region.state, district: region.district,
      },
      cropType: crop.name, season: crop.season,
      areaAcres: randFloat(rng, 1.0, 2.0, 1),
      insuredAmount: Math.round(randFloat(rng, 260000, 380000, 0)),
      ndviBefore: randFloat(rng, 0.28, 0.34, 3),
      // We will recompute ndviAfter dynamically in the next pass to ensure 
      // a proper distribution of damage percentage and severities.
      ndviAfter: 0,
      policyId: `POL-${uuidv4().slice(0, 8).toUpperCase()}`,
      enrolledAt: new Date(2026, 3, 1 + Math.floor(rng() * 14)).toISOString(),
    });
  }

  // Sort interleaved, assign IDs, clean up
  farms.sort((a, b) => a._s - b._s);

  // Exact 25/25/25/25 distribution for 200 farms (50 each)
  const riskLevelsCount = count / 4;
  const riskAllocations = shuffle(rng, [
    ...Array(riskLevelsCount).fill('low'),
    ...Array(riskLevelsCount).fill('medium'),
    ...Array(riskLevelsCount).fill('high'),
    ...Array(riskLevelsCount).fill('critical')
  ]);

  const alertTypes = ['Pest Attack', 'Hailstorm', 'Drought Warning', 'Severe Rainfall'];

  // ── Target distribution: ~35% Rejected, ~35% Approved, ~30% Under Review ──
  // We achieve this by pre-assigning outcome categories and then generating
  // damage + fraudScore values that produce the desired decision from the engine.
  //
  // Decision engine rules:
  //   damage < 10             → Rejected
  //   damage >= 10 & fraud<50 → Approved
  //   fraud >= 50             → Under Review
  //
  const numRejected = Math.round(count * 0.35);   // 70
  const numApproved = Math.round(count * 0.35);   // 70
  const numReview   = count - numRejected - numApproved; // 60

  const outcomeSlots = shuffle(rng, [
    ...Array(numRejected).fill('rejected'),
    ...Array(numApproved).fill('approved'),
    ...Array(numReview).fill('review'),
  ]);

  const { evaluateDecision } = require('../utils/decisionEngine');

  farms.forEach((f, i) => {
    f.farmId = `KCF-${String(i + 1).padStart(4, '0')}`;
    delete f._s;

    // Apply exact balanced riskLevel (kept for visual risk classification)
    const rLevel = riskAllocations[i];
    f.riskLevel = rLevel;

    // riskScore stays tied to riskLevel for backward compat with UI risk badges
    if (rLevel === 'low') {
       f.riskScore = Math.floor(randFloat(rng, 5, 25));
    } else if (rLevel === 'medium') {
       f.riskScore = Math.floor(randFloat(rng, 26, 50));
    } else if (rLevel === 'high') {
       f.riskScore = Math.floor(randFloat(rng, 51, 75));
    } else {
       f.riskScore = Math.floor(randFloat(rng, 76, 99));
    }

    // Dynamic alerts
    const numAlerts = rLevel === 'critical' ? 3 : rLevel === 'high' ? 2 : rLevel === 'medium' ? 1 : 0;
    f.alerts = shuffle(rng, [...alertTypes]).slice(0, numAlerts);

    // Mock logs
    f.activityLogs = [
      { id: uuidv4(), action: 'System Audit', timestamp: new Date(Date.now() - randFloat(rng, 10000, 500000)).toISOString() },
      { id: uuidv4(), action: 'Data Synced', timestamp: new Date(Date.now() - randFloat(rng, 600000, 9000000)).toISOString() }
    ];

    // Mock weather
    f.weather = {
      temperature: Math.floor(randFloat(rng, 25, 42)),
      humidity: Math.floor(randFloat(rng, 30, 90)),
      condition: rLevel === 'critical' || rLevel === 'high' ? pick(rng, ['Heavy Rain', 'Drought']) : pick(rng, ['Clear', 'Partly Cloudy', 'Light Rain'])
    };

    // ══════════════════════════════════════════════════════════════
    //  CONTROLLED DAMAGE + FRAUD SCORE GENERATION
    //  Generate values that produce the target outcome from the engine
    // ══════════════════════════════════════════════════════════════

    const outcome = outcomeSlots[i];
    let dropPercentTarget;
    let fraudScore;

    if (outcome === 'rejected') {
      // damage < 10 → Rejected (fraud doesn't matter, keep it low-to-medium)
      dropPercentTarget = randFloat(rng, 1, 9.5, 1);
      fraudScore = Math.floor(randFloat(rng, 5, 45));
    } else if (outcome === 'approved') {
      // damage >= 10 AND fraudScore < 50 → Approved
      dropPercentTarget = randFloat(rng, 10, 85, 1);
      fraudScore = Math.floor(randFloat(rng, 5, 48));
    } else {
      // fraudScore >= 50 → Under Review (damage can be anything >= 10)
      dropPercentTarget = randFloat(rng, 10, 90, 1);
      fraudScore = Math.floor(randFloat(rng, 50, 92));
    }

    f.ndviAfter = parseFloat((f.ndviBefore * (1 - (dropPercentTarget / 100))).toFixed(3));
    f.ndviDrop = parseFloat(dropPercentTarget.toFixed(1));

    // ── Severity classification ──
    if (f.ndviDrop < 10) f.severity = "minimal";
    else if (f.ndviDrop >= 10 && f.ndviDrop < 30) f.severity = "low";
    else if (f.ndviDrop >= 30 && f.ndviDrop < 50) f.severity = "moderate";
    else if (f.ndviDrop >= 50 && f.ndviDrop < 70) f.severity = "high";
    else f.severity = "severe";

    // ══════════════════════════════════════════════════════════════
    //  FRAUD SCORE — stored as single source of truth
    // ══════════════════════════════════════════════════════════════
    f.fraudScore = fraudScore;

    // Strictly Predefined Valid Image Sets (Agriculture Only & No AI)
    const healthyImages = [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
    ];
    const moderateDamageImages = [
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9",
    ];
    const severeDamageImages = [
      "https://images.unsplash.com/photo-1583245553131-0e7d36409271",
    ];

    f.beforeImage = healthyImages[1]; 
    if (f.ndviDrop < 10) {
      f.afterImage = healthyImages[0];
    } else if (f.ndviDrop >= 10 && f.ndviDrop <= 30) {
      f.afterImage = moderateDamageImages[0];
    } else {
      f.afterImage = severeDamageImages[0];
    }

    // 🧩 1. EXTEND FARM DATA (Analytics)
    f.analytics = {
      ndviHistory: [
        parseFloat((f.ndviBefore + 0.05).toFixed(2)),
        parseFloat((f.ndviBefore + 0.02).toFixed(2)),
        parseFloat((Math.max(0.01, f.ndviBefore - 0.01)).toFixed(2)),
        parseFloat((Math.max(0.01, f.ndviAfter + 0.04)).toFixed(2)),
        parseFloat(f.ndviAfter.toFixed(2))
      ],
      damageTrend: [
        Math.max(0, Math.floor(f.ndviDrop - 40)),
        Math.max(0, Math.floor(f.ndviDrop - 20)),
        Math.max(0, Math.floor(f.ndviDrop - 10)),
        Math.floor(f.ndviDrop),
        Math.floor(f.ndviDrop + randFloat(rng, 0, 5, 1))
      ],
      riskScore: f.riskScore,
      fraudScore: f.fraudScore,
      region: `${f.location.state}/${f.location.district}`
    };

    // ══════════════════════════════════════════════════════════════
    //  🧩 2. SINGLE SOURCE OF TRUTH — Decision + Explanation
    //  evaluateDecision runs ONCE here. Result is stored permanently.
    // ══════════════════════════════════════════════════════════════
    const { status, reason } = evaluateDecision(f.ndviDrop, f.fraudScore);

    let fraudRisk = 'low';
    if (f.fraudScore >= 60) fraudRisk = 'high';
    else if (f.fraudScore >= 25) fraudRisk = 'medium';

    f.explanation = {
      ndviDrop: f.ndviDrop,
      damageLevel: f.severity,
      fraudScore: f.fraudScore,
      fraudRisk: fraudRisk,
      reason: reason,
      decision: status
    };
  });

  return farms;
}

module.exports = { generateFarms };
