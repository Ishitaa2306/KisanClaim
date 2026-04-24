const fs = require('fs');
const newKeysEn = {
  'instant_decision': 'Instant Decision (Offline Estimate)'
};

const newKeysHi = {
  'instant_decision': 'त्वरित निर्णय (ऑफ़लाइन अनुमान)'
};

const newKeysKn = {
  'instant_decision': 'ತ್ವರಿತ ನಿರ್ಧಾರ (ಆಫ್‌ಲೈನ್ ಅಂದಾಜು)'
};

const updateJson = (file, newKeys) => {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  Object.assign(data, newKeys);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};
updateJson('frontend/src/locales/en.json', newKeysEn);
updateJson('frontend/src/locales/hi.json', newKeysHi);
updateJson('frontend/src/locales/kn.json', newKeysKn);
