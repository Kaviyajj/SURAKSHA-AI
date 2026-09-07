from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from datetime import datetime
from app.core.database import Base

class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(Integer, primary_key=True, index=True)
    scenario_name = Column(String(100), default="What-If Disaster Escalation")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Input parameters
    rainfall_delta_pct = Column(Float, default=0.0)
    river_level_delta_m = Column(Float, default=0.0)
    road_blockage_level = Column(String(50), default="None")
    
    # Delta Summary Output
    before_critical_count = Column(Integer, default=0)
    after_critical_count = Column(Integer, default=0)
    before_pop_at_risk = Column(Integer, default=0)
    after_pop_at_risk = Column(Integer, default=0)
    before_shelter_available = Column(Integer, default=0)
    after_shelter_available = Column(Integer, default=0)
    
    # Escalation details JSON list
    escalations = Column(JSON, default=[])
    full_results = Column(JSON, default={})
