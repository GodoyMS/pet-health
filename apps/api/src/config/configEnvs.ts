import * as dotenv from "dotenv";

dotenv.config({});

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
  }

  get isNearbyPlacesEnabled(): boolean {
    return !!this.GOOGLE_MAPS_API_KEY;
  }

  public validateConfig(): void {
    const required: (keyof Config)[] = [
      "NODE_ENV",
      "JWT_SECRET",
      "DATABASE_URL",
      "PORT",
      "WEB_ORIGIN",
      "DEEPSEEK_API_KEY"
    ];
    for (const key of required) {
      if (this[key] === undefined) {
        throw new Error(`Configuration ${key} is undefined`);
      }
    }
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
