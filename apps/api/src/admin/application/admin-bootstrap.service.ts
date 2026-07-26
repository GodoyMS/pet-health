import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";

import { configEnvs } from "config/configEnvs";
import { UserOrmEntity } from "../../users/infrastructure/typeorm/user.orm-entity";

/**
 * Promotes the accounts listed in ADMIN_EMAILS to the "admin" role on boot.
 * Users must exist already (register through the product app first).
 * Never demotes anyone — removing an email from the list leaves the role as-is.
 */
@Injectable()
export class AdminBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminBootstrapService.name);

  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly usersRepo: Repository<UserOrmEntity>
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const emails = configEnvs.adminEmails;
    if (emails.length === 0) {
      return;
    }

    try {
      const users = await this.usersRepo.find({ where: { email: In(emails) } });
      const toPromote = users.filter((u) => u.role !== "admin");

      if (toPromote.length > 0) {
        await this.usersRepo.update(
          { id: In(toPromote.map((u) => u.id)) },
          { role: "admin" }
        );
        this.logger.log(
          `Promoted ${toPromote.length} user(s) to admin: ${toPromote
            .map((u) => u.email)
            .join(", ")}`
        );
      }

      const missing = emails.filter(
        (email) => !users.some((u) => u.email.toLowerCase() === email)
      );
      if (missing.length > 0) {
        this.logger.warn(
          `ADMIN_EMAILS contains account(s) that do not exist yet: ${missing.join(", ")}. Register them first, then restart the API.`
        );
      }
    } catch (err) {
      this.logger.error("Failed to bootstrap admin roles", err as Error);
    }
  }
}
