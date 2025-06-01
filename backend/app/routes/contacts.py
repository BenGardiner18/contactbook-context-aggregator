from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
import logging

from app.auth.clerk_auth import ClerkAuth
from app.services.google_contacts import GoogleContactsService
from app.models.contact import ContactResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/contacts", tags=["contacts"])
security = HTTPBearer()

# Initialize services
clerk_auth = ClerkAuth()
google_contacts_service = GoogleContactsService()

@router.get("/google", response_model=List[ContactResponse])
async def get_google_contacts(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Fetch Google Contacts for the authenticated user
    """
    try:
        # Verify Clerk token and get user info
        user_info = await clerk_auth.verify_token(credentials.credentials)
        
        # Get Google access token for the user
        access_token = await clerk_auth.get_google_access_token(user_info['sub'])
        
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google account not linked or access token unavailable"
            )
        
        # Fetch contacts from Google
        contacts = await google_contacts_service.fetch_contacts(access_token, user_info['sub'])
        
        logger.info(f"Successfully fetched {len(contacts)} contacts for user {user_info['sub']}")
        return contacts
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching Google contacts: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch Google contacts"
        )

@router.get("/cached", response_model=List[ContactResponse])
async def get_cached_contacts(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get cached contacts for the authenticated user
    """
    try:
        # Verify Clerk token
        user_info = await clerk_auth.verify_token(credentials.credentials)
        
        # Get cached contacts
        contacts = await google_contacts_service.get_cached_contacts(user_info['sub'])
        
        return contacts
        
    except Exception as e:
        logger.error(f"Error fetching cached contacts: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch cached contacts"
        )

@router.delete("/cache")
async def clear_contacts_cache(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Clear contacts cache for the authenticated user
    """
    try:
        # Verify Clerk token
        user_info = await clerk_auth.verify_token(credentials.credentials)
        
        # Clear cache
        await google_contacts_service.clear_cache(user_info['sub'])
        
        return {"message": "Cache cleared successfully"}
        
    except Exception as e:
        logger.error(f"Error clearing cache: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear cache"
        ) 