import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { Request } from "express";

import { AuthService } from "../../../auth/application/auth.service";

/**
 * Backoffice guard: same cookie session as the product app, but the
 * authenticated user must also hold the "admin" role.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.cookies?.["auth_token"];

    if (!token) {
      throw new UnauthorizedException("Missing auth token");
    }

    const user = await this.authService.verifyToken(token);
    if (!user) {
      throw new UnauthorizedException("Invalid auth token");
    }

    if (user.role !== "admin") {
      throw new ForbiddenException("Admin access required");
    }

    (req as any).currentUser = user;
    return true;
  }
}
