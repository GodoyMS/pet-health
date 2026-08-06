import { Controller, Get } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DataSource } from "typeorm";

/**
 * Deployment healthcheck. Public and unauthenticated so platform probes
 * (Railway `healthcheckPath`) can reach it.
 */
@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({
    summary: "Liveness + database connectivity probe",
    description:
      "Returns 200 with `database: \"up\"` when the API can reach Postgres, " +
      "and `database: \"down\"` when it cannot. The status code stays 200 so a " +
      "transient database blip does not cause the platform to kill a healthy process."
  })
  @ApiOkResponse({
    schema: {
      example: {
        status: "ok",
        database: "up",
        uptimeSeconds: 42
      }
    }
  })
  async check(): Promise<{
    status: string;
    database: "up" | "down";
    uptimeSeconds: number;
  }> {
    let database: "up" | "down" = "down";
    try {
      await this.dataSource.query("SELECT 1");
      database = "up";
    } catch {
      database = "down";
    }

    return {
      status: "ok",
      database,
      uptimeSeconds: Math.round(process.uptime())
    };
  }
}
