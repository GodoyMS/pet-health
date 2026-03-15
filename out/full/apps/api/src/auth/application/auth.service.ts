import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

import { UsersService } from "../../users/application/users.service";
import { JwtService } from "../infrastructure/jwt.service";
import { User } from "../../users/domain/user.entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
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

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = await this.jwtService.sign({
      sub: user.id,
      email: user.email
    });

    return { user, token };
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

