from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.config import settings
from app.models.habitation import Habitation
from app.schemas.habitation import HabitationBase, HabitationDetail, FactorContribution
from app.services.risk_engine import risk_engine

router = APIRouter(prefix="/habitations", tags=["Habitations"])

@router.get("", response_model=List[HabitationDetail])
def get_habitations(
    hazard_type: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Habitation)
    
    if hazard_type and hazard_type != "All":
        query = query.filter(Habitation.hazard_type == hazard_type)
    if risk_level and risk_level != "All":
        query = query.filter(Habitation.risk_level == risk_level)
    if search:
        query = query.filter(Habitation.name.ilike(f"%{search}%"))

    habitations = query.all()
    results = []

    for h in habitations:
        tier_cfg = settings.RISK_TIERS.get(h.risk_level, {"color": "#64748b"})
        
        # Calculate factor breakdown
        _, _, factors, expl = risk_engine.calculate_habitation_risk(
            rainfall=h.rainfall,
            river_distance=h.river_distance,
            elevation=h.elevation,
            slope=h.slope,
            population=h.population,
            vulnerable_population=h.vulnerable_population,
            infrastructure_score=h.infrastructure_score,
            road_accessibility=h.road_accessibility,
            historical_risk=h.historical_risk,
            hazard_type=h.hazard_type
        )

        results.append(HabitationDetail(
            id=h.id,
            name=h.name,
            district=h.district,
            latitude=h.latitude,
            longitude=h.longitude,
            population=h.population,
            vulnerable_population=h.vulnerable_population,
            elderly_count=h.elderly_count,
            children_count=h.children_count,
            disabled_count=h.disabled_count,
            rainfall=h.rainfall,
            elevation=h.elevation,
            slope=h.slope,
            river_distance=h.river_distance,
            infrastructure_score=h.infrastructure_score,
            road_accessibility=h.road_accessibility,
            distance_to_medical=h.distance_to_medical,
            historical_risk=h.historical_risk,
            hazard_type=h.hazard_type,
            risk_score=h.risk_score,
            risk_level=h.risk_level,
            risk_color=tier_cfg["color"],
            factor_contributions=[FactorContribution(**f) for f in factors],
            explanation=h.explanation or expl
        ))

    return results

@router.get("/{habitation_id}", response_model=HabitationDetail)
def get_habitation_detail(habitation_id: int, db: Session = Depends(get_db)):
    h = db.query(Habitation).filter(Habitation.id == habitation_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Habitation not found")

    tier_cfg = settings.RISK_TIERS.get(h.risk_level, {"color": "#64748b"})
    
    _, _, factors, expl = risk_engine.calculate_habitation_risk(
        rainfall=h.rainfall,
        river_distance=h.river_distance,
        elevation=h.elevation,
        slope=h.slope,
        population=h.population,
        vulnerable_population=h.vulnerable_population,
        infrastructure_score=h.infrastructure_score,
        road_accessibility=h.road_accessibility,
        historical_risk=h.historical_risk,
        hazard_type=h.hazard_type
    )

    return HabitationDetail(
        id=h.id,
        name=h.name,
        district=h.district,
        latitude=h.latitude,
        longitude=h.longitude,
        population=h.population,
        vulnerable_population=h.vulnerable_population,
        elderly_count=h.elderly_count,
        children_count=h.children_count,
        disabled_count=h.disabled_count,
        rainfall=h.rainfall,
        elevation=h.elevation,
        slope=h.slope,
        river_distance=h.river_distance,
        infrastructure_score=h.infrastructure_score,
        road_accessibility=h.road_accessibility,
        distance_to_medical=h.distance_to_medical,
        historical_risk=h.historical_risk,
        hazard_type=h.hazard_type,
        risk_score=h.risk_score,
        risk_level=h.risk_level,
        risk_color=tier_cfg["color"],
        factor_contributions=[FactorContribution(**f) for f in factors],
        explanation=h.explanation or expl
    )

@router.get("/{habitation_id}/risk")
def get_habitation_risk_breakdown(habitation_id: int, db: Session = Depends(get_db)):
    h = db.query(Habitation).filter(Habitation.id == habitation_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Habitation not found")

    score, level, factors, expl = risk_engine.calculate_habitation_risk(
        rainfall=h.rainfall,
        river_distance=h.river_distance,
        elevation=h.elevation,
        slope=h.slope,
        population=h.population,
        vulnerable_population=h.vulnerable_population,
        infrastructure_score=h.infrastructure_score,
        road_accessibility=h.road_accessibility,
        historical_risk=h.historical_risk,
        hazard_type=h.hazard_type
    )

    return {
        "habitation_id": h.id,
        "name": h.name,
        "risk_score": score,
        "risk_level": level,
        "hazard_type": h.hazard_type,
        "factor_contributions": factors,
        "explanation": expl,
        "methodology": "Hybrid Multi-Factor Rule-Based Scoring Engine + Geometric Spatial Proximity Model"
    }
