/**
 * Predefined demo risk zones within and around Sohra (Cherrapunji), Meghalaya.
 * Each zone represents an approximate 1 km² area demonstrating varied terrain contexts
 * (ridge, river valley, plateau, steep slope, and south valley basin).
 *
 * Note: Risk profiles and environmental values are demo/profile representations.
 */
export const PREDEFINED_LOCATIONS = [
  {
    id: 'sohra-ridge-zone',
    name: 'Sohra Ridge Zone',
    state: 'Sohra, Meghalaya',
    coordinates: [25.2785, 91.7180],
    demoProfile: {
      risk: 'High',
      probability: 0.74,
      rainfall24h: '280 mm',
      slope: '38°',
      rainfall3Day: '620 mm',
      distanceToWater: '95 m',
      rainfall7Day: '1150 mm',
    },
  },
  {
    id: 'sohra-river-valley-zone',
    name: 'Sohra River Valley Zone',
    state: 'Sohra, Meghalaya',
    coordinates: [25.2890, 91.7420],
    demoProfile: {
      risk: 'Critical',
      probability: 0.91,
      rainfall24h: '350 mm',
      slope: '46°',
      rainfall3Day: '780 mm',
      distanceToWater: '25 m',
      rainfall7Day: '1410 mm',
    },
  },
  {
    id: 'sohra-plateau-zone',
    name: 'Sohra Plateau Zone',
    state: 'Sohra, Meghalaya',
    coordinates: [25.2690, 91.7310],
    demoProfile: {
      risk: 'Low',
      probability: 0.22,
      rainfall24h: '110 mm',
      slope: '14°',
      rainfall3Day: '240 mm',
      distanceToWater: '210 m',
      rainfall7Day: '480 mm',
    },
  },
  {
    id: 'sohra-east-slope-zone',
    name: 'Sohra East Slope Zone',
    state: 'Sohra, Meghalaya',
    coordinates: [25.2610, 91.7510],
    demoProfile: {
      risk: 'Critical',
      probability: 0.88,
      rainfall24h: '315 mm',
      slope: '49°',
      rainfall3Day: '705 mm',
      distanceToWater: '40 m',
      rainfall7Day: '1290 mm',
    },
  },
  {
    id: 'sohra-south-valley-zone',
    name: 'Sohra South Valley Zone',
    state: 'Sohra, Meghalaya',
    coordinates: [25.2490, 91.7240],
    demoProfile: {
      risk: 'Moderate',
      probability: 0.49,
      rainfall24h: '165 mm',
      slope: '27°',
      rainfall3Day: '340 mm',
      distanceToWater: '110 m',
      rainfall7Day: '670 mm',
    },
  },
];
