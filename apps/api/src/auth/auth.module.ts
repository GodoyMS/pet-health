import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PassportModule } from "@nestjs/passport";

import { AuthService } from "./application/auth.service";
import { GoogleCalendarModule } from "../google-calendar/google-calendar.module";
import { AuthController } from "./interfaces/http/auth.controller";
import { UsersModule } from "../users/users.module";
import { JwtService } from "./infrastructure/jwt.service";
import { UserOrmEntity } from "../users/infrastructure/typeorm/user.orm-entity";
import { AuthGuard } from "./interfaces/http/auth.guard";
import { GoogleStrategy } from "./infrastructure/google.strategy";
import { configEnvs } from "config/configEnvs";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
    UsersModule,
    PassportModule,
    forwardRef(() => GoogleCalendarModule)
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    AuthGuard,
    // Only register GoogleStrategy when credentials are present
    ...(configEnvs.isGoogleAuthEnabled ? [GoogleStrategy] : [])
  ],
  exports: [AuthService, AuthGuard]
})
export class AuthModule {}
