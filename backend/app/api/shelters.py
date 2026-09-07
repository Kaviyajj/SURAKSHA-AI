from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.shelter import Shelter
from app.models.habitation import Habitation
from app.schemas.shelter import ShelterBase, ShelterAllocationResponse
from app.services.shelter_service import shelter_service

router = APIRouter(prefix="/shelters", tags=["Shelters"])

@router.get("", response_model=List[ShelterBase])
def get_shelters(db: Session = Depends(get_db)):
    shelters = db.query(Shelter).all()
    results = []
    for s in shelters:
        avail = max(0, s.total_capacity - s.current_occupancy)
        occ_rate = round((s.current_occupancy / max(1, s.total_capacity)) * 100, 1)
        
        if s.hazard_risk <= 12.0:
            risk_tier = "Low Risk (Safe)"
        elif s.hazard_risk <= 20.0:
            risk_tier = "Moderate Risk"
        else:
            risk_tier = "High Risk"

        results.append(ShelterBase(
            id=s.id,
            name=s.name,
            shelter_type=s.shelter_type,
            latitude=s.latitude,
            longitude=s.longitude,
            total_capacity=s.total_capacity,
            current_occupancy=s.current_occupancy,
            available_capacity=avail,
            occupancy_rate=occ_rate,
            hazard_risk=s.hazard_risk,
            hazard_risk_level=risk_tier,
            road_accessibility=s.road_accessibility,
            medical_distance=s.medical_distance,
            has_generator=s.has_generator,
            has_water_filtration=s.has_water_filtration,
            has_medical_staff=s.has_medical_staff,
            is_active=s.is_active
        ))
    return results

@router.get("/recommend/{habitation_id}", response_model=ShelterAllocationResponse)
def get_shelter_recommendation(
    habitation_id: int,
    affected_population: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    habitation = db.query(Habitation).filter(Habitation.id == habitation_id).first()
    if not habitation:
        raise HTTPException(status_code=404, detail="Habitation not found")

    shelters = db.query(Shelter).filter(Shelter.is_active == True).all()
    if not shelters:
        raise HTTPException(status_code=404, detail="No active shelters found")

    return shelter_service.rank_and_allocate_shelters(habitation, shelters, affected_population)
