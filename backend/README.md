# Ultimate Contact Context Aggregator

A modular Python system to aggregate contact data from multiple sources (starting with Gmail and Google Calendar), vectorize it, store embeddings in Pinecone for similarity search, and visualize contact relationships in an interactive Streamlit app.

## Features
- Modular data ingestion (Gmail, Google Calendar, extensible)
- Vectorization with Sentence-BERT and numerical features
- Pinecone vector database integration
- Interactive Streamlit visualization
- Extensible, testable, and well-documented codebase

## Setup
1. Clone the repo
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure API keys and Pinecone in `config/config.yaml`
4. Run the CLI pipeline:
   ```bash
   python main.py
   ```
5. Or launch the Streamlit app:
   ```bash
   streamlit run app.py
   ```

## Directory Structure
- `src/` - Source code (auth, data_sources, vectorization, storage, visualization)
- `config/` - Configuration files
- `data/` - Credentials and tokens (not versioned)
- `tests/` - Unit and integration tests
- `main.py` - CLI entry point
- `app.py` - Streamlit app entry point

## Modular Structure (Planned)

- `vector_base.py`: Abstract base class for vector DB operations.
- `pinecone_storage.py`: Pinecone implementation of vector DB.
- `auth_base.py`: Abstract base class for authentication.
- `main.py`: Pipeline orchestrator for authentication, data loading, and Pinecone storage.

All new code will follow project modularity and type hinting rules. 