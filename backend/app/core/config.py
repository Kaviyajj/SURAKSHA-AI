import os
from pydantic import BaseModel
from typing import Dict

class RiskWeights(BaseModel):
    rainfall: float = 0.20
    river_distance: float = 0.18
    slope_elevation: float = 0.16
    road_accessibility: float = 0.14
    infrastructure_vulnerability: float = 0.12
    vulnerable_population: float = 0.10
    historical_risk: float = 0.10

class Settings:
    PROJECT_NAME: str = "SURAKSHA-AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DESCRIPTION: str = "AI-Powered Disaster Intelligence & Emergency Relocation Platform"
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./suraksha_ai.db")
    
    # Configurable Risk Weights
    RISK_WEIGHTS: RiskWeights = RiskWeights()
    
    # Risk Score Classification Tiers
    RISK_TIERS: Dict[str, Dict[str, any]] = {
        "Low": {"min": 0, "max": 20, "color": "#10b981", "badge": "success"},
        "Moderate": {"min": 21, "max": 40, "color": "#f59e0b", "badge": "warning"},
        "High": {"min": 41, "max": 60, "color": "#f97316", "badge": "high"},
        "Very High": {"min": 61, "max": 80, "color": "#e11d48", "badge": "destructive"},
        "Critical": {"min": 81, "max": 100, "color": "#dc2626", "badge": "critical"},
    }

settings = Settings()
