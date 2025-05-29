import logging
from typing import List, Dict, Any
import os

try:
    import openai
except ImportError:
    openai = None
    logging.error("openai package not installed. Please install openai to use the Vectorizer.")

class FeatureExtractor:
    """
    Extracts features from email or imported data for vectorization.
    """
    def extract_text(self, data: Dict[str, Any]) -> str:
        """
        Concatenate subject and snippet for embedding.
        """
        subject = data.get("subject", "")
        snippet = data.get("snippet", "")
        return f"{subject} {snippet}".strip()

class Vectorizer:
    """
    Vectorizes text data using OpenAI ada-002 embeddings (1536-dim). This is the only supported option.
    """
    def __init__(self, model_name: str = "text-embedding-ada-002"):
        if not openai:
            raise ImportError("openai package not installed. Please install openai to use the Vectorizer.")
        self.model_name = model_name
        openai.api_key = os.getenv("OPENAI_API_KEY")
        if not openai.api_key:
            raise EnvironmentError("OPENAI_API_KEY not set in environment.")

    def vectorize(self, texts: List[str]) -> List[List[float]]:
        """
        Vectorize a list of texts into 1536-dim OpenAI ada-002 embeddings.
        """
        try:
            response = openai.embeddings.create(
                input=texts,
                model=self.model_name
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            logging.error(f"OpenAI embedding error: {e}")
            raise 