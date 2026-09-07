from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.habitation import Habitation
from app.models.shelter import Shelter
from app.models.road import RoadSegment
from app.schemas.routing import EvacuationPlanRequest, EvacuationPlanResponse, RoadFeature
from app.services.routing_service import routing_service

router = APIRouter(prefix="/routing", tags=["Routing"])

@router.get("/roads", response_model=List[RoadFeature])
def get_road_network(db: Session = Depends(get_db)):
    roads = db.query(RoadSegment).all()
    return [
        RoadFeature(
            id=r.id,
            name=r.name,
            road_type=r.road_type,
            is_blocked=r.is_blocked,
            blockage_reason=r.blockage_reason or "",
            road_condition=r.road_condition,
            geometry=r.geometry
        )
        for r in roads
    ]

@router.post("/plan", response_model=EvacuationPlanResponse)
def plan_evacuation_route(request: EvacuationPlanRequest, db: Session = Depends(get_db)):
    habitation = db.query(Habitation).filter(Habitation.id == request.habitation_id).first()
    if not habitation:
        raise HTTPException(status_code=404, detail="Habitation not found")

    shelter = db.query(Shelter).filter(Shelter.id == request.shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")

    roads = db.query(RoadSegment).all()

    return routing_service.plan_evacuation_route(
        habitation=habitation,
        shelter=shelter,
        roads=roads,
        avoid_blocked_roads=request.avoid_blocked_roads,
        consider_hazard_proximity=request.consider_hazard_proximity
    )
