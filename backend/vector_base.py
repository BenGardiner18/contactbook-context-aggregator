from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseVectorDB(ABC):
    """
    Abstract base class for vector database operations.
    """

    @abstractmethod
    def insert_vectors(self, vectors: List[List[float]], ids: List[str], metadata: List[Dict[str, Any]], namespace: str) -> None:
        """
        Insert vectors into the vector database.
        """
        pass

    @abstractmethod
    def query_vectors(self, vector: List[float], top_k: int, namespace: str) -> List[Dict[str, Any]]:
        """
        Query the vector database for top_k most similar vectors.
        """
        pass

    @abstractmethod
    def fetch_all(self, namespace: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Fetch up to `limit` records from the vector database.
        """
        pass 