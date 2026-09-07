import math
from typing import List, Dict, Any, Tuple
from app.models.shelter import Shelter
from app.models.habitation import Habitation
from app.schemas.shelter import ShelterRecommendationItem, ShelterAllocationResponse

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two points in km."""
    R = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class ShelterService:
    def rank_and_allocate_shelters(
        self,
        habitation: Habitation,
        shelters: List[Shelter],
        affected_population: int = None
    ) -> ShelterAllocationResponse:
        """
        Ranks all active shelters for a given habitation using multi-criteria suitability scoring,
        and generates an automated population distribution plan if single-shelter overflow occurs.
        """
        if affected_population is None:
            # Default to vulnerable population or full population if critical
            if habitation.risk_level in ["Critical", "Very High"]:
                affected_population = habitation.population
            else:
                affected_population = habitation.vulnerable_population

        scored_shelters = []

        for s in shelters:
            if not s.is_active:
                continue

            available_cap = max(0, s.total_capacity - s.current_occupancy)
            dist_km = haversine_distance(habitation.latitude, habitation.longitude, s.latitude, s.longitude)
            
            # Estimated travel time based on distance and road accessibility
            avg_speed_kmh = max(20.0, (s.road_accessibility / 100.0) * 45.0)
            travel_time_min = round((dist_km / avg_speed_kmh) * 60.0, 1)

            # Suitability components (0 - 100):
            # 1. Safety score (100 - hazard_risk)
            safety_score = max(0.0, 100.0 - s.hazard_risk)
            
            # 2. Capacity sufficiency score
            cap_score = min(100.0, (available_cap / max(1, affected_population)) * 100.0)
            
            # 3. Distance proximity score (closer is better, max 35km scale)
            dist_score = max(0.0, (1.0 - (dist_km / 35.0)) * 100.0)
            
            # 4. Road accessibility
            access_score = s.road_accessibility
            
            # 5. Medical proximity score (under 2km is ideal)
            med_score = max(0.0, (1.0 - (s.medical_distance / 10.0)) * 100.0)

            # Multi-criteria weighted suitability formula:
            # Safety: 30%, Proximity: 25%, Available Capacity: 20%, Road Access: 15%, Medical: 10%
            suitability = (
                (safety_score * 0.30) +
                (dist_score * 0.25) +
                (cap_score * 0.20) +
                (access_score * 0.15) +
                (med_score * 0.10)
            )
            suitability_score = round(max(5.0, min(99.0, suitability)), 1)

            # Safety tier label
            if s.hazard_risk <= 12.0:
                safety_rating = "Excellent (Low Risk Zone)"
            elif s.hazard_risk <= 20.0:
                safety_rating = "High Safety (Elevated Masonry)"
            else:
                safety_rating = "Moderate Safety"

            # Formulate explainable reason
            reasons = []
            if available_cap >= affected_population:
                reasons.append(f"can accommodate entire target population ({available_cap} seats available)")
            else:
                reasons.append(f"partial capacity available ({available_cap} seats)")

            reasons.append(f"{dist_km} km distance (~{int(travel_time_min)} min transit)")
            if s.medical_distance <= 2.0:
                reasons.append(f"rapid medical link ({s.medical_distance} km to hospital)")

            reason_str = f"Ranked with {suitability_score}% suitability: " + ", ".join(reasons) + "."

            scored_shelters.append({
                "shelter": s,
                "available_cap": available_cap,
                "dist_km": dist_km,
                "travel_time_min": travel_time_min,
                "suitability_score": suitability_score,
                "safety_rating": safety_rating,
                "reason": reason_str
            })

        # Sort shelters by suitability score descending
        scored_shelters.sort(key=lambda x: x["suitability_score"], reverse=True)

        # Multi-shelter population distribution (Greedy / Knapsack allocation)
        distribution_plan = []
        remaining_to_allocate = affected_population
        total_allocated = 0
        is_overflow = False

        top_shelter = scored_shelters[0] if scored_shelters else None
        if top_shelter and top_shelter["available_cap"] < affected_population:
            is_overflow = True

        for idx, item in enumerate(scored_shelters):
            s = item["shelter"]
            avail = item["available_cap"]
            
            if remaining_to_allocate > 0 and avail > 0:
                allocated = min(remaining_to_allocate, avail)
                remaining_to_allocate -= allocated
                total_allocated += allocated
            else:
                allocated = 0

            rec_item = ShelterRecommendationItem(
                shelter_id=s.id,
                shelter_name=s.name,
                shelter_type=s.shelter_type,
                latitude=s.latitude,
                longitude=s.longitude,
                total_capacity=s.total_capacity,
                current_occupancy=s.current_occupancy,
                available_capacity=avail,
                distance_km=item["dist_km"],
                estimated_travel_time_min=item["travel_time_min"],
                suitability_score=item["suitability_score"],
                rank=idx + 1,
                safety_rating=item["safety_rating"],
                allocated_population=allocated,
                reason=item["reason"]
            )
            distribution_plan.append(rec_item)

        # Primary recommendation
        primary_rec = distribution_plan[0] if distribution_plan else None

        # Build decision summary
        if is_overflow:
            active_allocations = [f"{p.shelter_name} ({p.allocated_population} people)" for p in distribution_plan if p.allocated_population > 0]
            decision_summary = (
                f"OVERFLOW DETECTED: Total affected population of {affected_population:,} exceeds single-shelter available capacity. "
                f"Automated Multi-Shelter Knapsack Protocol has partitioned the population across {len(active_allocations)} designated relief centers: "
                + ", ".join(active_allocations) + "."
            )
        else:
            decision_summary = (
                f"Single-shelter relocation feasible: {primary_rec.shelter_name} possesses sufficient carrying capacity "
                f"({primary_rec.available_capacity:,} available) to safely accommodate all {affected_population:,} individuals."
            )

        return ShelterAllocationResponse(
            habitation_id=habitation.id,
            habitation_name=habitation.name,
            affected_population=affected_population,
            is_overflow=is_overflow,
            total_allocated=total_allocated,
            unallocated_count=max(0, remaining_to_allocate),
            primary_recommendation=primary_rec,
            distribution_plan=distribution_plan,
            decision_summary=decision_summary
        )

shelter_service = ShelterService()
