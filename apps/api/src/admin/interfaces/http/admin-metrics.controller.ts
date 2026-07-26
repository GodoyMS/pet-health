import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { AdminMetricsService } from "../../application/admin-metrics.service";
import { AdminGuard } from "./admin.guard";

@ApiTags("admin")
@ApiCookieAuth("auth_token")
@Controller("admin/metrics")
@UseGuards(AdminGuard)
export class AdminMetricsController {
  constructor(private readonly metricsService: AdminMetricsService) {}

  @Get("overview")
  @ApiOperation({ summary: "Platform-wide totals, time series and distributions" })
  @ApiResponse({ status: 200, description: "Overview metrics" })
  @ApiResponse({ status: 403, description: "Admin access required" })
  getOverview() {
    return this.metricsService.getOverview();
  }
}
