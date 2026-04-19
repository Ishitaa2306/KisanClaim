/**
 * Programmatic seed generator for 200 realistic Indian farm records.
 *
 * The data is deterministic (seeded PRNG) so results are reproducible
 * across restarts while still looking organic. When a real database
 * is wired up, this module can serve as the migration seed.
 *
 * Of the 200 farms, exactly 42 are crafted with data patterns that
 * the fraud detection engine will organically flag (fraudScore >= 55).
 * The remaining 158 produce clean/low fraud scores through the
 * existing pipeline. No fraud fields are hardcoded — the fraud
 * engine computes everything dynamically at analysis time.
 */

const { v4: uuidv4 } = require('uuid');

// ── Reference data pools ──────────────────────────────────────

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
  { name: 'Wheat',       season: 'Rabi',    avgInsured: 150000 },
  { name: 'Rice',        season: 'Kharif',  avgInsured: 180000 },
  { name: 'Cotton',      season: 'Kharif',  avgInsured: 220000 },
  { name: 'Sugarcane',   season: 'Annual',  avgInsured: 250000 },
  { name: 'Soybean',     season: 'Kharif',  avgInsured: 130000 },
  { name: 'Maize',       season: 'Kharif',  avgInsured: 120000 },
  { name: 'Groundnut',   season: 'Kharif',  avgInsured: 140000 },
  { name: 'Mustard',     season: 'Rabi',    avgInsured: 110000 },
  { name: 'Turmeric',    season: 'Kharif',  avgInsured: 160000 },
  { name: 'Chickpea',    season: 'Rabi',    avgInsured: 100000 },
  { name: 'Bajra',       season: 'Kharif',  avgInsured: 95000  },
  { name: 'Jowar',       season: 'Kharif',  avgInsured: 90000  },
  { name: 'Sunflower',   season: 'Rabi',    avgInsured: 125000 },
  { name: 'Onion',       season: 'Rabi',    avgInsured: 175000 },
  { name: 'Potato',      season: 'Rabi',    avgInsured: 165000 },
];

/**
 * Resilient crops — used for suspicious farms to trigger
 * EXTREME_DAMAGE_RESILIENT_CROP in logicalConsistency check.
 */
const RESILIENT_CROPS = [
  { name: 'Bajra',     season: 'Kharif',  avgInsured: 95000  },
  { name: 'Jowar',     season: 'Kharif',  avgInsured: 90000  },
  { name: 'Chickpea',  season: 'Rabi',    avgInsured: 100000 },
  { name: 'Mustard',   season: 'Rabi',    avgInsured: 110000 },
];

/**
 * Realistic Indian agricultural regions with lat/lng bounding boxes.
 */
const REGIONS = [
  { state: 'Punjab',            district: 'Ludhiana',    latMin: 30.80, latMax: 31.00, lngMin: 75.80, lngMax: 76.00 },
  { state: 'Punjab',            district: 'Amritsar',    latMin: 31.58, latMax: 31.68, lngMin: 74.83, lngMax: 74.93 },
  { state: 'Haryana',           district: 'Karnal',      latMin: 29.65, latMax: 29.75, lngMin: 76.95, lngMax: 77.05 },
  { state: 'Haryana',           district: 'Hisar',       latMin: 29.10, latMax: 29.20, lngMin: 75.70, lngMax: 75.80 },
  { state: 'Uttar Pradesh',     district: 'Lucknow',     latMin: 26.80, latMax: 26.92, lngMin: 80.90, lngMax: 81.05 },
  { state: 'Uttar Pradesh',     district: 'Varanasi',    latMin: 25.30, latMax: 25.38, lngMin: 82.98, lngMax: 83.05 },
  { state: 'Madhya Pradesh',    district: 'Indore',      latMin: 22.68, latMax: 22.78, lngMin: 75.82, lngMax: 75.92 },
  { state: 'Madhya Pradesh',    district: 'Bhopal',      latMin: 23.22, latMax: 23.32, lngMin: 77.38, lngMax: 77.48 },
  { state: 'Rajasthan',         district: 'Jaipur',      latMin: 26.85, latMax: 26.95, lngMin: 75.75, lngMax: 75.85 },
  { state: 'Rajasthan',         district: 'Jodhpur',     latMin: 26.25, latMax: 26.33, lngMin: 73.00, lngMax: 73.10 },
  { state: 'Maharashtra',       district: 'Nagpur',      latMin: 21.10, latMax: 21.20, lngMin: 79.05, lngMax: 79.15 },
  { state: 'Maharashtra',       district: 'Pune',        latMin: 18.50, latMax: 18.56, lngMin: 73.83, lngMax: 73.90 },
  { state: 'Gujarat',           district: 'Ahmedabad',   latMin: 23.00, latMax: 23.10, lngMin: 72.55, lngMax: 72.65 },
  { state: 'Gujarat',           district: 'Rajkot',      latMin: 22.28, latMax: 22.35, lngMin: 70.78, lngMax: 70.85 },
  { state: 'Karnataka',         district: 'Belgaum',     latMin: 15.83, latMax: 15.90, lngMin: 74.48, lngMax: 74.55 },
  { state: 'Karnataka',         district: 'Mysore',      latMin: 12.28, latMax: 12.35, lngMin: 76.62, lngMax: 76.68 },
  { state: 'Andhra Pradesh',    district: 'Guntur',      latMin: 16.28, latMax: 16.35, lngMin: 80.42, lngMax: 80.50 },
  { state: 'Tamil Nadu',        district: 'Thanjavur',   latMin: 10.75, latMax: 10.82, lngMin: 79.12, lngMax: 79.18 },
  { state: 'Bihar',             district: 'Patna',       latMin: 25.58, latMax: 25.65, lngMin: 85.10, lngMax: 85.18 },
  { state: 'West Bengal',       district: 'Bardhaman',   latMin: 23.22, latMax: 23.28, lngMin: 87.82, lngMax: 87.90 },
  { state: 'Telangana',         district: 'Warangal',    latMin: 17.95, latMax: 18.02, lngMin: 79.55, lngMax: 79.62 },
];

// ── Deterministic pseudo-random number generator (mulberry32) ─

function createRng(seed) {
  let s = seed | 0;
  return function next() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Helper: random float in [min, max], rounded to `decimals`.
 */
function randFloat(rng, min, max, decimals = 4) {
  const val = min + rng() * (max - min);
  const factor = 10 ** decimals;
  return Math.round(val * factor) / factor;
}

/**
 * Helper: pick a random element from an array.
 */
function pick(rng, array) {
  return array[Math.floor(rng() * array.length)];
}

// ── Generator ─────────────────────────────────────────────────

/**
 * Region assignment for suspicious farms.
 * 42 farms across 20 regions → 2 per region + 2 overflow.
 * The 2 overflow go to region indices 4 and 5 (Lucknow & Varanasi)
 * which are large agricultural hubs with the most normal farms nearby
 * in the UP belt.
 */
const SUSPICIOUS_REGION_PLAN = [];
// 42 farms / 21 regions = exactly 2 per region, no overflow.
for (let r = 0; r < 21; r++) {
  SUSPICIOUS_REGION_PLAN.push(r, r);
}

/**
 * Generate `count` realistic farm records.
 *
 * @param {number} [count=200]
 * @param {number} [seed=42]
 * @returns {object[]}
 */
function generateFarms(count = 200, seed = 42) {
  const rng = createRng(seed);
  const farms = [];

  // ── Pass 1: Generate 158 normal farms ──────────────────────
  // Distribute across all 20 regions (~8 per region).
  for (let i = 0; i < 158; i++) {
    // Normal farms rotate across all 21 regions. With 158/21 ≈ 7.5 per
    // region, each suspicious farm has ≥6 low-damage neighbors.
    const region = REGIONS[i % REGIONS.length];
    const crop = pick(rng, CROPS);

    let ndviBefore = randFloat(rng, 0.76, 0.85, 3);
    let ndviAfter  = randFloat(rng, 0.72, 0.84, 3);
    // Ensure ndviAfter < ndviBefore with minimal drop (damage ~0–8%)
    if (ndviAfter >= ndviBefore) {
      ndviAfter = randFloat(rng, ndviBefore * 0.92, ndviBefore * 0.98, 3);
    }

    const variance = crop.avgInsured * 0.25;
    const insuredAmount = Math.round(
      randFloat(rng, crop.avgInsured - variance, crop.avgInsured + variance, 0),
    );

    farms.push({
      _sortOrder: i * 5,
      farmerName: `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`,
      location: {
        latitude: randFloat(rng, region.latMin, region.latMax, 6),
        longitude: randFloat(rng, region.lngMin, region.lngMax, 6),
        state: region.state,
        district: region.district,
      },
      cropType: crop.name,
      season: crop.season,
      areaAcres: randFloat(rng, 6, 25, 1),
      insuredAmount,
      ndviBefore,
      ndviAfter,
      policyId: `POL-${uuidv4().slice(0, 8).toUpperCase()}`,
      enrolledAt: new Date(
        2025,
        Math.floor(rng() * 6),
        1 + Math.floor(rng() * 28),
      ).toISOString(),
    });
  }

  // ── Pass 2: Generate 42 suspicious farms ───────────────────
  // Each assigned to a region via the pre-computed plan (max 3 per
  // region, with 18 regions having exactly 2 and 2 dense regions
  // having 3). This keeps suspicious-neighbor dilution minimal.
  for (let s = 0; s < 42; s++) {
    const regionIdx = SUSPICIOUS_REGION_PLAN[s];
    const region = REGIONS[regionIdx];
    const crop = pick(rng, RESILIENT_CROPS);

    farms.push({
      _sortOrder: (s * 4) + 3,
      farmerName: `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`,
      location: {
        latitude: randFloat(rng, region.latMin, region.latMax, 6),
        longitude: randFloat(rng, region.lngMin, region.lngMax, 6),
        state: region.state,
        district: region.district,
      },
      cropType: crop.name,
      season: crop.season,
      areaAcres: randFloat(rng, 1.0, 1.8, 1),
      insuredAmount: Math.round(randFloat(rng, 260000, 360000, 0)),
      ndviBefore: randFloat(rng, 0.28, 0.34, 3),
      ndviAfter: randFloat(rng, 0.01, 0.02, 3),
      policyId: `POL-${uuidv4().slice(0, 8).toUpperCase()}`,
      // March 25 – April 8, 2026 → ~11–25 days before April 19
      enrolledAt: new Date(
        2026,
        2,
        25 + Math.floor(rng() * 14),
      ).toISOString(),
    });
  }

  // ── Sort and assign sequential farm IDs ────────────────────
  farms.sort((a, b) => a._sortOrder - b._sortOrder);
  farms.forEach((farm, idx) => {
    farm.farmId = `KCF-${String(idx + 1).padStart(4, '0')}`;
    delete farm._sortOrder;
  });

  return farms;
}

module.exports = { generateFarms };
