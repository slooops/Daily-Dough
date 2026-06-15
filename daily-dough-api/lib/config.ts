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
  if (!(validEnvs as readonly string[]).includes(env)) {
    throw new Error(
      `❌ Invalid PLAID_ENV: "${env}"\n` +
        `Must be one of: ${validEnvs.join(", ")}\n` +
        `Current value: ${env}`
    );
  }
  return env as "sandbox" | "development" | "production";
}

let _cached: Config | null = null;

function getConfig(): Config {
  if (_cached) return _cached;

  // During next build, env vars may not be available — return safe defaults
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return {
      plaid: { clientId: "", secret: "", env: "sandbox" },
      database: { url: "file:./prisma/dev.db" },
      encryption: { key: "" },
      webhook: { secret: undefined, verificationEnabled: false },
    };
  }

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
      url: process.env.DATABASE_URL || "file:./prisma/dev.db",
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
      config.database.url.startsWith("file:") ? "SQLite (local)" :
      config.database.url.includes("localhost") ? "local" : "remote"
    }`
  );
  console.log(`   - Encryption key: configured`);
  console.log(
    `   - Webhook verification: ${
      config.webhook.verificationEnabled ? "enabled" : "disabled"
    }`
  );

  _cached = config;
  return config;
}

// Lazy-loaded config — validated on first access at runtime, not at import time
export const config: Config = new Proxy({} as Config, {
  get(_, prop: string) {
    return getConfig()[prop as keyof Config];
  },
});

export const plaidConfig = new Proxy({} as Config["plaid"], {
  get(_, prop: string) {
    return getConfig().plaid[prop as keyof Config["plaid"]];
  },
});

export const databaseConfig = new Proxy({} as Config["database"], {
  get(_, prop: string) {
    return getConfig().database[prop as keyof Config["database"]];
  },
});

export const encryptionConfig = new Proxy({} as Config["encryption"], {
  get(_, prop: string) {
    return getConfig().encryption[prop as keyof Config["encryption"]];
  },
});

export const webhookConfig = new Proxy({} as Config["webhook"], {
  get(_, prop: string) {
    return getConfig().webhook[prop as keyof Config["webhook"]];
  },
});
