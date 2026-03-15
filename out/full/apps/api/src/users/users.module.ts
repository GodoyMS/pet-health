import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UsersService } from "./application/users.service";
import { UserOrmEntity } from "./infrastructure/typeorm/user.orm-entity";

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}

