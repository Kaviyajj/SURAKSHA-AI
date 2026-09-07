from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.habitation import Habitation
from app.models.shelter import Shelter
from app.models.road import RoadSegment
from app.schemas.reports import GenerateReportRequest, ReportResponse
from app.services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Reports & Action Plans"])

@router.post("/generate", response_model=ReportResponse)
def generate_authority_report(request: GenerateReportRequest, db: Session = Depends(get_db)):
    habitations = db.query(Habitation).all()
    shelters = db.query(Shelter).all()
    roads = db.query(RoadSegment).all()

    return report_service.generate_response_plan(
        request=request,
        habitations=habitations,
        shelters=shelters,
        roads=roads
    )

@router.get("/latest", response_model=ReportResponse)
def get_latest_report(db: Session = Depends(get_db)):
    habitations = db.query(Habitation).all()
    shelters = db.query(Shelter).all()
    roads = db.query(RoadSegment).all()

    default_req = GenerateReportRequest()
    return report_service.generate_response_plan(
        request=default_req,
        habitations=habitations,
        shelters=shelters,
        roads=roads
    )
