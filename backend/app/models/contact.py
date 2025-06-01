from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ContactBase(BaseModel):
    """Base contact model"""
    name: str = Field(..., description="Contact's full name")
    email: str = Field("", description="Primary email address")
    phone: str = Field("", description="Primary phone number")
    avatar: str = Field("", description="Profile picture URL")
    company: str = Field("", description="Company name")
    job: str = Field("", description="Job title")
    address: str = Field("", description="Primary address")
    notes: str = Field("", description="Additional notes")

class Contact(ContactBase):
    """Contact model for internal use"""
    id: str = Field(..., description="Unique contact identifier")
    resource_name: Optional[str] = Field(None, description="Google resource name")
    user_id: str = Field(..., description="User ID who owns this contact")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

class ContactResponse(ContactBase):
    """Contact model for API responses"""
    id: str = Field(..., description="Unique contact identifier")

class ContactCreate(ContactBase):
    """Contact model for creation requests"""
    pass

class ContactUpdate(BaseModel):
    """Contact model for update requests"""
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    company: Optional[str] = None
    job: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

class GoogleContact(BaseModel):
    """Raw Google contact data"""
    resource_name: str
    etag: Optional[str] = None
    names: List[dict] = []
    email_addresses: List[dict] = []
    phone_numbers: List[dict] = []
    photos: List[dict] = []
    organizations: List[dict] = []
    addresses: List[dict] = []
    biographies: List[dict] = []

class ContactsResponse(BaseModel):
    """Response model for multiple contacts"""
    contacts: List[ContactResponse]
    total: int
    cached: bool = False
    last_updated: Optional[datetime] = None 