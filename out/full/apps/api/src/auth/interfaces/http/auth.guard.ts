import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { Request } from "express";

import { AuthService } from "../../application/auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
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

    (req as any).currentUser = user;
    return true;
  }
}

