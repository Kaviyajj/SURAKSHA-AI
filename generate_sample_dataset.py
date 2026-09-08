#!/usr/bin/env python3
"""
SURAKSHA-AI Sample Dataset Generator & Exporter Utility
======================================================
This tool generates, exports, and seeds realistic multi-hazard disaster intelligence
datasets (habitations, emergency shelters, road segments, and hazard geometries).

Usage:
  python generate_sample_dataset.py --export
  python generate_sample_dataset.py --generate --count 100
  python generate_sample_dataset.py --seed-db
  python generate_sample_dataset.py --summary
"""

import os
import sys
import json
import csv
import random
import argparse
from typing import List, Dict, Any

# Add backend to sys.path so we can import app modules directly
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(CURRENT_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.data.seed_data import HABITATIONS_DATA, SHELTERS_DATA, ROAD_SEGMENTS_DATA, RIVERS_GEOJSON
from app.services.risk_engine import risk_engine
from app.core.database import engine, Base, SessionLocal
from app.models.habitation import Habitation
from app.models.shelter import Shelter
from app.models.road import RoadSegment

DATASET_OUT_DIR = os.path.join(CURRENT_DIR, "sample_dataset")


def export_sample_dataset(output_dir: str = DATASET_OUT_DIR):
    """Exports active seed dataset to CSV, JSON, and GeoJSON files."""
    os.makedirs(output_dir, exist_ok=True)
    print(f"\n[EXPORT] Exporting sample dataset to: {output_dir}")

    # 1. Habitations CSV
    hab_csv_path = os.path.join(output_dir, "habitations.csv")
    if HABITATIONS_DATA:
        fieldnames = [
            "id", "name", "district", "latitude", "longitude",
            "population", "vulnerable_population", "elderly_count", "children_count", "disabled_count",
            "rainfall", "elevation", "slope", "river_distance",
            "infrastructure_score", "road_accessibility", "distance_to_medical",
            "historical_risk", "hazard_type", "risk_score", "risk_level"
        ]
        with open(hab_csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for h in HABITATIONS_DATA:
                score, level, _, _ = risk_engine.calculate_habitation_risk(
                    rainfall=h["rainfall"],
                    river_distance=h["river_distance"],
                    elevation=h["elevation"],
                    slope=h["slope"],
                    population=h["population"],
                    vulnerable_population=h["vulnerable_population"],
                    infrastructure_score=h["infrastructure_score"],
                    road_accessibility=h["road_accessibility"],
                    historical_risk=h["historical_risk"],
                    hazard_type=h["hazard_type"]
                )
                row = {k: h.get(k, "") for k in fieldnames}
                row["risk_score"] = score
                row["risk_level"] = level
                writer.writerow(row)
        print(f"  -> Exported {len(HABITATIONS_DATA)} Habitations to {hab_csv_path}")

    # 2. Shelters CSV
    shelter_csv_path = os.path.join(output_dir, "shelters.csv")
    if SHELTERS_DATA:
        shelter_fields = [
            "id", "name", "shelter_type", "latitude", "longitude",
            "total_capacity", "current_occupancy", "hazard_risk", "road_accessibility",
            "medical_distance", "has_generator", "has_water_filtration", "has_medical_staff", "is_active"
        ]
        with open(shelter_csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=shelter_fields)
            writer.writeheader()
            for s in SHELTERS_DATA:
                row = {k: s.get(k, "") for k in shelter_fields}
                writer.writerow(row)
        print(f"  -> Exported {len(SHELTERS_DATA)} Shelters to {shelter_csv_path}")

    # 3. Road Network CSV
    roads_csv_path = os.path.join(output_dir, "road_network.csv")
    if ROAD_SEGMENTS_DATA:
        road_fields = [
            "id", "name", "road_type", "start_node", "end_node",
            "length_km", "base_speed_kmh", "is_blocked", "blockage_reason", "road_condition"
        ]
        with open(roads_csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=road_fields)
            writer.writeheader()
            for r in ROAD_SEGMENTS_DATA:
                row = {k: r.get(k, "") for k in road_fields}
                writer.writerow(row)
        print(f"  -> Exported {len(ROAD_SEGMENTS_DATA)} Road Segments to {roads_csv_path}")

    # 4. Structured JSON files
    hab_json_path = os.path.join(output_dir, "habitations.json")
    with open(hab_json_path, "w", encoding="utf-8") as f:
        json.dump(HABITATIONS_DATA, f, indent=2)
    print(f"  -> Exported Habitations JSON to {hab_json_path}")

    shelters_json_path = os.path.join(output_dir, "shelters.json")
    with open(shelters_json_path, "w", encoding="utf-8") as f:
        json.dump(SHELTERS_DATA, f, indent=2)
    print(f"  -> Exported Shelters JSON to {shelters_json_path}")

    roads_json_path = os.path.join(output_dir, "road_network.json")
    with open(roads_json_path, "w", encoding="utf-8") as f:
        json.dump(ROAD_SEGMENTS_DATA, f, indent=2)
    print(f"  -> Exported Road Segments JSON to {roads_json_path}")

    rivers_json_path = os.path.join(output_dir, "rivers_basin.geojson")
    with open(rivers_json_path, "w", encoding="utf-8") as f:
        json.dump(RIVERS_GEOJSON, f, indent=2)
    print(f"  -> Exported River Basins GeoJSON to {rivers_json_path}")

    # 5. Metadata Manifest & Summary
    summary = generate_summary(HABITATIONS_DATA, SHELTERS_DATA, ROAD_SEGMENTS_DATA)
    manifest_path = os.path.join(output_dir, "sample_dataset_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
    print(f"  -> Exported Dataset Manifest to {manifest_path}")

    # 6. Markdown Readme
    summary_md_path = os.path.join(output_dir, "DATASET_SUMMARY.md")
    with open(summary_md_path, "w", encoding="utf-8") as f:
        f.write(render_markdown_summary(summary))
    print(f"  -> Exported Dataset Documentation to {summary_md_path}")
    print("\n[SUCCESS] Sample dataset exported successfully!")


def generate_synthetic_dataset(count: int = 60, seed: int = 42) -> List[Dict[str, Any]]:
    """Generates synthetic habitations with realistic disaster attributes."""
    random.seed(seed)
    districts = [
        "Nilgiri Basin - Lowland Sector",
        "Bhavani Plains",
        "Kotagiri Foothills",
        "Pillur Catchment Corridor",
        "Upper Bhavani Valley",
        "Avalanche Ridge - Western Ghats",
        "Coonoor Slope Sector",
        "Mudumalai Forest Buffer",
        "Gudalur High Range"
    ]
    hazard_types = ["Flood", "Landslide", "Wildfire"]
    name_prefixes = [
        "Kaveri", "Bhavani", "Mettupalayam", "Sirumugai", "Jadayampalayam",
        "Thekkampatti", "Ooty", "Kotagiri", "Coonoor", "Pykara", "Avalanche",
        "Gudalur", "Devala", "Cherambadi", "Manjoor", "Kethi", "Aruvankadu",
        "Wellington", "Hubbathalai", "Kodanad", "Nelliyalam", "Sholur"
    ]
    name_suffixes = [
        "Nagar", "Colony", "Ward", "Giri", "Puram", "Valley", "Ridge",
        "Heights", "Pudur", "Palayam", "Hamlet", "Basin", "Terrace", "Camp"
    ]

    generated_habitations = []
    for i in range(1, count + 1):
        hazard = random.choices(hazard_types, weights=[0.45, 0.35, 0.20])[0]
        prefix = random.choice(name_prefixes)
        suffix = random.choice(name_suffixes)
        name = f"{prefix} {suffix} #{i}"

        # Lat / Lon around Nilgiris (11.30 to 11.60 Lat, 76.60 to 77.05 Lon)
        lat = round(random.uniform(11.3200, 11.5800), 4)
        lon = round(random.uniform(76.6200, 77.0200), 4)

        population = random.randint(800, 5500)
        vulnerable_ratio = random.uniform(0.18, 0.35)
        vulnerable_pop = int(population * vulnerable_ratio)
        elderly = int(vulnerable_pop * random.uniform(0.35, 0.45))
        children = int(vulnerable_pop * random.uniform(0.40, 0.50))
        disabled = max(10, vulnerable_pop - (elderly + children))

        if hazard == "Flood":
            rainfall = round(random.uniform(90.0, 195.0), 1)
            elevation = round(random.uniform(220.0, 480.0), 1)
            slope = round(random.uniform(1.2, 5.5), 1)
            river_dist = round(random.uniform(50.0, 650.0), 1)
            infra_score = round(random.uniform(55.0, 92.0), 1)
            road_access = round(random.uniform(20.0, 65.0), 1)
            hist_risk = round(random.uniform(65.0, 95.0), 1)
        elif hazard == "Landslide":
            rainfall = round(random.uniform(80.0, 185.0), 1)
            elevation = round(random.uniform(1200.0, 2200.0), 1)
            slope = round(random.uniform(22.0, 42.0), 1)
            river_dist = round(random.uniform(300.0, 1500.0), 1)
            infra_score = round(random.uniform(60.0, 90.0), 1)
            road_access = round(random.uniform(15.0, 50.0), 1)
            hist_risk = round(random.uniform(60.0, 96.0), 1)
        else:  # Wildfire
            rainfall = round(random.uniform(20.0, 55.0), 1)
            elevation = round(random.uniform(600.0, 1400.0), 1)
            slope = round(random.uniform(12.0, 32.0), 1)
            river_dist = round(random.uniform(800.0, 2500.0), 1)
            infra_score = round(random.uniform(45.0, 78.0), 1)
            road_access = round(random.uniform(25.0, 60.0), 1)
            hist_risk = round(random.uniform(45.0, 80.0), 1)

        distance_to_med = round(random.uniform(2.5, 16.0), 1)
        district = random.choice(districts)

        score, level, factors, expl = risk_engine.calculate_habitation_risk(
            rainfall=rainfall,
            river_distance=river_dist,
            elevation=elevation,
            slope=slope,
            population=population,
            vulnerable_population=vulnerable_pop,
            infrastructure_score=infra_score,
            road_accessibility=road_access,
            historical_risk=hist_risk,
            hazard_type=hazard
        )

        generated_habitations.append({
            "id": i,
            "name": name,
            "district": district,
            "latitude": lat,
            "longitude": lon,
            "population": population,
            "vulnerable_population": vulnerable_pop,
            "elderly_count": elderly,
            "children_count": children,
            "disabled_count": disabled,
            "rainfall": rainfall,
            "elevation": elevation,
            "slope": slope,
            "river_distance": river_dist,
            "infrastructure_score": infra_score,
            "road_accessibility": road_access,
            "distance_to_medical": distance_to_med,
            "historical_risk": hist_risk,
            "hazard_type": hazard,
            "risk_score": score,
            "risk_level": level,
            "risk_factors": factors,
            "explanation": expl
        })

    return generated_habitations


def seed_database(habitations=None, shelters=None, roads=None):
    """Seeds the SQLite database with given data."""
    habs_to_seed = habitations if habitations is not None else HABITATIONS_DATA
    shelters_to_seed = shelters if shelters is not None else SHELTERS_DATA
    roads_to_seed = roads if roads is not None else ROAD_SEGMENTS_DATA

    print(f"\n[SEED] Initializing and populating SQLite database with sample data...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Clear existing tables to ensure clean seed
        db.query(Habitation).delete()
        db.query(Shelter).delete()
        db.query(RoadSegment).delete()
        db.commit()

        # Seed Habitations
        for item in habs_to_seed:
            score, level, factors, expl = risk_engine.calculate_habitation_risk(
                rainfall=item["rainfall"],
                river_distance=item["river_distance"],
                elevation=item["elevation"],
                slope=item["slope"],
                population=item["population"],
                vulnerable_population=item["vulnerable_population"],
                infrastructure_score=item["infrastructure_score"],
                road_accessibility=item["road_accessibility"],
                historical_risk=item["historical_risk"],
                hazard_type=item["hazard_type"]
            )
            hab = Habitation(
                id=item["id"],
                name=item["name"],
                district=item["district"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                population=item["population"],
                vulnerable_population=item["vulnerable_population"],
                elderly_count=item["elderly_count"],
                children_count=item["children_count"],
                disabled_count=item["disabled_count"],
                rainfall=item["rainfall"],
                elevation=item["elevation"],
                slope=item["slope"],
                river_distance=item["river_distance"],
                infrastructure_score=item["infrastructure_score"],
                road_accessibility=item["road_accessibility"],
                distance_to_medical=item["distance_to_medical"],
                historical_risk=item["historical_risk"],
                hazard_type=item["hazard_type"],
                risk_score=score,
                risk_level=level,
                risk_factors=factors,
                explanation=expl
            )
            db.add(hab)

        # Seed Shelters
        for s in shelters_to_seed:
            shelter = Shelter(
                id=s["id"],
                name=s["name"],
                shelter_type=s["shelter_type"],
                latitude=s["latitude"],
                longitude=s["longitude"],
                total_capacity=s["total_capacity"],
                current_occupancy=s["current_occupancy"],
                hazard_risk=s["hazard_risk"],
                road_accessibility=s["road_accessibility"],
                medical_distance=s["medical_distance"],
                has_generator=s["has_generator"],
                has_water_filtration=s["has_water_filtration"],
                has_medical_staff=s["has_medical_staff"],
                is_active=s["is_active"]
            )
            db.add(shelter)

        # Seed Roads
        for r in roads_to_seed:
            road = RoadSegment(
                id=r["id"],
                name=r["name"],
                road_type=r["road_type"],
                start_node=r["start_node"],
                end_node=r["end_node"],
                geometry=r["geometry"],
                length_km=r["length_km"],
                base_speed_kmh=r["base_speed_kmh"],
                is_blocked=r["is_blocked"],
                blockage_reason=r["blockage_reason"],
                road_condition=r["road_condition"]
            )
            db.add(road)

        db.commit()
        print(f"[SUCCESS] Seeded {len(habs_to_seed)} Habitations, {len(shelters_to_seed)} Shelters, {len(roads_to_seed)} Roads!")
    finally:
        db.close()


def generate_summary(habitations, shelters, roads) -> Dict[str, Any]:
    """Computes comprehensive metrics and breakdown of the dataset."""
    total_hab = len(habitations)
    total_pop = sum(h["population"] for h in habitations)
    total_vuln = sum(h["vulnerable_population"] for h in habitations)

    risk_counts = {"Critical": 0, "Very High": 0, "High": 0, "Moderate": 0, "Low": 0}
    hazard_counts = {}

    for h in habitations:
        score, level, _, _ = risk_engine.calculate_habitation_risk(
            rainfall=h["rainfall"],
            river_distance=h["river_distance"],
            elevation=h["elevation"],
            slope=h["slope"],
            population=h["population"],
            vulnerable_population=h["vulnerable_population"],
            infrastructure_score=h["infrastructure_score"],
            road_accessibility=h["road_accessibility"],
            historical_risk=h["historical_risk"],
            hazard_type=h["hazard_type"]
        )
        risk_counts[level] = risk_counts.get(level, 0) + 1
        htype = h["hazard_type"]
        hazard_counts[htype] = hazard_counts.get(htype, 0) + 1

    total_shelter_cap = sum(s["total_capacity"] for s in shelters)
    total_shelter_occ = sum(s["current_occupancy"] for s in shelters)
    blocked_roads = sum(1 for r in roads if r.get("is_blocked", False))

    return {
        "dataset_name": "SURAKSHA-AI Disaster Intelligence Demo & Simulation Benchmark",
        "region": "Nilgiri-Bhavani River Basin, Tamil Nadu / Western Ghats",
        "total_habitations": total_hab,
        "total_population": total_pop,
        "total_vulnerable_population": total_vuln,
        "vulnerability_ratio_pct": round((total_vuln / max(1, total_pop)) * 100, 1),
        "risk_classification": risk_counts,
        "hazard_breakdown": hazard_counts,
        "shelters": {
            "count": len(shelters),
            "total_capacity": total_shelter_cap,
            "current_occupancy": total_shelter_occ,
            "available_capacity": total_shelter_cap - total_shelter_occ,
            "occupancy_rate_pct": round((total_shelter_occ / max(1, total_shelter_cap)) * 100, 1)
        },
        "road_network": {
            "total_segments": len(roads),
            "blocked_segments": blocked_roads,
            "operational_segments": len(roads) - blocked_roads
        }
    }


def render_markdown_summary(summary: Dict[str, Any]) -> str:
    """Renders human-readable markdown documentation for the dataset."""
    return f"""# SURAKSHA-AI Sample Dataset Summary
**Region**: {summary['region']}
**Dataset**: {summary['dataset_name']}

---

## Key Metrics Overview
| Metric | Value |
|:-------|:------|
| **Total Monitored Habitations** | `{summary['total_habitations']}` |
| **Total Population Monitored** | `{summary['total_population']:,}` |
| **Total Vulnerable Population** | `{summary['total_vulnerable_population']:,}` ({summary['vulnerability_ratio_pct']}%) |
| **Designated Relief Shelters** | `{summary['shelters']['count']}` |
| **Total Shelter Capacity** | `{summary['shelters']['total_capacity']:,}` beds |
| **Available Shelter Capacity** | `{summary['shelters']['available_capacity']:,}` beds |
| **Current Shelter Occupancy** | `{summary['shelters']['occupancy_rate_pct']}%` |
| **Active Road Segments** | `{summary['road_network']['total_segments']}` ({summary['road_network']['blocked_segments']} blocked) |

---

## Habitation Risk Distribution
- **Critical Risk (Score 81-100)**: `{summary['risk_classification'].get('Critical', 0)}` habitations (Immediate evacuation mandated)
- **Very High Risk (Score 61-80)**: `{summary['risk_classification'].get('Very High', 0)}` habitations
- **High Risk (Score 41-60)**: `{summary['risk_classification'].get('High', 0)}` habitations
- **Moderate Risk (Score 21-40)**: `{summary['risk_classification'].get('Moderate', 0)}` habitations
- **Low Risk (Score 0-20)**: `{summary['risk_classification'].get('Low', 0)}` habitations

---

## Hazard Type Breakdown
{"".join(f"- **{k}**: `{v}` habitations\n" for k, v in summary['hazard_breakdown'].items())}

---

## Included Files in `sample_dataset/`
1. `habitations.csv` - Tabular export of all habitations with geo coordinates, demographics, weather metrics, and risk scores.
2. `shelters.csv` - Relief shelters, capacity, amenities (generators, water filtration, medical staff), and status.
3. `road_network.csv` - Road topology, speed limits, lengths, and blockage reasons.
4. `habitations.json` - Complete JSON object array.
5. `shelters.json` - Complete shelters JSON array.
6. `road_network.json` - Road segments JSON array with coordinates.
7. `rivers_basin.geojson` - GeoJSON FeatureCollection of river geometry.
8. `sample_dataset_manifest.json` - Machine-readable metrics manifest.
"""


def main():
    parser = argparse.ArgumentParser(description="SURAKSHA-AI Sample Dataset Generator & Exporter")
    parser.add_argument("--export", action="store_true", help="Export active sample dataset to CSV and JSON files")
    parser.add_argument("--generate", action="store_true", help="Generate expanded synthetic dataset")
    parser.add_argument("--count", type=int, default=50, help="Number of habitations to generate (default: 50)")
    parser.add_argument("--seed-db", action="store_true", help="Seed SQLite database with the dataset")
    parser.add_argument("--summary", action="store_true", help="Print summary of the sample dataset")
    args = parser.parse_args()

    # Default action if no flags provided: export + seed + print summary
    if not any([args.export, args.generate, args.seed_db, args.summary]):
        print("No specific arguments provided. Performing default workflow: Export, Seed DB, and Summary.")
        export_sample_dataset()
        seed_database()
        summary = generate_summary(HABITATIONS_DATA, SHELTERS_DATA, ROAD_SEGMENTS_DATA)
        print("\n" + render_markdown_summary(summary))
        return

    if args.generate:
        print(f"[GENERATE] Generating {args.count} synthetic habitations...")
        new_habs = generate_synthetic_dataset(count=args.count)
        if args.seed_db:
            seed_database(habitations=new_habs)
        export_sample_dataset()
        summary = generate_summary(new_habs, SHELTERS_DATA, ROAD_SEGMENTS_DATA)
        print("\n" + render_markdown_summary(summary))
        return

    if args.export:
        export_sample_dataset()

    if args.seed_db:
        seed_database()

    if args.summary:
        summary = generate_summary(HABITATIONS_DATA, SHELTERS_DATA, ROAD_SEGMENTS_DATA)
        print("\n" + render_markdown_summary(summary))


if __name__ == "__main__":
    main()
