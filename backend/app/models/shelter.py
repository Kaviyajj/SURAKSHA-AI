from sqlalchemy import Column, Integer, String, Float, Boolean
from app.core.database import Base

class Shelter(Base):
    __tablename__ = "shelters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False, index=True)
    shelter_type = Column(String(50), default="Relief Camp")  # Relief Camp, School, Stadium, Community Hall
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Capacity metrics
    total_capacity = Column(Integer, nullable=False)
    current_occupancy = Column(Integer, default=0)
    
    # Safety and accessibility
    hazard_risk = Column(Float, default=10.0)  # 0 to 100 (lower is safer)
    road_accessibility = Column(Float, default=90.0)  # 0 to 100 (higher is better)
    medical_distance = Column(Float, default=1.5)  # in km
    has_generator = Column(Boolean, default=True)
    has_water_filtration = Column(Boolean, default=True)
    has_medical_staff = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
