"use client";

import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  Plus, 
  Receipt, 
  EyeOff, 
  Info, 
  DollarSign, 
  Calendar,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { SyncStatus } from './SyncStatus';

interface SettingsProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

// Sample settings data
const settingsData = {
  accounts: [
    { 
      id: 1, 
      name: "Chase Checking", 
      logo: "🏦", 
      provider: "Plaid", 
      lastSynced: "2025-08-18T10:58", 
      status: "syncing" as const 
    },
    { 
      id: 2, 
      name: "Wells Fargo Savings", 
      logo: "🏛️", 
      provider: "Teller", 
      lastSynced: "2025-08-18T10:40", 
      status: "ok" as const 
    },
  ],
  bills: [
    { id: 1, merchant: "Rent", amount: 1200, frequency: "monthly" },
    { id: 2, merchant: "Electric Bill", amount: 85, frequency: "monthly" },
    { id: 3, merchant: "Netflix", amount: 15.99, frequency: "monthly" },
  ],
  ignoreRules: [
    { id: 1, pattern: "USAA → Chase Card", type: "Credit Card Payment" },
    { id: 2, pattern: "Transfer from CHECKING", type: "Internal Transfer" },
    { id: 3, pattern: "VENMO CASHOUT", type: "Transfer" },
  ],
  app: {
    currency: "USD",
    version: "1.0.0",
    payPeriod: "biweekly",
    manualInputEnabled: false,
  }
};

export function Settings({ onBack, onNavigate }: SettingsProps) {
  const [manualInputEnabled, setManualInputEnabled] = useState(settingsData.app.manualInputEnabled);
  const [payPeriod, setPayPeriod] = useState(settingsData.app.payPeriod);
  const [currency, setCurrency] = useState(settingsData.app.currency);

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    action, 
    onClick 
  }: { 
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    onClick?: () => void;
  }) => (
    <div 
      className={`flex items-center justify-between p-4 touch-target ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
          {icon}
        </div>
        <div>
          <p className="font-medium">{title}</p>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex items-center">{action}</div>}
    </div>
  );

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
              <h1 className="text-xl font-semibold">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your Daily Dollars</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto safe-x">
        <div className="p-4 space-y-6">
          
          {/* Accounts & Sync */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="ios-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  Accounts & Sync
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {settingsData.accounts.map((account, index) => (
                  <div key={account.id}>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                          <span className="text-lg">{account.logo}</span>
                        </div>
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-sm text-muted-foreground">{account.provider}</p>
                        </div>
                      </div>
                      <SyncStatus 
                        status={account.status}
                        lastSynced={account.lastSynced}
                      />
                    </div>
                    {index < settingsData.accounts.length - 1 && <Separator />}
                  </div>
                ))}
                
                <Separator className="my-4" />
                
                <Button 
                  variant="outline" 
                  className="w-full rounded-2xl border-2"
                  onClick={() => onNavigate('connect-accounts')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Connect New Account
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bills & Ignore Rules */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="ios-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-orange-600" />
                  </div>
                  Bills & Ignore Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                <SettingItem
                  icon={<Receipt className="w-4 h-4" />}
                  title="Manage Bills"
                  subtitle={`${settingsData.bills.length} bills flagged`}
                  action={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  onClick={() => onNavigate('manage-bills')}
                />
                
                <Separator />
                
                <SettingItem
                  icon={<EyeOff className="w-4 h-4" />}
                  title="Ignored Transactions"
                  subtitle={`${settingsData.ignoreRules.length} rules active`}
                  action={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  onClick={() => onNavigate('ignore-rules')}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Manual Inputs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="ios-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-gray-600" />
                  </div>
                  Manual Inputs
                  <Badge variant="secondary" className="text-xs">Temporary</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable manual transactions</p>
                    <p className="text-sm text-muted-foreground">Add transactions manually when needed</p>
                  </div>
                  <Switch 
                    checked={manualInputEnabled}
                    onCheckedChange={setManualInputEnabled}
                  />
                </div>
                
                {manualInputEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.2 }}
                  >
                    <Separator />
                    <Button variant="outline" className="w-full rounded-2xl border-2">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Manual Transaction
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Explainers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="ios-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Info className="w-4 h-4 text-blue-600" />
                  </div>
                  Help & Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                <SettingItem
                  icon={<Info className="w-4 h-4" />}
                  title="How streaks & slush work"
                  action={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  onClick={() => onNavigate('explainer')}
                />
                
                <Separator />
                
                <SettingItem
                  icon={<DollarSign className="w-4 h-4" />}
                  title="Rounding rules"
                  subtitle="How we handle cents and daily calculations"
                  action={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  onClick={() => console.log('Navigate to rounding rules')}
                />
                
                <Separator />
                
                <SettingItem
                  icon={<Calendar className="w-4 h-4" />}
                  title="Payday anchoring"
                  subtitle="Bi-weekly vs monthly pay periods"
                  action={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  onClick={() => onNavigate('payday-explainer')}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* App Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="ios-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-gray-600" />
                  </div>
                  App Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Currency</p>
                    <p className="text-sm text-muted-foreground">Display currency for amounts</p>
                  </div>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-24 rounded-2xl border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pay Period</p>
                    <p className="text-sm text-muted-foreground">How often you get paid</p>
                  </div>
                  <Select value={payPeriod} onValueChange={setPayPeriod}>
                    <SelectTrigger className="w-32 rounded-2xl border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Version</p>
                    <p className="text-sm text-muted-foreground">Daily Dollars {settingsData.app.version}</p>
                  </div>
                </div>
                
                <Separator />
                
                <Button variant="ghost" className="w-full justify-start rounded-2xl text-primary">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Support & Feedback
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <div className="pb-6" />
        </div>
      </div>
    </div>
  );
}