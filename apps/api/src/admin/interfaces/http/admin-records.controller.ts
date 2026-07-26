import {
  Controller,
  Get,
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

import { PetHealthLogOrmEntity } from "../../../pets/infrastructure/typeorm/pet-health-log.orm-entity";
import { PetAiReportOrmEntity } from "../../../pets/infrastructure/typeorm/pet-ai-report.orm-entity";
import { AdminGuard } from "./admin.guard";
import {
  HealthLogsListQueryDto,
  pageOf,
  SearchPaginationQueryDto
} from "./dto/admin-query.dto";

/** Read-only access to user-generated records: health logs and AI reports. */
@ApiTags("admin")
@ApiCookieAuth("auth_token")
@Controller("admin")
@UseGuards(AdminGuard)
export class AdminRecordsController {
  constructor(
    @InjectRepository(PetHealthLogOrmEntity)
    private readonly logsRepo: Repository<PetHealthLogOrmEntity>,
    @InjectRepository(PetAiReportOrmEntity)
    private readonly reportsRepo: Repository<PetAiReportOrmEntity>
  ) {}

  @Get("health-logs")
  @ApiOperation({ summary: "List health logs across all pets (paginated)" })
  @ApiResponse({ status: 200, description: "Paginated health log list" })
  async listHealthLogs(@Query() query: HealthLogsListQueryDto) {
    const { page, limit, skip } = pageOf(query);

    const qb = this.logsRepo
      .createQueryBuilder("log")
      .leftJoinAndSelect("log.pet", "pet")
      .leftJoinAndSelect("pet.owner", "owner")
      .orderBy("log.logDate", "DESC")
      .addOrderBy("log.createdAt", "DESC")
      .skip(skip)
      .take(limit);

    if (query.petId) {
      qb.andWhere("pet.id = :petId", { petId: query.petId });
    }
    if (query.search) {
      qb.andWhere("(pet.name ILIKE :search OR owner.email ILIKE :search)", {
        search: `%${query.search}%`
      });
    }

    const [items, total] = await qb.getManyAndCount();
    return {
      items: items.map((log) => ({
        id: log.id,
        logDate: log.logDate,
        weightKg: log.weightKg,
        appetite: log.appetite,
        energy: log.energy,
        mood: log.mood,
        notes: log.notes,
        createdAt: log.createdAt,
        pet: log.pet
          ? {
              id: log.pet.id,
              name: log.pet.name,
              ownerEmail: log.pet.owner?.email ?? null
            }
          : null
      })),
      total,
      page,
      limit
    };
  }

  @Get("ai-reports")
  @ApiOperation({ summary: "List AI wellness reports across all pets (paginated)" })
  @ApiResponse({ status: 200, description: "Paginated AI report list" })
  async listAiReports(@Query() query: SearchPaginationQueryDto) {
    const { page, limit, skip } = pageOf(query);

    const qb = this.reportsRepo
      .createQueryBuilder("report")
      .leftJoinAndSelect("report.pet", "pet")
      .leftJoinAndSelect("pet.owner", "owner")
      .orderBy("report.generatedAt", "DESC")
      .skip(skip)
      .take(limit);

    if (query.search) {
      qb.andWhere(
        "(pet.name ILIKE :search OR owner.email ILIKE :search OR report.headline ILIKE :search)",
        { search: `%${query.search}%` }
      );
    }

    const [items, total] = await qb.getManyAndCount();
    return {
      items: items.map((report) => ({
        id: report.id,
        headline: report.headline,
        awarenessScore: report.awarenessScore,
        model: report.model,
        generatedAt: report.generatedAt,
        pet: report.pet
          ? {
              id: report.pet.id,
              name: report.pet.name,
              ownerEmail: report.pet.owner?.email ?? null
            }
          : null
      })),
      total,
      page,
      limit
    };
  }

  @Get("ai-reports/:id")
  @ApiOperation({ summary: "Full AI report including generated content" })
  @ApiResponse({ status: 200, description: "AI report detail" })
  @ApiResponse({ status: 404, description: "Report not found" })
  async aiReportDetail(@Param("id", ParseUUIDPipe) id: string) {
    const report = await this.reportsRepo.findOne({
      where: { id },
      relations: ["pet", "pet.owner"]
    });
    if (!report) {
      throw new NotFoundException("AI report not found");
    }
    return {
      id: report.id,
      headline: report.headline,
      awarenessScore: report.awarenessScore,
      model: report.model,
      generatedAt: report.generatedAt,
      content: report.content,
      pet: report.pet
        ? {
            id: report.pet.id,
            name: report.pet.name,
            ownerEmail: report.pet.owner?.email ?? null
          }
        : null
    };
  }
}
