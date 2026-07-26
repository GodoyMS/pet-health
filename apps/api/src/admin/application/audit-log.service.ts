import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "../../users/domain/user.entity";
import { AuditLogOrmEntity } from "../infrastructure/typeorm/audit-log.orm-entity";

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AuditLogOrmEntity)
    private readonly repo: Repository<AuditLogOrmEntity>
  ) {}

  /**
   * Best-effort: an audit write failure must never break the admin action
   * itself, so errors are logged and swallowed.
   */
  async record(
    actor: User,
    action: string,
    targetType: string,
    targetId: string | null,
    details?: Record<string, unknown>
  ): Promise<void> {
    try {
      const entry = this.repo.create({
        actorUserId: actor.id,
        actorEmail: actor.email,
        action,
        targetType,
        targetId,
        details: details ?? null
      });
      await this.repo.save(entry);
    } catch (err) {
      this.logger.error(`Failed to record audit log for ${action}`, err as Error);
    }
  }

  async list(page: number, limit: number): Promise<{
    items: AuditLogOrmEntity[];
    total: number;
  }> {
    const [items, total] = await this.repo.findAndCount({
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit
    });
    return { items, total };
  }
}
