# Exploratory Data Analysis (EDA) — SlopeEva Demonstration Dataset

This document provides a detailed statistical and visual analysis of the dataset used by the **SlopeEva** landslide risk evaluation and demonstration prototype.

---

## 1. Dataset Overview & Synthetic Calibration

The demonstration dataset consists of **5,000 observations** across **20 numerical environmental/geotechnical features** and a binary target label `Landslide` (`0` = No Landslide, `1` = Landslide Occurrence).

> [!NOTE]
> **Synthetic Calibration Notice**:  
> In accordance with project demonstration objectives, this dataset was synthetically generated and calibrated against realistic environmental and topographical parameter ranges characteristic of the **Sohra (Cherrapunji), Meghalaya** region in North-East India (known for extreme monsoonal precipitation and steep terrain). It serves as a testbed for machine learning pipeline integration, spatial risk mapping, and infrastructure hazard routing prior to permanent sensor/IoT network telemetry integration.

### Summary Statistics

- **Total Observations**: 5,000
- **Feature Count**: 20 numerical predictors + 1 target
- **Data Types**: Float64 / Int64 (No categorical encoding required)
- **Missing Values**: 0 missing entries (structurally clean)

---

## 2. Target Class Distribution

The target variable represents whether a landslide event occurred under the given environmental conditions:

- **Class 0 (No Landslide)**: ~75% (3,750 samples)
- **Class 1 (Landslide)**: ~25% (1,250 samples)
- **Class Ratio**: 3:1 moderate class imbalance

### Modeling Implication
Because of the moderate class imbalance, raw classification accuracy is supplemented with **Precision**, **Recall**, **F1-Score**, and **ROC-AUC** during model evaluation, ensuring that high-risk landslide occurrences are reliably detected without excessive false negatives.

---

## 3. Feature Breakdown & Environmental Indicators

The 20 input features represent primary geotechnical, hydrological, and topographical drivers of slope failure:

| Feature Name | Unit | Environmental Significance |
| :--- | :--- | :--- |
| `Rainfall_24h_mm` | mm | Short-term acute rainfall intensity triggering shallow landslides |
| `Rainfall_3Day_mm` | mm | Multi-day cumulative antecedent moisture accumulation |
| `Rainfall_7Day_mm` | mm | Long-term antecedent saturation weakening soil shear strength |
| `Slope_Angle_deg` | Degrees | Gravitational shear stress factor along the failure plane |
| `Elevation_m` | Meters | Orographic precipitation altitude effect |
| `Aspect_deg` | Degrees | Slope face direction relative to prevailing monsoon winds |
| `Soil_Saturation` | Ratio (0–1) | Ratio of water volume to total pore volume |
| `Vegetation_Cover` | Ratio (0–1) | Root cohesion and surface runoff buffer capacity |
| `NDVI_Index` | Index (-1 to 1) | Normalized Difference Vegetation Index |
| `Distance_to_Water_m` | Meters | Proximity to drainage channels / hydrological scouring |
| `Distance_to_Road_m` | Meters | Proximity to anthropogenic cut slopes / road excavation |
| `Temperature_C` | °C | Ambient thermal conditions impacting evapotranspiration |
| `Humidity_percent` | % | Atmospheric saturation |
| `Clay_Content_pct` | % | Cohesive soil fraction influencing plasticity |
| `Sand_Content_pct` | % | Granular soil fraction influencing hydraulic conductivity |
| `Silt_Content_pct` | % | Intermediate soil fraction |
| `Soil_Erosion_Rate_t_ha_yr`| t/ha/yr | Mass soil loss rate |
| `Pore_Water_Pressure_kPa` | kPa | Destabilizing pore water pressure reducing effective stress |
| `Soil_Moisture_Content` | % | Volumetric moisture content |
| `Earthquake_Activity` | Scale | Peak ground acceleration / seismic triggering index |

---

## 4. Key Exploratory Findings

### 4.1 Precipitation & Slope vs. Landslide Occurrence
- **24-hour and multi-day rainfall** features exhibit the strongest direct positive association with landslide events, showing significantly higher medians for `Landslide = 1`.
- **Slope Angle** displays a clear upward shift in median and interquartile range for landslide instances, confirming mechanical shear theory.
- **Pore Water Pressure** and **Soil Saturation** demonstrate strong positive correlations with failure probability.

### 4.2 Soil Composition & Vegetation
- In the baseline synthetic distribution, soil textural fractions (`Clay_Content_pct`, `Sand_Content_pct`, `Silt_Content_pct`) show overlapping marginal distributions, contributing primarily through non-linear interactions with moisture variables rather than standalone linear thresholds.
- **Vegetation Cover / NDVI** acts as a mitigating factor, with higher values slightly reducing failure rates across moderate slope angles.

---

## 5. Scope & Defensible Claims

1. **Demonstration Context**: The statistical relationships in this dataset reflect physical landslide principles (e.g., Mohr-Coulomb failure criteria, hydrological loading) calibrated to demonstrate software, ML, and geospatial integration.
2. **Operational Deployment**: Future iterations in live field settings will ingest real-time telemetry from rain gauges, piezometers, and satellite SAR (Synthetic Aperture Radar) data.

---

*For detailed graphical plots, see the [EDA Report in the EDA directory](./EDA/EDA_Report.md).*
