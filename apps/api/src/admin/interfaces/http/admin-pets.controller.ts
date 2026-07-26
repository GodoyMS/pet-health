import {
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards
} from "@nestjs/common";
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CurrentUser } from "../../../auth/interfaces/http/current-user.decorator";
import { User } from "../../../users/domain/user.entity";
import { PetOrmEntity } from "../../../pets/infrastructure/typeorm/pet.orm-entity";
import { PetHealthLogOrmEntity } from "../../../pets/infrastructure/typeorm/pet-health-log.orm-entity";
import { PetAiReportOrmEntity } from "../../../pets/infrastructure/typeorm/pet-ai-report.orm-entity";
import { PreventiveCarePetItemOrmEntity } from "../../../pets/infrastructure/typeorm/preventive-care-pet-item.orm-entity";
import { AuditLogService } from "../../application/audit-log.service";
import { AdminGuard } from "./admin.guard";
import { pageOf, PetsListQueryDto } from "./dto/admin-query.dto";

@ApiTags("admin")
@ApiCookieAuth("auth_token")
@Controller("admin/pets")
@UseGuards(AdminGuard)
export class AdminPetsController {
  constructor(
    @InjectRepository(PetOrmEntity)
    private readonly petsRepo: Repository<PetOrmEntity>,
    @InjectRepository(PetHealthLogOrmEntity)
    private readonly logsRepo: Repository<PetHealthLogOrmEntity>,
    @InjectRepository(PetAiReportOrmEntity)
    private readonly reportsRepo: Repository<PetAiReportOrmEntity>,
    @InjectRepository(PreventiveCarePetItemOrmEntity)
    private readonly careItemsRepo: Repository<PreventiveCarePetItemOrmEntity>,
    private readonly auditLog: AuditLogService
  ) {}

  @Get()
  @ApiOperation({ summary: "List all pets across owners (paginated, searchable)" })
  @ApiResponse({ status: 200, description: "Paginated pet list" })
  async list(@Query() query: PetsListQueryDto) {
    const { page, limit, skip } = pageOf(query);

    const qb = this.petsRepo
      .createQueryBuilder("pet")
      .leftJoinAndSelect("pet.owner", "owner")
      .leftJoinAndSelect("pet.species", "species")
      .leftJoinAndSelect("pet.breed", "breed")
      .orderBy("pet.name", "ASC")
      .skip(skip)
      .take(limit);

    if (query.search) {
      qb.andWhere(
        "(pet.name ILIKE :search OR owner.email ILIKE :search OR owner.name ILIKE :search)",
        { search: `%${query.search}%` }
      );
    }
    if (query.speciesId) {
      qb.andWhere("species.id = :speciesId", { speciesId: query.speciesId });
    }

    const [items, total] = await qb.getManyAndCount();
    return {
      items: items.map((pet) => ({
        id: pet.id,
        name: pet.name,
        speciesName: pet.species?.name ?? null,
        breedName: pet.breed?.name ?? null,
        birthDate: pet.birthDate,
        weightKg: pet.weightKg,
        awarenessScore: pet.awarenessScore,
        owner: pet.owner
          ? { id: pet.owner.id, name: pet.owner.name, email: pet.owner.email }
          : null
      })),
      total,
      page,
      limit
    };
  }

  @Get(":id")
  @ApiOperation({
    summary: "Pet detail with recent health logs, care items and AI reports"
  })
  @ApiResponse({ status: 200, description: "Pet detail" })
  @ApiResponse({ status: 404, description: "Pet not found" })
  async detail(@Param("id", ParseUUIDPipe) id: string) {
    const pet = await this.petsRepo.findOne({
      where: { id },
      relations: ["owner", "species", "breed"]
    });
    if (!pet) {
      throw new NotFoundException("Pet not found");
    }

    const [recentLogs, logCount, careItems, recentReports, reportCount] =
      await Promise.all([
        this.logsRepo.find({
          where: { pet: { id } },
          order: { logDate: "DESC", createdAt: "DESC" },
          take: 10
        }),
        this.logsRepo.count({ where: { pet: { id } } }),
        this.careItemsRepo.find({
          where: { pet: { id } },
          relations: ["preventiveCareRule"],
          order: { dueDate: "ASC" }
        }),
        this.reportsRepo.find({
          where: { pet: { id } },
          order: { generatedAt: "DESC" },
          take: 5
        }),
        this.reportsRepo.count({ where: { pet: { id } } })
      ]);

    return {
      id: pet.id,
      name: pet.name,
      birthDate: pet.birthDate,
      weightKg: pet.weightKg,
      expectedLifeSpanYears: pet.expectedLifeSpanYears,
      awarenessScore: pet.awarenessScore,
      speciesName: pet.species?.name ?? null,
      breedName: pet.breed?.name ?? null,
      owner: pet.owner
        ? { id: pet.owner.id, name: pet.owner.name, email: pet.owner.email }
        : null,
      healthLogCount: logCount,
      aiReportCount: reportCount,
      recentHealthLogs: recentLogs.map((log) => ({
        id: log.id,
        logDate: log.logDate,
        weightKg: log.weightKg,
        appetite: log.appetite,
        energy: log.energy,
        mood: log.mood,
        notes: log.notes
      })),
      careItems: careItems.map((item) => ({
        id: item.id,
        title: item.preventiveCareRule?.title ?? "Unknown rule",
        dueDate: item.dueDate,
        completedAt: item.completedAt
      })),
      recentAiReports: recentReports.map((report) => ({
        id: report.id,
        headline: report.headline,
        awarenessScore: report.awarenessScore,
        model: report.model,
        generatedAt: report.generatedAt
      }))
    };
  }

  @Delete(":id")
  @HttpCode(200)
  @ApiOperation({
    summary: "Delete a pet and its related data (logs, care items, reports)"
  })
  @ApiResponse({ status: 200, description: "Pet deleted" })
  @ApiResponse({ status: 404, description: "Pet not found" })
  async remove(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() actor: User
  ) {
    const pet = await this.petsRepo.findOne({
      where: { id },
      relations: ["owner"]
    });
    if (!pet) {
      throw new NotFoundException("Pet not found");
    }

    await this.petsRepo.delete({ id });
    await this.auditLog.record(actor, "pet.deleted", "pet", id, {
      name: pet.name,
      ownerEmail: pet.owner?.email ?? null
    });
    return { success: true };
  }
}
