// API service for connecting to your Daily Dough backend
import { Platform } from 'react-native';

// Use different base URLs for different platforms
const getApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    // For web browsers, use localhost to avoid CORS issues
    return 'http://localhost:3000';
  } else {
    // For mobile devices, use the network IP
    return 'http://10.0.0.194:3000';
  }
};

const API_BASE_URL = getApiBaseUrl();

export interface Account {
  id: string;
  name: string;
  type: string;
  subtype: string;
  balance: number;
  mask: string;
}

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  rawAmount: number;
  category: string;
  subCategory: string | null;
  accountId: string;
  isOutflow: boolean;
  description: string;
}

export interface TransactionResponse {
  success: boolean;
  message: string;
  data: {
    accounts: Account[];
    transactions: Transaction[];
    summary: {
      totalTransactions: number;
      totalSpent: number;
      totalReceived: number;
      netChange: number;
      categoriesCount: number;
    };
    dateRange: {
      start: string;
      end: string;
      daysRequested: number;
    };
  };
  metadata: {
    timestamp: string;
    note: string;
  };
}

class PlaidService {
  
  /**
   * Fetch development/sample transaction data (perfect for testing)
   */
  async getDevTransactions(): Promise<TransactionResponse> {
    console.log('🧪 Fetching development transactions from:', `${API_BASE_URL}/api/plaid/dev-transactions`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/plaid/dev-transactions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Dev transactions response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Dev transactions error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Dev transactions loaded:', data.data?.transactions?.length, 'transactions');
      return data;
    } catch (error) {
      console.error('❌ Dev transactions fetch error:', error);
      throw error;
    }
  }
  
  /**
   * Fetch real Plaid sandbox data (accounts + transactions)
   * This uses actual Plaid sandbox accounts with realistic transaction data
   */
  async getRealSandboxData(): Promise<TransactionResponse> {
    console.log('🏦 Fetching real Plaid sandbox data from:', `${API_BASE_URL}/api/plaid/sandbox-data`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/plaid/sandbox-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Sandbox data response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Sandbox data error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Sandbox data loaded:', data.data?.transactions?.length, 'transactions from', data.data?.accounts?.length, 'real Plaid accounts');
      return data;
    } catch (error) {
      console.error('❌ Sandbox data fetch error:', error);
      throw error;
    }
  }
  
  /**
   * Fetch real transaction data using an access token
   */
  async getRealTransactions(accessToken: string, days: number = 30): Promise<TransactionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/plaid/get-transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          days: days,
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch real transactions');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching real transactions:', error);
      throw error;
    }
  }
  
  /**
   * Create a link token for Plaid Link integration
   */
  async createLinkToken(userId?: string): Promise<{
    success: boolean;
    data: {
      linkToken: string;
      expiration: string;
      requestId: string;
    };
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/plaid/create-link-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId || `user_${Date.now()}`,
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create link token');
      }
      
      return data;
    } catch (error) {
      console.error('Error creating link token:', error);
      throw error;
    }
  }
  
  /**
   * Exchange a public token for an access token
   */
  async exchangeToken(publicToken: string, userId?: string): Promise<{
    success: boolean;
    data: {
      accessToken: string;
      itemId: string;
      userId: string;
    };
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/plaid/exchange-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_token: publicToken,
          userId: userId,
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to exchange token');
      }
      
      return data;
    } catch (error) {
      console.error('Error exchanging token:', error);
      throw error;
    }
  }
}

export const plaidService = new PlaidService();
