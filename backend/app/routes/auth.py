from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging

from app.auth.clerk_auth import ClerkAuth
from app.services.google_contacts import GoogleContactsService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["authentication"])
security = HTTPBearer()

# Initialize services
clerk_auth = ClerkAuth()
google_contacts_service = GoogleContactsService()

@router.post("/google/link")
async def link_google_account(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Link Google account for the authenticated user
    """
    try:
        # Verify Clerk token
        user_info = await clerk_auth.verify_token(credentials.credentials)
        
        # Generate Google OAuth URL
        auth_url = await google_contacts_service.get_auth_url(user_info['sub'])
        
        return {"auth_url": auth_url}
        
    except Exception as e:
        logger.error(f"Error linking Google account: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to link Google account"
        )

@router.post("/google/callback")
async def google_oauth_callback(
    code: str,
    state: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Handle Google OAuth callback
    """
    try:
        # Verify Clerk token
        user_info = await clerk_auth.verify_token(credentials.credentials)
        
        # Exchange code for tokens
        success = await google_contacts_service.handle_oauth_callback(
            code, state, user_info['sub']
        )
        
        if success:
            return {"message": "Google account linked successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to link Google account"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in Google OAuth callback: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OAuth callback failed"
        ) 