from pydantic import BaseModel
from typing import List, Optional

class ShelterBase(BaseModel):
    id: int
    name: str
    shelter_type: str
    latitude: float
    longitude: float
    total_capacity: int
    current_occupancy: int
    available_capacity: int
    occupancy_rate: float
    hazard_risk: float
    hazard_risk_level: str
    road_accessibility: float
    medical_distance: float
    has_generator: bool
    has_water_filtration: bool
    has_medical_staff: bool
    is_active: bool

class ShelterRecommendationItem(BaseModel):
    shelter_id: int
    shelter_name: str
    shelter_type: str
    latitude: float
    longitude: float
    total_capacity: int
    current_occupancy: int
    available_capacity: int
    distance_km: float
    estimated_travel_time_min: float
    suitability_score: float  # 0 to 100
    rank: int
    safety_rating: str
    allocated_population: int
    reason: str

class ShelterAllocationResponse(BaseModel):
    habitation_id: int
    habitation_name: str
    affected_population: int
    is_overflow: bool
    total_allocated: int
    unallocated_count: int
    primary_recommendation: Optional[ShelterRecommendationItem]
    distribution_plan: List[ShelterRecommendationItem]
    decision_summary: str
