from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from datetime import datetime
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(100), default="NDMA Protocol")  # SOP, Guideline, Evacuation Protocol, Medical Triage
    source = Column(String(200), default="National Disaster Management Authority")
    created_at = Column(DateTime, default=datetime.utcnow)
    is_demo = Column(String(10), default="YES")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, index=True)
    document_title = Column(String(200))
    category = Column(String(100))
    chunk_index = Column(Integer, default=0)
    content = Column(Text, nullable=False)
    keywords = Column(JSON, default=[])
