// Training dataset medians computed from src/landslide_demo_v1.csv
export const DEFAULT_FEATURE_MEDIANS = {
  Rainfall_24h_mm: 67.93,
  Slope_Angle_deg: 32.06,
  Rainfall_3Day_mm: 184.68,
  Distance_to_Water_m: 159.41,
  Rainfall_7Day_mm: 392.61,
  Elevation_m: 889.97,
  Aspect_deg: 181.86,
  Soil_Saturation: 0.44,
  Vegetation_Cover: 0.56,
  NDVI_Index: 0.56,
  Distance_to_Road_m: 177.84,
  Temperature_C: 23.96,
  Humidity_percent: 100.0,
  Clay_Content_pct: 31.93,
  Sand_Content_pct: 37.63,
  Silt_Content_pct: 30.37,
  Soil_Erosion_Rate_t_ha_yr: 5.77,
  Pore_Water_Pressure_kPa: 105.88,
  Soil_Moisture_Content: 0.23,
  Earthquake_Activity: 0.55,
};

export const PRIMARY_FEATURES = [
  { key: 'Rainfall_24h_mm', label: '24h Rainfall (mm)', step: 0.1 },
  { key: 'Slope_Angle_deg', label: 'Slope (°)', step: 0.1 },
  { key: 'Rainfall_3Day_mm', label: '3-Day Rainfall (mm)', step: 0.1 },
  { key: 'Distance_to_Water_m', label: 'Distance to Water (m)', step: 1 },
  { key: 'Rainfall_7Day_mm', label: '7-Day Rainfall (mm)', step: 0.1 },
];

export const ADVANCED_FEATURES = [
  { key: 'Elevation_m', label: 'Elevation (m)', step: 1 },
  { key: 'Aspect_deg', label: 'Aspect (°)', step: 0.1 },
  { key: 'Soil_Saturation', label: 'Soil Saturation (0–1)', step: 0.01 },
  { key: 'Vegetation_Cover', label: 'Vegetation Cover (0–1)', step: 0.01 },
  { key: 'NDVI_Index', label: 'NDVI Index (-1 to 1)', step: 0.01 },
  { key: 'Distance_to_Road_m', label: 'Distance to Road (m)', step: 1 },
  { key: 'Temperature_C', label: 'Temperature (°C)', step: 0.1 },
  { key: 'Humidity_percent', label: 'Humidity (%)', step: 0.1 },
  { key: 'Clay_Content_pct', label: 'Clay Content (%)', step: 0.1 },
  { key: 'Sand_Content_pct', label: 'Sand Content (%)', step: 0.1 },
  { key: 'Silt_Content_pct', label: 'Silt Content (%)', step: 0.1 },
  { key: 'Soil_Erosion_Rate_t_ha_yr', label: 'Soil Erosion Rate (t/ha/yr)', step: 0.01 },
  { key: 'Pore_Water_Pressure_kPa', label: 'Pore Water Pressure (kPa)', step: 0.1 },
  { key: 'Soil_Moisture_Content', label: 'Soil Moisture Content', step: 0.01 },
  { key: 'Earthquake_Activity', label: 'Earthquake Activity', step: 0.01 },
];
