import os
import re
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.schemas.rag import ChatResponse, SourceCitation

class RAGService:
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self.chunks: List[Dict[str, Any]] = []
        self.vectorizer: TfidfVectorizer = None
        self.tfidf_matrix = None
        self.is_initialized = False

    def initialize_kb(self, kb_dir: str):
        """Loads and indexes knowledge base text files."""
        self.documents = []
        self.chunks = []

        if not os.path.exists(kb_dir):
            return

        doc_id = 1
        for fname in os.listdir(kb_dir):
            if fname.endswith(".txt") or fname.endswith(".md"):
                fpath = os.path.join(kb_dir, fname)
                with open(fpath, "r", encoding="utf-8") as f:
                    content = f.read()

                # Derive clean title from filename
                title = fname.replace("_", " ").replace(".txt", "").replace(".md", "").title()
                category = "NDMA Standard Protocol"
                if "landslide" in fname.lower():
                    category = "Geological & Hillside SOP"
                elif "triage" in fname.lower() or "vulnerable" in fname.lower():
                    category = "Vulnerability Triage Guideline"
                elif "relief" in fname.lower() or "shelter" in fname.lower():
                    category = "Camp Management & Carrying Capacity"

                self.documents.append({
                    "id": doc_id,
                    "title": title,
                    "category": category,
                    "content": content
                })

                # Chunk document by numbered sections / double newlines
                raw_chunks = [c.strip() for c in re.split(r'\n\s*\n|(?=\d+\.\s+[A-Z])', content) if len(c.strip()) > 40]
                for idx, c_text in enumerate(raw_chunks):
                    self.chunks.append({
                        "doc_id": doc_id,
                        "doc_title": title,
                        "category": category,
                        "chunk_index": idx,
                        "text": c_text
                    })
                doc_id += 1

        if self.chunks:
            self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
            corpus = [c["text"] for c in self.chunks]
            self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
            self.is_initialized = True

    def add_custom_document(self, title: str, category: str, content: str) -> int:
        """Adds a newly uploaded document to the in-memory RAG index."""
        doc_id = len(self.documents) + 1
        self.documents.append({
            "id": doc_id,
            "title": title,
            "category": category,
            "content": content
        })
        raw_chunks = [c.strip() for c in re.split(r'\n\s*\n|(?=\d+\.\s+[A-Z])', content) if len(c.strip()) > 40]
        chunks_added = 0
        for idx, c_text in enumerate(raw_chunks):
            self.chunks.append({
                "doc_id": doc_id,
                "doc_title": title,
                "category": category,
                "chunk_index": idx,
                "text": c_text
            })
            chunks_added += 1

        # Recompute vector index
        if self.chunks:
            self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
            corpus = [c["text"] for c in self.chunks]
            self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
            self.is_initialized = True

        return chunks_added

    def query_assistant(self, query: str) -> ChatResponse:
        """
        Retrieves matching chunks and synthesizes an authoritative answer with exact source citations.
        """
        if not self.is_initialized or not self.chunks:
            return ChatResponse(
                query=query,
                answer="I could not find sufficient information in the verified knowledge base. The knowledge base is currently empty or indexing.",
                sources=[],
                confidence_level="Unsupported",
                is_knowledge_base_supported=False,
                disclaimer="SURAKSHA ASSIST answers strictly based on verified NDMA documents."
            )

        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix)[0]

        # Top 3 matching chunks
        ranked_indices = similarities.argsort()[::-1]
        top_matches = []
        for idx in ranked_indices[:3]:
            score = float(similarities[idx])
            if score > 0.08:  # Minimum relevance threshold
                chunk = self.chunks[idx]
                top_matches.append((chunk, score))

        if not top_matches:
            return ChatResponse(
                query=query,
                answer="I could not find sufficient information in the verified knowledge base. As a safety guardrail, SURAKSHA-AI does not synthesize unverified disaster protocols or hallucinate official policies.",
                sources=[],
                confidence_level="Unsupported",
                is_knowledge_base_supported=False,
                disclaimer="Answers are derived strictly from indexed NDMA disaster manuals and standard operating procedures."
            )

        # Build citations
        sources: List[SourceCitation] = []
        for chunk, score in top_matches:
            sources.append(SourceCitation(
                document_id=chunk["doc_id"],
                document_title=chunk["doc_title"],
                category=chunk["category"],
                snippet=chunk["text"][:280] + ("..." if len(chunk["text"]) > 280 else ""),
                relevance_score=round(score * 100, 1)
            ))

        top_score = top_matches[0][1]
        if top_score >= 0.35:
            conf_level = "High"
        elif top_score >= 0.18:
            conf_level = "Moderate"
        else:
            conf_level = "Low"

        # Generate structured answer from retrieved context
        context_snippets = [f"[{m[0]['doc_title']} - {m[0]['category']}]:\n{m[0]['text']}" for m in top_matches]
        answer = self._synthesize_grounded_answer(query, context_snippets, top_matches[0][0])

        return ChatResponse(
            query=query,
            answer=answer,
            sources=sources,
            confidence_level=conf_level,
            is_knowledge_base_supported=True,
            disclaimer="Verified from National Disaster Management Authority (NDMA) Standard Operating Procedures."
        )

    def _synthesize_grounded_answer(self, query: str, context_snippets: List[str], primary_chunk: Dict[str, Any]) -> str:
        """Synthesizes structured response cleanly from verified context."""
        chunk_text = primary_chunk["text"]
        title = primary_chunk["doc_title"]

        return (
            f"Based on **{title}** ({primary_chunk['category']}):\n\n"
            f"{chunk_text}\n\n"
            f"**Operational Recommendation for Responders:**\n"
            f"• Follow official verification protocols before dispatching emergency convoys.\n"
            f"• Cross-reference live GIS road blockage status in the SURAKSHA-AI Command Center before initiating transit."
        )

rag_service = RAGService()
