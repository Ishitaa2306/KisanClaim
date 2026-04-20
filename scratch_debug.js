const farmStore = require('./src/models/Farm');
const fraudService = require('./src/services/fraudService');
const { calculateDamage } = require('./src/utils/ndviAnalyzer');

const farms = require('./src/data/seedFarms').generateFarms(200);
const f = farms.find(farm => farm.farmId === 'KCF-0015');

const dmg = calculateDamage(f.ndviBefore, f.ndviAfter);

// Setup the stats cache before analyzing using testDistribution trick
require('./src/data/testDistribution'); // running this runs the whole test and populates cache
console.log(JSON.stringify(fraudService.analyzeFraud(f, dmg, f.insuredAmount), null, 2));
