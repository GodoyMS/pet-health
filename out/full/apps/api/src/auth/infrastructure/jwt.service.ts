import { Injectable } from "@nestjs/common";
import { configEnvs } from "config/configEnvs";
import jwt from "jsonwebtoken";

const DEFAULT_EXPIRATION = "1d";

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtService {
  private readonly secret = configEnvs.JWT_SECRET ?? "dev-secret-change-me";

  async sign(payload: JwtPayload): Promise<string> {
    return jwt.sign(payload, this.secret, { expiresIn: DEFAULT_EXPIRATION });
  }

  async verify(token: string): Promise<JwtPayload | null> {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch {
      return null;
    }
  }
}

