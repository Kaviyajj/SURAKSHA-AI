import math
from typing import Dict, Any, Tuple, List
from app.core.config import settings

class RiskEngine:
    def __init__(self):
        self.weights = settings.RISK_WEIGHTS

    def calculate_habitation_risk(
        self,
        rainfall: float,
        river_distance: float,
        elevation: float,
        slope: float,
        population: int,
        vulnerable_population: int,
        infrastructure_score: float,
        road_accessibility: float,
        historical_risk: float,
        hazard_type: str = "Flood",
        rainfall_modifier: float = 1.0,
        river_level_modifier: float = 0.0,
    ) -> Tuple[float, str, List[Dict[str, Any]], str]:
        """
        Calculates explainable composite risk score (0 to 100).
        Returns:
            (risk_score, risk_level, factor_contributions, explanation_text)
        """
        # Effective rainfall with modifier
        eff_rainfall = rainfall * rainfall_modifier
        
        # Effective river distance adjusted for rising river level
        # A 2m river rise expands the inundation footprint by ~100-250m
        effective_river_distance = max(10.0, river_distance - (river_level_modifier * 85.0))

        # 1. Rainfall Score (0-100) - 150mm+ is extreme
        if eff_rainfall <= 40:
            norm_rainfall = (eff_rainfall / 40.0) * 20.0
        elif eff_rainfall <= 100:
            norm_rainfall = 20.0 + ((eff_rainfall - 40.0) / 60.0) * 40.0
        elif eff_rainfall <= 160:
            norm_rainfall = 60.0 + ((eff_rainfall - 100.0) / 60.0) * 30.0
        else:
            norm_rainfall = min(100.0, 90.0 + ((eff_rainfall - 160.0) / 40.0) * 10.0)

        # 2. River Proximity Score (0-100) - Closer distance means higher risk
        if effective_river_distance <= 100:
            norm_river = 95.0 + max(0.0, (100 - effective_river_distance) / 100.0 * 5.0)
        elif effective_river_distance <= 300:
            norm_river = 75.0 + ((300.0 - effective_river_distance) / 200.0) * 20.0
        elif effective_river_distance <= 800:
            norm_river = 40.0 + ((800.0 - effective_river_distance) / 500.0) * 35.0
        elif effective_river_distance <= 2000:
            norm_river = 15.0 + ((2000.0 - effective_river_distance) / 1200.0) * 25.0
        else:
            norm_river = max(5.0, 15.0 - ((effective_river_distance - 2000.0) / 2000.0) * 10.0)

        # 3. Slope / Terrain Score (0-100)
        if hazard_type == "Landslide":
            # Steep slopes (>30 deg) severely escalate landslide hazard
            if slope > 35:
                norm_slope = min(100.0, 85.0 + (slope - 35.0) * 3.0)
            elif slope > 25:
                norm_slope = 60.0 + ((slope - 25.0) / 10.0) * 25.0
            elif slope > 15:
                norm_slope = 30.0 + ((slope - 15.0) / 10.0) * 30.0
            else:
                norm_slope = (slope / 15.0) * 30.0
        elif hazard_type == "Flood":
            # Flat lowlands (slope < 3 deg and low elevation) accumulate water
            if slope < 3.0:
                norm_slope = 85.0 + (3.0 - slope) * 5.0
            elif slope < 8.0:
                norm_slope = 50.0 + ((8.0 - slope) / 5.0) * 35.0
            else:
                norm_slope = max(10.0, 50.0 - ((slope - 8.0) / 15.0) * 40.0)
        else:  # Wildfire
            norm_slope = min(100.0, (slope / 40.0) * 70.0 + 20.0)

        # 4. Road Accessibility Score (0-100) - Inverted: Low accessibility = High vulnerability risk
        norm_road_vuln = max(0.0, min(100.0, 100.0 - road_accessibility))

        # 5. Infrastructure Score (0-100) - High score = weak infrastructure
        norm_infra = max(0.0, min(100.0, infrastructure_score))

        # 6. Vulnerable Population Ratio Score (0-100)
        vuln_ratio = (vulnerable_population / max(1, population)) * 100.0
        norm_vuln_pop = min(100.0, (vuln_ratio / 35.0) * 100.0)

        # 7. Historical Risk Score (0-100)
        norm_historical = max(0.0, min(100.0, historical_risk))

        # Weighted composite score
        w = self.weights
        composite = (
            (norm_rainfall * w.rainfall) +
            (norm_river * w.river_distance) +
            (norm_slope * w.slope_elevation) +
            (norm_road_vuln * w.road_accessibility) +
            (norm_infra * w.infrastructure_vulnerability) +
            (norm_vuln_pop * w.vulnerable_population) +
            (norm_historical * w.historical_risk)
        )

        risk_score = round(max(0.0, min(100.0, composite)), 1)

        # Tier classification
        if risk_score >= 81.0:
            risk_level = "Critical"
        elif risk_score >= 61.0:
            risk_level = "Very High"
        elif risk_score >= 41.0:
            risk_level = "High"
        elif risk_score >= 21.0:
            risk_level = "Moderate"
        else:
            risk_level = "Low"

        # Factor contributions breakdown
        def get_impact(score: float) -> str:
            if score >= 80: return "Critical"
            if score >= 60: return "High"
            if score >= 40: return "Medium"
            return "Low"

        factor_contributions = [
            {
                "name": "Rainfall Inundation / Intensity",
                "weight": w.rainfall,
                "raw_value": round(eff_rainfall, 1),
                "unit": "mm/24h",
                "normalized_score": round(norm_rainfall, 1),
                "impact_level": get_impact(norm_rainfall),
                "description": f"{round(eff_rainfall, 1)} mm rainfall recorded/simulated"
            },
            {
                "name": "River / Waterbody Proximity",
                "weight": w.river_distance,
                "raw_value": round(effective_river_distance, 1),
                "unit": "meters",
                "normalized_score": round(norm_river, 1),
                "impact_level": get_impact(norm_river),
                "description": f"Distance to primary water channel: {int(effective_river_distance)}m"
            },
            {
                "name": "Terrain & Slope Susceptibility",
                "weight": w.slope_elevation,
                "raw_value": round(slope, 1),
                "unit": "degrees",
                "normalized_score": round(norm_slope, 1),
                "impact_level": get_impact(norm_slope),
                "description": f"Slope angle: {round(slope, 1)}° at elevation {int(elevation)}m"
            },
            {
                "name": "Road Network Evacuation Isolation",
                "weight": w.road_accessibility,
                "raw_value": round(road_accessibility, 1),
                "unit": "% connectivity",
                "normalized_score": round(norm_road_vuln, 1),
                "impact_level": get_impact(norm_road_vuln),
                "description": f"Accessibility index: {round(road_accessibility, 1)}% ({'Constrained routes' if road_accessibility < 50 else 'Standard access'})"
            },
            {
                "name": "Infrastructure Weakness Index",
                "weight": w.infrastructure_vulnerability,
                "raw_value": round(infrastructure_score, 1),
                "unit": "index",
                "normalized_score": round(norm_infra, 1),
                "impact_level": get_impact(norm_infra),
                "description": f"Structural vulnerability score: {round(infrastructure_score, 1)}/100"
            },
            {
                "name": "Demographic Vulnerability (Elderly/Children)",
                "weight": w.vulnerable_population,
                "raw_value": round(vuln_ratio, 1),
                "unit": "%",
                "normalized_score": round(norm_vuln_pop, 1),
                "impact_level": get_impact(norm_vuln_pop),
                "description": f"{vulnerable_population} of {population} residents ({round(vuln_ratio, 1)}%) need assisted mobility"
            },
            {
                "name": "Historical Disaster Recurrence",
                "weight": w.historical_risk,
                "raw_value": round(historical_risk, 1),
                "unit": "index",
                "normalized_score": round(norm_historical, 1),
                "impact_level": get_impact(norm_historical),
                "description": f"Historical incidence index: {round(historical_risk, 1)}/100"
            }
        ]

        # Generate explainable diagnosis
        explanation = self._generate_explanation(
            hazard_type, risk_level, risk_score,
            eff_rainfall, effective_river_distance, slope, elevation,
            road_accessibility, vuln_ratio, infrastructure_score, historical_risk
        )

        return risk_score, risk_level, factor_contributions, explanation

    def _generate_explanation(
        self, hazard_type, risk_level, risk_score,
        rainfall, river_dist, slope, elevation,
        road_access, vuln_pct, infra_score, hist_risk
    ) -> str:
        reasons = []
        if rainfall > 130:
            reasons.append(f"severe precipitation ({int(rainfall)} mm) saturating catchment soil")
        elif rainfall > 90:
            reasons.append(f"sustained moderate-to-heavy rainfall ({int(rainfall)} mm)")

        if river_dist < 200:
            reasons.append(f"immediate proximity ({int(river_dist)}m) to active river channel with bank overflow risk")
        elif river_dist < 500:
            reasons.append(f"close proximity ({int(river_dist)}m) to primary drainage line")

        if hazard_type == "Landslide" and slope > 30:
            reasons.append(f"steep hillside slope ({round(slope, 1)}°) presenting acute shear failure danger")
        elif hazard_type == "Flood" and slope < 3.0:
            reasons.append(f"flat low-lying topography ({round(slope, 1)}° slope at {int(elevation)}m elevation) causing slow drainage runoff")

        if road_access < 40:
            reasons.append(f"severely constrained road access ({int(road_access)}% accessibility index) causing evacuation bottleneck")

        if vuln_pct > 24:
            reasons.append(f"high concentration of vulnerable residents ({round(vuln_pct, 1)}% elderly/children requiring priority assistance)")

        if infra_score > 70:
            reasons.append("high structural infrastructure vulnerability")

        if not reasons:
            reasons.append("favorable elevation, adequate drainage buffer, and robust road connectivity")

        summary = (
            f"{risk_level.upper()} RISK ALERT (Score: {risk_score}/100): "
            f"Vulnerability is primarily driven by {', and '.join(reasons)}. "
        )

        if risk_level in ["Critical", "Very High"]:
            summary += "Immediate pre-emptive relocation and deployment of specialized transport units are strongly advised."
        elif risk_level == "High":
            summary += "Enhanced monitoring and alert readiness for emergency evacuation corridors are recommended."
        else:
            summary += "Standard monitoring protocols are currently adequate."

        return summary

risk_engine = RiskEngine()
