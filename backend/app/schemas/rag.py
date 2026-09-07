from pydantic import BaseModel
from typing import List, Optional

class SourceCitation(BaseModel):
    document_id: int
    document_title: str
    category: str
    snippet: str
    relevance_score: float

class ChatRequest(BaseModel):
    query: str
    conversation_history: Optional[List[dict]] = []

class ChatResponse(BaseModel):
    query: str
    answer: str
    sources: List[SourceCitation]
    confidence_level: str  # High, Moderate, Low, Unsupported
    is_knowledge_base_supported: bool
    disclaimer: str

class DocumentUploadResponse(BaseModel):
    id: int
    title: str
    category: str
    chunks_created: int
    status: str
