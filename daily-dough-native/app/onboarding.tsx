import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { glass, glassColors } from "../styles/theme";
import { spacing, borderRadius } from "../styles/common";

const API_BASE_URL = "http://localhost:3000/api";

const CADENCE_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 Weeks" },
  { value: "semimonthly", label: "Twice a Month" },
  { value: "monthly", label: "Monthly" },
] as const;

type PayCadence = "weekly" | "biweekly" | "semimonthly" | "monthly";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form state
  const [grossPaycheck, setGrossPaycheck] = useState("");
  const [payCadence, setPayCadence] = useState<PayCadence>("biweekly");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  const totalSteps = 3;

  const handleNext = () => {
    if (step === 1) {
      if (!grossPaycheck || parseFloat(grossPaycheck) <= 0) {
        Alert.alert("Required", "Enter your paycheck amount");
        return;
      }
    }
    if (step === 2) {
      if (!monthlyRent) {
        Alert.alert("Required", "Enter your monthly rent (or 0 if none)");
        return;
      }
    }
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = async () => {
    if (!periodStart || !periodEnd) {
      Alert.alert("Required", "Enter your pay period start and end dates");
      return;
    }

    // Basic date format validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(periodStart) || !dateRegex.test(periodEnd)) {
      Alert.alert("Invalid Date", "Use YYYY-MM-DD format (e.g. 2026-05-01)");
      return;
    }

    if (periodEnd <= periodStart) {
      Alert.alert("Invalid Dates", "End date must be after start date");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo",
          grossPaycheck: parseFloat(grossPaycheck),
          payCadence,
          monthlyRent: parseFloat(monthlyRent),
          periodStart,
          periodEnd,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to save profile");
      }

      // Trigger initial engine computation
      await fetch(`${API_BASE_URL}/allowance/recompute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo" }),
      });

      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#F0F9FF", "#E0F2FE", "#F8FAFC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Welcome to Daily Dough</Text>
            <Text style={styles.subtitle}>
              Let's set up your budget in {totalSteps} quick steps
            </Text>

            {/* Progress indicator */}
            <View style={styles.progressRow}>
              {Array.from({ length: totalSteps }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.progressDot,
                    i + 1 <= step && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>

            {/* Step 1: Paycheck */}
            {step === 1 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>How much is your paycheck?</Text>
                <Text style={styles.stepDesc}>
                  Enter your gross (pre-tax) pay per check
                </Text>
                <View style={styles.inputRow}>
                  <Text style={styles.dollar}>$</Text>
                  <TextInput
                    style={styles.input}
                    value={grossPaycheck}
                    onChangeText={setGrossPaycheck}
                    keyboardType="decimal-pad"
                    placeholder="5,000"
                    placeholderTextColor="#94A3B8"
                    autoFocus
                  />
                </View>

                <Text style={[styles.stepDesc, { marginTop: spacing.xl }]}>
                  How often do you get paid?
                </Text>
                <View style={styles.cadenceGrid}>
                  {CADENCE_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={[
                        styles.cadenceBtn,
                        payCadence === opt.value && styles.cadenceBtnActive,
                      ]}
                      onPress={() => setPayCadence(opt.value)}
                    >
                      <Text
                        style={[
                          styles.cadenceBtnText,
                          payCadence === opt.value &&
                            styles.cadenceBtnTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Step 2: Rent */}
            {step === 2 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>What's your monthly rent?</Text>
                <Text style={styles.stepDesc}>
                  Enter 0 if you don't pay rent
                </Text>
                <View style={styles.inputRow}>
                  <Text style={styles.dollar}>$</Text>
                  <TextInput
                    style={styles.input}
                    value={monthlyRent}
                    onChangeText={setMonthlyRent}
                    keyboardType="decimal-pad"
                    placeholder="2,000"
                    placeholderTextColor="#94A3B8"
                    autoFocus
                  />
                </View>
              </View>
            )}

            {/* Step 3: Pay Period */}
            {step === 3 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>
                  When is your current pay period?
                </Text>
                <Text style={styles.stepDesc}>
                  Enter start and end dates (YYYY-MM-DD)
                </Text>

                <Text style={styles.fieldLabel}>Period Start</Text>
                <TextInput
                  style={styles.dateInput}
                  value={periodStart}
                  onChangeText={setPeriodStart}
                  placeholder="2026-05-01"
                  placeholderTextColor="#94A3B8"
                  autoFocus
                />

                <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>
                  Period End
                </Text>
                <TextInput
                  style={styles.dateInput}
                  value={periodEnd}
                  onChangeText={setPeriodEnd}
                  placeholder="2026-05-14"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            )}

            {/* Navigation */}
            <View style={styles.navRow}>
              {step > 1 && (
                <Pressable style={styles.backBtn} onPress={handleBack}>
                  <Text style={styles.backBtnText}>Back</Text>
                </Pressable>
              )}
              <View style={{ flex: 1 }} />
              {step < totalSteps ? (
                <Pressable style={styles.nextBtn} onPress={handleNext}>
                  <Text style={styles.nextBtnText}>Next</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.nextBtn, saving && { opacity: 0.6 }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={styles.nextBtnText}>
                    {saving ? "Saving..." : "Start Budgeting"}
                  </Text>
                </Pressable>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: glassColors.text,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: glassColors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(14,165,233,0.15)",
  },
  progressDotActive: {
    backgroundColor: glassColors.accent,
  },
  stepContainer: {
    marginBottom: spacing.xl,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: glass.radius,
    borderWidth: glass.borderWidth,
    borderColor: glass.borderColor,
    padding: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: glassColors.text,
    marginBottom: spacing.sm,
  },
  stepDesc: {
    fontSize: 15,
    color: glassColors.textSecondary,
    marginBottom: spacing.lg,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(14,165,233,0.20)",
    borderRadius: glass.radiusSmall,
    paddingHorizontal: spacing.lg,
    backgroundColor: "rgba(255,255,255,0.70)",
  },
  dollar: {
    fontSize: 24,
    fontWeight: "600",
    color: glassColors.textSecondary,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    color: glassColors.text,
    paddingVertical: spacing.lg,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: glassColors.textSecondary,
    marginBottom: spacing.sm,
  },
  dateInput: {
    fontSize: 18,
    fontWeight: "500",
    color: glassColors.text,
    borderWidth: 1.5,
    borderColor: "rgba(14,165,233,0.20)",
    borderRadius: glass.radiusSmall,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: "rgba(255,255,255,0.70)",
  },
  cadenceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  cadenceBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: glass.radiusSmall,
    borderWidth: 1.5,
    borderColor: "rgba(14,165,233,0.15)",
    backgroundColor: "rgba(255,255,255,0.50)",
  },
  cadenceBtnActive: {
    borderColor: glassColors.accent,
    backgroundColor: "rgba(14,165,233,0.08)",
  },
  cadenceBtnText: {
    fontSize: 15,
    fontWeight: "500",
    color: glassColors.textSecondary,
  },
  cadenceBtnTextActive: {
    color: glassColors.accent,
    fontWeight: "600",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xl,
  },
  backBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: "500",
    color: glassColors.textSecondary,
  },
  nextBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    backgroundColor: glassColors.accent,
    borderRadius: glass.radiusSmall,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
