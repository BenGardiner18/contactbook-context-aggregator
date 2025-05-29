import os
import logging
from typing import List, Dict, Any
import streamlit as st
import plotly.express as px
import numpy as np
from sklearn.decomposition import PCA
from dotenv import load_dotenv
from storage.pinecone_storage import PineconeStorage
from vectorization import Vectorizer, FeatureExtractor

logging.basicConfig(level=logging.INFO)

# Load environment variables
load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX = os.getenv("PINECONE_INDEX", "index")
PINECONE_NAMESPACE = os.getenv("PINECONE_NAMESPACE", "emails")

@st.cache_resource(show_spinner=False)
def get_pinecone_storage() -> PineconeStorage:
    """Initialize and cache PineconeStorage instance."""
    return PineconeStorage(api_key=PINECONE_API_KEY, index_name=PINECONE_INDEX)

@st.cache_data(show_spinner=False)
def fetch_email_vectors(storage: PineconeStorage, namespace: str) -> List[Dict[str, Any]]:
    """Fetch all email vectors and metadata from Pinecone."""
    try:
        return storage.fetch_all(namespace=namespace, limit=200)
    except Exception as e:
        logging.error(f"Error fetching vectors: {e}")
        return []

def reduce_dimensionality(vectors: List[List[float]], n_components: int = 2) -> np.ndarray:
    """Reduce vector dimensionality for visualization using PCA."""
    pca = PCA(n_components=n_components)
    return pca.fit_transform(np.array(vectors))

def main():
    st.title("📧 Email Embedding Visualizer")
    st.write("Visualize and explore your email embeddings from Pinecone.")

    storage = get_pinecone_storage()
    data = fetch_email_vectors(storage, PINECONE_NAMESPACE)

    if not data:
        st.warning("No email vectors found in Pinecone.")
        return

    vectors = [item["values"] for item in data]
    ids = [item["id"] for item in data]
    metadata = [item.get("metadata", {}) for item in data]
    categories = [meta.get("category", "unknown") for meta in metadata]
    subjects = [meta.get("subject", "") for meta in metadata]
    snippets = [meta.get("snippet", "") for meta in metadata]

    # Dimensionality reduction
    coords = reduce_dimensionality(vectors)

    # Plotly scatter plot
    fig = px.scatter(
        x=coords[:, 0],
        y=coords[:, 1],
        color=categories,
        hover_data={
            "ID": ids,
            "Subject": subjects,
            "Snippet": snippets,
            "Category": categories
        },
        labels={"color": "Category"},
        title="Email Embeddings (PCA Reduced)"
    )
    st.plotly_chart(fig, use_container_width=True)

    # Similarity search
    st.header("🔍 Similarity Search")
    query = st.text_input("Enter a query to find similar emails:")
    if query:
        vectorizer = Vectorizer()
        feat_extractor = FeatureExtractor()
        query_vec = vectorizer.vectorize([query])[0]
        try:
            results = storage.query_vectors(query_vec, top_k=5, namespace=PINECONE_NAMESPACE)
            st.subheader("Top 5 Similar Emails:")
            for res in results:
                meta = res.get("metadata", {})
                st.markdown(f"**Subject:** {meta.get('subject', 'N/A')}")
                st.markdown(f"**Snippet:** {meta.get('snippet', 'N/A')}")
                st.markdown(f"**Score:** {res.get('score', 'N/A')}")
                st.markdown("---")
        except Exception as e:
            st.error(f"Error during similarity search: {e}")

    # Show details for selected point (optional: can be expanded)
    st.header("📄 Email Details")
    selected_id = st.selectbox("Select an email ID to view details:", ids)
    if selected_id:
        idx = ids.index(selected_id)
        st.json(metadata[idx])

if __name__ == "__main__":
    main() 