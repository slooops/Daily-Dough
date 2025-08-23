import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { MotiView } from "moti";

type Variant =
  | "normal"
  | "warning"
  | "over"
  | "negative-start"
  | "morning-animate";

export interface DailyDialProps {
  allowance: number;
  spent: number;
  variant?: Variant;
  onAnimationComplete?: () => void;
}

const R = 45;
const CIRC = Math.PI * 2 * R;

export function DailyDial({
  allowance,
  spent,
  variant = "normal",
  onAnimationComplete,
}: DailyDialProps) {
  const [animatedAmount, setAnimatedAmount] = useState(
    variant === "morning-animate" ? 0 : Math.max(0, allowance - spent)
  );
  const [showConfetti, setShowConfetti] = useState(false);

  const remaining = allowance - spent;
  const safeAllowance = allowance > 0 ? allowance : 1;
  const percentage = Math.min(Math.abs(spent) / safeAllowance, 1);
  const isOver = remaining < 0;
  const isNegativeStart = variant === "negative-start";
  const isWarning = remaining <= allowance * 0.2 && remaining > 0;

  useEffect(() => {
    if (variant === "morning-animate") {
      const duration = 1500;
      const steps = 50;
      const increment = allowance / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const current = Math.min(allowance, step * increment);
        setAnimatedAmount(current);
        if (step >= steps) {
          clearInterval(timer);
          setShowConfetti(true);
          const confettiTimer = setTimeout(() => {
            setShowConfetti(false);
            onAnimationComplete?.();
          }, 800);
          return () => clearTimeout(confettiTimer);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [variant, allowance, onAnimationComplete]);

  const colors = useMemo(() => {
    if (isNegativeStart)
      return { dial: "#6B7280", bg: "#F3F4F6", text: "#DC2626" };
    if (isOver) return { dial: "#EF4444", bg: "#FEE2E2", text: "#DC2626" };
    if (isWarning) return { dial: "#F59E0B", bg: "#FEF3C7", text: "#B45309" };
    return { dial: "#3B82F6", bg: "#DBEAFE", text: "#111827" };
  }, [isNegativeStart, isOver, isWarning]);

  const displayAmount =
    variant === "morning-animate" ? animatedAmount : remaining;
  const dashOffset = CIRC * (1 - (isOver ? 1 : percentage));

  return (
    <View style={styles.center}>
      {showConfetti && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {Array.from({ length: 12 }).map((_, i) => (
            <MotiView
              key={i}
              from={{ opacity: 0, scale: 0, translateX: 0, translateY: 0 }}
              animate={{
                opacity: 1,
                scale: 1.1,
                translateX: (Math.random() - 0.5) * 120,
                translateY: (Math.random() - 0.5) * 120,
              }}
              transition={{ type: "timing", duration: 800, delay: i * 50 }}
              style={[
                styles.confetti,
                {
                  left: `${50 + (Math.random() - 0.5) * 40}%`,
                  top: `${50 + (Math.random() - 0.5) * 40}%`,
                  backgroundColor: colors.dial,
                },
              ]}
            />
          ))}
        </View>
      )}

      <View style={styles.dialWrap}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          style={{ transform: [{ rotate: "-90deg" }] }}
        >
          <Circle
            cx="50"
            cy="50"
            r={R}
            stroke={colors.bg}
            strokeWidth={8}
            fill="none"
          />
          <Circle
            cx="50"
            cy="50"
            r={R}
            stroke={colors.dial}
            strokeWidth={8}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
          />
        </Svg>

        <View style={styles.centerContent}>
          <Text style={styles.caption}>
            {isNegativeStart ? "Deficit" : "Spendable Today"}
          </Text>
          <Text style={[styles.amount, { color: colors.text }]}>
            {isNegativeStart
              ? `−$${Math.abs(displayAmount).toFixed(0)}`
              : isOver
              ? `+$${Math.abs(displayAmount).toFixed(0)} over`
              : `$${Math.max(0, displayAmount).toFixed(0)}`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  dialWrap: { width: 192, height: 192 },
  centerContent: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  caption: { fontSize: 12, color: "#6B7280", marginBottom: 4 },
  amount: { fontSize: 32, fontWeight: "600" },
  confetti: { position: "absolute", width: 10, height: 10, borderRadius: 5 },
});
