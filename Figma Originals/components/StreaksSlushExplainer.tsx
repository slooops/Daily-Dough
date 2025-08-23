"use client";

import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ChevronLeft, Flame, DollarSign, Target, Calendar, Clock, RefreshCw } from 'lucide-react';

interface StreaksSlushExplainerProps {
  onBack: () => void;
}

export function StreaksSlushExplainer({ onBack }: StreaksSlushExplainerProps) {
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
              <h1 className="text-xl font-semibold">How it Works</h1>
              <p className="text-sm text-muted-foreground">Streaks & slush rules</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto safe-x">
        <div className="p-4 space-y-6">
          
          {/* Streaks Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="ios-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center">
                    <Flame className="w-4 h-4 text-white" fill="currentColor" />
                  </div>
                  Streak Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Daily Dollars tracks two types of streaks to keep your budget fun and motivating.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* No-Spend Streak (Blue) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="ios-card border-l-4 border-l-blue-500">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-blue-500" fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-600">No-Spend Days</h3>
                    <Badge variant="secondary" className="text-xs">Blue Flame</Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800 mb-1">A day counts if:</p>
                    <p className="text-sm text-blue-700">Posted spend = $0</p>
                    <p className="text-xs text-blue-600 mt-1">Manual entries count as spend too!</p>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-800 mb-1">Streak breaks if:</p>
                    <p className="text-sm text-red-700">Any posted spend &gt; $0 on that day</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Within-Budget Streak (Orange) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="ios-card border-l-4 border-l-orange-500">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-500" fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-600">Within-Budget Days</h3>
                    <Badge variant="secondary" className="text-xs">Orange Flame</Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-orange-800 mb-2">A day counts if either:</p>
                    <div className="space-y-2 text-sm text-orange-700">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                        <span>spent_today ≤ daily_allowance</span>
                      </div>
                      <div className="text-xs text-orange-600 font-medium">OR</div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                        <span>spent_today &gt; daily_allowance AND slush after applying today ≥ 0</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-800 mb-1">The magic:</p>
                    <p className="text-sm text-green-700">Overspending is OK if you&apos;ve banked enough surplus!</p>
                  </div>

                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-800 mb-1">Streak breaks when:</p>
                    <p className="text-sm text-red-700">Slush &lt; 0 at day close</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Slush Explained */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="ios-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full gradient-success flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  Period Slush
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Your slush pot collects 100% of daily over/under amounts, smoothing out spending bumps.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Example day calculation:</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>Daily allowance: $100</p>
                    <p>Spent today: $112</p>
                    <p>Over by: $12</p>
                    <p className="font-medium text-foreground">→ Slush: $31 → $19</p>
                  </div>
                  <p className="text-xs text-success mt-2">✅ Orange streak continues (slush still positive)</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* End of Period */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="ios-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full gradient-orange flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-white" />
                  </div>
                  End of Period
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="bg-green-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-green-800 mb-1">If slush &gt; 0:</h4>
                    <p className="text-sm text-green-700">Choose to keep it or send to savings</p>
                    <p className="text-xs text-green-600 mt-1">Default: Keep (frictionless continuity)</p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-800 mb-1">If slush &lt; 0:</h4>
                    <p className="text-sm text-blue-700">Auto-reset to $0 with &quot;Fresh start&quot; message</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Edge Cases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="ios-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Target className="w-4 h-4 text-gray-600" />
                  </div>
                  Edge Cases
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Time zones & travel</h4>
                    <p className="text-sm text-muted-foreground">No special handling—slush smooths the bumps</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Rounding (nearest $1)</h4>
                    <p className="text-sm text-muted-foreground">Last day allowance absorbs remainder (±$1)</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Bills & ignored transactions</h4>
                    <p className="text-sm text-muted-foreground">Don&apos;t count toward daily spend or break streaks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Back to App */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="pb-6"
          >
            <Button 
              onClick={onBack}
              className="w-full touch-target gradient-blue text-white border-0 rounded-2xl"
              size="lg"
            >
              Got it!
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}