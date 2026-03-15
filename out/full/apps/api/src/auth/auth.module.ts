import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthService } from "./application/auth.service";
import { AuthController } from "./interfaces/http/auth.controller";
import { UsersModule } from "../users/users.module";
import { JwtService } from "./infrastructure/jwt.service";
import { UserOrmEntity } from "../users/infrastructure/typeorm/user.orm-entity";
import { AuthGuard } from "./interfaces/http/auth.guard";

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity]), UsersModule],
  controllers: [AuthController],
  providers: [AuthService, JwtService, AuthGuard],
  exports: [AuthService, AuthGuard]
})
export class AuthModule {}

