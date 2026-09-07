from pydantic import BaseModel
from typing import Dict, Any, Optional, List

class FactorContribution(BaseModel):
    name: str
    weight: float
    raw_value: float
    unit: str
    normalized_score: float
    impact_level: str  # Low, Medium, High, Very High, Critical
    description: str

class HabitationBase(BaseModel):
    id: int
    name: str
    district: str
    latitude: float
    longitude: float
    population: int
    vulnerable_population: int
    elderly_count: int
    children_count: int
    disabled_count: int
    rainfall: float
    elevation: float
    slope: float
    river_distance: float
    infrastructure_score: float
    road_accessibility: float
    distance_to_medical: float
    historical_risk: float
    hazard_type: str

class HabitationDetail(HabitationBase):
    risk_score: float
    risk_level: str
    risk_color: str
    factor_contributions: List[FactorContribution]
    explanation: str

class HabitationFilter(BaseModel):
    hazard_type: Optional[str] = None
    risk_level: Optional[str] = None
    min_population: Optional[int] = None
    search: Optional[str] = None
