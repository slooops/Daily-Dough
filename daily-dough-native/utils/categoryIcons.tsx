import React from "react";
import {
  Receipt,
  Home,
  Car,
  Coffee,
  ShoppingBag,
  Zap,
  Wifi,
  Heart,
  GraduationCap,
  Plane,
  Gift,
  CreditCard,
  ArrowRightLeft,
  DollarSign,
} from "lucide-react-native";

export type CategoryType =
  | "Housing"
  | "Utilities"
  | "Transportation"
  | "Food"
  | "Shopping"
  | "Subscriptions"
  | "Healthcare"
  | "Education"
  | "Travel"
  | "Entertainment"
  | "Personal"
  | "Credit Card Payment"
  | "Internal Transfer"
  | "Transfer"
  | "Bills"
  | "Other";

export interface CategoryConfig {
  icon: React.ReactElement;
  backgroundColor: string;
  iconColor: string;
}

export const getCategoryConfig = (category: string): CategoryConfig => {
  const normalizedCategory = category as CategoryType;

  switch (normalizedCategory) {
    case "Housing":
      return {
        icon: <Home size={16} color="#7C3AED" />,
        backgroundColor: "#EDE9FE",
        iconColor: "#7C3AED",
      };

    case "Utilities":
      return {
        icon: <Zap size={16} color="#EA580C" />,
        backgroundColor: "#FFEDD5",
        iconColor: "#EA580C",
      };

    case "Transportation":
      return {
        icon: <Car size={16} color="#0EA5E9" />,
        backgroundColor: "#E0F2FE",
        iconColor: "#0EA5E9",
      };

    case "Food":
      return {
        icon: <Coffee size={16} color="#F59E0B" />,
        backgroundColor: "#FEF3C7",
        iconColor: "#F59E0B",
      };

    case "Shopping":
      return {
        icon: <ShoppingBag size={16} color="#EC4899" />,
        backgroundColor: "#FCE7F3",
        iconColor: "#EC4899",
      };

    case "Subscriptions":
      return {
        icon: <Wifi size={16} color="#8B5CF6" />,
        backgroundColor: "#EDE9FE",
        iconColor: "#8B5CF6",
      };

    case "Healthcare":
      return {
        icon: <Heart size={16} color="#EF4444" />,
        backgroundColor: "#FEE2E2",
        iconColor: "#EF4444",
      };

    case "Education":
      return {
        icon: <GraduationCap size={16} color="#059669" />,
        backgroundColor: "#D1FAE5",
        iconColor: "#059669",
      };

    case "Travel":
      return {
        icon: <Plane size={16} color="#0891B2" />,
        backgroundColor: "#CFFAFE",
        iconColor: "#0891B2",
      };

    case "Entertainment":
      return {
        icon: <Gift size={16} color="#DC2626" />,
        backgroundColor: "#FEE2E2",
        iconColor: "#DC2626",
      };

    case "Credit Card Payment":
      return {
        icon: <CreditCard size={16} color="#1D4ED8" />,
        backgroundColor: "#DBEAFE",
        iconColor: "#1D4ED8",
      };

    case "Internal Transfer":
      return {
        icon: <ArrowRightLeft size={16} color="#16A34A" />,
        backgroundColor: "#DCFCE7",
        iconColor: "#16A34A",
      };

    case "Transfer":
      return {
        icon: <ArrowRightLeft size={16} color="#6B7280" />,
        backgroundColor: "#F3F4F6",
        iconColor: "#6B7280",
      };

    case "Bills":
      return {
        icon: <Receipt size={16} color="#C2410C" />,
        backgroundColor: "#FFEDD5",
        iconColor: "#C2410C",
      };

    default: // "Other" and fallback
      return {
        icon: <DollarSign size={16} color="#6B7280" />,
        backgroundColor: "#F9FAFB",
        iconColor: "#6B7280",
      };
  }
}; // Helper function to get just the icon with proper color
export const getCategoryIcon = (category: string): React.ReactElement => {
  const config = getCategoryConfig(category);
  return config.icon;
};

// Helper function to get just the background color
export const getCategoryBackgroundColor = (category: string): string => {
  const config = getCategoryConfig(category);
  return config.backgroundColor;
};
