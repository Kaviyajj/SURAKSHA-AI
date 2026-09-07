from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class SimulationRequest(BaseModel):
    scenario_name: str = "Custom Escalation Scenario"
    rainfall_delta_pct: float = 0.0      # e.g., 0, 10, 20, 30, 50
    river_level_delta_m: float = 0.0     # e.g., 0, 1, 2, 3
    road_blockage_level: str = "None"    # None, Minor, Moderate, Severe
    custom_blocked_road_ids: Optional[List[int]] = None

class EscalatedHabitation(BaseModel):
    id: int
    name: str
    previous_risk_score: float
    simulated_risk_score: float
    previous_risk_level: str
    simulated_risk_level: str
    population: int
    vulnerable_population: int
    escalation_type: str  # e.g., "Moderate → High", "High → Critical"
    primary_trigger: str

class SimulationResponse(BaseModel):
    simulation_id: int
    scenario_name: str
    parameters: Dict[str, Any]
    
    # Before vs After KPIs
    before_critical_count: int
    after_critical_count: int
    critical_delta: int
    
    before_high_count: int
    after_high_count: int
    
    before_pop_at_risk: int
    after_pop_at_risk: int
    pop_at_risk_delta: int
    
    before_shelter_capacity_available: int
    after_shelter_capacity_available: int
    
    escalations: List[EscalatedHabitation]
    affected_habitations: List[Dict[str, Any]]
    simulated_blocked_roads: List[int]
    actionable_summary: str
