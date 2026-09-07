from pydantic import BaseModel
from typing import List, Optional

class RouteStep(BaseModel):
    instruction: str
    distance_km: float
    duration_min: float
    hazard_warning: Optional[str] = None

class EvacuationPlanRequest(BaseModel):
    habitation_id: int
    shelter_id: int
    avoid_blocked_roads: bool = True
    consider_hazard_proximity: bool = True

class EvacuationPlanResponse(BaseModel):
    origin_id: int
    origin_name: str
    origin_coords: List[float]
    destination_id: int
    destination_name: str
    destination_coords: List[float]
    
    total_distance_km: float
    estimated_travel_time_min: float
    route_safety_score: float  # 0 to 100
    safety_tier: str
    
    blocked_roads_avoided: int
    hazard_zones_bypassed: List[str]
    
    # [[lat, lon], ...]
    route_geometry: List[List[float]]
    turn_by_turn: List[RouteStep]
    routing_algorithm: str
    explanation: str

class RoadFeature(BaseModel):
    id: int
    name: str
    road_type: str
    is_blocked: bool
    blockage_reason: str
    road_condition: str
    geometry: List[List[float]]
