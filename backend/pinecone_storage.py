import logging
from typing import List, Dict, Any
from pinecone import Pinecone, PineconeException
from vector_base import BaseVectorDB

class PineconeStorage(BaseVectorDB):
    """
    Pinecone implementation of the BaseVectorDB for vector storage and similarity search.
    """
    def __init__(self, api_key: str, index_name: str):
        self.api_key = api_key
        self.index_name = index_name
        try:
            self.pc = Pinecone(api_key=api_key)
            self.index = self.pc.Index(index_name)
            logging.info(f"Connected to Pinecone index: {index_name}")
        except PineconeException as e:
            logging.error(f"Failed to initialize Pinecone: {e}")
            raise

    def insert_vectors(self, vectors: List[List[float]], ids: List[str], metadata: List[Dict[str, Any]], namespace: str) -> None:
        """
        Insert vectors into Pinecone index with metadata.
        """
        try:
            items = [(id_, vec, meta) for id_, vec, meta in zip(ids, vectors, metadata)]
            self.index.upsert(vectors=items, namespace=namespace)
            logging.info(f"Inserted {len(vectors)} vectors into namespace '{namespace}'")
        except PineconeException as e:
            logging.error(f"Error inserting vectors: {e}")
            raise

    def query_vectors(self, vector: List[float], top_k: int, namespace: str) -> List[Dict[str, Any]]:
        """
        Query Pinecone for top_k most similar vectors.
        """
        try:
            response = self.index.query(vector=vector, top_k=top_k, include_values=True, include_metadata=True, namespace=namespace)
            return [
                {"id": match["id"], "values": match["values"], "metadata": match.get("metadata", {})}
                for match in response["matches"]
            ]
        except PineconeException as e:
            logging.error(f"Error querying vectors: {e}")
            raise

    def fetch_all(self, namespace: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Fetch up to `limit` records from Pinecone index.
        """
        try:
            dummy_vector = [0.0] * 1536  # For ada-002
            response = self.index.query(vector=dummy_vector, top_k=limit, include_values=True, include_metadata=True, namespace=namespace)
            return [
                {"id": match["id"], "values": match["values"], "metadata": match.get("metadata", {})}
                for match in response["matches"]
            ]
        except PineconeException as e:
            logging.error(f"Error fetching records: {e}")
            raise 