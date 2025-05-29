import os
import pickle
from typing import Any, Dict, List
import logging
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from dotenv import load_dotenv
import json

logging.basicConfig(level=logging.INFO)
load_dotenv()

def get_google_credentials(scopes: List[str]) -> Any:
    """
    Authenticate with Google using client secrets from environment variables.
    Does NOT persist or load tokens from disk.
    """
    # Prepare client secrets dict
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
    # Write to a temporary file for the flow
    with open("client_secrets.json", "w") as f:
        json.dump(client_config, f)
    flow = InstalledAppFlow.from_client_secrets_file("client_secrets.json", scopes)
    creds = flow.run_local_server(port=8080)
    return creds

def fetch_gmail_messages(service, max_results: int = 100) -> List[Dict[str, Any]]:
    """Fetch a list of messages from Gmail inbox."""
    results = service.users().messages().list(userId='me', maxResults=max_results).execute()
    messages = results.get('messages', [])
    all_msgs = []
    for msg in messages:
        msg_detail = service.users().messages().get(userId='me', id=msg['id'], format='metadata').execute()
        all_msgs.append(msg_detail)
    return all_msgs

def fetch_gcal_events(service, max_results: int = 100) -> List[Dict[str, Any]]:
    """Fetch a list of upcoming events from Google Calendar."""
    events_result = service.events().list(
        calendarId='primary', maxResults=max_results, singleEvents=True,
        orderBy='startTime').execute()
    events = events_result.get('items', [])
    return events

def main():
    """Authenticate and load all data from Gmail and Google Calendar."""
    scopes = os.getenv("GOOGLE_SCOPES", "https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/calendar.readonly").split(",")
    creds = get_google_credentials(scopes)

    # Gmail
    gmail_service = build('gmail', 'v1', credentials=creds)
    gmail_msgs = fetch_gmail_messages(gmail_service, max_results=50)
    logging.info(f"Fetched {len(gmail_msgs)} Gmail messages.")

    # Google Calendar
    gcal_service = build('calendar', 'v3', credentials=creds)
    gcal_events = fetch_gcal_events(gcal_service, max_results=50)
    logging.info(f"Fetched {len(gcal_events)} Google Calendar events.")

    # Print a summary (for now)
    print(f"Gmail: {len(gmail_msgs)} messages loaded.")
    print(f"GCal: {len(gcal_events)} events loaded.")
    # For future: return or save these for vectorization

if __name__ == "__main__":
    main() 