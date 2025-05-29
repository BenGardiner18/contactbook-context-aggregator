import os
import logging
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from src.storage.pinecone_storage import PineconeStorage
from src.vectorization.vectorization import Vectorizer, FeatureExtractor

# Load environment variables
load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX = os.getenv("PINECONE_INDEX", "index")
PINECONE_NAMESPACE = os.getenv("PINECONE_NAMESPACE", "emails")

logging.basicConfig(level=logging.INFO)

app = FastAPI()

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AuthResponse(BaseModel):
    token: str

@app.post("/auth", response_model=AuthResponse)
def auth():
    """
    Basic authentication endpoint. Returns a static token for now.
    """
    return AuthResponse(token="test-token-123")

class SimilarityRequest(BaseModel):
    query: str
    top_k: int = 5

class SimilarityResult(BaseModel):
    id: str
    score: float = 0.0
    metadata: Dict[str, Any] = {}

@app.post("/similarity-search", response_model=List[SimilarityResult])
def similarity_search(request: SimilarityRequest):
    """
    Given a query string, return top-k most similar items from Pinecone.
    """
    if not PINECONE_API_KEY:
        logging.error("PINECONE_API_KEY not set in environment.")
        raise HTTPException(status_code=500, detail="Pinecone API key not set.")
    try:
        storage = PineconeStorage(api_key=PINECONE_API_KEY, index_name=PINECONE_INDEX)
        vectorizer = Vectorizer()
        feat_extractor = FeatureExtractor()
        query_vec = vectorizer.vectorize([request.query])[0]
        results = storage.query_vectors(query_vec, top_k=request.top_k, namespace=PINECONE_NAMESPACE)
        # Add a dummy score if not present
        for r in results:
            if "score" not in r:
                r["score"] = 0.0
        return [SimilarityResult(id=r["id"], score=r.get("score", 0.0), metadata=r.get("metadata", {})) for r in results]
    except Exception as e:
        logging.error(f"Similarity search error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 