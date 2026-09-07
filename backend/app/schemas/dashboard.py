from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class AlertItem(BaseModel):
    id: str
    severity: str  # Critical, Warning, Info
    habitation_id: Optional[int] = None
    habitation_name: Optional[str] = None
    title: str
    message: str
    timestamp: str
    recommended_action: str

class DashboardKPIs(BaseModel):
    total_habitations: int
    critical_zones_count: int
    high_risk_count: int
    moderate_risk_count: int
    low_risk_count: int
    
    total_monitored_population: int
    vulnerable_population_total: int
    population_at_risk: int  # Critical + High zones
    
    total_shelters: int
    total_shelter_capacity: int
    total_shelter_occupied: int
    available_shelter_capacity: int
    shelter_utilization_pct: float
    
    active_evacuations_count: int
    blocked_roads_count: int
    system_status: str
    active_scenario: str
    is_demo_mode: bool

class DashboardResponse(BaseModel):
    kpis: DashboardKPIs
    active_alerts: List[AlertItem]
    risk_distribution: Dict[str, int]
    hazard_type_breakdown: Dict[str, int]
    top_critical_habitations: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]
