"use client";

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Sparkles, 
  Piggy,
  TrendingUp,
  Heart,
  Zap,
  Star
} from 'lucide-react';

interface EndOfPeriodCelebrationProps {
  onContinue: () => void;
}

// Sample data matching the requirements
const celebrationData = {
  slush_end: 87,
  slush_status: "positive",
  period_end: "2025-08-24",
  next_period_start: "2025-08-25"
};

// Confetti particle component
const ConfettiParticle = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full"
    style={{
      background: `hsl(${Math.random() * 360}, 70%, 60%)`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
    initial={{ 
      scale: 0, 
      rotate: 0,
      opacity: 1
    }}
    animate={{ 
      scale: [0, 1.2, 0], 
      rotate: 360,
      opacity: [1, 1, 0],
      y: [0, -50, 100]
    }}
    transition={{ 
      duration: 2,
      delay,
      ease: "easeOut"
    }}
  />
);

// Floating coin component
const FloatingCoin = ({ delay, direction }: { delay: number; direction: 'left' | 'right' }) => (
  <motion.div
    className="absolute text-2xl"
    style={{
      left: direction === 'left' ? '10%' : '90%',
      top: '30%'
    }}
    initial={{ 
      scale: 0,
      rotate: 0,
      opacity: 0
    }}
    animate={{ 
      scale: [0, 1, 0.8],
      rotate: 360,
      opacity: [0, 1, 0],
      y: [-20, -60, -100],
      x: direction === 'left' ? [0, 30, 60] : [0, -30, -60]
    }}
    transition={{ 
      duration: 2.5,
      delay,
      ease: "easeOut"
    }}
  >
    💰
  </motion.div>
);

export function EndOfPeriodCelebration({ onContinue }: EndOfPeriodCelebrationProps) {
  const [selectedChoice, setSelectedChoice] = useState<'savings' | 'keep' | null>(null);
  const [savingsAmount, setSavingsAmount] = useState(celebrationData.slush_end.toString());
  const [keepAmount, setKeepAmount] = useState('0');
  const [showConfetti, setShowConfetti] = useState(true);
  const [showChoiceConfetti, setShowChoiceConfetti] = useState(false);

  const isPositiveSlush = celebrationData.slush_status === 'positive' && celebrationData.slush_end > 0;

  useEffect(() => {
    // Stop initial confetti after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleChoiceSelect = (choice: 'savings' | 'keep') => {
    setSelectedChoice(choice);
    setShowChoiceConfetti(true);
    
    if (choice === 'savings') {
      setSavingsAmount(celebrationData.slush_end.toString());
      setKeepAmount('0');
    } else {
      setSavingsAmount('0');
      setKeepAmount(celebrationData.slush_end.toString());
    }

    // Hide choice confetti after 2 seconds
    setTimeout(() => setShowChoiceConfetti(false), 2000);
  };

  const handleSavingsAmountChange = (value: string) => {
    const amount = Math.max(0, Math.min(celebrationData.slush_end, parseInt(value) || 0));
    setSavingsAmount(amount.toString());
    setKeepAmount((celebrationData.slush_end - amount).toString());
  };

  const handleContinueToNewPeriod = () => {
    // Trigger morning allowance animation on continue
    onContinue();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 relative overflow-hidden">
      {/* Confetti Animation */}
      {(showConfetti || showChoiceConfetti) && (
        <div className="fixed inset-0 pointer-events-none z-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <ConfettiParticle key={`confetti-${i}`} delay={i * 0.1} />
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            <FloatingCoin 
              key={`coin-${i}`} 
              delay={i * 0.3} 
              direction={i % 2 === 0 ? 'left' : 'right'} 
            />
          ))}
        </div>
      )}

      <div className="max-w-md mx-auto safe-x min-h-screen flex flex-col">
        <div className="flex-1 p-6 space-y-8">
          
          {/* Header & Animation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center pt-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="w-24 h-24 rounded-full gradient-orange mx-auto mb-6 flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6, repeat: 3, delay: 1 }}
              >
                <span className="text-4xl">🎉</span>
              </motion.div>
            </motion.div>
            
            <motion.h1 
              className="text-display mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              You just got paid!
            </motion.h1>
            
            <motion.p 
              className="text-lg text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {isPositiveSlush 
                ? `Your slush fund is resetting. Choose what to do with your leftover $${celebrationData.slush_end}.`
                : "No worries, you're starting fresh. Let's make this period count."
              }
            </motion.p>
          </motion.div>

          {/* Slush Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Card className="ios-card-elevated relative overflow-hidden">
              <CardContent className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5, type: "spring" }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-large">Slush Balance</h2>
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                  </div>
                  
                  <motion.div
                    className={`inline-block px-6 py-3 rounded-full text-3xl font-bold ${
                      isPositiveSlush 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.5, delay: 1.8 }}
                  >
                    {isPositiveSlush ? '+' : ''}${Math.abs(celebrationData.slush_end)}
                  </motion.div>

                  {!isPositiveSlush && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2 }}
                      className="bg-blue-50 rounded-xl p-4 mt-4"
                    >
                      <p className="text-blue-700 font-medium mb-2">Fresh start: Slush resets to $0</p>
                      <p className="text-sm text-blue-600">
                        Every period is a new beginning. You've got this! 💪
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Choice Buttons (only for positive slush) */}
          {isPositiveSlush && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              className="space-y-4"
            >
              {/* Send to Savings - Primary Choice */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`ios-card cursor-pointer transition-all duration-200 ${
                    selectedChoice === 'savings' ? 'ring-4 ring-green-200 bg-green-50' : 'hover:shadow-lg'
                  }`}
                  onClick={() => handleChoiceSelect('savings')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl gradient-success flex items-center justify-center">
                        <span className="text-3xl">🚀</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-large mb-2">Send it all to Savings</h3>
                        <p className="text-sm text-muted-foreground">
                          Future you will thank present you! 
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-xs">Astronaut approves</span>
                          <span className="text-sm">👨‍🚀</span>
                        </div>
                      </div>
                      {selectedChoice === 'savings' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                        >
                          <span className="text-white text-sm">✓</span>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Save My Slush - Secondary Choice */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`ios-card cursor-pointer transition-all duration-200 ${
                    selectedChoice === 'keep' ? 'ring-4 ring-orange-200 bg-orange-50' : 'hover:shadow-lg'
                  }`}
                  onClick={() => handleChoiceSelect('keep')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl gradient-orange flex items-center justify-center">
                        <span className="text-3xl">🐉</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-large mb-2">Carry into next period</h3>
                        <p className="text-sm text-muted-foreground">
                          Build your slush hoard for extra flexibility
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-xs">Dragon hoards gold</span>
                          <span className="text-sm">🏆</span>
                        </div>
                      </div>
                      {selectedChoice === 'keep' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center"
                        >
                          <span className="text-white text-sm">✓</span>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Custom Amount Input (if keep is selected) */}
              {selectedChoice === 'keep' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="ios-card">
                    <CardContent className="p-4">
                      <Label className="text-sm text-muted-foreground mb-3 block">
                        Customize your split (optional)
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="savings" className="text-xs">To Savings</Label>
                          <Input
                            id="savings"
                            type="number"
                            value={savingsAmount}
                            onChange={(e) => handleSavingsAmountChange(e.target.value)}
                            className="mt-1 rounded-xl text-center"
                            max={celebrationData.slush_end}
                            min={0}
                          />
                        </div>
                        <div>
                          <Label htmlFor="keep" className="text-xs">Keep as Slush</Label>
                          <Input
                            id="keep"
                            type="number"
                            value={keepAmount}
                            readOnly
                            className="mt-1 rounded-xl text-center bg-gray-50"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Celebration Copy */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <p className="text-lg font-medium">
                {isPositiveSlush 
                  ? "Nice work! Every dollar you saved makes the next period easier."
                  : "Every fresh start is a chance to build better habits."
                }
              </p>
              <Heart className="w-5 h-5 text-red-500" />
            </div>

            <Button
              size="lg"
              className="w-full touch-target gradient-blue text-white border-0 rounded-2xl"
              onClick={handleContinueToNewPeriod}
              disabled={isPositiveSlush && !selectedChoice}
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              {isPositiveSlush && !selectedChoice 
                ? 'Make your choice above' 
                : 'Start New Period'
              }
            </Button>

            <button 
              className="text-sm text-primary underline"
              onClick={() => console.log('Navigate to budget')}
            >
              See my new period budget
            </button>
          </motion.div>

          {/* Bottom decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="flex items-center justify-center gap-4 pb-8"
          >
            {[Star, Zap, Star].map((Icon, index) => (
              <motion.div
                key={index}
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 3,
                  delay: index * 0.5,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                <Icon className="w-6 h-6 text-yellow-500" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}