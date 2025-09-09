/**
 * Environment configuration with strict validation
 * Fails fast on server boot if required variables are missing
 */

interface Config {
  plaid: {
    clientId: string;
    secret: string;
    env: "sandbox" | "development" | "production";
  };
  database: {
    url: string;
  };
  encryption: {
    key: string;
  };
  webhook: {
    secret?: string;
    verificationEnabled: boolean;
  };
}

function validateEnvVar(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `❌ Missing required environment variable: ${name}\n` +
        `Please check your .env.local or .env.development.local file.\n` +
        `Server cannot start without this configuration.`
    );
  }
  return value.trim();
}

function validatePlaidEnv(
  env: string
): "sandbox" | "development" | "production" {
  const validEnvs = ["sandbox", "development", "production"] as const;
  if (!validEnvs.includes(env as any)) {
    throw new Error(
      `❌ Invalid PLAID_ENV: "${env}"\n` +
        `Must be one of: ${validEnvs.join(", ")}\n` +
        `Current value: ${env}`
    );
  }
  return env as "sandbox" | "development" | "production";
}

// Validate all required environment variables on module load
function loadConfig(): Config {
  try {
    console.log("🔧 Validating environment configuration...");

    const webhookSecret = process.env.PLAID_WEBHOOK_SECRET?.trim();

    const config: Config = {
      plaid: {
        clientId: validateEnvVar(
          "PLAID_CLIENT_ID",
          process.env.PLAID_CLIENT_ID
        ),
        secret: validateEnvVar("PLAID_SECRET", process.env.PLAID_SECRET),
        env: validatePlaidEnv(
          validateEnvVar("PLAID_ENV", process.env.PLAID_ENV)
        ),
      },
      database: {
        url: validateEnvVar("DATABASE_URL", process.env.DATABASE_URL),
      },
      encryption: {
        key: validateEnvVar("ENCRYPTION_KEY", process.env.ENCRYPTION_KEY),
      },
      webhook: {
        secret: webhookSecret,
        verificationEnabled: !!webhookSecret,
      },
    };

    console.log(`✅ Environment validated successfully`);
    console.log(`   - Plaid environment: ${config.plaid.env}`);
    console.log(
      `   - Database configured: ${
        config.database.url.includes("localhost") ? "local" : "remote"
      }`
    );
    console.log(`   - Encryption key: configured`);
    console.log(
      `   - Webhook verification: ${
        config.webhook.verificationEnabled ? "enabled" : "disabled"
      }`
    );

    return config;
  } catch (error) {
    console.error("\n🚨 CONFIGURATION ERROR - SERVER CANNOT START\n");
    console.error(
      error instanceof Error ? error.message : "Unknown configuration error"
    );
    console.error(
      "\nPlease fix the environment configuration and restart the server.\n"
    );

    // Exit the process to fail fast
    process.exit(1);
  }
}

// Load and export the validated configuration
export const config = loadConfig();

// Re-export for convenience
export const {
  plaid: plaidConfig,
  database: databaseConfig,
  encryption: encryptionConfig,
  webhook: webhookConfig,
} = config;
