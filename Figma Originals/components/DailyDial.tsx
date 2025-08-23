"use client";

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface DailyDialProps {
  allowance: number;
  spent: number;
  variant?: 'normal' | 'warning' | 'over' | 'negative-start' | 'morning-animate';
  onAnimationComplete?: () => void;
}

export function DailyDial({ allowance, spent, variant = 'normal', onAnimationComplete }: DailyDialProps) {
  const [animatedAmount, setAnimatedAmount] = useState(variant === 'morning-animate' ? 0 : allowance - spent);
  const [showConfetti, setShowConfetti] = useState(false);

  const remaining = allowance - spent;
  const percentage = Math.min(Math.abs(spent) / allowance, 1) * 100;
  const isOver = remaining < 0;
  const isNegativeStart = variant === 'negative-start';
  const isWarning = remaining <= allowance * 0.2 && remaining > 0;

  useEffect(() => {
    if (variant === 'morning-animate') {
      const duration = 1500;
      const steps = 50;
      const increment = allowance / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current = Math.min(allowance, step * increment);
        setAnimatedAmount(current);
        
        if (step >= steps) {
          clearInterval(timer);
          setShowConfetti(true);
          setTimeout(() => {
            setShowConfetti(false);
            if (onAnimationComplete) onAnimationComplete();
          }, 800);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [variant, allowance, onAnimationComplete]);

  const getDialColor = () => {
    if (isNegativeStart) return '#6B7280';
    if (isOver) return '#EF4444';
    if (isWarning) return '#F59E0B';
    return '#3B82F6';
  };

  const getBackgroundColor = () => {
    if (isNegativeStart) return '#F3F4F6';
    if (isOver) return '#FEE2E2';
    if (isWarning) return '#FEF3C7';
    return '#DBEAFE';
  };

  const displayAmount = variant === 'morning-animate' ? animatedAmount : remaining;

  return (
    <div className="relative flex items-center justify-center">
      {/* Confetti particles */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-primary rounded-full"
              style={{
                left: `${50 + (Math.random() - 0.5) * 40}%`,
                top: `${50 + (Math.random() - 0.5) * 40}%`,
              }}
              initial={{ scale: 0, rotate: 0 }}
              animate={{
                scale: [0, 1.2, 0],
                rotate: 360,
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200,
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.05,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Main dial container */}
      <div className="relative w-48 h-48 md:w-56 md:h-56">
        {/* Background ring */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getBackgroundColor()}
            strokeWidth="8"
          />
          {/* Progress ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getDialColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${Math.PI * 2 * 45}`}
            strokeDashoffset={`${Math.PI * 2 * 45 * (1 - (isOver ? 1 : percentage / 100))}`}
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-sm text-muted-foreground mb-1">
            {isNegativeStart ? "Deficit" : "Spendable Today"}
          </p>
          <motion.div
            key={displayAmount}
            initial={variant === 'morning-animate' ? { scale: 0.8, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`text-display text-currency ${
              isNegativeStart ? 'text-danger' :
              isOver ? 'text-danger' :
              isWarning ? 'text-warning' :
              'text-foreground'
            }`}
          >
            {isNegativeStart ? 
              `−$${Math.abs(displayAmount).toFixed(0)}` :
              isOver ? 
              `+$${Math.abs(displayAmount).toFixed(0)} over` :
              `$${Math.max(0, displayAmount).toFixed(0)}`
            }
          </motion.div>
        </div>
      </div>
    </div>
  );
}