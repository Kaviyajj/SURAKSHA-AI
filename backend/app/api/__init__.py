from fastapi import APIRouter
from app.api.dashboard import router as dashboard_router
from app.api.habitations import router as habitations_router
from app.api.shelters import router as shelters_router
from app.api.routing import router as routing_router
from app.api.simulation import router as simulation_router
from app.api.rag import router as rag_router
from app.api.hazards import router as hazards_router
from app.api.reports import router as reports_router

api_router = APIRouter()

api_router.include_router(dashboard_router)
api_router.include_router(habitations_router)
api_router.include_router(shelters_router)
api_router.include_router(routing_router)
api_router.include_router(simulation_router)
api_router.include_router(rag_router)
api_router.include_router(hazards_router)
api_router.include_router(reports_router)
