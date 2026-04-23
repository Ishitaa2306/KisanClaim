/**
 * Farm data access layer — JSON File backed.
 *
 * Provides the same async interface but reads/writes to `database.json`.
 */

const { generateFarms } = require('../data/seedFarms');
const dbManager = require('../data/dbManager');

const farmStore = {

  /**
   * Seed the database with 200 farms if the collection is empty.
   */
  async initialize() {
    const db = await dbManager.getData();
    
    if (!db.farms) db.farms = [];

    const count = db.farms.length;
    if (count >= 200) {
      console.log(`  ✔  FarmStore: ${count} farms already in JSON DB`);
      return;
    }

    if (count > 0 && count < 200) {
      console.log(`  ⚠  FarmStore: Found ${count} farms (incomplete). Re-seeding...`);
      db.farms = [];
    }

    console.log('  ⏳ FarmStore: Seeding 200 farms into JSON DB...');
    const generatedFarms = generateFarms(200);
    db.farms = [...generatedFarms];
    
    await dbManager.saveData();
    console.log(`  ✔  FarmStore: Seeded ${generatedFarms.length} farms`);
  },

  // ── Query interface ───────────────────────────────────────

  /** Return all farms. */
  async findAll() {
    const db = await dbManager.getData();
    return [...(db.farms || [])];
  },

  /** Find a single farm by its ID. Returns null if not found. */
  async findById(farmId) {
    const db = await dbManager.getData();
    const farms = db.farms || [];
    return farms.find(f => f.farmId === farmId) || null;
  },

  /**
   * Filter farms by a predicate function.
   * @param {(farm: object) => boolean} predicate
   * @returns {Promise<object[]>}
   */
  async filter(predicate) {
    const all = await this.findAll();
    return all.filter(predicate);
  },

  /** Total number of records. */
  async getCount() {
    const db = await dbManager.getData();
    return (db.farms || []).length;
  },

  /**
   * Group farms by a given key.
   */
  async groupBy(key) {
    const all = await this.findAll();
    const groups = {};
    for (const farm of all) {
      const val = key.split('.').reduce((obj, k) => obj?.[k], farm);
      if (!groups[val]) groups[val] = [];
      groups[val].push(farm);
    }
    return groups;
  },

  /**
   * Create and save a new farm record.
   * @param {object} farmData
   * @returns {Promise<object>}
   */
  async create(farmData) {
    const db = await dbManager.getData();
    if (!db.farms) db.farms = [];
    
    const count = db.farms.length;
    const id = farmData.farmId || `FARM-${String(count + 1).padStart(3, '0')}`;
    const newFarm = { ...farmData, farmId: id };
    
    db.farms.push(newFarm);
    await dbManager.saveData();
    
    return newFarm;
  },

  /**
   * Update a farm document by farmId.
   */
  async updateById(farmId, update) {
    const db = await dbManager.getData();
    if (!db.farms) return null;
    
    const idx = db.farms.findIndex(f => f.farmId === farmId);
    if (idx === -1) return null;

    // Handle MongoDB style updates (like $addToSet) if we encounter them
    const existing = db.farms[idx];
    
    if (update.$addToSet) {
      for (const [k, v] of Object.entries(update.$addToSet)) {
        if (!existing[k]) existing[k] = [];
        if (!existing[k].includes(v)) {
          existing[k].push(v);
        }
      }
    } else {
      db.farms[idx] = { ...existing, ...update };
    }
    
    await dbManager.saveData();
    return db.farms[idx];
  },
};

module.exports = farmStore;
