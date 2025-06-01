from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "ContactBook API is running"}

@router.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "services": {
            "google_contacts": "available",
            "clerk_auth": "available"
        }
    } 