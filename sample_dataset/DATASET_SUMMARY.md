# SURAKSHA-AI Sample Dataset Summary
**Region**: Nilgiri-Bhavani River Basin, Tamil Nadu / Western Ghats
**Dataset**: SURAKSHA-AI Disaster Intelligence Demo & Simulation Benchmark

---

## Key Metrics Overview
| Metric | Value |
|:-------|:------|
| **Total Monitored Habitations** | `50` |
| **Total Population Monitored** | `160,800` |
| **Total Vulnerable Population** | `39,520` (24.6%) |
| **Designated Relief Shelters** | `10` |
| **Total Shelter Capacity** | `24,100` beds |
| **Available Shelter Capacity** | `18,150` beds |
| **Current Shelter Occupancy** | `24.7%` |
| **Active Road Segments** | `10` (2 blocked) |

---

## Habitation Risk Distribution
- **Critical Risk (Score 81-100)**: `10` habitations (Immediate evacuation mandated)
- **Very High Risk (Score 61-80)**: `20` habitations
- **High Risk (Score 41-60)**: `14` habitations
- **Moderate Risk (Score 21-40)**: `6` habitations
- **Low Risk (Score 0-20)**: `0` habitations

---

## Hazard Type Breakdown
- **Flood**: `20` habitations
- **Landslide**: `24` habitations
- **Wildfire**: `6` habitations


---

## Included Files in `sample_dataset/`
1. `habitations.csv` - Tabular export of all habitations with geo coordinates, demographics, weather metrics, and risk scores.
2. `shelters.csv` - Relief shelters, capacity, amenities (generators, water filtration, medical staff), and status.
3. `road_network.csv` - Road topology, speed limits, lengths, and blockage reasons.
4. `habitations.json` - Complete JSON object array.
5. `shelters.json` - Complete shelters JSON array.
6. `road_network.json` - Road segments JSON array with coordinates.
7. `rivers_basin.geojson` - GeoJSON FeatureCollection of river geometry.
8. `sample_dataset_manifest.json` - Machine-readable metrics manifest.
