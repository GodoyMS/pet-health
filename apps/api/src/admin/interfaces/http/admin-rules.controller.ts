import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min
} from "class-validator";
import { Type } from "class-transformer";
import { Repository, SelectQueryBuilder } from "typeorm";

import { CurrentUser } from "../../../auth/interfaces/http/current-user.decorator";
import { User } from "../../../users/domain/user.entity";
import { PreventiveCareRuleService } from "../../../preventive-care-rules/application/preventive-care-rule.service";
import { CreatePreventiveCareRuleDto } from "../../../preventive-care-rules/application/dto/create-preventive-care-rule.dto";
import { UpdatePreventiveCareRuleDto } from "../../../preventive-care-rules/application/dto/update-preventive-care-rule.dto";
import { PreventiveCareRuleOrmEntity } from "../../../preventive-care-rules/infrastructure/typeorm/preventive-care-rule.orm-entity";
import { LifestyleRuleOrmEntity } from "../../../lifestyle-rules/infrastructure/typeorm/lifestyle-rule.orm-entity";
import { LifestyleRuleType } from "../../../lifestyle-rules/domain/lifestyle-rule-type.enum";
import { SpeciesOrmEntity } from "../../../species/infrastructure/typeorm/species.orm-entity";
import { BreedOrmEntity } from "../../../species/infrastructure/typeorm/breed.orm-entity";
import { AuditLogService } from "../../application/audit-log.service";
import { AdminGuard } from "./admin.guard";
import { pageOf, RulesListQueryDto } from "./dto/admin-query.dto";

class CreateLifestyleRuleDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  description!: string;

  @IsUUID()
  speciesId!: string;

  @IsUUID()
  breedId!: string;

  @IsEnum(LifestyleRuleType)
  type!: LifestyleRuleType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(365_000)
  applicableMinAgeDays?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(365_000)
  applicableMaxAgeDays?: number | null;
}

class UpdateLifestyleRuleDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(LifestyleRuleType)
  type?: LifestyleRuleType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(365_000)
  applicableMinAgeDays?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(365_000)
  applicableMaxAgeDays?: number | null;
}

function applyRuleFilters<T extends { id: string }>(
  qb: SelectQueryBuilder<T>,
  alias: string,
  query: RulesListQueryDto
): void {
  if (query.search) {
    qb.andWhere(`${alias}.title ILIKE :search`, { search: `%${query.search}%` });
  }
  if (query.speciesId) {
    qb.andWhere("species.id = :speciesId", { speciesId: query.speciesId });
  }
  if (query.breedId) {
    qb.andWhere("breed.id = :breedId", { breedId: query.breedId });
  }
}

@ApiTags("admin")
@ApiCookieAuth("auth_token")
@Controller("admin")
@UseGuards(AdminGuard)
export class AdminRulesController {
  constructor(
    private readonly preventiveRuleService: PreventiveCareRuleService,
    @InjectRepository(PreventiveCareRuleOrmEntity)
    private readonly preventiveRepo: Repository<PreventiveCareRuleOrmEntity>,
    @InjectRepository(LifestyleRuleOrmEntity)
    private readonly lifestyleRepo: Repository<LifestyleRuleOrmEntity>,
    @InjectRepository(SpeciesOrmEntity)
    private readonly speciesRepo: Repository<SpeciesOrmEntity>,
    @InjectRepository(BreedOrmEntity)
    private readonly breedsRepo: Repository<BreedOrmEntity>,
    private readonly auditLog: AuditLogService
  ) {}

  // ─── Species & breeds reference ─────────────────────────────────────────

  @Get("species")
  @ApiOperation({ summary: "Species with their breeds and pet counts" })
  @ApiResponse({ status: 200, description: "Species reference list" })
  async listSpecies() {
    const species = await this.speciesRepo
      .createQueryBuilder("species")
      .leftJoinAndSelect("species.breeds", "breeds")
      .loadRelationCountAndMap("species.petCount", "species.pets")
      .orderBy("species.order", "ASC", "NULLS LAST")
      .addOrderBy("species.name", "ASC")
      .addOrderBy("breeds.name", "ASC")
      .getMany();

    return species.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      imageUrl: s.imageUrl,
      petCount: (s as SpeciesOrmEntity & { petCount?: number }).petCount ?? 0,
      breeds: (s.breeds ?? []).map((b) => ({
        id: b.id,
        name: b.name,
        expectedLifespanYears: b.expectedLifespanYears
      }))
    }));
  }

  // ─── Preventive care rules (full CRUD) ──────────────────────────────────

  @Get("preventive-care-rules")
  @ApiOperation({ summary: "List preventive care rules (paginated, filterable)" })
  @ApiResponse({ status: 200, description: "Paginated rule list" })
  async listPreventiveRules(@Query() query: RulesListQueryDto) {
    const { page, limit, skip } = pageOf(query);
    const qb = this.preventiveRepo
      .createQueryBuilder("rule")
      .leftJoinAndSelect("rule.species", "species")
      .leftJoinAndSelect("rule.breed", "breed")
      .orderBy("species.name", "ASC")
      .addOrderBy("breed.name", "ASC")
      .addOrderBy("rule.title", "ASC")
      .skip(skip)
      .take(limit);
    applyRuleFilters(qb, "rule", query);

    const [items, total] = await qb.getManyAndCount();
    return {
      items: items.map((rule) => ({
        id: rule.id,
        title: rule.title,
        type: rule.type,
        speciesId: rule.species?.id ?? null,
        speciesName: rule.species?.name ?? null,
        breedId: rule.breed?.id ?? null,
        breedName: rule.breed?.name ?? null,
        applicableMinAgeDays: rule.applicableMinAgeDays,
        applicableMaxAgeDays: rule.applicableMaxAgeDays,
        intervalDays: rule.intervalDays,
        updatedAt: rule.updatedAt
      })),
      total,
      page,
      limit
    };
  }

  @Post("preventive-care-rules")
  @ApiOperation({ summary: "Create a preventive care rule" })
  @ApiResponse({ status: 201, description: "Rule created" })
  async createPreventiveRule(
    @Body() body: CreatePreventiveCareRuleDto,
    @CurrentUser() actor: User
  ) {
    const rule = await this.preventiveRuleService.create(body);
    await this.auditLog.record(
      actor,
      "preventive_care_rule.created",
      "preventive_care_rule",
      rule.id,
      { title: rule.title, type: rule.type }
    );
    return rule;
  }

  @Patch("preventive-care-rules/:id")
  @ApiOperation({ summary: "Update a preventive care rule" })
  @ApiResponse({ status: 200, description: "Rule updated" })
  @ApiResponse({ status: 404, description: "Rule not found" })
  async updatePreventiveRule(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdatePreventiveCareRuleDto,
    @CurrentUser() actor: User
  ) {
    const rule = await this.preventiveRuleService.update(id, body);
    await this.auditLog.record(
      actor,
      "preventive_care_rule.updated",
      "preventive_care_rule",
      id,
      { title: rule.title, changes: body as unknown as Record<string, unknown> }
    );
    return rule;
  }

  @Delete("preventive-care-rules/:id")
  @HttpCode(200)
  @ApiOperation({ summary: "Delete a preventive care rule" })
  @ApiResponse({ status: 200, description: "Rule deleted" })
  @ApiResponse({ status: 404, description: "Rule not found" })
  async deletePreventiveRule(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() actor: User
  ) {
    await this.preventiveRuleService.delete(id);
    await this.auditLog.record(
      actor,
      "preventive_care_rule.deleted",
      "preventive_care_rule",
      id
    );
    return { success: true };
  }

  // ─── Lifestyle rules (full CRUD) ────────────────────────────────────────

  @Get("lifestyle-rules")
  @ApiOperation({ summary: "List lifestyle rules (paginated, filterable)" })
  @ApiResponse({ status: 200, description: "Paginated rule list" })
  async listLifestyleRules(@Query() query: RulesListQueryDto) {
    const { page, limit, skip } = pageOf(query);
    const qb = this.lifestyleRepo
      .createQueryBuilder("rule")
      .leftJoinAndSelect("rule.species", "species")
      .leftJoinAndSelect("rule.breed", "breed")
      .orderBy("species.name", "ASC")
      .addOrderBy("breed.name", "ASC")
      .addOrderBy("rule.title", "ASC")
      .skip(skip)
      .take(limit);
    applyRuleFilters(qb, "rule", query);

    const [items, total] = await qb.getManyAndCount();
    return {
      items: items.map((rule) => ({
        id: rule.id,
        title: rule.title,
        description: rule.description,
        type: rule.type,
        speciesId: rule.species?.id ?? null,
        speciesName: rule.species?.name ?? null,
        breedId: rule.breed?.id ?? null,
        breedName: rule.breed?.name ?? null,
        applicableMinAgeDays: rule.applicableMinAgeDays,
        applicableMaxAgeDays: rule.applicableMaxAgeDays,
        updatedAt: rule.updatedAt
      })),
      total,
      page,
      limit
    };
  }

  @Post("lifestyle-rules")
  @ApiOperation({ summary: "Create a lifestyle rule" })
  @ApiResponse({ status: 201, description: "Rule created" })
  async createLifestyleRule(
    @Body() body: CreateLifestyleRuleDto,
    @CurrentUser() actor: User
  ) {
    const species = await this.speciesRepo.findOne({
      where: { id: body.speciesId }
    });
    if (!species) {
      throw new NotFoundException("Species not found");
    }
    const breed = await this.breedsRepo.findOne({
      where: { id: body.breedId, species: { id: body.speciesId } }
    });
    if (!breed) {
      throw new NotFoundException("Breed not found for this species");
    }

    const row = this.lifestyleRepo.create({
      title: body.title,
      description: body.description,
      species,
      breed,
      type: body.type,
      applicableMinAgeDays: body.applicableMinAgeDays ?? null,
      applicableMaxAgeDays: body.applicableMaxAgeDays ?? null
    });
    const saved = await this.lifestyleRepo.save(row);
    await this.auditLog.record(
      actor,
      "lifestyle_rule.created",
      "lifestyle_rule",
      saved.id,
      { title: saved.title, type: saved.type }
    );
    return { id: saved.id, title: saved.title };
  }

  @Patch("lifestyle-rules/:id")
  @ApiOperation({ summary: "Update a lifestyle rule" })
  @ApiResponse({ status: 200, description: "Rule updated" })
  @ApiResponse({ status: 404, description: "Rule not found" })
  async updateLifestyleRule(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateLifestyleRuleDto,
    @CurrentUser() actor: User
  ) {
    const rule = await this.lifestyleRepo.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException("Lifestyle rule not found");
    }

    if (body.title !== undefined) rule.title = body.title;
    if (body.description !== undefined) rule.description = body.description;
    if (body.type !== undefined) rule.type = body.type;
    if (body.applicableMinAgeDays !== undefined) {
      rule.applicableMinAgeDays = body.applicableMinAgeDays;
    }
    if (body.applicableMaxAgeDays !== undefined) {
      rule.applicableMaxAgeDays = body.applicableMaxAgeDays;
    }

    const saved = await this.lifestyleRepo.save(rule);
    await this.auditLog.record(
      actor,
      "lifestyle_rule.updated",
      "lifestyle_rule",
      id,
      { title: saved.title, changes: body as unknown as Record<string, unknown> }
    );
    return { id: saved.id, title: saved.title };
  }

  @Delete("lifestyle-rules/:id")
  @HttpCode(200)
  @ApiOperation({ summary: "Delete a lifestyle rule" })
  @ApiResponse({ status: 200, description: "Rule deleted" })
  @ApiResponse({ status: 404, description: "Rule not found" })
  async deleteLifestyleRule(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() actor: User
  ) {
    const res = await this.lifestyleRepo.delete({ id });
    if (!res.affected) {
      throw new NotFoundException("Lifestyle rule not found");
    }
    await this.auditLog.record(actor, "lifestyle_rule.deleted", "lifestyle_rule", id);
    return { success: true };
  }
}
