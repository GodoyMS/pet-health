import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";

import { configEnvs } from "config/configEnvs";
import { AuthService } from "../application/auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: configEnvs.GOOGLE_CLIENT_ID!,
      clientSecret: configEnvs.GOOGLE_CLIENT_SECRET!,
      callbackURL: configEnvs.GOOGLE_CALLBACK_URL!,
      scope: ["email", "profile"]
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: {
      id: string;
      displayName: string;
      emails?: { value: string }[];
    },
    done: VerifyCallback
  ) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(new Error("No email returned from Google"), undefined);
    }

    try {
      const user = await this.authService.loginWithGoogle(
        profile.id,
        email,
        profile.displayName
      );
      done(null, user);
    } catch (err: any) {
      done(null, { error: err?.message ?? "google_auth_failed" } as any);
    }
  }
}
