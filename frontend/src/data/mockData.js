export const mockFarms = [
  {
    farmId: '#KC-99201-B',
    shortId: '#FK-9201',
    farmerName: 'Rajesh Kumar',
    cropType: 'Organic Wheat',
    cropCulture: 'Cotton (Bt)',
    location: {
      region: 'Vidarbha Region, Maharashtra',
      district: 'Vidarbha Region',
      state: 'Maharashtra',
      coordinates: '19.7506° N, 75.7139° E'
    },
    damagePercentage: 68.4,
    claimAmount: 578000,
    insuredAmount: 845000,
    fraudScore: 94,
    fraudStatus: 'CRITICAL',
    status: 'High Risk',
    landAreaAcres: 12.4,
    preHealth: 92,
    reportedYield: 0.4,
    satelliteYield: 2.8,
    lastUpdate: '2 minutes ago'
  },
  {
    farmId: '#KC-29401',
    shortId: '#FK-2940',
    farmerName: 'Amrita Patel',
    cropType: 'Basmati Rice',
    location: { region: 'Gujarat, Central' },
    damagePercentage: 64,
    claimAmount: 412000,
    insuredAmount: 600000,
    fraudScore: 12,
    fraudStatus: 'LOW',
    status: 'High Risk',
    landAreaAcres: 5.2,
    lastUpdate: '14 minutes ago'
  },
  {
    farmId: '#KC-28112',
    shortId: '#FK-2811',
    farmerName: 'Lalit Singh',
    cropType: 'Sugarcane',
    location: { region: 'Uttar Pradesh, East' },
    damagePercentage: 4,
    claimAmount: 0,
    insuredAmount: 950000,
    fraudScore: 5,
    fraudStatus: 'LOW',
    status: 'Optimal',
    landAreaAcres: 18.5
  },
  {
    farmId: '#KC-27550',
    shortId: '#FK-8842',
    farmerName: 'Sunita Deshmukh',
    cropType: 'Soybeans',
    location: { region: 'Madhya Pradesh' },
    damagePercentage: 28,
    claimAmount: 112000,
    insuredAmount: 400000,
    fraudScore: 52,
    fraudStatus: 'MEDIUM',
    status: 'In Review',
    landAreaAcres: 8.0
  }
];

export const dashboardStats = {
  totalFarms: 100,
  totalClaims: 45,
  approved: 32,
  flagged: 8,
  totalPayout: '1.2M',
  avgDamage: 28
};
