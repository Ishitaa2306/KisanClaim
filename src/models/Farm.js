/**
 * Farm model / in-memory data store.
 *
 * Currently backed by a Map for O(1) ID lookups. When a database is
 * introduced, this module will be replaced by an ORM model — but the
 * interface (find, findById, etc.) should stay identical so callers
 * don't break.
 */

const { generateFarms } = require('../data/seedFarms');

class FarmStore {
  constructor() {
    /** @type {Map<string, object>} */
    this._store = new Map();
    this._initialise();
  }

  /** Seed the store on startup. */
  _initialise() {
    const farms = generateFarms(200);
    for (const farm of farms) {
      this._store.set(farm.farmId, farm);
    }
    console.log(`  ✔  FarmStore initialised with ${this._store.size} records`);
  }

  // ── Query interface ───────────────────────────────────────

  /** Return all farms as an array. */
  findAll() {
    return Array.from(this._store.values());
  }

  /** Find a single farm by its ID. Returns `undefined` if not found. */
  findById(farmId) {
    return this._store.get(farmId);
  }

  /**
   * Filter farms by a predicate function.
   * @param {(farm: object) => boolean} predicate
   * @returns {object[]}
   */
  filter(predicate) {
    return this.findAll().filter(predicate);
  }

  /** Total number of records. */
  get count() {
    return this._store.size;
  }

  // ── Aggregate helpers (useful for dashboard endpoints) ────

  /**
   * Group farms by a given key (e.g. 'cropType', 'location.state').
   * @param {string} key  Dot-notation path
   * @returns {Record<string, object[]>}
   */
  groupBy(key) {
    const groups = {};
    for (const farm of this._store.values()) {
      const val = key.split('.').reduce((obj, k) => obj?.[k], farm);
      if (!groups[val]) groups[val] = [];
      groups[val].push(farm);
    }
    return groups;
  }

  /**
   * Create and save a new farm record.
   * @param {object} farmData 
   */
  create(farmData) {
    const id = farmData.farmId || `FARM-${String(this._store.size + 1).padStart(3, '0')}`;
    const newFarm = {
      ...farmData,
      farmId: id,
    };
    this._store.set(id, newFarm);
    return newFarm;
  }
}

// Singleton — shared across the application
module.exports = new FarmStore();
