from sqlalchemy import Column, Integer, String, Float, Boolean, JSON
from app.core.database import Base

class RoadSegment(Base):
    __tablename__ = "road_segments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    road_type = Column(String(50), default="Arterial")  # National Highway, State Highway, District Road, Rural Arterial
    
    # Graph connectivity
    start_node = Column(String(50), nullable=False)
    end_node = Column(String(50), nullable=False)
    
    # Coordinates list [[lat1, lon1], [lat2, lon2], ...]
    geometry = Column(JSON, nullable=False)
    
    length_km = Column(Float, nullable=False)
    base_speed_kmh = Column(Float, default=40.0)
    
    # Dynamic conditions
    is_blocked = Column(Boolean, default=False)
    blockage_reason = Column(String(200), default="")
    flood_water_level_m = Column(Float, default=0.0)
    landslide_debris_risk = Column(Float, default=0.0)
    road_condition = Column(String(50), default="Good")  # Good, Fair, Damaged, Impassable
