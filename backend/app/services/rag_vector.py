from typing import List, Dict, Any
import math

class RAGVectorGenomeIndexer:
    def __init__(self):
        self.embeddings_db: Dict[str, List[float]] = {}

    def generate_gene_embedding(self, text: str) -> List[float]:
        """Generates a normalized pseudo-embedding vector for semantic gene indexing."""
        hash_val = sum(ord(c) for c in text)
        vector = [math.sin(hash_val + i) for i in range(16)]
        norm = math.sqrt(sum(x * x for x in vector)) or 1.0
        return [round(x / norm, 4) for x in vector]

    def index_gene(self, gene_id: str, code_snippet: str):
        vec = self.generate_gene_embedding(code_snippet)
        self.embeddings_db[gene_id] = vec

    def search_similar(self, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        q_vec = self.generate_gene_embedding(query_text)
        results = []
        for gid, vec in self.embeddings_db.items():
            cosine_sim = sum(a * b for a, b in zip(q_vec, vec))
            results.append({"gene_id": gid, "similarity": round(cosine_sim, 4)})
        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:top_k]
