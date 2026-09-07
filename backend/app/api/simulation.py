from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.habitation import Habitation
from app.models.shelter import Shelter
from app.models.road import RoadSegment
from app.schemas.simulation import SimulationRequest, SimulationResponse
from app.services.simulation_service import simulation_service

router = APIRouter(prefix="/simulation", tags=["Simulation"])

@router.get("/presets")
def get_simulation_presets():
    return [
        {
            "id": "preset_monsoon_surge",
            "name": "Heavy Monsoon Surge (+30% Rain, +2m River)",
            "description": "Simulates continuous cloudburst in Nilgiri catchment with overflowing river banks.",
            "rainfall_delta_pct": 30.0,
            "river_level_delta_m": 2.0,
            "road_blockage_level": "Moderate"
        },
        {
            "id": "preset_catastrophic_flood",
            "name": "Catastrophic Flood Wave (+50% Rain, +3m River)",
            "description": "Simulates dam emergency spillway release compounded with heavy basin deluge.",
            "rainfall_delta_pct": 50.0,
            "river_level_delta_m": 3.0,
            "road_blockage_level": "Severe"
        },
        {
            "id": "preset_landslide_trigger",
            "name": "Hillside Landslide Trigger (+20% Rain, Minor Inundation)",
            "description": "Simulates localized ghat road slip and saturated hillside failure.",
            "rainfall_delta_pct": 20.0,
            "river_level_delta_m": 1.0,
            "road_blockage_level": "Minor"
        }
    ]

@router.post("/run", response_model=SimulationResponse)
def run_simulation(request: SimulationRequest, db: Session = Depends(get_db)):
    habitations = db.query(Habitation).all()
    shelters = db.query(Shelter).all()
    roads = db.query(RoadSegment).all()

    return simulation_service.run_simulation(
        request=request,
        habitations=habitations,
        shelters=shelters,
        roads=roads
    )
