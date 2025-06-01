# Quick Setup Guide

## 1. Install Dependencies

```bash
pip install -r requirements.txt
```

## 2. Environment Setup

Copy `env.example` to `.env`:

```bash
cp env.example .env
```

Then edit `.env` with your actual values:

```env
# Clerk Configuration
CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key
CLERK_SECRET_KEY=sk_test_your_actual_key

# Google OAuth Configuration  
GOOGLE_CLIENT_ID=your_actual_client_id
GOOGLE_CLIENT_SECRET=your_actual_client_secret
GOOGLE_PROJECT_ID=your_actual_project_id
```

## 3. Start the Server

```bash
python main.py
```

The API will be available at: http://localhost:8000

## 4. Test the API

Visit http://localhost:8000/health to check if it's running.

## Next Steps

1. Configure Google OAuth in Google Cloud Console
2. Configure Clerk with Google OAuth provider
3. Update your React Native app to use the backend API

See README.md for detailed instructions. 