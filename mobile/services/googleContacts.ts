import { useUser, useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Interface for a normalized contact from Google Contacts
 */
export interface GoogleContact {
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

/**
 * Service class for fetching Google Contacts using the People API
 */
export class GoogleContactsService {
  private baseUrl = 'https://people.googleapis.com/v1/people/me/connections';

  /**
   * Fetch contacts from Google People API
   */
  async fetchContacts(accessToken: string): Promise<GoogleContact[]> {
    try {
      const url = `${this.baseUrl}?personFields=names,emailAddresses,phoneNumbers,photos,organizations,addresses,biographies&pageSize=1000`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Access token expired or invalid. Please re-authenticate with Google.');
        }
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const contacts = this.transformContacts(data.connections || []);
      
      // Cache the contacts locally
      await this.cacheContacts(contacts);
      
      return contacts;
    } catch (error) {
      console.error('Error fetching Google contacts:', error);
      
      // Try to return cached contacts if API fails
      const cachedContacts = await this.getCachedContacts();
      if (cachedContacts.length > 0) {
        console.log('Returning cached contacts due to API error');
        return cachedContacts;
      }
      
      throw error;
    }
  }

  /**
   * Transform Google People API response to our contact format
   */
  private transformContacts(googleContacts: any[]): GoogleContact[] {
    return googleContacts.map((contact, index) => {
      // Extract name
      const name = contact.names?.[0]?.displayName || 'Unknown Contact';
      
      // Extract email
      const email = contact.emailAddresses?.[0]?.value || '';
      
      // Extract phone
      const phone = contact.phoneNumbers?.[0]?.value || '';
      
      // Extract photo/avatar
      const avatar = contact.photos?.[0]?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`;
      
      // Extract organization info
      const organization = contact.organizations?.[0];
      const company = organization?.name || '';
      const job = organization?.title || '';
      
      // Extract address
      const address = contact.addresses?.[0]?.formattedValue || '';
      
      // Extract notes/biography
      const notes = contact.biographies?.[0]?.value || '';

      return {
        id: contact.resourceName || `contact-${index}`,
        name,
        email,
        phone,
        avatar,
        company,
        job,
        address,
        notes,
      };
    }).filter(contact => 
      contact.name !== 'Unknown Contact' || 
      contact.email || 
      contact.phone
    ); // Filter out empty contacts
  }

  /**
   * Cache contacts locally
   */
  private async cacheContacts(contacts: GoogleContact[]): Promise<void> {
    try {
      await AsyncStorage.setItem('cached_google_contacts', JSON.stringify(contacts));
      await AsyncStorage.setItem('cached_contacts_timestamp', Date.now().toString());
    } catch (error) {
      console.error('Error caching contacts:', error);
    }
  }

  /**
   * Get cached contacts
   */
  private async getCachedContacts(): Promise<GoogleContact[]> {
    try {
      const cachedData = await AsyncStorage.getItem('cached_google_contacts');
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.error('Error getting cached contacts:', error);
    }
    return [];
  }

  /**
   * Check if cached contacts are fresh (less than 1 hour old)
   */
  private async areCachedContactsFresh(): Promise<boolean> {
    try {
      const timestamp = await AsyncStorage.getItem('cached_contacts_timestamp');
      if (timestamp) {
        const age = Date.now() - parseInt(timestamp);
        return age < 60 * 60 * 1000; // 1 hour in milliseconds
      }
    } catch (error) {
      console.error('Error checking cache freshness:', error);
    }
    return false;
  }

  /**
   * Get contacts with caching logic
   */
  async getContactsWithCache(accessToken: string): Promise<GoogleContact[]> {
    const isFresh = await this.areCachedContactsFresh();
    
    if (isFresh) {
      const cached = await this.getCachedContacts();
      if (cached.length > 0) {
        console.log('Using fresh cached contacts');
        return cached;
      }
    }
    
    // Fetch fresh data if cache is stale or empty
    return await this.fetchContacts(accessToken);
  }
}

/**
 * React hook for fetching Google Contacts
 */
export const useGoogleContacts = () => {
  const { user } = useUser();

  const fetchContacts = async (): Promise<GoogleContact[]> => {
    try {
      // Check if user has Google account linked
      const googleAccount = user?.externalAccounts?.find(
        account => account.provider === 'google'
      );

      if (!googleAccount) {
        throw new Error('Google account not linked. Please link your Google account in Settings.');
      }

      // For production, you would need to implement proper token management
      // This is a simplified example that assumes you have access to the token
      
      // Option 1: Try to get token from external account (may not be available in Clerk)
      const accessToken = (googleAccount as any)?.accessToken;
      
      if (!accessToken) {
        throw new Error('Google access token not available. You may need to re-authenticate with Google.');
      }

      const service = new GoogleContactsService();
      return await service.getContactsWithCache(accessToken);
    } catch (error) {
      console.error('Error in useGoogleContacts:', error);
      throw error;
    }
  };

  const getCachedContacts = async (): Promise<GoogleContact[]> => {
    const service = new GoogleContactsService();
    return await service['getCachedContacts']();
  };

  return { 
    fetchContacts, 
    getCachedContacts,
    isGoogleLinked: !!user?.externalAccounts?.find(account => account.provider === 'google')
  };
}; 