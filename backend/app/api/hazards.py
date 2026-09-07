from fastapi import APIRouter
from app.data.seed_data import RIVERS_GEOJSON

router = APIRouter(prefix="/hazards", tags=["Hazards & GIS Layers"])

@router.get("/rivers")
def get_rivers_geojson():
    return RIVERS_GEOJSON

@router.get("/summary")
def get_hazards_summary():
    return {
        "active_disaster_types": ["Flood", "Landslide", "Wildfire"],
        "primary_river_system": "Bhavani-Moyar River Drainage Basin",
        "current_alert_tier": "ORANGE WATCH",
        "hydrological_status": {
            "bhavani_flow_rate_m3s": 450.0,
            "moyar_flow_rate_m3s": 280.0,
            "pykara_flow_rate_m3s": 90.0,
            "bhavanisagar_reservoir_inflow_cusecs": 18500
        },
        "meteorological_summary": {
            "24h_peak_rainfall_mm": 195.0,
            "wind_speed_kmh": 28.0,
            "relative_humidity_pct": 94.0
        }
    }
