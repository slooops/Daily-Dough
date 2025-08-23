"use client";

import { useState, useEffect } from "react";
import { DailyDial } from "./components/DailyDial";
import { SlushPill } from "./components/SlushPill";
import { StreakBadge } from "./components/StreakBadge";
import { TransactionRow } from "./components/TransactionRow";
import { SyncStatus } from "./components/SyncStatus";
import { StreaksSlushExplainer } from "./components/StreaksSlushExplainer";
import { Settings } from "./components/Settings";
import { PaydayExplainer } from "./components/PaydayExplainer";
import { ManageBills } from "./components/ManageBills";
import { IgnoreRules } from "./components/IgnoreRules";
import { ConnectAccounts } from "./components/ConnectAccounts";
import { PeriodOverview } from "./components/PeriodOverview";
import { EndOfPeriodCelebration } from "./components/EndOfPeriodCelebration";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Progress } from "./components/ui/progress";
import { Settings as SettingsIcon, Plus, Info, TrendingUp } from "lucide-react";
import { Badge } from "./components/ui/badge";
import { motion } from 'motion/react';

// Sample data structure as provided
const sampleData = {
  period: {
    type: "biweekly",
    start: "2025-08-17",
    end: "2025-08-30",
    payday_anchor: "2025-08-16",
    discretionary_total: 1400,
    slush_start: 25,
  },
  today: {
    date: "2025-08-18",
    daily_allowance: 100,
    spent_today: 0,
    carryover_from_yesterday: -12,
  },
  slush: { current: 13 },
  streaks: {
    blue_days_this_period: 3,
    orange_current_streak: 7,
  },
  transactions: [
    {
      id: 1,
      date: "2025-08-18T09:20",
      merchant: "Blue Bottle",
      amount: -5.0,
      tag: "spend",
    },
    {
      id: 2,
      date: "2025-08-18T10:05",
      merchant: "USAA → Chase Card",
      amount: -300.0,
      tag: "ignored",
    },
    {
      id: 3,
      date: "2025-08-18T11:00",
      merchant: "Rent",
      amount: -1200.0,
      tag: "bill",
    },
  ],
  sync: {
    global_last_synced: "2025-08-18T10:58",
    providers: [
      {
        name: "Plaid",
        last_synced: "2025-08-18T10:58",
        status: "syncing",
      },
      {
        name: "Teller",
        last_synced: "2025-08-18T10:40",
        status: "ok",
      },
    ],
  },
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("home");
  const [showMorningAnimation, setShowMorningAnimation] =
    useState(false);
  const [hasSeenMorningAnimation, setHasSeenMorningAnimation] =
    useState(false);

  // Check if it's first open of the day
  useEffect(() => {
    const lastOpenDate = localStorage.getItem("lastOpenDate");
    const today = new Date().toDateString();

    if (lastOpenDate !== today && !hasSeenMorningAnimation) {
      setShowMorningAnimation(true);
      localStorage.setItem("lastOpenDate", today);
    }
  }, [hasSeenMorningAnimation]);

  const handleMorningAnimationComplete = () => {
    setShowMorningAnimation(false);
    setHasSeenMorningAnimation(true);
  };

  // Calculate current spending for the day
  const todaySpent = sampleData.transactions
    .filter(
      (t) =>
        t.date.startsWith(sampleData.today.date) &&
        t.tag === "spend",
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const spendableToday =
    sampleData.today.daily_allowance -
    todaySpent +
    sampleData.today.carryover_from_yesterday;
  const remainingThisPeriod =
    sampleData.period.discretionary_total - todaySpent * 10; // Mock calculation
  const periodProgress =
    ((sampleData.period.discretionary_total -
      remainingThisPeriod) /
      sampleData.period.discretionary_total) *
    100;

  const isLowBudget =
    remainingThisPeriod <
    sampleData.period.discretionary_total * 0.2;
  const isOverBudget = remainingThisPeriod < 0;

  // Handle navigation
  const handleNavigation = (screen: string) => {
    setCurrentScreen(screen);
  };

  // Show end of period celebration screen
  if (currentScreen === "end-of-period") {
    return (
      <EndOfPeriodCelebration 
        onContinue={() => {
          setShowMorningAnimation(true);
          setCurrentScreen("home");
        }}
      />
    );
  }

  // Show period overview screen
  if (currentScreen === "period-overview") {
    return (
      <PeriodOverview 
        onBack={() => setCurrentScreen("home")}
        onSettings={() => setCurrentScreen("settings")} 
      />
    );
  }

  // Show connect accounts screen
  if (currentScreen === "connect-accounts") {
    return (
      <ConnectAccounts 
        onBack={() => setCurrentScreen("onboarding")}
        onContinue={() => setCurrentScreen("budget-setup")} 
      />
    );
  }

  // Show manage bills screen
  if (currentScreen === "manage-bills") {
    return (
      <ManageBills 
        onBack={() => setCurrentScreen("settings")} 
      />
    );
  }

  // Show ignore rules screen
  if (currentScreen === "ignore-rules") {
    return (
      <IgnoreRules 
        onBack={() => setCurrentScreen("settings")} 
      />
    );
  }

  // Show settings screen
  if (currentScreen === "settings") {
    return (
      <Settings 
        onBack={() => setCurrentScreen("home")}
        onNavigate={handleNavigation}
      />
    );
  }

  // Show payday explainer screen
  if (currentScreen === "payday-explainer") {
    return (
      <PaydayExplainer 
        onBack={() => setCurrentScreen("settings")} 
      />
    );
  }

  // Show explainer screen
  if (currentScreen === "explainer") {
    return (
      <StreaksSlushExplainer 
        onBack={() => setCurrentScreen("home")} 
      />
    );
  }

  if (currentScreen === "onboarding") {
    return (
      <div className="min-h-screen bg-background safe-top safe-bottom safe-x">
        <div className="max-w-md mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 rounded-3xl gradient-blue mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">$</span>
            </div>
            <h1 className="text-title text-primary mb-2">
              Daily Dollars
            </h1>
            <p className="text-muted-foreground">
              Choose your setup path
            </p>
          </motion.div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="ios-card cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-2xl gradient-blue mb-4 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">$</span>
                  </div>
                  <h3 className="text-large mb-2">
                    I know my daily discretionary
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Jump straight to setting your daily allowance
                  </p>
                  <Button
                    className="w-full touch-target rounded-2xl gradient-blue text-white border-0"
                    onClick={() =>
                      setCurrentScreen("direct-setup")
                    }
                  >
                    Enter Amount
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="ios-card cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 mb-4 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-gray-600" />
                  </div>
                  <h3 className="text-large mb-2">
                    Let's calculate it
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Connect accounts, flag bills, and we'll do the
                    math
                  </p>
                  <Button
                    variant="outline"
                    className="w-full touch-target rounded-2xl border-2"
                    onClick={() =>
                      setCurrentScreen("connect-accounts")
                    }
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-primary rounded-2xl"
              onClick={() => setCurrentScreen("explainer")}
            >
              <Info className="w-4 h-4 mr-1" />
              How streaks & slush work
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-lg border-b border-border/50 safe-x sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-xl font-semibold">
                Daily Dollars
              </h1>
              <SyncStatus
                status={
                  sampleData.sync.providers.find(
                    (p) => p.status === "syncing",
                  )
                    ? "syncing"
                    : "idle"
                }
                lastSynced={sampleData.sync.global_last_synced}
              />
            </motion.div>
            <Button
              variant="ghost"
              size="sm"
              className="relative touch-target rounded-2xl"
              onClick={() => setCurrentScreen("settings")}
            >
              <SettingsIcon className="w-5 h-5" />
              {sampleData.sync.providers.some(
                (p) => p.status === "syncing",
              ) && (
                <Badge className="absolute -top-1 -right-1 w-3 h-3 p-0 bg-primary rounded-full">
                  <span className="sr-only">Syncing</span>
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto safe-x">
        <div className="p-4 space-y-6">
          {/* Daily Dial */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <DailyDial
              allowance={sampleData.today.daily_allowance}
              spent={todaySpent}
              variant={
                showMorningAnimation
                  ? "morning-animate"
                  : spendableToday < 0
                    ? "negative-start"
                    : "normal"
              }
              onAnimationComplete={
                handleMorningAnimationComplete
              }
            />
          </motion.div>

          {/* Slush and Period Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="ios-card-elevated">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <SlushPill amount={sampleData.slush.current} />
                  <SyncStatus
                    status="idle"
                    lastSynced={
                      sampleData.sync.global_last_synced
                    }
                    compact
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground font-medium">
                      Remaining this period
                    </span>
                    <span
                      className={`text-sm font-semibold text-currency ${
                        isOverBudget
                          ? "text-danger"
                          : isLowBudget
                            ? "text-warning"
                            : "text-foreground"
                      }`}
                    >
                      ${remainingThisPeriod.toFixed(0)} / $
                      {sampleData.period.discretionary_total}
                    </span>
                  </div>
                  <Progress
                    value={Math.max(
                      0,
                      Math.min(100, periodProgress),
                    )}
                    className="h-3 rounded-full"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Streaks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card 
              className="ios-card cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              onClick={() => setCurrentScreen("explainer")}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <StreakBadge
                    count={
                      sampleData.streaks.blue_days_this_period
                    }
                    type="blue"
                    label="no-spend days"
                  />
                  <StreakBadge
                    count={
                      sampleData.streaks.orange_current_streak
                    }
                    type="orange"
                    label="within budget"
                  />
                </div>
                <div className="mt-3 text-center">
                  <p className="text-xs text-muted-foreground">Tap to learn how streaks work</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="ios-card-elevated">
              <CardContent className="p-0">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Recent Transactions
                    </h3>
                    <Button variant="ghost" size="sm" className="rounded-2xl">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {sampleData.transactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <TransactionRow
                        transaction={transaction}
                      />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex gap-3 pb-6"
          >
            <Button
              variant="outline"
              className="flex-1 touch-target rounded-2xl border-2"
              onClick={() =>
                setCurrentScreen("period-overview")
              }
            >
              Period Overview
            </Button>
            <Button
              variant="outline"
              className="flex-1 touch-target rounded-2xl border-2"
              onClick={() => setCurrentScreen("end-of-period")}
            >
              Celebration
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}