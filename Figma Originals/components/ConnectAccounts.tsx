"use client";

import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  ChevronLeft, 
  Building2, 
  Shield, 
  Check,
  Loader2,
  Lock,
  Eye
} from 'lucide-react';
import { SyncStatus } from './SyncStatus';

interface ConnectAccountsProps {
  onBack: () => void;
  onContinue: () => void;
}

// Sample connected accounts data
const sampleConnectedAccounts = [
  { 
    id: 1, 
    name: "Chase Checking", 
    logo: "🏦", 
    provider: "Plaid", 
    lastSynced: "2025-08-18T10:58", 
    status: "ok" as const,
    accountType: "Checking",
    balance: 2847.32
  },
  { 
    id: 2, 
    name: "Wells Fargo Savings", 
    logo: "🏛️", 
    provider: "Plaid", 
    lastSynced: "2025-08-18T10:40", 
    status: "ok" as const,
    accountType: "Savings", 
    balance: 12459.68
  },
  { 
    id: 3, 
    name: "USAA Credit Card", 
    logo: "💳", 
    provider: "Plaid", 
    lastSynced: "2025-08-18T10:42", 
    status: "syncing" as const,
    accountType: "Credit Card",
    balance: -423.15
  },
];

const providers = [
  {
    id: 'plaid',
    name: 'Plaid',
    description: 'Most banks supported',
    logo: '🔗',
    isDefault: true,
    supported: ['Chase', 'Wells Fargo', 'Bank of America', 'Citi', 'USAA', 'Capital One', '10,000+ others']
  },
  {
    id: 'teller',
    name: 'Teller',
    description: 'Alternative provider',
    logo: '🏪',
    isDefault: false,
    supported: ['Most major banks', 'Credit unions', 'Regional banks']
  }
];

export function ConnectAccounts({ onBack, onContinue }: ConnectAccountsProps) {
  const [selectedProvider, setSelectedProvider] = useState('plaid');
  const [connectedAccounts, setConnectedAccounts] = useState(sampleConnectedAccounts);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectAccount = async () => {
    setIsConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      // Add a new mock account
      const newAccount = {
        id: Date.now(),
        name: "TD Bank Checking",
        logo: "🏢",
        provider: selectedProvider === 'plaid' ? 'Plaid' : 'Teller',
        lastSynced: new Date().toISOString(),
        status: "ok" as const,
        accountType: "Checking",
        balance: 1523.45
      };
      setConnectedAccounts(prev => [...prev, newAccount]);
      setIsConnecting(false);
    }, 2000);
  };

  const hasConnectedAccounts = connectedAccounts.length > 0;

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-lg border-b border-border/50 safe-x sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="touch-target -ml-2 rounded-2xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Let&apos;s connect your accounts</h1>
              <p className="text-sm text-muted-foreground">Secure bank connection</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto safe-x">
        <div className="p-4 space-y-6">
          
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="ios-card">
              <CardContent className="p-5 text-center">
                <div className="w-16 h-16 rounded-3xl gradient-blue mx-auto mb-4 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-large mb-3">Connect your bank safely</h2>
                <p className="text-muted-foreground mb-4">
                  Securely link your bank account to start tracking spending automatically. We use bank-grade encryption with our trusted provider Plaid.
                </p>
                
                <div className="bg-blue-50 rounded-xl p-3">
                  <div className="flex items-center justify-center gap-2 text-blue-700">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">256-bit SSL encryption</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Provider Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="ios-card">
              <CardHeader className="pb-4">
                <CardTitle>Choose your provider</CardTitle>
                <p className="text-sm text-muted-foreground">Both are secure and trusted</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {providers.map((provider) => (
                  <motion.div
                    key={provider.id}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedProvider === provider.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedProvider(provider.id)}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                          <span className="text-lg">{provider.logo}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{provider.name}</h3>
                            {provider.isDefault && (
                              <Badge variant="secondary" className="text-xs">Recommended</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{provider.description}</p>
                        </div>
                      </div>
                      {selectedProvider === provider.id && (
                        <Check className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Supports: {provider.supported.slice(0, 3).join(', ')}
                      {provider.supported.length > 3 && ` +${provider.supported.length - 3} more`}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Connect Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              className="w-full touch-target gradient-blue text-white border-0 rounded-2xl"
              onClick={handleConnectAccount}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting to {providers.find(p => p.id === selectedProvider)?.name}...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  Connect with {providers.find(p => p.id === selectedProvider)?.name}
                </>
              )}
            </Button>
          </motion.div>

          {/* Connected Accounts */}
          {hasConnectedAccounts && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="ios-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    Connected Accounts
                    <Badge variant="secondary" className="text-xs">{connectedAccounts.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  {connectedAccounts.map((account, index) => (
                    <div key={account.id}>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                            <span className="text-lg">{account.logo}</span>
                          </div>
                          <div>
                            <h4 className="font-medium">{account.name}</h4>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-muted-foreground">{account.accountType}</p>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-sm font-medium text-currency">
                                ${Math.abs(account.balance).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <SyncStatus 
                          status={account.status}
                          lastSynced={account.lastSynced}
                        />
                      </div>
                      {index < connectedAccounts.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Privacy & Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="ios-card">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <Lock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-800 mb-1">Your privacy is protected</h4>
                    <p className="text-sm text-green-700 mb-3">
                      Your login credentials are never shared with Daily Dollars. Secure tokens are stored locally on your device.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span>Read-only access to transaction data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span>Bank-grade 256-bit encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span>Tokens stored securely on your device</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span>No access to login credentials</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="pb-6"
          >
            <Button 
              className={`w-full touch-target rounded-2xl ${
                hasConnectedAccounts 
                  ? 'gradient-success text-white border-0' 
                  : 'bg-gray-100 text-gray-400 border-0 cursor-not-allowed'
              }`}
              onClick={onContinue}
              disabled={!hasConnectedAccounts}
              size="lg"
            >
              {hasConnectedAccounts ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Continue Setup
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Connect at least one account to continue
                </>
              )}
            </Button>
            
            {hasConnectedAccounts && (
              <p className="text-center text-xs text-muted-foreground mt-2">
                You can add more accounts later in Settings
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}