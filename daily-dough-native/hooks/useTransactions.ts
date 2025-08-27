import { useState, useEffect, useCallback } from 'react';
import { plaidService, Transaction, Account, TransactionResponse } from '../services/plaidService';
import { secureStorage } from '../services/secureStorage';

export interface UseTransactionsResult {
  transactions: Transaction[];
  accounts: Account[];
  summary: {
    totalTransactions: number;
    totalSpent: number;
    totalReceived: number;
    netChange: number;
    categoriesCount: number;
  } | null;
  loading: boolean;
  error: string | null;
  hasStoredCredentials: boolean;
  refresh: () => Promise<void>;
  loadDevData: () => Promise<void>;
  loadSandboxData: () => Promise<void>;
  clearData: () => Promise<void>;
}

/**
 * Custom hook for managing transaction data
 * Handles both development/sample data and real Plaid data
 */
export function useTransactions(): UseTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<UseTransactionsResult['summary']>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);

  // Check for stored credentials on mount
  useEffect(() => {
    checkStoredCredentials();
  }, []);

  const checkStoredCredentials = useCallback(async () => {
    try {
      const hasCredentials = await secureStorage.hasStoredCredentials();
      setHasStoredCredentials(hasCredentials);
      
      if (hasCredentials) {
        // Auto-load real data if we have credentials
        await loadRealData();
      } else {
        // Load sandbox data first, then fall back to dev data if needed
        await loadSandboxData();
      }
    } catch (err) {
      console.error('Error checking stored credentials:', err);
      // Final fallback to dev data
      await loadDevData();
    }
  }, []);

  const processTransactionData = useCallback((data: TransactionResponse) => {
    setTransactions(data.data.transactions);
    setAccounts(data.data.accounts);
    setSummary(data.data.summary);
    setError(null);
    
    // Update last sync timestamp
    secureStorage.storeLastSync(data.metadata.timestamp);
    
    console.log(`✅ Loaded ${data.data.transactions.length} transactions`);
  }, []);

  const loadRealData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const accessToken = await secureStorage.getAccessToken();
      
      if (!accessToken) {
        // No stored access token, try sandbox data instead
        console.log('🏦 No access token found, loading sandbox data...');
        await loadSandboxData();
        return;
      }
      
      console.log('📊 Loading real transaction data...');
      const data = await plaidService.getRealTransactions(accessToken, 30);
      processTransactionData(data);
      
    } catch (err) {
      console.error('Error loading real transaction data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load real transaction data');
      
      // Fallback to sandbox data
      console.log('🔄 Falling back to sandbox data...');
      await loadSandboxData();
    } finally {
      setLoading(false);
    }
  }, [processTransactionData]);

  const loadSandboxData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏦 Loading real Plaid sandbox data...');
      const data = await plaidService.getRealSandboxData();
      processTransactionData(data);
      
    } catch (err) {
      console.error('Error loading sandbox data:', err);
      // Final fallback to development data
      console.log('🔄 Falling back to development data...');
      await loadDevData();
    } finally {
      setLoading(false);
    }
  }, [processTransactionData]);

  const loadDevData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🧪 Loading development transaction data...');
      const data = await plaidService.getDevTransactions();
      processTransactionData(data);
      
    } catch (err) {
      console.error('Error loading development transaction data:', err);
      const errorMessage = err instanceof Error 
        ? `Failed to load data: ${err.message}` 
        : 'Failed to load transaction data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [processTransactionData]);

  const refresh = useCallback(async () => {
    if (hasStoredCredentials) {
      await loadRealData();
    } else {
      await loadSandboxData();
    }
  }, [hasStoredCredentials, loadRealData, loadSandboxData]);

  const clearData = useCallback(async () => {
    try {
      await secureStorage.clearSession();
      setTransactions([]);
      setAccounts([]);
      setSummary(null);
      setHasStoredCredentials(false);
      setError(null);
      
      // Load dev data after clearing
      await loadDevData();
      
      console.log('✅ Data cleared, switched to development mode');
    } catch (err) {
      console.error('Error clearing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear data');
    }
  }, [loadDevData]);

  return {
    transactions,
    accounts,
    summary,
    loading,
    error,
    hasStoredCredentials,
    refresh,
    loadDevData,
    loadSandboxData,
    clearData,
  };
}
