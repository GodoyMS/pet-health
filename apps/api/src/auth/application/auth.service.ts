import {
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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => GoogleCalendarService))
    private readonly googleCalendarService: GoogleCalendarService
  ) {}

  async register(name: string, email: string, password: string): Promise<User> {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new UnauthorizedException("Email already in use");
    }

    const hashed = await bcrypt.hash(password, 10);
    return this.usersService.create(name, email, hashed);
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.usersService.findByEmail(email);
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
      // Check if the email is already registered with email/password
      const existingByEmail = await this.usersService.findByEmail(email);
      if (existingByEmail) {
        // Link the Google account to the existing email account
        // For simplicity we throw a clear error — full account linking is out of scope
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
    try {
      await this.googleCalendarService.disconnect(userId);
    } catch (err) {
      this.logger.error(
        `Failed to clean up Google Calendar for user ${userId} during account deletion`,
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
}
