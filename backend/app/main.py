import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models.habitation import Habitation
from app.models.shelter import Shelter
from app.models.road import RoadSegment
from app.data.seed_data import HABITATIONS_DATA, SHELTERS_DATA, ROAD_SEGMENTS_DATA
from app.services.risk_engine import risk_engine
from app.services.rag_service import rag_service
from app.api import api_router

def seed_database_if_empty():
    """Initializes and seeds database with realistic demo data on first launch."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if habitations exist
        if db.query(Habitation).count() == 0:
            print("[SEED] Seeding 50 Monitored Habitations...")
            for item in HABITATIONS_DATA:
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
            db.commit()
            print("[SUCCESS] 50 Habitations seeded and risk scores precomputed.")

        if db.query(Shelter).count() == 0:
            print("[SEED] Seeding 10 Designated Shelters...")
            for s_data in SHELTERS_DATA:
                shelter = Shelter(
                    id=s_data["id"],
                    name=s_data["name"],
                    shelter_type=s_data["shelter_type"],
                    latitude=s_data["latitude"],
                    longitude=s_data["longitude"],
                    total_capacity=s_data["total_capacity"],
                    current_occupancy=s_data["current_occupancy"],
                    hazard_risk=s_data["hazard_risk"],
                    road_accessibility=s_data["road_accessibility"],
                    medical_distance=s_data["medical_distance"],
                    has_generator=s_data["has_generator"],
                    has_water_filtration=s_data["has_water_filtration"],
                    has_medical_staff=s_data["has_medical_staff"],
                    is_active=s_data["is_active"]
                )
                db.add(shelter)
            db.commit()
            print("[SUCCESS] 10 Shelters seeded.")

        if db.query(RoadSegment).count() == 0:
            print("[SEED] Seeding Road Network segments...")
            for r_data in ROAD_SEGMENTS_DATA:
                road = RoadSegment(
                    id=r_data["id"],
                    name=r_data["name"],
                    road_type=r_data["road_type"],
                    start_node=r_data["start_node"],
                    end_node=r_data["end_node"],
                    geometry=r_data["geometry"],
                    length_km=r_data["length_km"],
                    base_speed_kmh=r_data["base_speed_kmh"],
                    is_blocked=r_data["is_blocked"],
                    blockage_reason=r_data["blockage_reason"],
                    road_condition=r_data["road_condition"]
                )
                db.add(road)
            db.commit()
            print("[SUCCESS] Road Network segments seeded.")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB & Seed
    seed_database_if_empty()
    
    # Initialize RAG Knowledge Base
    kb_dir = os.path.join(os.path.dirname(__file__), "data", "kb_docs")
    rag_service.initialize_kb(kb_dir)
    print(f"[RAG] SURAKSHA ASSIST RAG Initialized with {len(rag_service.documents)} documents ({len(rag_service.chunks)} chunks).")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan
)

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "system": "SURAKSHA-AI Disaster Intelligence & Emergency Relocation API",
        "status": "ONLINE",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "demo_mode": "ACTIVE (SIMULATED DATA)"
    }
