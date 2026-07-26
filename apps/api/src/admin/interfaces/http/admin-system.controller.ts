import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { configEnvs } from "config/configEnvs";
import { AuditLogService } from "../../application/audit-log.service";
import { AdminGuard } from "./admin.guard";
import { pageOf, PaginationQueryDto } from "./dto/admin-query.dto";

const TRACKED_TABLES = [
  "users",
  "pets",
  "pet_health_logs",
  "pet_ai_reports",
  "preventive_care_pet_items",
  "preventive_care_rules",
  "lifestyle_rules",
  "species",
  "breeds",
  "google_calendar_tokens",
  "admin_audit_logs"
] as const;

@ApiTags("admin")
@ApiCookieAuth("auth_token")
@Controller("admin/system")
@UseGuards(AdminGuard)
export class AdminSystemController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditLog: AuditLogService
  ) {}

  @Get("status")
  @ApiOperation({
    summary: "Runtime health: DB connectivity, process stats, feature flags, table sizes"
  })
  @ApiResponse({ status: 200, description: "System status" })
  async status() {
    let database: { ok: boolean; latencyMs: number | null; error?: string };
    const started = Date.now();
    try {
      await this.dataSource.query("SELECT 1");
      database = { ok: true, latencyMs: Date.now() - started };
    } catch (err) {
      database = {
        ok: false,
        latencyMs: null,
        error: err instanceof Error ? err.message : String(err)
      };
    }

    const tableCounts: Record<string, number | null> = {};
    if (database.ok) {
      await Promise.all(
        TRACKED_TABLES.map(async (table) => {
          try {
            const rows = (await this.dataSource.query(
              `SELECT COUNT(*)::int AS count FROM "${table}"`
            )) as { count: number }[];
            tableCounts[table] = rows[0]?.count ?? 0;
          } catch {
            // Table may not exist yet (created lazily by synchronize).
            tableCounts[table] = null;
          }
        })
      );
    }

    const memory = process.memoryUsage();
    return {
      api: {
        uptimeSeconds: Math.round(process.uptime()),
        nodeVersion: process.version,
        environment: configEnvs.NODE_ENV ?? "unknown",
        memory: {
          rssMb: Math.round(memory.rss / 1024 / 1024),
          heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
          heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024)
        }
      },
      database,
      featureFlags: {
        googleAuth: configEnvs.isGoogleAuthEnabled,
        googleCalendar:
          configEnvs.isGoogleAuthEnabled &&
          !!configEnvs.GOOGLE_CALENDAR_CALLBACK_URL,
        nearbyPlaces: configEnvs.isNearbyPlacesEnabled,
        aiReports: !!configEnvs.DEEPSEEK_API_KEY
      },
      tableCounts,
      checkedAt: new Date().toISOString()
    };
  }

  @Get("audit-logs")
  @ApiOperation({ summary: "Backoffice action audit trail (paginated)" })
  @ApiResponse({ status: 200, description: "Paginated audit log list" })
  async auditLogs(@Query() query: PaginationQueryDto) {
    const { page, limit } = pageOf(query);
    const { items, total } = await this.auditLog.list(page, limit);
    return { items, total, page, limit };
  }
}
