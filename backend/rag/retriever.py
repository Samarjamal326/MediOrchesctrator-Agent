"""
RAG Retriever module for retrieving domain-specific clinical and nutritional contexts.
"""
from typing import List, Dict, Any, Optional
from rag.vector_store import vector_store

class ClinicalRetriever:
    def __init__(self, top_k: int = 4):
        self.top_k = top_k

    def retrieve(
        self,
        query: str,
        domain: Optional[str] = None,
        top_k: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        k = top_k or self.top_k
        where_filter = None
        if domain:
            where_filter = {"domain": domain}
            
        try:
            return vector_store.similarity_search(
                query=query,
                k=k,
                collection_name="clinical_knowledge",
                where=where_filter
            )
        except Exception as e:
            # Graceful fallback: return empty list on any RAG error so the LLM pipeline is never broken
            print(f"[RAG Retriever Warning] Similarity search failed: {e}")
            return []

    def format_for_prompt(self, hits: List[Dict[str, Any]]) -> str:
        if not hits:
            return ""
        sections = []
        for i, h in enumerate(hits, 1):
            src = h.get("metadata", {}).get("source", "Clinical Knowledge Base")
            item_name = h.get("metadata", {}).get("item_name", "")
            header = f"[Source {i}: {src}" + (f" - {item_name}]" if item_name else "]")
            sections.append(f"{header}\n{h['content']}")
        return "\n\n".join(sections)

clinical_retriever = ClinicalRetriever()
