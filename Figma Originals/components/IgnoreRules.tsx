"use client";

import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  ChevronLeft, 
  EyeOff, 
  Plus, 
  Check,
  Trash2,
  Info,
  ArrowRightLeft,
  CreditCard
} from 'lucide-react';

interface IgnoreRulesProps {
  onBack: () => void;
}

// Sample transactions that could be ignored
const potentialIgnoreTransactions = [
  { id: 1, date: "2025-08-17T16:45", merchant: "PAYMENT TO CHASE CARD", amount: -300.00, tag: "spend", type: "Credit Card Payment" },
  { id: 2, date: "2025-08-17T14:20", merchant: "Transfer from CHECKING", amount: -500.00, tag: "ignored", type: "Internal Transfer" },
  { id: 3, date: "2025-08-16T09:30", merchant: "VENMO CASHOUT", amount: 45.00, tag: "spend", type: "Transfer" },
  { id: 4, date: "2025-08-15T18:15", merchant: "ZELLE TRANSFER TO SAVINGS", amount: -200.00, tag: "spend", type: "Internal Transfer" },
  { id: 5, date: "2025-08-15T12:00", merchant: "PAYMENT TO DISCOVER CARD", amount: -150.00, tag: "ignored", type: "Credit Card Payment" },
  { id: 6, date: "2025-08-14T20:30", merchant: "ACH WITHDRAWAL SAVINGS", amount: -100.00, tag: "spend", type: "Internal Transfer" },
  { id: 7, date: "2025-08-14T08:45", merchant: "PAYPAL TRANSFER", amount: -75.00, tag: "spend", type: "Transfer" },
];

// Sample existing ignore rules
const existingIgnoreRules = [
  { id: 1, pattern: "USAA → Chase Card", type: "Credit Card Payment" },
  { id: 2, pattern: "Transfer from CHECKING", type: "Internal Transfer" },
  { id: 3, pattern: "VENMO CASHOUT", type: "Transfer" },
];

export function IgnoreRules({ onBack }: IgnoreRulesProps) {
  const [transactions, setTransactions] = useState(potentialIgnoreTransactions);
  const [ignoreRules, setIgnoreRules] = useState(existingIgnoreRules);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({ pattern: '', type: 'Internal Transfer' });

  const toggleTransactionIgnore = (id: number) => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, tag: t.tag === 'ignored' ? 'spend' : 'ignored' } : t
    ));
  };

  const addIgnoreRule = () => {
    if (newRule.pattern) {
      const rule = {
        id: Date.now(),
        pattern: newRule.pattern,
        type: newRule.type
      };
      setIgnoreRules(prev => [...prev, rule]);
      setNewRule({ pattern: '', type: 'Internal Transfer' });
      setShowAddRule(false);
    }
  };

  const removeIgnoreRule = (id: number) => {
    setIgnoreRules(prev => prev.filter(r => r.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Credit Card Payment':
        return <CreditCard className="w-4 h-4" />;
      case 'Internal Transfer':
        return <ArrowRightLeft className="w-4 h-4" />;
      default:
        return <ArrowRightLeft className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Credit Card Payment':
        return 'bg-blue-100 text-blue-600';
      case 'Internal Transfer':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

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
              <h1 className="text-xl font-semibold">Ignore Rules</h1>
              <p className="text-sm text-muted-foreground">Manage transfers & CC payments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto safe-x">
        <div className="p-4 space-y-6">
          
          {/* Explanation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="ios-card">
              <CardContent className="p-5">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">How Ignore Rules Work</h4>
                      <p className="text-sm text-blue-700 mb-2">
                        Mark transfers and credit card payments as &quot;Ignored&quot; so they won&apos;t affect your daily spending or slush pot.
                      </p>
                      <p className="text-xs text-blue-600">
                        We&apos;ll still show them in your transaction feed with an &quot;Ignored&quot; tag for transparency.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Current Ignore Rules */}
          {ignoreRules.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="ios-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <EyeOff className="w-4 h-4 text-gray-600" />
                    </div>
                    Active Ignore Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  {ignoreRules.map((rule, index) => (
                    <div key={rule.id}>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${getTypeColor(rule.type)}`}>
                            {getTypeIcon(rule.type)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{rule.pattern}</h4>
                            <p className="text-sm text-muted-foreground">{rule.type}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIgnoreRule(rule.id)}
                          className="text-danger hover:bg-red-50 rounded-2xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {index < ignoreRules.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Add Manual Rule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Dialog open={showAddRule} onOpenChange={setShowAddRule}>
              <DialogTrigger asChild>
                <Button className="w-full rounded-2xl gradient-blue text-white border-0 touch-target">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ignore Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="ios-card max-w-sm mx-auto">
                <DialogHeader>
                  <DialogTitle>Add Ignore Rule</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="pattern">Transaction Pattern</Label>
                    <Input
                      id="pattern"
                      placeholder="e.g., PAYMENT TO CHASE CARD"
                      value={newRule.pattern}
                      onChange={(e) => setNewRule(prev => ({ ...prev, pattern: e.target.value }))}
                      className="mt-1 rounded-2xl border-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter text that appears in transactions you want to ignore
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="type">Category</Label>
                    <Select value={newRule.type} onValueChange={(value) => setNewRule(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="mt-1 rounded-2xl border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Internal Transfer">Internal Transfer</SelectItem>
                        <SelectItem value="Credit Card Payment">Credit Card Payment</SelectItem>
                        <SelectItem value="Transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline" 
                      onClick={() => setShowAddRule(false)}
                      className="flex-1 rounded-2xl border-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={addIgnoreRule}
                      className="flex-1 rounded-2xl gradient-blue text-white border-0"
                    >
                      Add Rule
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Recent Transactions to Flag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="ios-card">
              <CardHeader className="pb-4">
                <CardTitle>Recent Transactions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Common patterns detected - tap to ignore or un-ignore
                </p>
              </CardHeader>
              <CardContent className="space-y-0">
                {transactions.map((transaction, index) => (
                  <div key={transaction.id}>
                    <motion.div
                      className="flex items-center justify-between py-3 touch-target cursor-pointer hover:bg-gray-50 rounded-lg"
                      onClick={() => toggleTransactionIgnore(transaction.id)}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          transaction.tag === 'ignored' ? 'bg-gray-100' : getTypeColor(transaction.type)
                        }`}>
                          {transaction.tag === 'ignored' ? (
                            <Check className="w-4 h-4 text-gray-600" />
                          ) : (
                            getTypeIcon(transaction.type)
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{transaction.merchant}</h4>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric'
                              })}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {transaction.type}
                            </Badge>
                            {transaction.tag === 'ignored' && (
                              <Badge variant="secondary" className="text-xs">Ignored</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-semibold text-currency ${
                          transaction.amount < 0 ? 'text-danger' : 'text-success'
                        }`}>
                          {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                        </span>
                      </div>
                    </motion.div>
                    {index < transactions.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <div className="pb-6" />
        </div>
      </div>
    </div>
  );
}