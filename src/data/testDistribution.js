/**
 * Quick validation of the new distribution.
 */
delete require.cache[require.resolve('../models/Farm')];
delete require.cache[require.resolve('./seedFarms')];

const farmStore = require('../models/Farm');
const { calculateDamage } = require('../utils/ndviAnalyzer');
const { calculateClaim } = require('../services/claimService');
const { analyzeFraud } = require('../services/fraudService');

const farms = farmStore.findAll();
console.log(`Total farms: ${farms.length}`);

const results = farms.map(farm => {
  const damage = calculateDamage(farm.ndviBefore, farm.ndviAfter);
  const claim = calculateClaim({
    damagePercentage: damage.damagePercentage,
    insuredAmount: farm.insuredAmount,
    cropType: farm.cropType,
    areaAcres: farm.areaAcres,
  });
  const fraud = analyzeFraud(farm, damage.damagePercentage, claim.claimAmount);
  return { farm, damage, fraud };
});

// Severity distribution
const sevCounts = {};
results.forEach(r => {
  const s = r.damage.severity;
  sevCounts[s] = (sevCounts[s] || 0) + 1;
});
console.log('\n=== Damage Severity Distribution ===');
['none', 'minimal', 'low', 'moderate', 'high', 'severe'].forEach(s => {
  const count = sevCounts[s] || 0;
  const pct = ((count / 200) * 100).toFixed(1);
  console.log(`  ${s.padEnd(10)} ${String(count).padStart(3)} farms (${pct}%)`);
});

// Fraud status distribution
const fraudCounts = {};
results.forEach(r => {
  fraudCounts[r.fraud.fraudStatus] = (fraudCounts[r.fraud.fraudStatus] || 0) + 1;
});
console.log('\n=== Fraud Status Distribution ===');
['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].forEach(s => {
  if (fraudCounts[s]) console.log(`  ${s.padEnd(10)} ${fraudCounts[s]} farms`);
});

// Fraud score variation
const scores = results.map(r => r.fraud.fraudScore).sort((a,b) => a-b);
const uniqueScores = new Set(scores);
console.log(`\n=== Fraud Score Variation ===`);
console.log(`  Unique scores: ${uniqueScores.size} (out of 200)`);
console.log(`  Range: ${scores[0]} to ${scores[scores.length-1]}`);
console.log(`  Mean: ${(scores.reduce((a,b)=>a+b)/scores.length).toFixed(1)}`);

// Flag counts
const flagged = results.filter(r => r.fraud.flag).length;
console.log(`\n  Flagged (flag=true): ${flagged}`);
console.log(`  Clean (flag=false): ${200 - flagged}`);

// Sample variety in scores
console.log('\n=== Sample Fraud Scores (first 20) ===');
results.slice(0, 20).forEach(r => {
  console.log(`  ${r.farm.farmId}: score=${r.fraud.fraudScore.toFixed(1)} status=${r.fraud.fraudStatus} dmg=${r.damage.damagePercentage.toFixed(1)}% sev=${r.damage.severity}`);
});

console.log('\n' + '='.repeat(50));
const sevOk = ['none','minimal','low','moderate','high','severe'].every(s => (sevCounts[s]||0) > 0);
const fraudOk = (fraudCounts.LOW || 0) >= 130 && (fraudCounts.HIGH || 0) >= 10;
console.log(sevOk && fraudOk ? '✅ Distribution looks realistic!' : '⚠ Needs tuning');
console.log('='.repeat(50));
