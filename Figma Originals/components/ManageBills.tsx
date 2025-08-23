"use client";

import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { 
  ChevronLeft, 
  Receipt, 
  Plus, 
  Check,
  X,
  DollarSign,
  Calendar,
  Trash2,
  Info
} from 'lucide-react';

interface ManageBillsProps {
  onBack: () => void;
}

// Sample transaction data for flagging
const recentTransactions = [
  { id: 1, date: "2025-08-17T14:30", merchant: "Electric Company", amount: -85.50, tag: "spend", category: "Utilities" },
  { id: 2, date: "2025-08-16T09:15", merchant: "Netflix", amount: -15.99, tag: "bill", category: "Subscriptions" },
  { id: 3, date: "2025-08-15T16:22", merchant: "Starbucks", amount: -4.75, tag: "spend", category: "Food" },
  { id: 4, date: "2025-08-15T08:00", merchant: "Rent Payment", amount: -1200.00, tag: "bill", category: "Housing" },
  { id: 5, date: "2025-08-14T19:45", merchant: "Spotify", amount: -9.99, tag: "spend", category: "Subscriptions" },
  { id: 6, date: "2025-08-14T12:30", merchant: "Grocery Store", amount: -67.32, tag: "spend", category: "Food" },
  { id: 7, date: "2025-08-13T10:15", merchant: "Internet Service", amount: -79.99, tag: "spend", category: "Utilities" },
];

// Sample existing bills
const existingBills = [
  { id: 1, merchant: "Rent Payment", amount: 1200.00, frequency: "monthly" },
  { id: 2, merchant: "Netflix", amount: 15.99, frequency: "monthly" },
];

export function ManageBills({ onBack }: ManageBillsProps) {
  const [transactions, setTransactions] = useState(recentTransactions);
  const [bills, setBills] = useState(existingBills);
  const [showAddBill, setShowAddBill] = useState(false);
  const [newBill, setNewBill] = useState({ merchant: '', amount: '', frequency: 'monthly' });

  // Calculate total monthly bills
  const monthlyBillsTotal = bills.reduce((sum, bill) => {
    const monthlyAmount = bill.frequency === 'monthly' ? bill.amount : 
                         bill.frequency === 'weekly' ? bill.amount * 4.33 :
                         bill.frequency === 'biweekly' ? bill.amount * 2.17 :
                         bill.amount;
    return sum + monthlyAmount;
  }, 0);

  const toggleTransactionBill = (id: number) => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, tag: t.tag === 'bill' ? 'spend' : 'bill' } : t
    ));
  };

  const addManualBill = () => {
    if (newBill.merchant && newBill.amount) {
      const bill = {
        id: Date.now(),
        merchant: newBill.merchant,
        amount: parseFloat(newBill.amount),
        frequency: newBill.frequency
      };
      setBills(prev => [...prev, bill]);
      setNewBill({ merchant: '', amount: '', frequency: 'monthly' });
      setShowAddBill(false);
    }
  };

  const removeBill = (id: number) => {
    setBills(prev => prev.filter(b => b.id !== id));
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
              <h1 className="text-xl font-semibold">Manage Bills</h1>
              <p className="text-sm text-muted-foreground">Flag non-discretionary expenses</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto safe-x">
        <div className="p-4 space-y-6">
          
          {/* Monthly Bills Total */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="ios-card-elevated">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-success flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Estimated Monthly Bills</h3>
                      <p className="text-sm text-muted-foreground">Live calculation</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-currency text-success">
                      ${monthlyBillsTotal.toFixed(0)}
                    </span>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                      Bills reduce your discretionary income but don&apos;t count against daily spend or break streaks.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Current Bills */}
          {bills.length > 0 && (
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
                    Current Bills
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  {bills.map((bill, index) => (
                    <div key={bill.id}>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{bill.merchant}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{bill.frequency}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold text-currency">
                            ${bill.amount.toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBill(bill.id)}
                            className="text-danger hover:bg-red-50 rounded-2xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {index < bills.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Add Manual Bill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Dialog open={showAddBill} onOpenChange={setShowAddBill}>
              <DialogTrigger asChild>
                <Button className="w-full rounded-2xl gradient-blue text-white border-0 touch-target">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bill Manually
                </Button>
              </DialogTrigger>
              <DialogContent className="ios-card max-w-sm mx-auto">
                <DialogHeader>
                  <DialogTitle>Add Manual Bill</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="merchant">Bill Name</Label>
                    <Input
                      id="merchant"
                      placeholder="e.g., Electric Bill"
                      value={newBill.merchant}
                      onChange={(e) => setNewBill(prev => ({ ...prev, merchant: e.target.value }))}
                      className="mt-1 rounded-2xl border-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={newBill.amount}
                      onChange={(e) => setNewBill(prev => ({ ...prev, amount: e.target.value }))}
                      className="mt-1 rounded-2xl border-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={newBill.frequency} onValueChange={(value) => setNewBill(prev => ({ ...prev, frequency: value }))}>
                      <SelectTrigger className="mt-1 rounded-2xl border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline" 
                      onClick={() => setShowAddBill(false)}
                      className="flex-1 rounded-2xl border-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={addManualBill}
                      className="flex-1 rounded-2xl gradient-blue text-white border-0"
                    >
                      Add Bill
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
                  Tap to flag as bills or unflag existing bills
                </p>
              </CardHeader>
              <CardContent className="space-y-0">
                {transactions.map((transaction, index) => (
                  <div key={transaction.id}>
                    <motion.div
                      className="flex items-center justify-between py-3 touch-target cursor-pointer hover:bg-gray-50 rounded-lg"
                      onClick={() => toggleTransactionBill(transaction.id)}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          transaction.tag === 'bill' ? 'bg-orange-100' : 'bg-gray-100'
                        }`}>
                          {transaction.tag === 'bill' ? (
                            <Check className="w-4 h-4 text-orange-600" />
                          ) : (
                            <Receipt className="w-4 h-4 text-gray-600" />
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
                            {transaction.tag === 'bill' && (
                              <Badge variant="secondary" className="text-xs">Bill</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold text-currency text-danger">
                          ${Math.abs(transaction.amount).toFixed(2)}
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