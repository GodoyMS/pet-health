import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({});

class Config {
  public NODE_ENV: string | undefined;
  public JWT_SECRET: string | undefined;
  public DATABASE_URL: string | undefined;
  public PORT: string | undefined;
  public WEB_ORIGIN: string | undefined;

  constructor() {
    this.NODE_ENV = process.env.NODE_ENV;
    this.JWT_SECRET = process.env.JWT_SECRET;
    this.DATABASE_URL = process.env.DATABASE_URL;
    this.PORT = process.env.PORT;
    this.WEB_ORIGIN = process.env.WEB_ORIGIN;
  }

  public validateConfig(): void {
    console.log(this);
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) {
        throw new Error(`Configuration ${key} is undefined`);
      }
    }
  }
}

export const configEnvs: Config = new Config();
