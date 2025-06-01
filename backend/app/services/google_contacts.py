import httpx
import json
import redis
from typing import List, Dict, Optional
import logging
from datetime import datetime, timedelta

from app.core.config import settings
from app.models.contact import ContactResponse, GoogleContact
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import Flow

logger = logging.getLogger(__name__)

class GoogleContactsService:
    """Service for handling Google Contacts API operations"""
    
    def __init__(self):
        self.redis_client = None
        self.base_url = "https://people.googleapis.com/v1"
        self.scopes = settings.GOOGLE_SCOPES
        
    async def get_redis_client(self):
        """Get Redis client for caching"""
        if not self.redis_client:
            try:
                self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
                self.redis_client.ping()
            except Exception as e:
                logger.warning(f"Redis not available: {str(e)}")
                self.redis_client = None
        return self.redis_client
    
    async def fetch_contacts(self, access_token: str, user_id: str = None) -> List[ContactResponse]:
        """
        Fetch contacts from Google People API
        """
        try:
            # Check cache first
            if user_id:
                cached_contacts = await self.get_cached_contacts(user_id)
                if cached_contacts:
                    logger.info(f"Returning {len(cached_contacts)} cached contacts")
                    return cached_contacts
            
            # Fetch from Google API
            url = f"{self.base_url}/people/me/connections"
            params = {
                "personFields": "names,emailAddresses,phoneNumbers,photos,organizations,addresses,biographies",
                "pageSize": 1000
            }
            
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, headers=headers)
                
                if response.status_code == 401:
                    raise Exception("Access token expired or invalid")
                elif response.status_code != 200:
                    raise Exception(f"Google API error: {response.status_code} - {response.text}")
                
                data = response.json()
                connections = data.get("connections", [])
                
                # Transform to our contact format
                contacts = self._transform_contacts(connections)
                
                # Cache the results
                if user_id:
                    await self.cache_contacts(user_id, contacts)
                
                logger.info(f"Fetched {len(contacts)} contacts from Google API")
                return contacts
                
        except Exception as e:
            logger.error(f"Error fetching Google contacts: {str(e)}")
            
            # Try to return cached contacts as fallback
            if user_id:
                cached_contacts = await self.get_cached_contacts(user_id)
                if cached_contacts:
                    logger.info("Returning cached contacts due to API error")
                    return cached_contacts
            
            raise Exception(f"Failed to fetch contacts: {str(e)}")
    
    def _transform_contacts(self, google_contacts: List[Dict]) -> List[ContactResponse]:
        """
        Transform Google People API response to our contact format
        """
        contacts = []
        
        for contact in google_contacts:
            try:
                # Extract name
                names = contact.get("names", [])
                name = names[0].get("displayName", "Unknown Contact") if names else "Unknown Contact"
                
                # Extract email
                emails = contact.get("emailAddresses", [])
                email = emails[0].get("value", "") if emails else ""
                
                # Extract phone
                phones = contact.get("phoneNumbers", [])
                phone = phones[0].get("value", "") if phones else ""
                
                # Extract photo
                photos = contact.get("photos", [])
                avatar = photos[0].get("url", "") if photos else ""
                if not avatar:
                    # Generate avatar using UI Avatars
                    avatar = f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}&background=6366f1&color=fff&size=128"
                
                # Extract organization
                organizations = contact.get("organizations", [])
                org = organizations[0] if organizations else {}
                company = org.get("name", "")
                job = org.get("title", "")
                
                # Extract address
                addresses = contact.get("addresses", [])
                address = addresses[0].get("formattedValue", "") if addresses else ""
                
                # Extract biography/notes
                biographies = contact.get("biographies", [])
                notes = biographies[0].get("value", "") if biographies else ""
                
                # Create contact object
                contact_obj = ContactResponse(
                    id=contact.get("resourceName", f"contact-{len(contacts)}"),
                    name=name,
                    email=email,
                    phone=phone,
                    avatar=avatar,
                    company=company,
                    job=job,
                    address=address,
                    notes=notes
                )
                
                # Only add contacts with meaningful data
                if name != "Unknown Contact" or email or phone:
                    contacts.append(contact_obj)
                    
            except Exception as e:
                logger.warning(f"Error transforming contact: {str(e)}")
                continue
        
        return contacts
    
    async def cache_contacts(self, user_id: str, contacts: List[ContactResponse]) -> None:
        """
        Cache contacts in Redis
        """
        try:
            redis_client = await self.get_redis_client()
            if not redis_client:
                return
            
            # Convert contacts to JSON
            contacts_data = [contact.dict() for contact in contacts]
            cache_data = {
                "contacts": contacts_data,
                "cached_at": datetime.utcnow().isoformat(),
                "count": len(contacts)
            }
            
            # Store with TTL
            cache_key = f"contacts:{user_id}"
            redis_client.setex(
                cache_key,
                settings.CACHE_TTL,
                json.dumps(cache_data)
            )
            
            logger.info(f"Cached {len(contacts)} contacts for user {user_id}")
            
        except Exception as e:
            logger.warning(f"Failed to cache contacts: {str(e)}")
    
    async def get_cached_contacts(self, user_id: str) -> List[ContactResponse]:
        """
        Get cached contacts from Redis
        """
        try:
            redis_client = await self.get_redis_client()
            if not redis_client:
                return []
            
            cache_key = f"contacts:{user_id}"
            cached_data = redis_client.get(cache_key)
            
            if cached_data:
                data = json.loads(cached_data)
                contacts_data = data.get("contacts", [])
                
                # Convert back to ContactResponse objects
                contacts = [ContactResponse(**contact) for contact in contacts_data]
                
                logger.info(f"Retrieved {len(contacts)} cached contacts for user {user_id}")
                return contacts
            
            return []
            
        except Exception as e:
            logger.warning(f"Failed to get cached contacts: {str(e)}")
            return []
    
    async def clear_cache(self, user_id: str) -> None:
        """
        Clear cached contacts for a user
        """
        try:
            redis_client = await self.get_redis_client()
            if not redis_client:
                return
            
            cache_key = f"contacts:{user_id}"
            redis_client.delete(cache_key)
            
            logger.info(f"Cleared cache for user {user_id}")
            
        except Exception as e:
            logger.warning(f"Failed to clear cache: {str(e)}")
    
    async def get_auth_url(self, user_id: str) -> str:
        """
        Generate Google OAuth authorization URL
        """
        try:
            flow = Flow.from_client_config(
                {
                    "web": {
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "redirect_uris": ["http://localhost:8000/api/auth/google/callback"]
                    }
                },
                scopes=self.scopes
            )
            
            flow.redirect_uri = "http://localhost:8000/api/auth/google/callback"
            
            auth_url, state = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true',
                state=user_id  # Use user_id as state for verification
            )
            
            return auth_url
            
        except Exception as e:
            logger.error(f"Error generating auth URL: {str(e)}")
            raise Exception("Failed to generate authorization URL")
    
    async def handle_oauth_callback(self, code: str, state: str, user_id: str) -> bool:
        """
        Handle OAuth callback and exchange code for tokens
        """
        try:
            # Verify state matches user_id
            if state != user_id:
                logger.error("OAuth state mismatch")
                return False
            
            # Exchange code for tokens
            flow = Flow.from_client_config(
                {
                    "web": {
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "redirect_uris": ["http://localhost:8000/api/auth/google/callback"]
                    }
                },
                scopes=self.scopes,
                state=state
            )
            
            flow.redirect_uri = "http://localhost:8000/api/auth/google/callback"
            flow.fetch_token(code=code)
            
            # Store tokens (in production, you'd save this securely)
            # For now, we'll just return success
            # You would typically save the tokens to your database
            # associated with the user_id
            
            logger.info(f"Successfully linked Google account for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error in OAuth callback: {str(e)}")
            return False 