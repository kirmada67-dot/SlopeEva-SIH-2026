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
  // ── 5 additional zones for 10-zone public coverage ──────────────────────────
  // Spatial gradient rule: no two adjacent zones differ by more than one risk
  // level. These fill the geographic gaps in the Sohra demo area.
  {
    id: 'sohra-north-plateau-zone',
    name: 'Sohra North Plateau Zone',
    state: 'Sohra, Meghalaya',
    // North of River Valley (Critical) — one step down going north
    coordinates: [25.2960, 91.7310],
    demoProfile: {
      risk: 'High',
      probability: 0.78,
      rainfall24h: '295 mm',
      slope: '41°',
      rainfall3Day: '650 mm',
      distanceToWater: '60 m',
      rainfall7Day: '1220 mm',
    },
  },
  {
    id: 'sohra-west-escarpment-zone',
    name: 'Sohra West Escarpment Zone',
    state: 'Sohra, Meghalaya',
    // West of Ridge (High) — tapering toward western plateau edge
    coordinates: [25.2785, 91.7050],
    demoProfile: {
      risk: 'Moderate',
      probability: 0.55,
      rainfall24h: '185 mm',
      slope: '29°',
      rainfall3Day: '390 mm',
      distanceToWater: '145 m',
      rainfall7Day: '750 mm',
    },
  },
  {
    id: 'sohra-central-zone',
    name: 'Sohra Central Zone',
    state: 'Sohra, Meghalaya',
    // Between Plateau (Low) and East Slope (Critical) — bridges the jump
    coordinates: [25.2700, 91.7430],
    demoProfile: {
      risk: 'High',
      probability: 0.72,
      rainfall24h: '265 mm',
      slope: '36°',
      rainfall3Day: '590 mm',
      distanceToWater: '80 m',
      rainfall7Day: '1100 mm',
    },
  },
  {
    id: 'sohra-southeast-zone',
    name: 'Sohra Southeast Zone',
    state: 'Sohra, Meghalaya',
    // Between South Valley (Moderate) and East Slope (Critical) — gradual step up
    coordinates: [25.2520, 91.7450],
    demoProfile: {
      risk: 'High',
      probability: 0.81,
      rainfall24h: '290 mm',
      slope: '43°',
      rainfall3Day: '630 mm',
      distanceToWater: '55 m',
      rainfall7Day: '1175 mm',
    },
  },
  {
    id: 'sohra-far-south-zone',
    name: 'Sohra Far South Zone',
    state: 'Sohra, Meghalaya',
    // South of South Valley (Moderate) — consistent southward continuation
    coordinates: [25.2380, 91.7300],
    demoProfile: {
      risk: 'Moderate',
      probability: 0.52,
      rainfall24h: '170 mm',
      slope: '25°',
      rainfall3Day: '355 mm',
      distanceToWater: '125 m',
      rainfall7Day: '690 mm',
    },
  },
];
