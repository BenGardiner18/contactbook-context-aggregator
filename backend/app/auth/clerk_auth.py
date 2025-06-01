import httpx
import jwt
from jwt.exceptions import InvalidTokenError
from fastapi import HTTPException, status
from typing import Dict, Optional
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class ClerkAuth:
    """Clerk authentication service"""
    
    def __init__(self):
        self.clerk_secret_key = settings.CLERK_SECRET_KEY
        self.clerk_base_url = "https://api.clerk.com/v1"
        
    async def verify_token(self, token: str) -> Dict:
        """
        Verify Clerk JWT token and return user information
        """
        try:
            # For development, we'll use a simplified approach
            # In production, you should verify the JWT signature properly
            
            # Decode without verification for now (development only)
            # In production, use proper JWT verification with Clerk's public keys
            decoded_token = jwt.decode(
                token, 
                options={"verify_signature": False}  # ONLY for development
            )
            
            return decoded_token
            
        except InvalidTokenError as e:
            logger.error(f"Invalid JWT token: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )
        except Exception as e:
            logger.error(f"Token verification error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed"
            )
    
    async def get_user_info(self, user_id: str) -> Dict:
        """
        Get user information from Clerk API
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.clerk_base_url}/users/{user_id}",
                    headers={
                        "Authorization": f"Bearer {self.clerk_secret_key}",
                        "Content-Type": "application/json"
                    }
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Failed to get user info: {response.status_code}")
                    return {}
                    
        except Exception as e:
            logger.error(f"Error getting user info: {str(e)}")
            return {}
    
    async def get_google_access_token(self, user_id: str) -> Optional[str]:
        """
        Get Google OAuth access token for a user from Clerk
        """
        try:
            # Get user's external accounts from Clerk
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.clerk_base_url}/users/{user_id}/oauth_access_tokens/google",
                    headers={
                        "Authorization": f"Bearer {self.clerk_secret_key}",
                        "Content-Type": "application/json"
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    # Extract access token from response
                    return data.get("token")
                else:
                    logger.warning(f"No Google token found for user {user_id}: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting Google access token: {str(e)}")
            return None
    
    async def get_user_external_accounts(self, user_id: str) -> list:
        """
        Get user's external accounts from Clerk
        """
        try:
            user_info = await self.get_user_info(user_id)
            return user_info.get("external_accounts", [])
            
        except Exception as e:
            logger.error(f"Error getting external accounts: {str(e)}")
            return [] 