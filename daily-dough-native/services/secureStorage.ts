import * as SecureStore from 'expo-secure-store';

/**
 * Secure storage service for handling sensitive data like access tokens
 * Uses Expo SecureStore which provides encrypted storage on device
 */
class SecureStorageService {
  
  // Storage keys
  private static readonly ACCESS_TOKEN_KEY = 'plaid_access_token';
  private static readonly ITEM_ID_KEY = 'plaid_item_id';
  private static readonly USER_ID_KEY = 'user_id';
  private static readonly LAST_SYNC_KEY = 'last_sync_timestamp';
  
  /**
   * Store Plaid access token securely
   */
  async storeAccessToken(accessToken: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(SecureStorageService.ACCESS_TOKEN_KEY, accessToken);
      console.log('✅ Access token stored securely');
    } catch (error) {
      console.error('❌ Error storing access token:', error);
      throw new Error('Failed to store access token securely');
    }
  }
  
  /**
   * Retrieve Plaid access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(SecureStorageService.ACCESS_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('❌ Error retrieving access token:', error);
      return null;
    }
  }
  
  /**
   * Store Plaid item ID
   */
  async storeItemId(itemId: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(SecureStorageService.ITEM_ID_KEY, itemId);
      console.log('✅ Item ID stored securely');
    } catch (error) {
      console.error('❌ Error storing item ID:', error);
      throw new Error('Failed to store item ID securely');
    }
  }
  
  /**
   * Retrieve Plaid item ID
   */
  async getItemId(): Promise<string | null> {
    try {
      const itemId = await SecureStore.getItemAsync(SecureStorageService.ITEM_ID_KEY);
      return itemId;
    } catch (error) {
      console.error('❌ Error retrieving item ID:', error);
      return null;
    }
  }
  
  /**
   * Store user ID
   */
  async storeUserId(userId: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(SecureStorageService.USER_ID_KEY, userId);
      console.log('✅ User ID stored securely');
    } catch (error) {
      console.error('❌ Error storing user ID:', error);
      throw new Error('Failed to store user ID securely');
    }
  }
  
  /**
   * Retrieve user ID
   */
  async getUserId(): Promise<string | null> {
    try {
      const userId = await SecureStore.getItemAsync(SecureStorageService.USER_ID_KEY);
      return userId;
    } catch (error) {
      console.error('❌ Error retrieving user ID:', error);
      return null;
    }
  }
  
  /**
   * Store last sync timestamp
   */
  async storeLastSync(timestamp: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(SecureStorageService.LAST_SYNC_KEY, timestamp);
    } catch (error) {
      console.error('❌ Error storing last sync timestamp:', error);
    }
  }
  
  /**
   * Retrieve last sync timestamp
   */
  async getLastSync(): Promise<string | null> {
    try {
      const timestamp = await SecureStore.getItemAsync(SecureStorageService.LAST_SYNC_KEY);
      return timestamp;
    } catch (error) {
      console.error('❌ Error retrieving last sync timestamp:', error);
      return null;
    }
  }
  
  /**
   * Check if user has stored credentials
   */
  async hasStoredCredentials(): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const itemId = await this.getItemId();
      return !!(accessToken && itemId);
    } catch (error) {
      console.error('❌ Error checking stored credentials:', error);
      return false;
    }
  }
  
  /**
   * Store complete Plaid session data
   */
  async storeSession(accessToken: string, itemId: string, userId: string): Promise<void> {
    try {
      await Promise.all([
        this.storeAccessToken(accessToken),
        this.storeItemId(itemId),
        this.storeUserId(userId),
        this.storeLastSync(new Date().toISOString()),
      ]);
      console.log('✅ Complete Plaid session stored securely');
    } catch (error) {
      console.error('❌ Error storing Plaid session:', error);
      throw new Error('Failed to store Plaid session securely');
    }
  }
  
  /**
   * Clear all stored Plaid data (logout)
   */
  async clearSession(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(SecureStorageService.ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(SecureStorageService.ITEM_ID_KEY),
        SecureStore.deleteItemAsync(SecureStorageService.USER_ID_KEY),
        SecureStore.deleteItemAsync(SecureStorageService.LAST_SYNC_KEY),
      ]);
      console.log('✅ Plaid session cleared');
    } catch (error) {
      console.error('❌ Error clearing Plaid session:', error);
      throw new Error('Failed to clear Plaid session');
    }
  }
  
  /**
   * Get complete session data
   */
  async getSession(): Promise<{
    accessToken: string | null;
    itemId: string | null;
    userId: string | null;
    lastSync: string | null;
  }> {
    try {
      const [accessToken, itemId, userId, lastSync] = await Promise.all([
        this.getAccessToken(),
        this.getItemId(),
        this.getUserId(),
        this.getLastSync(),
      ]);
      
      return {
        accessToken,
        itemId,
        userId,
        lastSync,
      };
    } catch (error) {
      console.error('❌ Error retrieving session data:', error);
      return {
        accessToken: null,
        itemId: null,
        userId: null,
        lastSync: null,
      };
    }
  }
}

export const secureStorage = new SecureStorageService();
