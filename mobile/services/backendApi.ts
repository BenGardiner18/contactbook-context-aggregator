import { useAuth } from '@clerk/clerk-expo';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  company: string;
  job: string;
  address: string;
  notes: string;
}

export interface ContactsResponse {
  contacts: Contact[];
  total: number;
  cached: boolean;
  last_updated?: string;
}

class BackendApiService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  private async getAuthHeaders(getToken: () => Promise<string | null>) {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async fetchGoogleContacts(getToken: () => Promise<string | null>): Promise<Contact[]> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      const response = await fetch(`${this.baseUrl}/api/contacts/google`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Google account not linked or access token unavailable');
        }
        throw new Error(`Failed to fetch contacts: ${response.status}`);
      }

      const contacts: Contact[] = await response.json();
      return contacts;
    } catch (error) {
      console.error('Error fetching Google contacts:', error);
      throw error;
    }
  }

  async getCachedContacts(getToken: () => Promise<string | null>): Promise<Contact[]> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      const response = await fetch(`${this.baseUrl}/api/contacts/cached`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch cached contacts: ${response.status}`);
      }

      const contacts: Contact[] = await response.json();
      return contacts;
    } catch (error) {
      console.error('Error fetching cached contacts:', error);
      throw error;
    }
  }

  async linkGoogleAccount(getToken: () => Promise<string | null>): Promise<string> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      const response = await fetch(`${this.baseUrl}/api/auth/google/link`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to link Google account: ${response.status}`);
      }

      const data = await response.json();
      return data.auth_url;
    } catch (error) {
      console.error('Error linking Google account:', error);
      throw error;
    }
  }

  async clearContactsCache(getToken: () => Promise<string | null>): Promise<void> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      const response = await fetch(`${this.baseUrl}/api/contacts/cache`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to clear cache: ${response.status}`);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const backendApi = new BackendApiService();

// React hook for using the backend API
export function useBackendApi() {
  const { getToken } = useAuth();

  const fetchGoogleContacts = async (): Promise<Contact[]> => {
    return backendApi.fetchGoogleContacts(getToken);
  };

  const getCachedContacts = async (): Promise<Contact[]> => {
    return backendApi.getCachedContacts(getToken);
  };

  const linkGoogleAccount = async (): Promise<string> => {
    return backendApi.linkGoogleAccount(getToken);
  };

  const clearContactsCache = async (): Promise<void> => {
    return backendApi.clearContactsCache(getToken);
  };

  const healthCheck = async (): Promise<boolean> => {
    return backendApi.healthCheck();
  };

  return {
    fetchGoogleContacts,
    getCachedContacts,
    linkGoogleAccount,
    clearContactsCache,
    healthCheck,
  };
} 