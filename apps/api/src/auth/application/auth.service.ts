import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";

import { UsersService } from "../../users/application/users.service";
import { JwtService } from "../infrastructure/jwt.service";
import { User } from "../../users/domain/user.entity";
import { GoogleCalendarService } from "../../google-calendar/application/google-calendar.service";
import { AuthChallengeService } from "./auth-challenge.service";
import { configEnvs } from "../../config/configEnvs";

export type RegisterStartResult = {
  email: string;
  requiresVerification: true;
  /** Present only in non-production when SES is not configured. */
  previewCode?: string;
};

export type MessageResult = {
  success: true;
  message: string;
  previewCode?: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly authChallengeService: AuthChallengeService,
    @Inject(forwardRef(() => GoogleCalendarService))
    private readonly googleCalendarService: GoogleCalendarService
  ) {}

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<RegisterStartResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.usersService.findByEmail(normalizedEmail);

    if (existing?.provider === "google") {
      throw new UnauthorizedException(
        "This email is registered with Google Sign-In. Please log in with Google."
      );
    }

    if (existing?.emailVerified) {
      throw new UnauthorizedException("Email already in use");
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = existing
      ? await this.usersService.updateUnverifiedRegistration(
          existing.id,
          name.trim(),
          hashed
        )
      : await this.usersService.create(name.trim(), normalizedEmail, hashed, {
          emailVerified: false
        });

    const challenge = await this.authChallengeService.issueChallenge({
      email: user.email,
      purpose: "email_verification",
      name: user.name,
      // Fresh signup / re-signup should always mint a new code.
      force: true
    });

    return {
      email: user.email,
      requiresVerification: true,
      ...this.withPreviewCode(challenge.previewCode)
    };
  }

  async verifyEmail(
    email: string,
    code: string
  ): Promise<{ user: User; token: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (!user || user.provider !== "email") {
      throw new BadRequestException("Invalid or expired verification code.");
    }

    if (user.emailVerified) {
      const token = await this.jwtService.sign({ sub: user.id, email: user.email });
      return { user, token };
    }

    await this.authChallengeService.consumeChallenge({
      email: normalizedEmail,
      purpose: "email_verification",
      code
    });

    const verified = await this.usersService.markEmailVerified(user.id);
    const token = await this.jwtService.sign({
      sub: verified.id,
      email: verified.email
    });
    return { user: verified, token };
  }

  async resendEmailVerification(email: string): Promise<MessageResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (!user || user.provider !== "email" || user.emailVerified) {
      return {
        success: true,
        message: "If an unverified account exists, a new code has been sent."
      };
    }

    const challenge = await this.authChallengeService.issueChallenge({
      email: user.email,
      purpose: "email_verification",
      name: user.name
    });

    return {
      success: true,
      message: "If an unverified account exists, a new code has been sent.",
      ...this.withPreviewCode(challenge.previewCode)
    };
  }

  async forgotPassword(email: string): Promise<MessageResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const generic: MessageResult = {
      success: true,
      message: "If an account exists for that email, a reset code has been sent."
    };

    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user || user.provider !== "email" || !user.passwordHash || !user.emailVerified) {
      return generic;
    }

    const challenge = await this.authChallengeService.issueChallenge({
      email: user.email,
      purpose: "password_reset",
      name: user.name
    });

    return {
      ...generic,
      ...this.withPreviewCode(challenge.previewCode)
    };
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<MessageResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (!user || user.provider !== "email" || !user.passwordHash) {
      throw new BadRequestException("Invalid or expired verification code.");
    }

    await this.authChallengeService.consumeChallenge({
      email: normalizedEmail,
      purpose: "password_reset",
      code
    });

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user.id, hashed);

    if (!user.emailVerified) {
      await this.usersService.markEmailVerified(user.id);
    }

    return {
      success: true,
      message: "Password updated. You can sign in with your new password."
    };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (user.provider !== "email" || !user.passwordHash) {
      throw new UnauthorizedException(
        "This account uses Google Sign-In. Please log in with Google."
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException(
        "Email not verified. Please enter the verification code sent to your inbox."
      );
    }

    const token = await this.jwtService.sign({ sub: user.id, email: user.email });
    return { user, token };
  }

  async loginWithGoogle(
    googleId: string,
    email: string,
    name: string
  ): Promise<{ user: User; token: string }> {
    let user = await this.usersService.findByGoogleId(googleId);

    if (!user) {
      const existingByEmail = await this.usersService.findByEmail(email);
      if (existingByEmail) {
        throw new UnauthorizedException(
          "An account with this email already exists. Please log in with your email and password."
        );
      }
      user = await this.usersService.createOAuthUser(name, email, googleId);
    }

    const token = await this.jwtService.sign({ sub: user.id, email: user.email });
    return { user, token };
  }

  /**
   * Permanently delete the user's account and all related data.
   *
   * We first best-effort disconnect Google Calendar so the events we created in
   * the user's external calendar are removed — the DB cascade only clears our own
   * tables, not the events living in Google. A failure there must not block the
   * account deletion, so it is logged and swallowed.
   */
  async deleteAccount(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      return;
    }

    try {
      await this.googleCalendarService.disconnect(userId);
    } catch (err) {
      this.logger.error(
        `Failed to clean up Google Calendar for user ${userId} during account deletion`,
        err as Error
      );
    }

    try {
      await this.authChallengeService.deleteByEmail(user.email);
    } catch (err) {
      this.logger.error(
        `Failed to clean up auth challenges for user ${userId} during account deletion`,
        err as Error
      );
    }

    await this.usersService.deleteById(userId);
  }

  async verifyToken(token: string): Promise<User | null> {
    const payload = await this.jwtService.verify(token);
    if (!payload) {
      return null;
    }

    const user = await this.usersService.findById(payload.sub);
    return user ?? null;
  }

  private withPreviewCode(previewCode?: string): { previewCode?: string } {
    if (!previewCode || configEnvs.NODE_ENV === "production") {
      return {};
    }
    return { previewCode };
  }
}
