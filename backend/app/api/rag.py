from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Dict, Any
from app.schemas.rag import ChatRequest, ChatResponse, DocumentUploadResponse
from app.services.rag_service import rag_service

router = APIRouter(prefix="/rag", tags=["SURAKSHA ASSIST RAG"])

@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(request: ChatRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    return rag_service.query_assistant(request.query)

@router.get("/documents")
def get_indexed_documents():
    return {
        "total_documents": len(rag_service.documents),
        "total_chunks": len(rag_service.chunks),
        "documents": [
            {
                "id": doc["id"],
                "title": doc["title"],
                "category": doc["category"],
                "snippet": doc["content"][:150] + "...",
                "is_demo": True
            }
            for doc in rag_service.documents
        ]
    }

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(None),
    category: str = Form("Operational SOP")
):
    try:
        content_bytes = await file.read()
        content = content_bytes.decode("utf-8", errors="ignore")
        doc_title = title or file.filename.replace(".txt", "").replace(".md", "").title()
        
        chunks_added = rag_service.add_custom_document(doc_title, category, content)

        return DocumentUploadResponse(
            id=len(rag_service.documents),
            title=doc_title,
            category=category,
            chunks_created=chunks_added,
            status="SUCCESS - INGESTED & INDEXED"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")
