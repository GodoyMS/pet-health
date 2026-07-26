import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength
} from "class-validator";

import { PetsService } from "../../application/pets.service";
import { PetPreventiveCareItemService } from "../../application/pet-preventive-care-item.service";
import { PetLifestyleGuidanceService } from "../../application/pet-lifestyle-guidance.service";
import { PetHealthLogService } from "../../application/pet-health-log.service";
import { PetAiReportService } from "../../application/pet-ai-report.service";
import { PetAnalyticsService } from "../../application/pet-analytics.service";
import { AuthGuard } from "../../../auth/interfaces/http/auth.guard";
import { CurrentUser } from "../../../auth/interfaces/http/current-user.decorator";
import { User } from "../../../users/domain/user.entity";

class SpeciesSummaryDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty({ nullable: true })
  imageUrl!: string | null;
}

class BreedSummaryDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty({ nullable: true, description: "Typical breed lifespan in years (reference)" })
  expectedLifespanYears!: number | null;
}

class PetWithSpeciesDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  ownerId!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty({ type: SpeciesSummaryDto })
  species!: SpeciesSummaryDto;
  @ApiProperty({ type: BreedSummaryDto })
  breed!: BreedSummaryDto;
  @ApiProperty({ example: "2020-05-15" })
  birthDate!: string;
  @ApiProperty({ nullable: true, example: 8.4, description: "Body mass in kilograms" })
  weightKg!: number | null;
  @ApiProperty({ nullable: true })
  expectedLifeSpanYears!: number | null;
  @ApiProperty({
    nullable: true,
    minimum: 0,
    maximum: 100,
    description: "Latest AI wellness awareness score (0–100)"
  })
  awarenessScore!: number | null;
}

class CreatePetDto {
  @ApiProperty({ example: "Buddy" })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000", description: "UUID of the species" })
  @IsUUID("4")
  speciesId!: string;

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440001", description: "UUID of the breed (must belong to speciesId)" })
  @IsUUID("4")
  breedId!: string;

  @ApiProperty({ example: "2020-05-15", description: "ISO 8601 date (YYYY-MM-DD)" })
  @IsISO8601({ strict: true }, { message: "birthDate must be a valid ISO 8601 date (YYYY-MM-DD)" })
  birthDate!: string;

  @ApiProperty({ example: 8.4, description: "Body mass in kilograms" })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999)
  weightKg!: number;

  @ApiPropertyOptional({ example: 12, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  expectedLifeSpanYears?: number | null;
}

class UpdatePetDto extends CreatePetDto {}

class PreventiveCareScheduleItemDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  ruleId!: string;
  @ApiProperty()
  title!: string;
  @ApiProperty({ example: "2026-03-15" })
  dueDate!: string;
  @ApiProperty()
  type!: string;
  @ApiProperty({ nullable: true, example: "2026-03-15T14:00:00.000Z" })
  completedAt!: string | null;
}

class PreventiveCareScheduleGroupDto {
  @ApiProperty({ enum: ["vaccination", "deworming", "checklist"] })
  key!: string;
  @ApiProperty()
  title!: string;
  @ApiProperty()
  subtitle!: string;
  @ApiProperty()
  icon!: string;
  @ApiProperty({ type: [PreventiveCareScheduleItemDto] })
  items!: PreventiveCareScheduleItemDto[];
}

class PetPreventiveCareScheduleDto {
  @ApiProperty()
  petId!: string;
  @ApiProperty()
  speciesName!: string;
  @ApiProperty({ nullable: true })
  breedName!: string | null;
  @ApiProperty({ example: 2026 })
  year!: number;
  @ApiProperty({ type: [PreventiveCareScheduleGroupDto] })
  groups!: PreventiveCareScheduleGroupDto[];
}

class ListPreventiveCareQueryDto {
  @ApiPropertyOptional({ example: 2026, minimum: 2000, maximum: 2100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;
}

class LifestyleGuidanceItemDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  title!: string;
  @ApiProperty()
  description!: string;
  @ApiProperty({ nullable: true, description: "Minimum age in whole days from birth" })
  applicableMinAgeDays!: number | null;
  @ApiProperty({ nullable: true, description: "Maximum age in whole days from birth" })
  applicableMaxAgeDays!: number | null;
  @ApiProperty({ example: "Valid from birth to about 4 months of age" })
  validForLabel!: string;
}

class LifestyleTabDto {
  @ApiProperty({ enum: ["exercise", "feeding_awareness", "food_safety"] })
  key!: string;
  @ApiProperty()
  title!: string;
  @ApiProperty()
  icon!: string;
  @ApiProperty({ type: [LifestyleGuidanceItemDto] })
  items!: LifestyleGuidanceItemDto[];
}

class PetLifestyleGuidanceDto {
  @ApiProperty()
  petId!: string;
  @ApiProperty()
  speciesName!: string;
  @ApiProperty({ nullable: true })
  breedName!: string | null;
  @ApiProperty({ example: 30, description: "Pet age in whole days; used to filter tips" })
  petAgeDays!: number;
  @ApiProperty({ example: "30 days old" })
  petAgeLabel!: string;
  @ApiProperty({ type: [LifestyleTabDto] })
  tabs!: LifestyleTabDto[];
}

class ListHealthLogsQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 50, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({ example: "2026-01-01" })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: "startDate must be YYYY-MM-DD" })
  startDate?: string;

  @ApiPropertyOptional({ example: "2026-05-31" })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: "endDate must be YYYY-MM-DD" })
  endDate?: string;
}

class HealthLogKpisDto {
  @ApiProperty({ nullable: true, example: 4.2 })
  appetite!: number | null;
  @ApiProperty({ nullable: true, example: 3.8 })
  energy!: number | null;
  @ApiProperty({ nullable: true, example: 4.5 })
  mood!: number | null;
  @ApiProperty({ example: 12 })
  logCount!: number;
}

class HealthLogItemDto {
  @ApiProperty()
  id!: string;
  @ApiProperty({ example: "2026-05-12" })
  date!: string;
  @ApiProperty({ example: 11.2 })
  weightKg!: number;
  @ApiProperty({ minimum: 1, maximum: 5 })
  appetite!: number;
  @ApiProperty({ minimum: 1, maximum: 5 })
  energy!: number;
  @ApiProperty({ minimum: 1, maximum: 5 })
  mood!: number;
  @ApiProperty()
  notes!: string;
}

class PaginatedHealthLogsDto {
  @ApiProperty()
  petId!: string;
  @ApiProperty()
  page!: number;
  @ApiProperty()
  limit!: number;
  @ApiProperty()
  total!: number;
  @ApiProperty()
  totalPages!: number;
  @ApiProperty({ type: HealthLogKpisDto })
  kpis!: HealthLogKpisDto;
  @ApiProperty({ type: [HealthLogItemDto] })
  items!: HealthLogItemDto[];
}

class CreateHealthLogDto {
  @ApiProperty({ example: "2026-05-12" })
  @IsISO8601({ strict: true }, { message: "date must be YYYY-MM-DD" })
  date!: string;

  @ApiProperty({ example: 11.2 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999)
  weightKg!: number;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  appetite!: number;

  @ApiProperty({ example: 3, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  energy!: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  mood!: number;

  @ApiPropertyOptional({ example: "Playful after walk." })
  @IsOptional()
  @IsString()
  notes?: string;
}

class AiReportRecommendationDto {
  @ApiProperty()
  title!: string;
  @ApiProperty()
  description!: string;
  @ApiProperty({ enum: ["high", "medium", "low"] })
  priority!: string;
}

class AiReportContentDto {
  @ApiProperty()
  executiveSummary!: string;
  @ApiProperty()
  healthAnalysis!: string;
  @ApiProperty()
  healthTrends!: string;
  @ApiProperty()
  preventiveCareAnalysis!: string;
  @ApiProperty()
  lifestyleInsights!: string;
  @ApiProperty()
  predictions!: string;
  @ApiProperty({ type: [AiReportRecommendationDto] })
  recommendations!: AiReportRecommendationDto[];
  @ApiProperty({ type: [String] })
  actionSteps!: string[];
  @ApiProperty({ type: [String] })
  nutritionRecommendations!: string[];
  @ApiProperty({ type: [String] })
  activityRecommendations!: string[];
  @ApiProperty({ type: [String] })
  riskFactors!: string[];
  @ApiProperty()
  disclaimer!: string;
}

class PetAiReportSummaryDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  petId!: string;
  @ApiProperty({ minimum: 0, maximum: 100 })
  awarenessScore!: number;
  @ApiProperty()
  headline!: string;
  @ApiProperty()
  generatedAt!: string;
}

class PetAiReportDto extends PetAiReportSummaryDto {
  @ApiProperty({ type: AiReportContentDto })
  content!: AiReportContentDto;
  @ApiProperty({ nullable: true })
  model!: string | null;
}

class WeightTrendPointDto {
  @ApiProperty()
  label!: string;
  @ApiProperty()
  date!: string;
  @ApiProperty()
  kg!: number;
}

class WellnessDayPointDto {
  @ApiProperty()
  date!: string;
  @ApiProperty()
  short!: string;
  @ApiProperty()
  energy!: number;
  @ApiProperty()
  mood!: number;
}

class LoggingWeekDayDto {
  @ApiProperty()
  date!: string;
  @ApiProperty()
  short!: string;
  @ApiProperty()
  logged!: boolean;
  @ApiProperty()
  isToday!: boolean;
}

class LoggingWeekBarDto {
  @ApiProperty()
  label!: string;
  @ApiProperty()
  loggedDays!: number;
}

class LoggingConsistencyDto {
  @ApiProperty()
  streakDays!: number;
  @ApiProperty()
  weekCompletion!: number;
  @ApiProperty()
  totalLogsLast30Days!: number;
  @ApiProperty({ nullable: true })
  lastLogDate!: string | null;
  @ApiProperty({ nullable: true })
  daysSinceLastLog!: number | null;
  @ApiProperty({ type: [LoggingWeekDayDto] })
  currentWeekDays!: LoggingWeekDayDto[];
  @ApiProperty({ type: [LoggingWeekBarDto] })
  recentWeeks!: LoggingWeekBarDto[];
  @ApiProperty()
  headline!: string;
  @ApiProperty()
  subline!: string;
  @ApiProperty()
  tip!: string;
}

class PetAnalyticsKpisDto {
  @ApiProperty({ nullable: true })
  appetite!: number | null;
  @ApiProperty({ nullable: true })
  energy!: number | null;
  @ApiProperty({ nullable: true })
  mood!: number | null;
  @ApiProperty()
  logCount!: number;
}

class PetAnalyticsDto {
  @ApiProperty()
  petId!: string;
  @ApiProperty({ type: [WeightTrendPointDto] })
  weightTrend!: WeightTrendPointDto[];
  @ApiProperty({ type: [WellnessDayPointDto] })
  wellnessWeek!: WellnessDayPointDto[];
  @ApiProperty({ type: LoggingConsistencyDto })
  loggingConsistency!: LoggingConsistencyDto;
  @ApiProperty({ type: PetAnalyticsKpisDto })
  kpis!: PetAnalyticsKpisDto;
}

@ApiTags("pets")
@Controller("pets")
export class PetsController {
  constructor(
    private readonly petsService: PetsService,
    private readonly preventiveCareItems: PetPreventiveCareItemService,
    private readonly lifestyleGuidance: PetLifestyleGuidanceService,
    private readonly healthLogs: PetHealthLogService,
    private readonly aiReports: PetAiReportService,
    private readonly analytics: PetAnalyticsService
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "List all pets for the current user" })
  @ApiResponse({ status: 200, description: "List of pets with species", type: [PetWithSpeciesDto] })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async list(@CurrentUser() user: User) {
    return this.petsService.listForUser(user.id);
  }

  @Get("preventive-care/calendar")
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "Get all pending preventive care items for all pets (calendar view)" })
  @ApiResponse({ status: 200, description: "Flat list of items with pet info, filtered by year" })
  async getAllPreventiveCareCalendar(
    @CurrentUser() user: User,
    @Query() query: ListPreventiveCareQueryDto
  ) {
    const year = query.year ?? new Date().getFullYear();
    const items = await this.preventiveCareItems.getAllItemsForUserCalendar(user.id, year);
    return { year, items };
  }

  @Get(":id/preventive-care")
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "Get preventive care schedule for a pet" })
  @ApiParam({ name: "id", description: "Pet UUID" })
  @ApiResponse({
    status: 200,
    description: "Grouped preventive care items with due dates",
    type: PetPreventiveCareScheduleDto
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pet not found" })
  async getPreventiveCare(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Query() query: ListPreventiveCareQueryDto
  ) {
    const year = query.year ?? new Date().getFullYear();
    return this.preventiveCareItems.getScheduleForUser(user.id, id, year);
  }

  @Patch(":id/preventive-care/items/:itemId/toggle")
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "Toggle completion of a preventive care item" })
  @ApiParam({ name: "id", description: "Pet UUID" })
  @ApiParam({ name: "itemId", description: "Preventive care pet item UUID" })
  @ApiResponse({
    status: 200,
    description: "Updated item with completion state",
    type: PreventiveCareScheduleItemDto
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pet or item not found" })
  async togglePreventiveCareItem(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Param("itemId") itemId: string
  ) {
    return this.preventiveCareItems.toggleItemCompletion(user.id, id, itemId);
  }

  @Get(":id/lifestyle")
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "Get lifestyle guidance for a pet" })
  @ApiParam({ name: "id", description: "Pet UUID" })
  @ApiResponse({
    status: 200,
    description: "Exercise, feeding awareness, and food safety tips",
    type: PetLifestyleGuidanceDto
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pet not found" })
  async getLifestyle(@CurrentUser() user: User, @Param("id") id: string) {
    return this.lifestyleGuidance.getGuidanceForUser(user.id, id);
  }

  @Get(":id/health-logs")
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "List health logs for a pet with pagination and KPIs" })
  @ApiParam({ name: "id", description: "Pet UUID" })
  @ApiResponse({
    status: 200,
    description: "Paginated health log history with average KPIs for the filtered range",
    type: PaginatedHealthLogsDto
  })
  @ApiResponse({ status: 400, description: "Invalid query parameters" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pet not found" })
  async listHealthLogs(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Query() query: ListHealthLogsQueryDto
  ) {
    return this.healthLogs.listForUser(user.id, id, query);
  }

  @Post(":id/health-logs")
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "Create a health log entry for a pet" })
  @ApiParam({ name: "id", description: "Pet UUID" })
  @ApiBody({ type: CreateHealthLogDto })
  @ApiResponse({ status: 201, description: "Health log created", type: HealthLogItemDto })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pet not found" })
  async createHealthLog(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Body() body: CreateHealthLogDto
  ) {
    return this.healthLogs.createForUser(user.id, id, {
      date: body.date,
      weightKg: body.weightKg,
      appetite: body.appetite as 1 | 2 | 3 | 4 | 5,
      energy: body.energy as 1 | 2 | 3 | 4 | 5,
      mood: body.mood as 1 | 2 | 3 | 4 | 5,
      notes: body.notes
    });
  }

  @Get(":id/analytics")
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "Get analytics charts and KPIs for a pet" })
  @ApiParam({ name: "id", description: "Pet UUID" })
  @ApiResponse({
    status: 200,
    description: "Weight trend, wellness scores, and logging consistency",
    type: PetAnalyticsDto
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pet not found" })
  async getAnalytics(@CurrentUser() user: User, @Param("id") id: string) {
    return this.analytics.getForUser(user.id, id);
  }

  @Get(":id/ai-reports")
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "List AI wellness reports for a pet" })
  @ApiParam({ name: "id", description: "Pet UUID" })
  @ApiResponse({
    status: 200,
    description: "Reports ordered by generation date (newest first)",
    type: [PetAiReportSummaryDto]
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pet not found" })
  async listAiReports(@CurrentUser() user: User, @Param("id") id: string) {
    return this.aiReports.listForUser(user.id, id);
  }

  @Post(":id/ai-reports/generate")
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "Generate a new AI wellness report for a pet" })
  @ApiParam({ name: "id", description: "Pet UUID" })
  @ApiResponse({
    status: 201,
    description: "Report generated; pet awarenessScore updated",
    type: PetAiReportDto
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pet not found" })
  @ApiResponse({ status: 503, description: "AI service unavailable" })
  async generateAiReport(@CurrentUser() user: User, @Param("id") id: string) {
    return this.aiReports.generateForUser(user.id, id);
  }

  @Get(":id/ai-reports/:reportId")
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "Get a single AI wellness report" })
  @ApiParam({ name: "id", description: "Pet UUID" })
  @ApiParam({ name: "reportId", description: "Report UUID" })
  @ApiResponse({ status: 200, description: "Full report", type: PetAiReportDto })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pet or report not found" })
  async getAiReport(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Param("reportId") reportId: string
  ) {
    return this.aiReports.getForUser(user.id, id, reportId);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "Get a pet by ID" })
  @ApiParam({ name: "id", description: "Pet UUID" })
  @ApiResponse({ status: 200, description: "Pet with species", type: PetWithSpeciesDto })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pet not found" })
  async get(@CurrentUser() user: User, @Param("id") id: string) {
    return this.petsService.getForUser(user.id, id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "Create a new pet" })
  @ApiBody({ type: CreatePetDto })
  @ApiResponse({ status: 201, description: "Pet created", type: PetWithSpeciesDto })
  @ApiResponse({ status: 400, description: "Validation error or species not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async create(@CurrentUser() user: User, @Body() body: CreatePetDto) {
    return this.petsService.createForUser(user.id, {
      name: body.name,
      speciesId: body.speciesId,
      breedId: body.breedId,
      birthDate: body.birthDate,
      weightKg: body.weightKg,
      expectedLifeSpanYears: body.expectedLifeSpanYears ?? null
    });
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "Update a pet" })
  @ApiParam({ name: "id", description: "Pet UUID" })
  @ApiBody({ type: UpdatePetDto })
  @ApiResponse({ status: 200, description: "Pet updated", type: PetWithSpeciesDto })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pet not found" })
  async update(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Body() body: UpdatePetDto
  ) {
    return this.petsService.updateForUser(user.id, id, {
      name: body.name,
      speciesId: body.speciesId,
      breedId: body.breedId,
      birthDate: body.birthDate,
      weightKg: body.weightKg,
      expectedLifeSpanYears: body.expectedLifeSpanYears ?? null
    });
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "Delete a pet (cannot be undone)" })
  @ApiParam({ name: "id", description: "Pet UUID" })
  @ApiResponse({ status: 204, description: "Pet deleted" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pet not found" })
  async remove(@CurrentUser() user: User, @Param("id") id: string): Promise<void> {
    await this.petsService.deleteForUser(user.id, id);
  }
}
