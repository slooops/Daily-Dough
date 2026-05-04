import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { glass, gradients, glassColors } from "../styles/theme";

// Import MotiView only for mobile platforms
let MotiView: any = View;
if (Platform.OS !== "web") {
  try {
    const moti = require("moti");
    MotiView = moti.MotiView;
  } catch (error) {
    console.warn("Moti not available, using regular View");
  }
}

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

const SIZE = 260;
const STROKE = 20;
const VB = 100; // viewBox size
const SVG_STROKE = STROKE * (VB / SIZE); // stroke in viewBox units
const R = (VB - SVG_STROKE) / 2; // radius in viewBox units
const CIRC = Math.PI * 2 * R;
const ARC_DEGREES = 270;
const ARC_LENGTH = (ARC_DEGREES / 360) * CIRC;
const GAP_LENGTH = CIRC - ARC_LENGTH;

// Arc starts at 7:30 (bottom-left) and goes CW through 12:00 to 4:30 (bottom-right)
// SVG default start = 3 o'clock. Rotating 135° CW moves start to 7:30.
const ARC_ROTATE = 135;

// Zero-dot pixel position (7:30 = 135° in SVG-screen coords)
const R_PX = (SIZE - STROKE) / 2;
const DOT_ANGLE_RAD = (ARC_ROTATE * Math.PI) / 180;
const DOT_CX = SIZE / 2 + R_PX * Math.cos(DOT_ANGLE_RAD);
const DOT_CY = SIZE / 2 + R_PX * Math.sin(DOT_ANGLE_RAD);

export function DailyDial({
  allowance,
  spent,
  variant = "normal",
  onAnimationComplete,
}: DailyDialProps) {
  const [animatedAmount, setAnimatedAmount] = useState(
    variant === "morning-animate" ? 0 : Math.max(0, allowance - spent),
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

  // Gradient colors based on state
  const stateColors = useMemo(() => {
    if (isNegativeStart)
      return {
        gradient: ["#9CA3AF", "#6B7280"] as const,
        track: "rgba(107,114,128,0.12)",
        text: glassColors.danger,
      };
    if (isOver)
      return {
        gradient: gradients.red,
        track: "rgba(239,68,68,0.10)",
        text: glassColors.danger,
      };
    if (isWarning)
      return {
        gradient: gradients.amber,
        track: "rgba(245,158,11,0.10)",
        text: glassColors.warning,
      };
    return {
      gradient: gradients.teal,
      track: "rgba(14,165,233,0.10)",
      text: glassColors.text,
    };
  }, [isNegativeStart, isOver, isWarning]);

  const displayAmount =
    variant === "morning-animate" ? animatedAmount : remaining;
  // Fill length: percentage of arc that's been "used"
  const fillLength = ARC_LENGTH * (isOver ? 1 : percentage);
  const showZeroDot = percentage === 0 && !isOver && !isNegativeStart;

  // Generate stable random positions for confetti pieces
  const confettiPositions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        left: 50 + Math.sin(index * 0.5) * 40,
        top: 50 + Math.cos(index * 0.7) * 40,
        translateX: Math.sin(index * 0.8) * 120,
        translateY: Math.cos(index * 0.6) * 120,
      })),
    [],
  );

  const ConfettiPiece = React.memo(({ index }: { index: number }) => {
    const position = confettiPositions[index];

    if (Platform.OS === "web") {
      return (
        <View
          style={[
            styles.confetti,
            {
              left: `${position.left}%`,
              top: `${position.top}%`,
              backgroundColor: stateColors.gradient[0],
              opacity: showConfetti ? 1 : 0,
              transform: [
                { scale: showConfetti ? 1.1 : 0 },
                { translateX: showConfetti ? position.translateX : 0 },
                { translateY: showConfetti ? position.translateY : 0 },
              ],
            },
          ]}
        />
      );
    }

    return (
      <MotiView
        key={index}
        from={{ opacity: 0, scale: 0, translateX: 0, translateY: 0 }}
        animate={{
          opacity: 1,
          scale: 1.1,
          translateX: position.translateX,
          translateY: position.translateY,
        }}
        transition={{ type: "timing", duration: 800, delay: index * 50 }}
        style={[
          styles.confetti,
          {
            left: `${position.left}%`,
            top: `${position.top}%`,
            backgroundColor: stateColors.gradient[0],
          },
        ]}
      />
    );
  });

  return (
    <View style={styles.center}>
      {showConfetti && (
        <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
          {Array.from({ length: 12 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </View>
      )}

      {/* Outer glow / shadow */}
      <View style={styles.glowWrap}>
        <View style={styles.dialWrap}>
          <Svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${VB} ${VB}`}
            style={{ transform: [{ rotate: `${ARC_ROTATE}deg` }] }}
          >
            <Defs>
              <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={stateColors.gradient[0]} />
                <Stop offset="1" stopColor={stateColors.gradient[1]} />
              </LinearGradient>
            </Defs>

            {/* Track arc (270°) */}
            <Circle
              cx={VB / 2}
              cy={VB / 2}
              r={R}
              stroke={stateColors.track}
              strokeWidth={SVG_STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${ARC_LENGTH} ${GAP_LENGTH}`}
            />
            {/* Progress arc — fill from start, no offset */}
            {fillLength > 0 && (
              <Circle
                cx={VB / 2}
                cy={VB / 2}
                r={R}
                stroke="url(#ringGrad)"
                strokeWidth={SVG_STROKE}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${fillLength} ${CIRC}`}
              />
            )}
          </Svg>

          {/* Glass center */}
          <View style={styles.glassCenter}>
            <View style={styles.glassSurface}>
              <Text style={styles.caption}>
                {isNegativeStart ? "Deficit" : "Spendable Today"}
              </Text>
              <Text style={[styles.amount, { color: stateColors.text }]}>
                {isNegativeStart
                  ? `−$${Math.abs(displayAmount).toFixed(0)}`
                  : isOver
                    ? `+$${Math.abs(displayAmount).toFixed(0)} over`
                    : `$${Math.max(0, displayAmount).toFixed(0)}`}
              </Text>
              <Text style={styles.spentToday}>
                Spent today: ${spent.toFixed(0)}
              </Text>
            </View>
          </View>

          {/* Zero-spend dot — rendered above glass center */}
          {showZeroDot && (
            <View
              style={[
                styles.zeroDot,
                { backgroundColor: stateColors.gradient[0] },
              ]}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  glowWrap: {
    shadowColor: "rgba(14, 165, 233, 0.25)",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 20,
    shadowOpacity: 1,
    elevation: 12,
  },
  dialWrap: { width: SIZE, height: SIZE },
  zeroDot: {
    position: "absolute",
    left: DOT_CX - STROKE / 2,
    top: DOT_CY - STROKE / 2,
    width: STROKE,
    height: STROKE,
    borderRadius: STROKE / 2,
  },
  glassCenter: {
    position: "absolute",
    left: STROKE + 6,
    right: STROKE + 6,
    top: STROKE + 6,
    bottom: STROKE + 6,
    alignItems: "center",
    justifyContent: "center",
  },
  glassSurface: {
    width: "100%",
    height: "100%",
    borderRadius: SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  caption: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  amount: {
    fontSize: 46,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    letterSpacing: -1,
  },
  spentToday: {
    fontSize: 13,
    fontWeight: "500",
    color: "#94A3B8",
    marginTop: 2,
    letterSpacing: 0.2,
  },
  confetti: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
