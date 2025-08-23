"use client";

import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  ChevronLeft, 
  Settings as SettingsIcon,
  Flame,
  TrendingUp,
  Calendar,
  Info,
  BarChart3
} from 'lucide-react';
import { StreakBadge } from './StreakBadge';
import { SlushPill } from './SlushPill';

interface PeriodOverviewProps {
  onBack: () => void;
  onSettings: () => void;
}

// Sample data structure matching the requirements
const periodData = {
  period: {
    type: "biweekly",
    start: "2025-08-11",
    end: "2025-08-24",
    discretionary_total: 1400,
    slush_current: 45
  },
  remaining: 275,
  calendar_days: [
    {"date":"2025-08-11","status":"under", "spent": 45, "allowance": 100, "slush_change": +15},
    {"date":"2025-08-12","status":"over", "spent": 125, "allowance": 100, "slush_change": -25},
    {"date":"2025-08-13","status":"no_spend", "spent": 0, "allowance": 100, "slush_change": +100},
    {"date":"2025-08-14","status":"under", "spent": 78, "allowance": 100, "slush_change": +22},
    {"date":"2025-08-15","status":"over", "spent": 134, "allowance": 100, "slush_change": -34},
    {"date":"2025-08-16","status":"under", "spent": 65, "allowance": 100, "slush_change": +35},
    {"date":"2025-08-17","status":"no_spend", "spent": 0, "allowance": 100, "slush_change": +100},
    {"date":"2025-08-18","status":"under", "spent": 89, "allowance": 100, "slush_change": +11},
    {"date":"2025-08-19","status":"over", "spent": 115, "allowance": 100, "slush_change": -15},
    {"date":"2025-08-20","status":"under", "spent": 92, "allowance": 100, "slush_change": +8},
    {"date":"2025-08-21","status":"no_spend", "spent": 0, "allowance": 100, "slush_change": +100},
    {"date":"2025-08-22","status":"under", "spent": 71, "allowance": 100, "slush_change": +29},
    {"date":"2025-08-23","status":"over", "spent": 142, "allowance": 100, "slush_change": -42},
    {"date":"2025-08-24","status":"under", "spent": 56, "allowance": 100, "slush_change": +44}
  ],
  streaks: { blue_days: 3, orange_streak: 7 },
  trend: {
    status: "on_track", // on_track, behind, ahead
    cumulative_spent: 1012,
    planned_cumulative: 1125
  }
};

// Generate trend data points for sparkline
const generateTrendData = () => {
  const data = [];
  let cumulativeSpent = 0;
  let plannedCumulative = 0;
  
  periodData.calendar_days.forEach((day, index) => {
    cumulativeSpent += day.spent;
    plannedCumulative += day.allowance;
    data.push({
      day: index + 1,
      spent: cumulativeSpent,
      planned: plannedCumulative
    });
  });
  
  return data;
};

export function PeriodOverview({ onBack, onSettings }: PeriodOverviewProps) {
  const [periodType, setPeriodType] = useState<"biweekly" | "monthly">("biweekly");
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [showDayModal, setShowDayModal] = useState(false);

  const trendData = generateTrendData();
  const totalSpent = periodData.calendar_days.reduce((sum, day) => sum + day.spent, 0);
  const progressPercentage = ((periodData.period.discretionary_total - periodData.remaining) / periodData.period.discretionary_total) * 100;
  
  const isLowBudget = periodData.remaining < periodData.period.discretionary_total * 0.2;
  const isOverBudget = periodData.remaining < 0;

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-danger';
    if (isLowBudget) return 'bg-warning';
    return 'bg-primary';
  };

  const getDayStatusColor = (status: string) => {
    switch (status) {
      case 'no_spend': return 'bg-blue-500';
      case 'under': return 'bg-green-400';
      case 'over': return 'bg-red-400';
      default: return 'bg-gray-200';
    }
  };

  const getDayStatusText = (status: string) => {
    switch (status) {
      case 'no_spend': return 'No spending';
      case 'under': return 'Under budget';
      case 'over': return 'Over budget';
      default: return 'Unknown';
    }
  };

  const handleDayClick = (day: any) => {
    setSelectedDay(day);
    setShowDayModal(true);
  };

  const getTrendStatus = () => {
    const currentDay = periodData.calendar_days.length;
    const currentTrend = trendData[currentDay - 1];
    
    if (currentTrend.spent < currentTrend.planned * 0.9) return { status: 'ahead', color: 'text-success', text: 'Ahead of plan' };
    if (currentTrend.spent > currentTrend.planned * 1.1) return { status: 'behind', color: 'text-danger', text: 'Behind plan' };
    return { status: 'on_track', color: 'text-primary', text: 'On track' };
  };

  const trendStatus = getTrendStatus();

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-lg border-b border-border/50 safe-x sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
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
                <h1 className="text-xl font-semibold">Period Overview</h1>
                <p className="text-sm text-muted-foreground">Bi-weekly spending analysis</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="touch-target rounded-2xl"
              onClick={onSettings}
            >
              <SettingsIcon className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Period Type Toggle */}
          <Tabs value={periodType} onValueChange={(value) => setPeriodType(value as "biweekly" | "monthly")}>
            <TabsList className="grid w-full grid-cols-2 rounded-2xl">
              <TabsTrigger value="biweekly" className="rounded-xl">Bi-weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="rounded-xl">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="max-w-md mx-auto safe-x">
        <div className="p-4 space-y-6">
          
          {/* Remaining Budget Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="ios-card-elevated">
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-medium">
                      Remaining this period
                    </span>
                    <span className={`text-lg font-semibold text-currency ${
                      isOverBudget ? "text-danger" : isLowBudget ? "text-warning" : "text-foreground"
                    }`}>
                      ${periodData.remaining} / ${periodData.period.discretionary_total}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <Progress 
                      value={Math.max(0, Math.min(100, progressPercentage))} 
                      className="h-4 rounded-full"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <SlushPill amount={periodData.period.slush_current} />
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {Math.round((14 - periodData.calendar_days.length))} days left
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Calendar Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="ios-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  Daily Spending Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-7 gap-2">
                  {periodData.calendar_days.map((day, index) => (
                    <motion.div
                      key={day.date}
                      className={`aspect-square rounded-lg border-2 border-white cursor-pointer transition-all hover:scale-110 ${getDayStatusColor(day.status)}`}
                      onClick={() => handleDayClick(day)}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {new Date(day.date).getDate()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Legend */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <span className="text-xs text-muted-foreground">No spend</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-400"></div>
                    <span className="text-xs text-muted-foreground">Under</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-400"></div>
                    <span className="text-xs text-muted-foreground">Over</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trend Sparkline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="ios-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  Spending Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className={`font-semibold ${trendStatus.color}`}>{trendStatus.text}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Cumulative</p>
                    <p className="font-semibold text-currency">${totalSpent.toFixed(0)}</p>
                  </div>
                </div>
                
                {/* Simple sparkline visualization */}
                <div className="relative h-16 bg-gray-50 rounded-xl overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 280 64">
                    {/* Planned line */}
                    <polyline
                      fill="none"
                      stroke="#94A3B8"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      points={trendData.map((d, i) => `${i * 20},${64 - (d.planned / 1400) * 64}`).join(' ')}
                    />
                    {/* Actual spending line */}
                    <polyline
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      points={trendData.map((d, i) => `${i * 20},${64 - (d.spent / 1400) * 64}`).join(' ')}
                    />
                  </svg>
                  <div className="absolute top-2 left-2 text-xs text-muted-foreground">
                    Planned vs Actual
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Streak Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="ios-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-orange-600" />
                  </div>
                  Streaks This Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <StreakBadge
                    count={periodData.streaks.blue_days}
                    type="blue"
                    label="no-spend days"
                  />
                  <StreakBadge
                    count={periodData.streaks.orange_streak}
                    type="orange"
                    label="within budget"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Breakdown (Stub) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="ios-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-gray-600" />
                  </div>
                  Category Breakdown
                  <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['Dining', 'Groceries', 'Transit', 'Other'].map((category, index) => (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm text-muted-foreground">---%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-full bg-gray-300 rounded-full w-0"></div>
                    </div>
                  </div>
                ))}
                <div className="pt-2 text-center">
                  <p className="text-xs text-muted-foreground">
                    Automatic categorization will be available soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="pb-6" />
        </div>
      </div>

      {/* Day Detail Modal */}
      <Dialog open={showDayModal} onOpenChange={setShowDayModal}>
        <DialogContent className="ios-card max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && new Date(selectedDay.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </DialogTitle>
          </DialogHeader>
          {selectedDay && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={selectedDay.status === 'no_spend' ? 'default' : 
                              selectedDay.status === 'under' ? 'secondary' : 'destructive'}>
                  {getDayStatusText(selectedDay.status)}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Spent</span>
                  <span className="font-semibold text-currency">${selectedDay.spent.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Allowance</span>
                  <span className="font-semibold text-currency">${selectedDay.allowance.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Slush change</span>
                  <span className={`font-semibold text-currency ${
                    selectedDay.slush_change > 0 ? 'text-success' : 'text-danger'
                  }`}>
                    {selectedDay.slush_change > 0 ? '+' : ''}${selectedDay.slush_change.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <Separator />
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Tap outside to close
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}