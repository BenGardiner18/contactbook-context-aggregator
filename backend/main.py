import os
import logging
from typing import List, Dict, Any
from dotenv import load_dotenv
from src.storage.pinecone_storage import PineconeStorage
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
import json
from src.vectorization.vectorization import FeatureExtractor, Vectorizer

logging.basicConfig(level=logging.INFO)

def get_google_credentials(scopes: List[str]) -> Any:
    """
    Authenticate with Google using client secrets from environment variables, without writing a file.
    """
    client_config = {
        "installed": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "project_id": os.getenv("GOOGLE_PROJECT_ID"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": ["http://localhost:8080"]
        }
    }
    flow = InstalledAppFlow.from_client_config(client_config, scopes)
    creds = flow.run_local_server(port=8080)
    return creds

def fetch_gmail_messages(service, max_results: int = 100) -> List[Dict[str, Any]]:
    """
    Fetch a list of messages from Gmail inbox, extracting subject and snippet.
    """
    results = service.users().messages().list(userId='me', maxResults=max_results).execute()
    messages = results.get('messages', [])
    all_msgs = []
    for msg in messages:
        msg_detail = service.users().messages().get(userId='me', id=msg['id'], format='metadata').execute()
        headers = msg_detail.get('payload', {}).get('headers', [])
        subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '')
        snippet = msg_detail.get('snippet', '')
        all_msgs.append({
            "id": msg['id'],
            "subject": subject,
            "snippet": snippet,
            "metadata": {"category": "inbox"}
        })
        print(all_msgs)
    return all_msgs

def main():
    load_dotenv()
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    pinecone_index = os.getenv("PINECONE_INDEX", "index")
    pinecone_namespace = os.getenv("PINECONE_NAMESPACE", "emails")
    google_scopes = os.getenv("GOOGLE_SCOPES", "https://www.googleapis.com/auth/gmail.readonly").split(",")

    if not pinecone_api_key:
        logging.error("PINECONE_API_KEY not set in environment.")
        return

    # Initialize Pinecone storage
    try:
        storage = PineconeStorage(api_key=pinecone_api_key, index_name=pinecone_index)
    except Exception as e:
        logging.error(f"Failed to initialize PineconeStorage: {e}")
        return

    # Authenticate and fetch emails
    try:
        creds = get_google_credentials(google_scopes)
        gmail_service = build('gmail', 'v1', credentials=creds)
        emails = fetch_gmail_messages(gmail_service, max_results=50)
        logging.info(f"Fetched {len(emails)} Gmail messages.")
    except Exception as e:
        logging.error(f"Failed to fetch Gmail messages: {e}")
        return

    if not emails:
        logging.info("No emails to process.")
        return

    ids = [email["id"] for email in emails]
    extractor = FeatureExtractor()
    texts = [extractor.extract_text(email) for email in emails]
    metadata = [email["metadata"] for email in emails]

    # Vectorize emails using the new Vectorizer
    vectorizer = Vectorizer()
    vectors = vectorizer.vectorize(texts)

    # Insert into Pinecone
    try:
        storage.insert_vectors(vectors, ids, metadata, pinecone_namespace)
        logging.info(f"Inserted {len(ids)} emails into Pinecone namespace '{pinecone_namespace}'")
    except Exception as e:
        logging.error(f"Failed to insert vectors: {e}")

if __name__ == "__main__":
    main() 