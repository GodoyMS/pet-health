import * as dotenv from "dotenv";

dotenv.config({});

/** Reads a boolean env var; `undefined`/empty falls back to `fallback`. */
function boolEnv(raw: string | undefined, fallback: boolean): boolean {
  const value = raw?.trim().toLowerCase();
  if (value == null || value === "") {
    return fallback;
  }
  return value === "true" || value === "1" || value === "yes";
}

class Config {
  public NODE_ENV: string | undefined;
  public JWT_SECRET: string | undefined;
  public DATABASE_URL: string | undefined;
  public PORT: string | undefined;
  public WEB_ORIGIN: string | undefined;
  /** Origin of the admin backoffice app (CORS allow-list), e.g. http://localhost:5174 */
  public ADMIN_ORIGIN: string | undefined;
  /**
   * Comma-separated emails promoted to the "admin" role on API boot.
   * Users must already exist (register first, then restart / re-boot).
   */
  public ADMIN_EMAILS: string | undefined;
  /** Required for AI wellness report generation; optional for offline rule CLI scripts. */
  public DEEPSEEK_API_KEY: string | undefined;
  /** Optional — only required if Google OAuth is enabled. */
  public GOOGLE_CLIENT_ID: string | undefined;
  public GOOGLE_CLIENT_SECRET: string | undefined;
  public GOOGLE_CALLBACK_URL: string | undefined;
  /** Required for Google Calendar integration. */
  public GOOGLE_CALENDAR_CALLBACK_URL: string | undefined;
  /**
   * Server-side key for the Google Places API (New), used by the Nearby Care
   * map to proxy `places:searchNearby` and photo lookups. Enable "Places API
   * (New)" on the key's Google Cloud project.
   */
  public GOOGLE_MAPS_API_KEY: string | undefined;
  /** AWS region for SES (e.g. us-east-1). Required when SES_FROM_EMAIL is set. */
  public AWS_REGION: string | undefined;
  public AWS_ACCESS_KEY_ID: string | undefined;
  public AWS_SECRET_ACCESS_KEY: string | undefined;
  /** Verified SES identity used as the From address. */
  public SES_FROM_EMAIL: string | undefined;
  /** Optional SES configuration set name. */
  public SES_CONFIGURATION_SET: string | undefined;
  /** Enables TLS to Postgres. Required by most managed providers over public networking. */
  public DB_SSL: string | undefined;
  /** Escape hatch for TypeORM auto-schema. Never enable in production — migrations own the schema. */
  public DB_SYNCHRONIZE: string | undefined;
  /** Applies pending migrations during DataSource init, before the app accepts traffic. */
  public DB_MIGRATIONS_RUN: string | undefined;
  /** Runs the idempotent reference-data seed on boot (species, breeds, care + lifestyle rules). */
  public SEED_ON_BOOT: string | undefined;

  constructor() {
    this.NODE_ENV = process.env.NODE_ENV;
    this.JWT_SECRET = process.env.JWT_SECRET;
    this.DATABASE_URL = process.env.DATABASE_URL;
    this.PORT = process.env.PORT;
    this.WEB_ORIGIN = process.env.WEB_ORIGIN;
    this.ADMIN_ORIGIN = process.env.ADMIN_ORIGIN;
    this.ADMIN_EMAILS = process.env.ADMIN_EMAILS;
    this.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    this.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    this.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    this.GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
    this.GOOGLE_CALENDAR_CALLBACK_URL = process.env.GOOGLE_CALENDAR_CALLBACK_URL;
    this.GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    this.AWS_REGION = process.env.AWS_REGION;
    this.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
    this.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
    this.SES_FROM_EMAIL = process.env.SES_FROM_EMAIL;
    this.SES_CONFIGURATION_SET = process.env.SES_CONFIGURATION_SET;
    this.DB_SSL = process.env.DB_SSL;
    this.DB_SYNCHRONIZE = process.env.DB_SYNCHRONIZE;
    this.DB_MIGRATIONS_RUN = process.env.DB_MIGRATIONS_RUN;
    this.SEED_ON_BOOT = process.env.SEED_ON_BOOT;
  }

  get isProduction(): boolean {
    return this.NODE_ENV === "production";
  }

  get isNearbyPlacesEnabled(): boolean {
    return !!this.GOOGLE_MAPS_API_KEY;
  }

  get isDbSslEnabled(): boolean {
    return boolEnv(this.DB_SSL, false);
  }

  /**
   * Auto-schema is a development convenience only. Production schema changes go
   * through migrations, so this stays off there regardless of the env var.
   */
  get isDbSynchronizeEnabled(): boolean {
    if (this.isProduction) {
      return false;
    }
    return boolEnv(this.DB_SYNCHRONIZE, true);
  }

  /** Pending migrations apply automatically in production; opt-in elsewhere. */
  get isDbMigrationsRunEnabled(): boolean {
    return boolEnv(this.DB_MIGRATIONS_RUN, this.isProduction);
  }

  get isSeedOnBootEnabled(): boolean {
    return boolEnv(this.SEED_ON_BOOT, false);
  }

  /** SES sends when a verified From address and region are configured. */
  get isSesEnabled(): boolean {
    return !!(this.SES_FROM_EMAIL && this.AWS_REGION);
  }

  /**
   * Fails fast on boot rather than at first request. Only vars the API cannot
   * serve a single authenticated request without are required; feature-gating
   * vars are reported as warnings so a deployment can start without them.
   *
   * @returns Warnings for optional vars whose feature will stay disabled.
   */
  public validateConfig(): string[] {
    const isBlank = (key: keyof Config): boolean => {
      const value = this[key];
      return typeof value !== "string" || value.trim() === "";
    };

    const required: (keyof Config)[] = [
      "JWT_SECRET",
      "DATABASE_URL",
      "WEB_ORIGIN"
    ];
    const missing = required.filter(isBlank);
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variable(s): ${missing.join(", ")}. ` +
          "See apps/api/.env.example."
      );
    }

    const optional: { key: keyof Config; feature: string }[] = [
      { key: "DEEPSEEK_API_KEY", feature: "AI wellness reports" },
      { key: "GOOGLE_CLIENT_ID", feature: "Google sign-in" },
      { key: "GOOGLE_MAPS_API_KEY", feature: "Nearby Care map" },
      { key: "SES_FROM_EMAIL", feature: "transactional email (codes fall back to logs)" }
    ];
    return optional
      .filter(({ key }) => isBlank(key))
      .map(({ key, feature }) => `${key} is not set — ${feature} is disabled.`);
  }

  get isGoogleAuthEnabled(): boolean {
    return !!(this.GOOGLE_CLIENT_ID && this.GOOGLE_CLIENT_SECRET && this.GOOGLE_CALLBACK_URL);
  }

  get adminEmails(): string[] {
    return (this.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0);
  }

  get corsOrigins(): string[] {
    const origins = [
      this.WEB_ORIGIN ?? "http://localhost:5173",
      this.ADMIN_ORIGIN ?? "http://localhost:5174"
    ];
    return [...new Set(origins)];
  }
}

export const configEnvs: Config = new Config();
