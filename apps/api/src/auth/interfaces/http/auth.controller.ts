import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards
} from "@nestjs/common";
import { Response, Request } from "express";
import { IsEmail, IsString, MinLength } from "class-validator";

import { AuthService } from "../../application/auth.service";
import { AuthGuard } from "./auth.guard";
import { CurrentUser } from "./current-user.decorator";
import { User } from "../../../users/domain/user.entity";

class RegisterDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() body: RegisterDto) {
    const user = await this.authService.register(
      body.name,
      body.email,
      body.password
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email
    };
  }

  @Post("login")
  @HttpCode(200)
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.authService.login(
      body.email,
      body.password
    );

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email
    };
  }

  @Post("logout")
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("auth_token", { path: "/" });
    return { success: true };
  }

  @Get("me")
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email
    };
  }
}

