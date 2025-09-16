/**
 * Utility functions for cleaner error logging and handling
 */

interface PrismaError extends Error {
  code?: string;
  meta?: any;
  clientVersion?: string;
}

/**
 * Temporarily override console.error to suppress Prisma noise
 */
let originalConsoleError: typeof console.error;
let errorSuppression = false;

export function suppressPrismaErrors() {
  if (errorSuppression) return;

  originalConsoleError = console.error;
  errorSuppression = true;

  console.error = (...args: any[]) => {
    const message = args.join(" ");

    // Suppress verbose Prisma stack traces
    if (
      message.includes("PrismaClientKnownRequestError") ||
      message.includes("parsing request") ||
      message.includes("parseEngineResponse") ||
      message.includes("buildQueryError") ||
      message.includes("clientVersion") ||
      message.includes("lib/generated/prisma/runtime") ||
      message.includes("${a.backtrace}")
    ) {
      return; // Suppress these completely
    }

    // Call original console.error for non-Prisma errors
    originalConsoleError(...args);
  };
}

export function restorePrismaErrors() {
  if (!errorSuppression) return;

  console.error = originalConsoleError;
  errorSuppression = false;
}

/**
 * Clean up Prisma errors to show only essential information
 */
export function cleanPrismaError(error: unknown): string {
  if (!error) return "Unknown error";

  // Check if it's a Prisma error
  const prismaError = error as PrismaError;

  if (prismaError.code) {
    // Common Prisma error codes
    const errorMessages: Record<string, string> = {
      P1008: "Database timeout",
      P2002: "Unique constraint violation",
      P2003: "Foreign key constraint violation",
      P2025: "Record not found",
      P2034: "Transaction failed due to dependency on one or more records",
    };

    const friendlyMessage =
      errorMessages[prismaError.code] || `Prisma error ${prismaError.code}`;

    return `${friendlyMessage}${
      prismaError.meta ? ` (${JSON.stringify(prismaError.meta)})` : ""
    }`;
  }

  // Handle timeout errors specifically
  if (error instanceof Error) {
    if (
      error.message.includes("timeout") ||
      error.message.includes("Socket timeout")
    ) {
      return "Database timeout";
    }

    if (error.message.includes("PrismaClientKnownRequestError")) {
      return "Database request error";
    }

    // For other errors, just show the message without the stack
    return error.message;
  }

  return String(error);
}

/**
 * Log an error in a clean, readable format
 */
export function logCleanError(prefix: string, error: unknown): void {
  const cleanMessage = cleanPrismaError(error);
  console.error(`${prefix} ${cleanMessage}`);

  // In development, we might want to see the full error occasionally
  if (
    process.env.NODE_ENV === "development" &&
    process.env.VERBOSE_ERRORS === "true"
  ) {
    console.error("Full error details:", error);
  }
}
