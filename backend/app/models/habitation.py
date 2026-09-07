from sqlalchemy import Column, Integer, String, Float, Text, JSON
from app.core.database import Base

class Habitation(Base):
    __tablename__ = "habitations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    district = Column(String(100), default="Nilgiri Basin")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Population details
    population = Column(Integer, nullable=False)
    vulnerable_population = Column(Integer, nullable=False)  # Elderly, children, disabled
    elderly_count = Column(Integer, default=0)
    children_count = Column(Integer, default=0)
    disabled_count = Column(Integer, default=0)
    
    # Hazard & Physical metrics
    rainfall = Column(Float, nullable=False)  # in mm
    elevation = Column(Float, nullable=False)  # in meters
    slope = Column(Float, nullable=False)  # in degrees
    river_distance = Column(Float, nullable=False)  # in meters
    
    # Vulnerability & Infrastructure metrics
    infrastructure_score = Column(Float, nullable=False)  # 0 to 100 (higher = worse/more vulnerable)
    road_accessibility = Column(Float, nullable=False)  # 0 to 100 (lower = worse/more isolated)
    distance_to_medical = Column(Float, default=5.0)  # in km
    historical_risk = Column(Float, nullable=False)  # 0 to 100
    
    # Primary Hazard Classification (Flood / Landslide / Wildfire)
    hazard_type = Column(String(50), default="Flood")
    
    # Computed risk caches
    risk_score = Column(Float, default=0.0)
    risk_level = Column(String(20), default="Low")
    risk_factors = Column(JSON, default={})
    explanation = Column(Text, default="")
