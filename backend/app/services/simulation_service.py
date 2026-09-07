from typing import List, Dict, Any
from app.models.habitation import Habitation
from app.models.shelter import Shelter
from app.models.road import RoadSegment
from app.models.simulation import SimulationRun
from app.schemas.simulation import SimulationRequest, SimulationResponse, EscalatedHabitation
from app.services.risk_engine import risk_engine

class SimulationService:
    def run_simulation(
        self,
        request: SimulationRequest,
        habitations: List[Habitation],
        shelters: List[Shelter],
        roads: List[RoadSegment]
    ) -> SimulationResponse:
        """
        Executes a real-time parametric What-If disaster scenario across all 50 habitations,
        recalculating risk scores, red-zone polygons, shelter limits, and escalation transitions.
        """
        rainfall_mod = 1.0 + (request.rainfall_delta_pct / 100.0)
        river_mod = request.river_level_delta_m

        # Determine road blockages based on blockage severity level
        simulated_blocked_road_ids = []
        if request.custom_blocked_road_ids:
            simulated_blocked_road_ids = list(request.custom_blocked_road_ids)
        else:
            if request.road_blockage_level == "Minor":
                simulated_blocked_road_ids = [2]
            elif request.road_blockage_level == "Moderate":
                simulated_blocked_road_ids = [2, 6]
            elif request.road_blockage_level == "Severe":
                simulated_blocked_road_ids = [2, 6, 10, 4]

        # Before baseline calculations
        before_critical = sum(1 for h in habitations if h.risk_level == "Critical")
        before_high = sum(1 for h in habitations if h.risk_level in ["High", "Very High"])
        before_pop_at_risk = sum(h.population for h in habitations if h.risk_level in ["Critical", "Very High"])
        before_shelter_avail = sum(max(0, s.total_capacity - s.current_occupancy) for s in shelters if s.is_active)

        # Recalculate each habitation under simulated parameters
        escalations: List[EscalatedHabitation] = []
        affected_habitations: List[Dict[str, Any]] = []

        after_critical = 0
        after_high = 0
        after_pop_at_risk = 0

        for h in habitations:
            # Baseline score and level
            prev_score = h.risk_score
            prev_level = h.risk_level

            # Recalculate with simulation modifiers
            sim_score, sim_level, factors, expl = risk_engine.calculate_habitation_risk(
                rainfall=h.rainfall,
                river_distance=h.river_distance,
                elevation=h.elevation,
                slope=h.slope,
                population=h.population,
                vulnerable_population=h.vulnerable_population,
                infrastructure_score=h.infrastructure_score,
                road_accessibility=h.road_accessibility,
                historical_risk=h.historical_risk,
                hazard_type=h.hazard_type,
                rainfall_modifier=rainfall_mod,
                river_level_modifier=river_mod
            )

            if sim_level == "Critical":
                after_critical += 1
            if sim_level in ["High", "Very High"]:
                after_high += 1
            if sim_level in ["Critical", "Very High"]:
                after_pop_at_risk += h.population

            # Check if escalated
            tier_order = {"Low": 1, "Moderate": 2, "High": 3, "Very High": 4, "Critical": 5}
            if tier_order.get(sim_level, 0) > tier_order.get(prev_level, 0):
                # Trigger explanation
                triggers = []
                if request.rainfall_delta_pct > 0:
                    triggers.append(f"+{int(request.rainfall_delta_pct)}% Rainfall")
                if request.river_level_delta_m > 0:
                    triggers.append(f"+{int(request.river_level_delta_m)}m River Rise")
                if not triggers:
                    triggers.append("Compounded Hazard Conditions")

                escalation = EscalatedHabitation(
                    id=h.id,
                    name=h.name,
                    previous_risk_score=prev_score,
                    simulated_risk_score=sim_score,
                    previous_risk_level=prev_level,
                    simulated_risk_level=sim_level,
                    population=h.population,
                    vulnerable_population=h.vulnerable_population,
                    escalation_type=f"{prev_level} → {sim_level}",
                    primary_trigger=", ".join(triggers)
                )
                escalations.append(escalation)

            affected_habitations.append({
                "id": h.id,
                "name": h.name,
                "latitude": h.latitude,
                "longitude": h.longitude,
                "population": h.population,
                "vulnerable_population": h.vulnerable_population,
                "hazard_type": h.hazard_type,
                "previous_risk_score": prev_score,
                "previous_risk_level": prev_level,
                "simulated_risk_score": sim_score,
                "simulated_risk_level": sim_level,
                "factor_contributions": factors,
                "explanation": expl
            })

        # Recalculate shelter available capacity under simulated strain
        # Estimated influx based on newly escalated vulnerable population
        additional_evacuees = max(0, after_pop_at_risk - before_pop_at_risk)
        after_shelter_avail = max(0, before_shelter_avail - int(additional_evacuees * 0.75))

        # Actionable Summary
        summary = (
            f"SIMULATION RUN COMPLETE: Scenario with +{int(request.rainfall_delta_pct)}% rainfall, "
            f"+{int(request.river_level_delta_m)}m river rise, and '{request.road_blockage_level}' road blockage "
            f"escalates {len(escalations)} habitations into higher risk tiers. "
            f"Critical zones increased from {before_critical} to {after_critical} (+{after_critical - before_critical}), "
            f"expanding the population at acute risk by {after_pop_at_risk - before_pop_at_risk:,} citizens."
        )

        return SimulationResponse(
            simulation_id=1,
            scenario_name=request.scenario_name,
            parameters={
                "rainfall_delta_pct": request.rainfall_delta_pct,
                "river_level_delta_m": request.river_level_delta_m,
                "road_blockage_level": request.road_blockage_level,
                "simulated_blocked_roads": simulated_blocked_road_ids
            },
            before_critical_count=before_critical,
            after_critical_count=after_critical,
            critical_delta=after_critical - before_critical,
            before_high_count=before_high,
            after_high_count=after_high,
            before_pop_at_risk=before_pop_at_risk,
            after_pop_at_risk=after_pop_at_risk,
            pop_at_risk_delta=after_pop_at_risk - before_pop_at_risk,
            before_shelter_capacity_available=before_shelter_avail,
            after_shelter_capacity_available=after_shelter_avail,
            escalations=escalations,
            affected_habitations=affected_habitations,
            simulated_blocked_roads=simulated_blocked_road_ids,
            actionable_summary=summary
        )

simulation_service = SimulationService()
