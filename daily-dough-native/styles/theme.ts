/**
 * Liquid Glass Theme
 *
 * iOS 26-inspired design tokens for translucent materials, depth,
 * and spring-driven motion. Builds on top of the existing common.ts
 * tokens — use glass.* for the new translucent surfaces.
 */

// ── Glass Materials ──────────────────────────────────────────────

export const glass = {
  /** Primary translucent surface */
  background: "rgba(255, 255, 255, 0.60)",
  /** Slightly more opaque for cards on busy backgrounds */
  backgroundSolid: "rgba(255, 255, 255, 0.78)",
  /** Dark-mode surface (future) */
  backgroundDark: "rgba(30, 30, 30, 0.70)",

  /** Blur intensity for BlurView */
  blur: 24,
  /** Lighter blur for overlapping elements */
  blurLight: 16,

  /** Subtle glass border */
  borderColor: "rgba(255, 255, 255, 0.45)",
  borderWidth: 1,

  /** Depth shadow (diffused) */
  shadow: {
    color: "rgba(0, 0, 0, 0.08)",
    offset: { width: 0, height: 8 },
    radius: 24,
    opacity: 1,
  },
  /** Elevated shadow (cards, modals) */
  shadowElevated: {
    color: "rgba(0, 0, 0, 0.12)",
    offset: { width: 0, height: 12 },
    radius: 32,
    opacity: 1,
  },

  /** Corner radii for glass elements */
  radius: 30,
  radiusSmall: 20,
  radiusLarge: 36,
  radiusPill: 999,
} as const;

// ── Spring Configs (Reanimated / Moti) ──────────────────────────

export const motion = {
  /** Default spring for most transitions */
  spring: { damping: 20, stiffness: 300 },
  /** Gentle spring for large layout shifts */
  springGentle: { damping: 25, stiffness: 200 },
  /** Bouncy spring for celebratory moments */
  springBouncy: { damping: 12, stiffness: 350 },
  /** Snappy spring for small UI feedback */
  springSnap: { damping: 18, stiffness: 400 },
  /** Duration-based fallback (ms) */
  durationFast: 200,
  durationMedium: 350,
} as const;

// ── Gradient Presets ──────────────────────────────────────────────

export const gradients = {
  /** Default teal accent (DailyDial normal state) */
  teal: ["#0EA5E9", "#06B6D4"] as const,
  /** Success / within budget */
  green: ["#10B981", "#34D399"] as const,
  /** Warning / low budget */
  amber: ["#F59E0B", "#FBBF24"] as const,
  /** Over budget / negative */
  red: ["#EF4444", "#F87171"] as const,
  /** Subtle background wash */
  surface: ["#F0F9FF", "#F8FAFC"] as const,
  /** Glass shimmer overlay */
  shimmer: [
    "rgba(255,255,255,0.0)",
    "rgba(255,255,255,0.15)",
    "rgba(255,255,255,0.0)",
  ] as const,
} as const;

// ── Semantic Colors (extend existing palette) ────────────────────

export const glassColors = {
  accent: "#0EA5E9",
  accentLight: "#BAE6FD",
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  text: "#1E293B",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  separator: "rgba(0, 0, 0, 0.06)",
} as const;
