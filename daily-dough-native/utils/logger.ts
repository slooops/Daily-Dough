/**
 * Enhanced logging utility for Daily Dough
 * Provides consistent, structured logging across web and mobile platforms
 */

interface LogContext {
  platform?: "web" | "ios" | "android";
  component?: string;
  action?: string;
  data?: any;
}

class DailyDoughLogger {
  private platform: string;

  constructor() {
    // Detect platform
    if (typeof window !== "undefined") {
      this.platform = "web";
    } else {
      this.platform = "mobile";
    }
  }

  private formatMessage(
    level: string,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
    const platformTag = `[${this.platform.toUpperCase()}]`;
    const contextTag = context?.component ? `[${context.component}]` : "";
    const actionTag = context?.action ? `{${context.action}}` : "";

    return `${timestamp} ${platformTag}${contextTag}${actionTag} ${level} ${message}`;
  }

  info(message: string, context?: LogContext) {
    const formatted = this.formatMessage("ℹ️", message, context);
    console.log(formatted);
    if (context?.data) {
      console.log("   📊 Data:", context.data);
    }
  }

  success(message: string, context?: LogContext) {
    const formatted = this.formatMessage("✅", message, context);
    console.log(formatted);
    if (context?.data) {
      console.log("   📊 Data:", context.data);
    }
  }

  warning(message: string, context?: LogContext) {
    const formatted = this.formatMessage("⚠️", message, context);
    console.warn(formatted);
    if (context?.data) {
      console.warn("   📊 Data:", context.data);
    }
  }

  error(message: string, error?: Error | any, context?: LogContext) {
    const formatted = this.formatMessage("❌", message, context);
    console.error(formatted);
    if (error) {
      console.error("   🔍 Error:", error);
    }
    if (context?.data) {
      console.error("   📊 Data:", context.data);
    }
  }

  api(method: string, url: string, status?: number, data?: any) {
    const message = `${method.toUpperCase()} ${url}`;
    const statusEmoji = status
      ? status < 300
        ? "✅"
        : status < 500
        ? "⚠️"
        : "❌"
      : "📡";
    const statusText = status ? ` → ${status}` : "";

    console.log(`${this.formatMessage(statusEmoji, message)} ${statusText}`);
    if (data) {
      console.log("   📊 Response:", data);
    }
  }

  transaction(action: string, count?: number, data?: any) {
    const message = count !== undefined ? `${action} (${count} items)` : action;
    this.info(message, { component: "Transaction", data });
  }

  navigation(screen: string, action: string = "navigated") {
    this.info(`${action} to ${screen}`, { component: "Navigation" });
  }
}

// Export singleton instance
export const logger = new DailyDoughLogger();

// Export for convenience
export default logger;
