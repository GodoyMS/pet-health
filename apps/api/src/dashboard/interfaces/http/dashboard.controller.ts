import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiCookieAuth,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";

import { AuthGuard } from "../../../auth/interfaces/http/auth.guard";
import { CurrentUser } from "../../../auth/interfaces/http/current-user.decorator";
import { User } from "../../../users/domain/user.entity";
import { DashboardService } from "../../application/dashboard.service";

class PreventiveCareSummaryDto {
  @ApiProperty()
  total!: number;
  @ApiProperty()
  completed!: number;
  @ApiProperty()
  pending!: number;
  @ApiProperty()
  overdue!: number;
}

class DashboardSummaryDto {
  @ApiProperty()
  petCount!: number;
  @ApiProperty()
  totalHealthLogs!: number;
  @ApiProperty()
  overduePreventiveItems!: number;
  @ApiProperty()
  upcomingPreventiveItems!: number;
  @ApiProperty({ nullable: true })
  averageAwarenessScore!: number | null;
  @ApiProperty()
  bestLoggingStreakDays!: number;
  @ApiProperty()
  logsThisWeek!: number;
}

class DashboardPetCardDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  speciesName!: string;
  @ApiProperty({ nullable: true })
  speciesImageUrl!: string | null;
  @ApiProperty({ nullable: true })
  breedName!: string | null;
  @ApiProperty({ nullable: true })
  awarenessScore!: number | null;
  @ApiProperty({ nullable: true })
  weightKg!: number | null;
  @ApiProperty({ type: PreventiveCareSummaryDto })
  preventiveCare!: PreventiveCareSummaryDto;
  @ApiProperty({ nullable: true })
  lastHealthLogDate!: string | null;
  @ApiProperty()
  loggingStreakDays!: number;
  @ApiProperty({ nullable: true })
  nextDueDate!: string | null;
  @ApiProperty({ nullable: true })
  nextDueTitle!: string | null;
}

class DashboardAlertDto {
  @ApiProperty({ enum: ["overdue_preventive", "missing_logs", "upcoming_due"] })
  type!: string;
  @ApiProperty()
  petId!: string;
  @ApiProperty()
  petName!: string;
  @ApiProperty()
  message!: string;
  @ApiProperty({ enum: ["high", "medium", "low"] })
  severity!: string;
  @ApiProperty()
  actionPath!: string;
}

class DashboardActivityDto {
  @ApiProperty({ enum: ["health_log", "preventive_completed", "ai_report"] })
  type!: string;
  @ApiProperty()
  petId!: string;
  @ApiProperty()
  petName!: string;
  @ApiProperty()
  date!: string;
  @ApiProperty()
  description!: string;
}

class DashboardDataDto {
  @ApiProperty({ type: DashboardSummaryDto })
  summary!: DashboardSummaryDto;
  @ApiProperty({ type: [DashboardPetCardDto] })
  pets!: DashboardPetCardDto[];
  @ApiProperty({ type: [DashboardAlertDto] })
  alerts!: DashboardAlertDto[];
  @ApiProperty({ type: [DashboardActivityDto] })
  recentActivity!: DashboardActivityDto[];
}

@ApiTags("dashboard")
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "Get aggregated dashboard data for the current user" })
  @ApiResponse({ status: 200, description: "Dashboard summary", type: DashboardDataDto })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async get(@CurrentUser() user: User) {
    return this.dashboard.getForUser(user.id);
  }
}
