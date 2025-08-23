"use client";

import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ChevronLeft, Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface PaydayExplainerProps {
  onBack: () => void;
}

export function PaydayExplainer({ onBack }: PaydayExplainerProps) {
  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <div className="bg-card border-b border-border safe-x sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="touch-target -ml-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Payday Anchoring</h1>
              <p className="text-sm text-muted-foreground">How pay periods work</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto safe-x">
        <div className="p-4 space-y-6">
          
          {/* Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="ios-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  Budget Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Daily Dollars anchors your budget to your actual payday, ensuring your allowances sync perfectly with your income.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bi-weekly Default */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="ios-card border-l-4 border-l-blue-500">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-600">Bi-weekly (Default)</h3>
                    <Badge variant="secondary" className="text-xs">Most common</Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">How it works:</h4>
                    <div className="space-y-1 text-sm text-blue-700">
                      <p>• Paycheck every 2 weeks (26 per year)</p>
                      <p>• Budget periods align with pay dates</p>
                      <p>• Handles 2 vs 3-paycheck months automatically</p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-green-800 mb-1">Math preview:</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>Discretionary per period = Paycheck - (Monthly bills ÷ 2)</p>
                      <p>Daily allowance = Period discretionary ÷ 14 days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Monthly Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="ios-card border-l-4 border-l-orange-500">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-600">Monthly</h3>
                    <Badge variant="secondary" className="text-xs">Alternative</Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-orange-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-orange-800 mb-2">How it works:</h4>
                    <div className="space-y-1 text-sm text-orange-700">
                      <p>• Paycheck once per month (12 per year)</p>
                      <p>• Budget periods = calendar months</p>
                      <p>• Consistent monthly planning</p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-green-800 mb-1">Math preview:</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>Discretionary per month = Paycheck - Monthly bills</p>
                      <p>Daily allowance = Monthly discretionary ÷ days in month</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Special Cases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="ios-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  Special Cases
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <h4 className="text-sm font-medium text-green-800">3-Paycheck Months</h4>
                  </div>
                  <p className="text-sm text-green-700 mb-2">
                    Bi-weekly workers get 3 paychecks in some months. Daily Dollars automatically detects this and shows:
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <Badge variant="default" className="bg-green-600 text-white text-xs">
                      💰 This month has 3 paychecks → discretionary higher by $467
                    </Badge>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <h4 className="text-sm font-medium text-blue-800">Carryover Logic</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    100% of daily over/under amounts flow to your Period Slush pot, smoothing out spending variations and keeping weekends consistent.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="ios-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                  </div>
                  Setup Inputs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Required Information:</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Payday anchor date (we detect from linked accounts)</p>
                      <p>• Paycheck amounts (manual or auto-detected)</p>
                      <p>• Monthly bills total (from flagged transactions)</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Rounding Rules:</h4>
                    <p className="text-sm text-muted-foreground">
                      Daily allowances round to nearest $1. Any remainder gets absorbed by the last day of the period (±$1 max).
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Weekends:</h4>
                    <p className="text-sm text-muted-foreground">
                      Same allowance as weekdays. Your slush pot handles natural spending variations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Back to Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="pb-6"
          >
            <Button 
              onClick={onBack}
              className="w-full touch-target gradient-blue text-white border-0 rounded-2xl"
              size="lg"
            >
              Back to Settings
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}