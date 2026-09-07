from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class GenerateReportRequest(BaseModel):
    title: str = "SURAKSHA-AI Official Disaster Evacuation & Relocation Action Plan"
    officer_name: str = "District Emergency Operations Commander"
    jurisdiction: str = "Nilgiri Basin Disaster Response Authority"
    include_critical_only: bool = False
    custom_notes: Optional[str] = None

class ReportResponse(BaseModel):
    report_id: str
    generated_at: str
    title: str
    officer_name: str
    jurisdiction: str
    status: str
    
    # Executive Summary Metrics
    critical_habitations_count: int
    population_at_risk: int
    vulnerable_individuals: int
    assigned_shelters_count: int
    shelter_capacity_allocated: int
    total_evacuation_routes: int
    
    # Detailed Sections
    critical_habitations: List[Dict[str, Any]]
    shelter_allocations: List[Dict[str, Any]]
    evacuation_routes: List[Dict[str, Any]]
    action_directives: List[str]
    standard_operating_procedures: List[str]
    
    disclaimer: str
