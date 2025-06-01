from pydantic import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # API Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # Clerk Configuration
    CLERK_PUBLISHABLE_KEY: str
    CLERK_SECRET_KEY: str
    
    # Google OAuth Configuration
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_PROJECT_ID: str
    
    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379"
    
    # CORS Configuration
    CORS_ORIGINS: str = "http://localhost:8081,exp://127.0.0.1:8081,exp://localhost:8081"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    # Pinecone Configuration (optional)
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX: str = "contacts-index"
    
    # Google OAuth Scopes
    GOOGLE_SCOPES: List[str] = [
        "https://www.googleapis.com/auth/contacts.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
    ]
    
    # Cache Configuration
    CACHE_TTL: int = 3600  # 1 hour in seconds
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create global settings instance
settings = Settings() 