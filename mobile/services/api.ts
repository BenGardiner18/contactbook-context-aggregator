import { useAuth } from '@clerk/clerk-expo';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * API service for backend communication
 */
export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make authenticated request to backend
   */
  private async makeRequest(
    endpoint: string, 
    options: RequestInit = {}, 
    token?: string
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }

  /**
   * Fetch Google Contacts from backend
   */
  async fetchGoogleContacts(authToken: string): Promise<any[]> {
    try {
      const response = await this.makeRequest('/api/contacts/google', {
        method: 'GET',
      }, authToken);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Google contacts from API:', error);
      throw error;
    }
  }

  /**
   * Initialize Google OAuth flow and get contacts
   */
  async initializeGoogleContacts(authToken: string): Promise<any[]> {
    try {
      const response = await this.makeRequest('/api/auth/google/contacts', {
        method: 'POST',
      }, authToken);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error initializing Google contacts:', error);
      throw error;
    }
  }
}

/**
 * React hook for API service with Clerk authentication
 */
export const useApiService = () => {
  const { getToken } = useAuth();

  const apiService = new ApiService();

  const fetchGoogleContacts = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      return await apiService.fetchGoogleContacts(token);
    } catch (error) {
      console.error('Error in fetchGoogleContacts:', error);
      throw error;
    }
  };

  const initializeGoogleContacts = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      return await apiService.initializeGoogleContacts(token);
    } catch (error) {
      console.error('Error in initializeGoogleContacts:', error);
      throw error;
    }
  };

  return {
    fetchGoogleContacts,
    initializeGoogleContacts,
  };
}; 