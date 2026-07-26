import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards
} from "@nestjs/common";
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";
import { AuthGuard as PassportAuthGuard } from "@nestjs/passport";
import { Response, Request } from "express";
import { IsEmail, IsString, MinLength } from "class-validator";

import { AuthService } from "../../application/auth.service";
import { AuthGuard } from "./auth.guard";
import { CurrentUser } from "./current-user.decorator";
import { User } from "../../../users/domain/user.entity";
import { configEnvs } from "config/configEnvs";

class UserResponseDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id!: string;
  @ApiProperty({ example: "Jane Doe" })
  name!: string;
  @ApiProperty({ example: "jane@example.com" })
  email!: string;
  @ApiProperty({ example: "email", enum: ["email", "google"] })
  provider!: string;
  @ApiProperty({ example: "user", enum: ["user", "admin"] })
  role!: string;
}

class RegisterDto {
  @ApiProperty({ example: "Jane Doe", description: "Display name" })
  @IsString()
  name!: string;

  @ApiProperty({ example: "jane@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "secret123", minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;
}

class LoginDto {
  @ApiProperty({ example: "jane@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "secret123" })
  @IsString()
  password!: string;
}

const setAuthCookie = (res: Response, token: string) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000
  });
};

const toUserResponse = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  provider: user.provider,
  role: user.role
});

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: "User created", type: UserResponseDto })
  @ApiResponse({ status: 401, description: "Email already in use" })
  async register(@Body() body: RegisterDto) {
    const user = await this.authService.register(body.name, body.email, body.password);
    return toUserResponse(user);
  }

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Log in; sets httpOnly cookie auth_token" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: "Logged in", type: UserResponseDto })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.authService.login(body.email, body.password);
    setAuthCookie(res, token);
    return toUserResponse(user);
  }

  @Post("logout")
  @HttpCode(200)
  @ApiOperation({ summary: "Log out; clears auth_token cookie" })
  @ApiResponse({ status: 200, description: "Logged out" })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("auth_token", { path: "/" });
    return { success: true };
  }

  @Get("me")
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "Get current user" })
  @ApiResponse({ status: 200, description: "Current user", type: UserResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  me(@CurrentUser() user: User) {
    return toUserResponse(user);
  }

  @Delete("me")
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({
    summary: "Permanently delete the current user's account and all related data"
  })
  @ApiResponse({ status: 200, description: "Account deleted" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async deleteAccount(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response
  ) {
    await this.authService.deleteAccount(user.id);
    res.clearCookie("auth_token", { path: "/" });
    return { success: true };
  }

  // ─── Google OAuth ──────────────────────────────────────────────────────────

  @Get("google")
  @UseGuards(PassportAuthGuard("google"))
  @ApiOperation({ summary: "Initiate Google OAuth flow" })
  googleLogin() {
    // Passport redirects automatically
  }

  @Get("google/callback")
  @UseGuards(PassportAuthGuard("google"))
  @ApiOperation({ summary: "Google OAuth callback" })
  async googleCallback(
    @Req() req: Request & { user?: { user: User; token: string } },
    @Res() res: Response
  ) {
    const result = req.user as any;
    if (!result) {
      return res.redirect(`${configEnvs.WEB_ORIGIN}/login?error=google_auth_failed`);
    }
    if (result.error) {
      const encoded = encodeURIComponent(result.error);
      return res.redirect(`${configEnvs.WEB_ORIGIN}/login?error=${encoded}`);
    }

    setAuthCookie(res, result.token);
    return res.redirect(`${configEnvs.WEB_ORIGIN}/dashboard`);
  }
}
