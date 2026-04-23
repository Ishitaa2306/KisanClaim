/**
 * JSON Database Manager
 *
 * Persists data to a local `src/data/database.json` file.
 * Automatically saves on every modification.
 */

const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.json');

const defaultData = {
  farms: [],
  farmers: [],
  claims: [],
  notifications: [],
  activities: [],
  weather: [],
  counters: { claim: 0 },
};

let memDb = null;

async function _load() {
  if (memDb) return memDb;
  try {
    const raw = await fs.readFile(DB_PATH, 'utf-8');
    memDb = JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      memDb = { ...defaultData };
      await _save();
    } else {
      console.error('[DB] Failed to read database.json:', err);
      memDb = { ...defaultData }; // fallback
    }
  }
  return memDb;
}

async function _save() {
  if (!memDb) return;
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(memDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to save to database.json:', err);
  }
}

/**
 * Get the current database state.
 */
async function getData() {
  return await _load();
}

/**
 * Save the database state to disk.
 */
async function saveData() {
  await _save();
}

/**
 * Atomic increment for generating sequential IDs.
 */
async function getNextSequence(counterName) {
  const db = await _load();
  if (!db.counters) db.counters = {};
  if (typeof db.counters[counterName] !== 'number') db.counters[counterName] = 0;
  
  db.counters[counterName] += 1;
  await _save();
  return db.counters[counterName];
}

module.exports = {
  getData,
  saveData,
  getNextSequence,
};
