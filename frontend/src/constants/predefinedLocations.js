/**
 * Predefined demo locations in the North-Eastern Region (NER) of India.
 * Note: Risk profiles and environmental values are demo/sample representations.
 */
export const PREDEFINED_LOCATIONS = [
  {
    id: 'mawsynram',
    name: 'Mawsynram',
    state: 'Meghalaya',
    coordinates: [25.2975, 91.5826],
    demoProfile: {
      risk: 'Critical',
      probability: 0.92,
      rainfall24h: '340 mm',
      slope: '48°',
      rainfall3Day: '790 mm',
      distanceToWater: '30 m',
      rainfall7Day: '1420 mm',
    },
  },
  {
    id: 'sohra',
    name: 'Sohra (Cherrapunji)',
    state: 'Meghalaya',
    coordinates: [25.2702, 91.7323],
    demoProfile: {
      risk: 'Critical',
      probability: 0.89,
      rainfall24h: '310 mm',
      slope: '45°',
      rainfall3Day: '710 mm',
      distanceToWater: '45 m',
      rainfall7Day: '1280 mm',
    },
  },
  {
    id: 'shillong',
    name: 'Shillong',
    state: 'Meghalaya',
    coordinates: [25.5788, 91.8933],
    demoProfile: {
      risk: 'Moderate',
      probability: 0.46,
      rainfall24h: '95 mm',
      slope: '28°',
      rainfall3Day: '180 mm',
      distanceToWater: '120 m',
      rainfall7Day: '310 mm',
    },
  },
  {
    id: 'aizawl',
    name: 'Aizawl',
    state: 'Mizoram',
    coordinates: [23.7271, 92.7176],
    demoProfile: {
      risk: 'High',
      probability: 0.78,
      rainfall24h: '210 mm',
      slope: '42°',
      rainfall3Day: '430 mm',
      distanceToWater: '65 m',
      rainfall7Day: '740 mm',
    },
  },
  {
    id: 'kohima',
    name: 'Kohima',
    state: 'Nagaland',
    coordinates: [25.6751, 94.1086],
    demoProfile: {
      risk: 'High',
      probability: 0.73,
      rainfall24h: '185 mm',
      slope: '39°',
      rainfall3Day: '390 mm',
      distanceToWater: '80 m',
      rainfall7Day: '680 mm',
    },
  },
];
