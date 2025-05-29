from pinecone import Pinecone
from dotenv import load_dotenv
import os
import openai
from typing import List, Dict, Any
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from sklearn.manifold import TSNE
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

def initialize_environment() -> None:
    """Initialize environment variables and API clients."""
    load_dotenv()
    openai.api_key = os.getenv("OPENAI_API_KEY")
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    return Pinecone(api_key=pinecone_api_key)

def get_embedding(text: str) -> List[float]:
    """Generate embeddings for a given text using OpenAI's API."""
    response = openai.embeddings.create(
        input=[text],
        model="text-embedding-ada-002"
    )
    return response.data[0].embedding

def fetch_pinecone_records(index, namespace: str, limit: int = 50) -> List[Dict[str, Any]]:
    """Fetch up to `limit` records from Pinecone index and format for downstream use."""
    # Pinecone fetches by id, so we use .query with a dummy vector to get top-k
    dummy_vector = [0.0] * 1536  # 1536 for ada-002
    query_response = index.query(vector=dummy_vector, top_k=limit, include_values=True, include_metadata=True, namespace=namespace)
    records = []
    for match in query_response['matches']:
        records.append({
            "id": match['id'],
            "values": match['values'],
            "metadata": match.get('metadata', {})
        })
    return records

def get_similarity_matrix(records: List[Dict[str, Any]]) -> np.ndarray:
    """Calculate cosine similarity matrix between all records."""
    embeddings = np.array([rec["values"] for rec in records])
    return cosine_similarity(embeddings)

def plot_similarity_matrix(similarity_matrix: np.ndarray, record_ids: List[str]) -> None:
    """Plot similarity matrix as a heatmap."""
    fig = go.Figure(data=go.Heatmap(
        z=similarity_matrix,
        x=record_ids,
        y=record_ids,
        colorscale='Viridis'
    ))
    fig.update_layout(
        title='Similarity Matrix',
        xaxis_title='Record ID',
        yaxis_title='Record ID'
    )
    fig.show()

def plot_2d_embeddings(records: List[Dict[str, Any]]) -> None:
    """Plot embeddings in 2D space using t-SNE."""
    embeddings = np.array([rec["values"] for rec in records])
    categories = [rec["metadata"].get("category", "unknown") for rec in records]
    texts = [rec["metadata"].get("chunk_text", "") for rec in records]
    
    # Reduce dimensionality to 2D using t-SNE
    tsne = TSNE(n_components=2, random_state=42, perplexity=min(30, len(records)-1))
    embeddings_2d = tsne.fit_transform(embeddings)
    
    # Create DataFrame for plotting
    df = pd.DataFrame({
        'x': embeddings_2d[:, 0],
        'y': embeddings_2d[:, 1],
        'category': categories,
        'text': texts
    })
    
    # Plot using plotly
    fig = px.scatter(
        df, x='x', y='y',
        color='category',
        hover_data=['text'],
        title='2D Visualization of Embeddings'
    )
    fig.show()

def plot_3d_embeddings(records: List[Dict[str, Any]]) -> None:
    """Plot embeddings in 3D space using t-SNE."""
    embeddings = np.array([rec["values"] for rec in records])
    categories = [rec["metadata"].get("category", "unknown") for rec in records]
    texts = [rec["metadata"].get("chunk_text", "") for rec in records]
    
    # Reduce dimensionality to 3D using t-SNE
    tsne = TSNE(n_components=3, random_state=42, perplexity=min(30, len(records)-1))
    embeddings_3d = tsne.fit_transform(embeddings)
    
    # Create DataFrame for plotting
    df = pd.DataFrame({
        'x': embeddings_3d[:, 0],
        'y': embeddings_3d[:, 1],
        'z': embeddings_3d[:, 2],
        'category': categories,
        'text': texts
    })
    
    # Plot using plotly
    fig = px.scatter_3d(
        df, x='x', y='y', z='z',
        color='category',
        hover_data=['text'],
        title='3D Visualization of Embeddings'
    )
    fig.show()

def main():
    """Main function to run the vector database operations."""
    # Initialize clients
    pc = initialize_environment()
    index = pc.Index("index")
    
    # Fetch records from Pinecone
    pinecone_records = fetch_pinecone_records(index, namespace="example-namespace", limit=50)
    if not pinecone_records:
        print("No records found in Pinecone index.")
        return
    
    # Generate and plot similarity matrix
    similarity_matrix = get_similarity_matrix(pinecone_records)
    plot_similarity_matrix(similarity_matrix, [rec["id"] for rec in pinecone_records])
    
    # Plot embeddings in 2D space
    plot_2d_embeddings(pinecone_records)
    # Plot embeddings in 3D space
    plot_3d_embeddings(pinecone_records)

if __name__ == "__main__":
    main()
