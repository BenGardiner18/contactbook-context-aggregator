#!/usr/bin/env python3
"""
Test script to verify backend setup
"""

import sys
import os
from pathlib import Path

# Add the app directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def test_imports():
    """Test that all modules can be imported"""
    print("Testing imports...")
    
    try:
        from app.core.config import settings
        print("✓ Config module imported successfully")
        
        from app.models.contact import ContactResponse, Contact
        print("✓ Contact models imported successfully")
        
        from app.auth.clerk_auth import ClerkAuth
        print("✓ Clerk auth module imported successfully")
        
        from app.services.google_contacts import GoogleContactsService
        print("✓ Google Contacts service imported successfully")
        
        return True
    except ImportError as e:
        print(f"✗ Import error: {e}")
        return False

def test_config():
    """Test configuration loading"""
    print("\nTesting configuration...")
    
    try:
        from app.core.config import settings
        
        # Test that required config exists (even if not set)
        required_attrs = [
            'HOST', 'PORT', 'DEBUG',
            'GOOGLE_SCOPES', 'CACHE_TTL', 'CORS_ORIGINS'
        ]
        
        for attr in required_attrs:
            if hasattr(settings, attr):
                value = getattr(settings, attr)
                print(f"✓ {attr}: {value}")
            else:
                print(f"✗ Missing config: {attr}")
                return False
        
        return True
    except Exception as e:
        print(f"✗ Config error: {e}")
        return False

def test_env_file():
    """Check if .env file exists"""
    print("\nChecking environment setup...")
    
    env_file = backend_dir / '.env'
    env_example = backend_dir / 'env.example'
    
    if env_file.exists():
        print("✓ .env file exists")
    else:
        print("✗ .env file not found")
        if env_example.exists():
            print("  → Copy env.example to .env and fill in your values")
        return False
    
    return True

def main():
    """Run all tests"""
    print("ContactBook Backend Setup Test")
    print("=" * 40)
    
    tests = [
        test_imports,
        test_config,
        test_env_file
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"✗ Test failed with exception: {e}")
            results.append(False)
    
    print("\n" + "=" * 40)
    if all(results):
        print("🎉 All tests passed! Backend setup looks good.")
        print("\nNext steps:")
        print("1. Fill in your .env file with actual values")
        print("2. Run: python main.py")
        print("3. Visit: http://localhost:8000")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main() 