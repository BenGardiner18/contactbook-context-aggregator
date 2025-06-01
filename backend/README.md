# ContactBook API Backend

FastAPI backend for the ContactBook app with Google Contacts integration and Clerk authentication.

## Features

- **Authentication**: Clerk JWT token verification
- **Google Contacts**: Fetch contacts from Google People API
- **Caching**: Redis-based caching for performance
- **CORS**: Configured for React Native Expo development
- **Type Safety**: Full type hints with Pydantic models

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Variables

Copy `env.example` to `.env` and fill in your values:

```bash
cp env.example .env
```

Required environment variables:

```env
# Clerk Configuration
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_PROJECT_ID=your_google_project_id

# Redis Configuration (optional - runs without Redis)
REDIS_URL=redis://localhost:6379
```

### 3. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **People API**
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:8000/api/auth/google/callback`
5. Copy the Client ID and Client Secret to your `.env` file

### 4. Clerk Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create or select your project
3. In **Configure → Settings**, copy:
   - Publishable key → `CLERK_PUBLISHABLE_KEY`
   - Secret key → `CLERK_SECRET_KEY`
4. In **Configure → Social Providers**, enable Google OAuth:
   - Add your Google Client ID and Secret
   - Add required scopes:
     - `https://www.googleapis.com/auth/contacts.readonly`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`

### 5. Start Redis (Optional)

If you want caching, start Redis:

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install locally (macOS)
brew install redis
brew services start redis
```

### 6. Run the Server

```bash
cd backend
python main.py
```

The API will be available at: `http://localhost:8000`

## API Endpoints

### Health Check
- `GET /` - Simple health check
- `GET /health` - Detailed health check

### Authentication
- `POST /api/auth/google/link` - Generate Google OAuth URL
- `POST /api/auth/google/callback` - Handle OAuth callback

### Contacts
- `GET /api/contacts/google` - Fetch contacts from Google
- `GET /api/contacts/cached` - Get cached contacts
- `DELETE /api/contacts/cache` - Clear contacts cache

## Usage

### 1. Authentication

All endpoints require a Clerk JWT token in the Authorization header:

```bash
Authorization: Bearer <clerk-jwt-token>
```

### 2. Fetch Google Contacts

```bash
curl -X GET http://localhost:8000/api/contacts/google \
  -H "Authorization: Bearer <clerk-jwt-token>"
```

### 3. Link Google Account

```bash
curl -X POST http://localhost:8000/api/auth/google/link \
  -H "Authorization: Bearer <clerk-jwt-token>"
```

## Development

### Project Structure

```
backend/
├── app/
│   ├── auth/
│   │   └── clerk_auth.py           # Clerk authentication service
│   ├── core/
│   │   └── config.py               # Settings & configuration
│   ├── models/
│   │   └── contact.py              # Pydantic data models
│   ├── routes/
│   │   ├── auth.py                 # Authentication endpoints
│   │   ├── contacts.py             # Contact management endpoints
│   │   └── health.py               # Health check endpoints
│   └── services/
│       └── google_contacts.py     # Google Contacts API service
├── main.py                         # FastAPI app entry point & configuration
├── requirements.txt                # Python dependencies
└── env.example                    # Environment variables template
```

### Adding Features

1. **New endpoints**: Add to appropriate file in `app/routes/`
2. **New models**: Add to `app/models/`
3. **New services**: Add to `app/services/`
4. **New route groups**: Create new router file and register in `main.py`
5. **Configuration**: Update `app/core/config.py`

### Error Handling

The API includes comprehensive error handling:
- **401**: Authentication errors
- **500**: Server errors
- **400**: Client errors

Logs are written to console with detailed error information.

### Caching

Redis caching is optional but recommended:
- **Cache TTL**: 1 hour (configurable)
- **Cache Keys**: `contacts:{user_id}`
- **Fallback**: If Redis is unavailable, API works without caching

## Deployment

### Production Considerations

1. **JWT Verification**: Update `clerk_auth.py` to properly verify JWT signatures
2. **HTTPS**: Use HTTPS in production
3. **Environment**: Set `DEBUG=false`
4. **CORS**: Update `CORS_ORIGINS` for your production domains
5. **Redis**: Use managed Redis service (AWS ElastiCache, etc.)

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "main.py"]
```

## Troubleshooting

### Common Issues

1. **"Google API error: 401"**
   - Check your Google OAuth credentials
   - Ensure scopes are correct in Clerk dashboard

2. **"Invalid authentication token"**
   - Verify Clerk secret key is correct
   - Ensure JWT token is valid

3. **"Redis not available"**
   - Check if Redis is running
   - Update `REDIS_URL` in `.env`

4. **CORS errors**
   - Update `CORS_ORIGINS` in config
   - Ensure your React Native app URL is included

### Logs

Check the console output for detailed error logs:
- **INFO**: Successful operations
- **WARNING**: Non-critical issues (Redis unavailable, etc.)
- **ERROR**: Critical errors

## Security Notes

- **Development JWT**: Current JWT verification is simplified for development
- **Production**: Implement proper JWT signature verification
- **Tokens**: Store Google OAuth tokens securely in production
- **HTTPS**: Always use HTTPS in production
- **CORS**: Restrict CORS origins to your domains only 