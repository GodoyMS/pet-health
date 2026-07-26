import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards
} from "@nestjs/common";
import {
  ApiCookieAuth,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { Repository } from "typeorm";

import { AuthService } from "../../../auth/application/auth.service";
import { CurrentUser } from "../../../auth/interfaces/http/current-user.decorator";
import { User, UserRole } from "../../../users/domain/user.entity";
import { UserOrmEntity } from "../../../users/infrastructure/typeorm/user.orm-entity";
import { AuditLogService } from "../../application/audit-log.service";
import { AdminGuard } from "./admin.guard";
import { pageOf, UsersListQueryDto } from "./dto/admin-query.dto";

class UpdateUserDto {
  @ApiProperty({ example: "Jane Doe", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiProperty({ example: "admin", enum: ["user", "admin"], required: false })
  @IsOptional()
  @IsIn(["user", "admin"])
  role?: UserRole;
}

const toListItem = (user: UserOrmEntity & { petCount?: number }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  provider: user.provider,
  role: user.role,
  createdAt: user.createdAt,
  petCount: user.petCount ?? 0
});

@ApiTags("admin")
@ApiCookieAuth("auth_token")
@Controller("admin/users")
@UseGuards(AdminGuard)
export class AdminUsersController {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly usersRepo: Repository<UserOrmEntity>,
    private readonly authService: AuthService,
    private readonly auditLog: AuditLogService
  ) {}

  @Get()
  @ApiOperation({ summary: "List users with pet counts (paginated, searchable)" })
  @ApiResponse({ status: 200, description: "Paginated user list" })
  async list(@Query() query: UsersListQueryDto) {
    const { page, limit, skip } = pageOf(query);

    const qb = this.usersRepo
      .createQueryBuilder("user")
      .loadRelationCountAndMap("user.petCount", "user.pets")
      .orderBy("user.createdAt", "DESC")
      .skip(skip)
      .take(limit);

    if (query.search) {
      qb.andWhere("(user.email ILIKE :search OR user.name ILIKE :search)", {
        search: `%${query.search}%`
      });
    }
    if (query.role) {
      qb.andWhere("user.role = :role", { role: query.role });
    }

    const [items, total] = await qb.getManyAndCount();
    return {
      items: items.map((u) => toListItem(u as UserOrmEntity & { petCount?: number })),
      total,
      page,
      limit
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "User detail including owned pets" })
  @ApiResponse({ status: 200, description: "User detail" })
  @ApiResponse({ status: 404, description: "User not found" })
  async detail(@Param("id", ParseUUIDPipe) id: string) {
    const user = await this.usersRepo.findOne({
      where: { id },
      relations: ["pets", "pets.species", "pets.breed"]
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      provider: user.provider,
      role: user.role,
      createdAt: user.createdAt,
      pets: (user.pets ?? []).map((pet) => ({
        id: pet.id,
        name: pet.name,
        speciesName: pet.species?.name ?? null,
        breedName: pet.breed?.name ?? null,
        birthDate: pet.birthDate,
        weightKg: pet.weightKg,
        awarenessScore: pet.awarenessScore
      }))
    };
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a user's name or role" })
  @ApiResponse({ status: 200, description: "Updated user" })
  @ApiResponse({ status: 400, description: "Cannot change your own role" })
  @ApiResponse({ status: 404, description: "User not found" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateUserDto,
    @CurrentUser() actor: User
  ) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (body.role !== undefined && id === actor.id) {
      // Guards against an admin locking themselves out of the backoffice.
      throw new BadRequestException("You cannot change your own role");
    }

    const changes: Record<string, unknown> = {};
    if (body.name !== undefined && body.name !== user.name) {
      changes.name = { from: user.name, to: body.name };
      user.name = body.name;
    }
    if (body.role !== undefined && body.role !== user.role) {
      changes.role = { from: user.role, to: body.role };
      user.role = body.role;
    }

    if (Object.keys(changes).length > 0) {
      await this.usersRepo.save(user);
      await this.auditLog.record(actor, "user.updated", "user", id, {
        email: user.email,
        ...changes
      });
    }

    return toListItem(user);
  }

  @Delete(":id")
  @HttpCode(200)
  @ApiOperation({
    summary: "Permanently delete a user and all their data (pets, logs, reports)"
  })
  @ApiResponse({ status: 200, description: "User deleted" })
  @ApiResponse({ status: 400, description: "Cannot delete your own account here" })
  @ApiResponse({ status: 404, description: "User not found" })
  async remove(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() actor: User
  ) {
    if (id === actor.id) {
      throw new BadRequestException(
        "You cannot delete your own account from the backoffice"
      );
    }
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Reuses the product deletion path so external Google Calendar events
    // created for this user are cleaned up before the DB cascade.
    await this.authService.deleteAccount(id);
    await this.auditLog.record(actor, "user.deleted", "user", id, {
      email: user.email,
      name: user.name
    });
    return { success: true };
  }
}
