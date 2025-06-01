# ContactBook API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication
All API endpoints (except health checks) require a Clerk JWT token in the Authorization header:

```http
Authorization: Bearer <clerk-jwt-token>
```

## Endpoints

### Health Check

#### `GET /`
Simple health check endpoint.

**Response:**
```json
{
  "message": "ContactBook API is running"
}
```

#### `GET /health`
Detailed health check with service status.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "google_contacts": "available",
    "clerk_auth": "available"
  }
}
```

---

### Authentication

#### `POST /api/auth/google/link`
Generate Google OAuth authorization URL for linking user's Google account.

**Headers:**
- `Authorization: Bearer <clerk-jwt-token>`

**Response:**
```json
{
  "auth_url": "https://accounts.google.com/o/oauth2/auth?..."
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid Clerk token
- `500 Internal Server Error`: Failed to generate auth URL

#### `POST /api/auth/google/callback`
Handle Google OAuth callback after user authorization.

**Headers:**
- `Authorization: Bearer <clerk-jwt-token>`

**Query Parameters:**
- `code`: OAuth authorization code
- `state`: State parameter for verification

**Response:**
```json
{
  "message": "Google account linked successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Failed to link account
- `401 Unauthorized`: Invalid Clerk token
- `500 Internal Server Error`: OAuth callback failed

---

### Contacts

#### `GET /api/contacts/google`
Fetch contacts from Google People API. Uses cached data if available, otherwise fetches fresh data from Google.

**Headers:**
- `Authorization: Bearer <clerk-jwt-token>`

**Response:**
```json
[
  {
    "id": "people/c1234567890",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567",
    "avatar": "https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff&size=128",
    "company": "Acme Corp",
    "job": "Software Engineer",
    "address": "123 Main St, San Francisco, CA",
    "notes": "Met at conference"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: Google account not linked or invalid token
- `500 Internal Server Error`: Failed to fetch contacts

#### `GET /api/contacts/cached`
Get cached contacts without making API calls to Google.

**Headers:**
- `Authorization: Bearer <clerk-jwt-token>`

**Response:**
```json
[
  {
    "id": "people/c1234567890",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567",
    "avatar": "https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff&size=128",
    "company": "Acme Corp",
    "job": "Software Engineer",
    "address": "123 Main St, San Francisco, CA",
    "notes": "Met at conference"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: Invalid Clerk token
- `500 Internal Server Error`: Failed to fetch cached contacts

#### `DELETE /api/contacts/cache`
Clear cached contacts for the authenticated user.

**Headers:**
- `Authorization: Bearer <clerk-jwt-token>`

**Response:**
```json
{
  "message": "Cache cleared successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid Clerk token
- `500 Internal Server Error`: Failed to clear cache

---

## Data Models

### Contact
```typescript
interface Contact {
  id: string;           // Unique identifier (Google resource name)
  name: string;         // Full name
  email: string;        // Primary email address
  phone: string;        // Primary phone number
  avatar: string;       // Profile picture URL
  company: string;      // Company name
  job: string;          // Job title
  address: string;      // Primary address
  notes: string;        // Additional notes/biography
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "detail": "Error message description"
}
```

### HTTP Status Codes
- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or invalid
- `500 Internal Server Error`: Server error

---

## Rate Limiting
- Google People API has rate limits (100 requests per 100 seconds per user)
- Use cached endpoints when possible to avoid hitting limits
- Cache TTL is 1 hour by default

---

## Testing with cURL

### Health Check
```bash
curl -X GET http://localhost:8000/health
```

### Fetch Google Contacts
```bash
curl -X GET http://localhost:8000/api/contacts/google \
  -H "Authorization: Bearer YOUR_CLERK_JWT_TOKEN"
```

### Get Cached Contacts
```bash
curl -X GET http://localhost:8000/api/contacts/cached \
  -H "Authorization: Bearer YOUR_CLERK_JWT_TOKEN"
```

### Clear Cache
```bash
curl -X DELETE http://localhost:8000/api/contacts/cache \
  -H "Authorization: Bearer YOUR_CLERK_JWT_TOKEN"
```

---

## Interactive Documentation

When the server is running, you can access interactive API documentation at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc 