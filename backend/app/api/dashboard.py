from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.habitation import Habitation
from app.models.shelter import Shelter
from app.models.road import RoadSegment
from app.schemas.dashboard import DashboardResponse, DashboardKPIs, AlertItem

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    habitations = db.query(Habitation).all()
    shelters = db.query(Shelter).all()
    roads = db.query(RoadSegment).all()

    # Risk counts
    critical_count = sum(1 for h in habitations if h.risk_level == "Critical")
    very_high_count = sum(1 for h in habitations if h.risk_level == "Very High")
    high_count = sum(1 for h in habitations if h.risk_level == "High")
    moderate_count = sum(1 for h in habitations if h.risk_level == "Moderate")
    low_count = sum(1 for h in habitations if h.risk_level == "Low")

    total_pop = sum(h.population for h in habitations)
    vuln_pop = sum(h.vulnerable_population for h in habitations)
    pop_at_risk = sum(h.population for h in habitations if h.risk_level in ["Critical", "Very High"])

    total_capacity = sum(s.total_capacity for s in shelters)
    total_occupied = sum(s.current_occupancy for s in shelters)
    available_capacity = max(0, total_capacity - total_occupied)
    utilization_pct = round((total_occupied / max(1, total_capacity)) * 100, 1)

    blocked_roads_count = sum(1 for r in roads if r.is_blocked)

    # Active alert items
    active_alerts: List[AlertItem] = []
    critical_habs = [h for h in habitations if h.risk_level == "Critical"]
    for idx, ch in enumerate(critical_habs[:5]):
        active_alerts.append(AlertItem(
            id=f"ALT-{ch.id}",
            severity="Critical",
            habitation_id=ch.id,
            habitation_name=ch.name,
            title=f"CRITICAL ESCALATION: {ch.name}",
            message=f"Composite risk score reached {ch.risk_score}/100 with {ch.vulnerable_population:,} vulnerable individuals requiring relocation.",
            timestamp="Just Now",
            recommended_action="Initiate immediate Phase-1 evacuation to designated relief center."
        ))

    if blocked_roads_count > 0:
        active_alerts.append(AlertItem(
            id="ALT-ROAD-BLK",
            severity="Warning",
            habitation_id=None,
            habitation_name=None,
            title=f"{blocked_roads_count} Road Arterials Inundated/Blocked",
            message="SH-15 Bhavani Valley Arterial impassable due to rising river level. Rerouting via Ridge Corridor active.",
            timestamp="12 min ago",
            recommended_action="Deploy traffic barricades and dispatch highway safety escort units."
        ))

    # Breakdown by hazard type
    hazard_breakdown = {
        "Flood": sum(1 for h in habitations if h.hazard_type == "Flood"),
        "Landslide": sum(1 for h in habitations if h.hazard_type == "Landslide"),
        "Wildfire": sum(1 for h in habitations if h.hazard_type == "Wildfire")
    }

    # Top critical habitations
    sorted_critical = sorted(habitations, key=lambda x: x.risk_score, reverse=True)[:5]
    top_critical_list = [{
        "id": h.id,
        "name": h.name,
        "district": h.district,
        "risk_score": h.risk_score,
        "risk_level": h.risk_level,
        "population": h.population,
        "vulnerable_population": h.vulnerable_population,
        "hazard_type": h.hazard_type,
        "explanation": h.explanation
    } for h in sorted_critical]

    # Recent activity
    recent_activity = [
        {"time": "10:42 AM", "action": "Risk Engine Recalibration", "detail": "Automated rainfall grid ingest updated 50 habitations."},
        {"time": "10:35 AM", "action": "Evacuation Route Generated", "detail": "Corridor mapped from Kaveri Nagar to District Central Camp."},
        {"time": "10:20 AM", "action": "Shelter Quota Updated", "detail": "District Indoor Sports Stadium reported 600 current occupants."},
        {"time": "10:05 AM", "action": "Road Sensor Alert", "detail": "SH-15 Bhavani River bridge water depth sensor reached 0.45m threshold."}
    ]

    kpis = DashboardKPIs(
        total_habitations=len(habitations),
        critical_zones_count=critical_count,
        high_risk_count=very_high_count + high_count,
        moderate_risk_count=moderate_count,
        low_risk_count=low_count,
        total_monitored_population=total_pop,
        vulnerable_population_total=vuln_pop,
        population_at_risk=pop_at_risk,
        total_shelters=len(shelters),
        total_shelter_capacity=total_capacity,
        total_shelter_occupied=total_occupied,
        available_shelter_capacity=available_capacity,
        shelter_utilization_pct=utilization_pct,
        active_evacuations_count=critical_count,
        blocked_roads_count=blocked_roads_count,
        system_status="OPERATIONAL - HIGH ALERT",
        active_scenario="Monsoon Active Basin Inundation",
        is_demo_mode=True
    )

    return DashboardResponse(
        kpis=kpis,
        active_alerts=active_alerts,
        risk_distribution={
            "Critical": critical_count,
            "Very High": very_high_count,
            "High": high_count,
            "Moderate": moderate_count,
            "Low": low_count
        },
        hazard_type_breakdown=hazard_breakdown,
        top_critical_habitations=top_critical_list,
        recent_activity=recent_activity
    )
