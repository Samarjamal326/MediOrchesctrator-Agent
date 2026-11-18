"""
ChromaDB Vector Store wrapper for MediOrchestrator clinical domains.
Persists to local directory: backend/rag/chroma_db/
"""
import os
from typing import List, Dict, Any, Optional

CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")

class ChromaVectorStore:
    def __init__(self, persist_directory: str = CHROMA_PERSIST_DIR):
        self.persist_directory = persist_directory
        self._client = None

    def get_client(self):
        if self._client is None:
            import chromadb
            from chromadb.config import Settings
            os.makedirs(self.persist_directory, exist_ok=True)
            self._client = chromadb.PersistentClient(
                path=self.persist_directory,
                settings=Settings(anonymized_telemetry=False)
            )
        return self._client

    def get_or_create_collection(self, collection_name: str = "clinical_knowledge"):
        client = self.get_client()
        return client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}
        )

    def add_texts(
        self,
        texts: List[str],
        metadatas: Optional[List[Dict[str, Any]]] = None,
        ids: Optional[List[str]] = None,
        collection_name: str = "clinical_knowledge"
    ):
        if not texts:
            return
        from rag.embeddings import local_embeddings
        collection = self.get_or_create_collection(collection_name)
        
        # Compute embeddings locally via sentence-transformers
        embeddings = local_embeddings.embed_documents(texts)
        
        # Batch insert into Chroma (max 500 at a time)
        batch_size = 500
        for i in range(0, len(texts), batch_size):
            end_idx = min(i + batch_size, len(texts))
            batch_texts = texts[i:end_idx]
            batch_embeddings = embeddings[i:end_idx]
            batch_metadatas = metadatas[i:end_idx] if metadatas else None
            batch_ids = ids[i:end_idx] if ids else [f"doc_{j}" for j in range(i, end_idx)]
            
            collection.upsert(
                documents=batch_texts,
                embeddings=batch_embeddings,
                metadatas=batch_metadatas,
                ids=batch_ids
            )

    def similarity_search(
        self,
        query: str,
        k: int = 4,
        collection_name: str = "clinical_knowledge",
        where: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        from rag.embeddings import local_embeddings
        collection = self.get_or_create_collection(collection_name)
        
        query_embedding = local_embeddings.embed_query(query)
        kwargs: Dict[str, Any] = {
            "query_embeddings": [query_embedding],
            "n_results": k,
        }
        if where:
            kwargs["where"] = where
            
        results = collection.query(**kwargs)
        
        hits = []
        if results and "documents" in results and results["documents"]:
            docs = results["documents"][0]
            metas = results.get("metadatas", [[]])[0] if results.get("metadatas") else [{}] * len(docs)
            dists = results.get("distances", [[]])[0] if results.get("distances") else [0.0] * len(docs)
            
            for doc, meta, dist in zip(docs, metas, dists):
                hits.append({
                    "content": doc,
                    "metadata": meta,
                    "score": round(1.0 - dist, 4) if dist is not None else 1.0
                })
        return hits

vector_store = ChromaVectorStore()
