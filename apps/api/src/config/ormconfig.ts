import { DataSourceOptions } from "typeorm";

import { UserOrmEntity } from "../users/infrastructure/typeorm/user.orm-entity";
import { AuthChallengeOrmEntity } from "../auth/infrastructure/typeorm/auth-challenge.orm-entity";
import { PetOrmEntity } from "../pets/infrastructure/typeorm/pet.orm-entity";
import { BreedOrmEntity } from "../species/infrastructure/typeorm/breed.orm-entity";
import { SpeciesOrmEntity } from "../species/infrastructure/typeorm/species.orm-entity";
import { LifestyleRuleOrmEntity } from "../lifestyle-rules/infrastructure/typeorm/lifestyle-rule.orm-entity";
import { PreventiveCareRuleOrmEntity } from "../preventive-care-rules/infrastructure/typeorm/preventive-care-rule.orm-entity";
import { PetHealthLogOrmEntity } from "../pets/infrastructure/typeorm/pet-health-log.orm-entity";
import { PreventiveCarePetItemOrmEntity } from "../pets/infrastructure/typeorm/preventive-care-pet-item.orm-entity";
import { PetAiReportOrmEntity } from "../pets/infrastructure/typeorm/pet-ai-report.orm-entity";
import { GoogleCalendarTokenOrmEntity } from "../google-calendar/infrastructure/typeorm/google-calendar-token.orm-entity";
import { GoogleCalendarSyncOrmEntity } from "../google-calendar/infrastructure/typeorm/google-calendar-sync.orm-entity";
import { AuditLogOrmEntity } from "../admin/infrastructure/typeorm/audit-log.orm-entity";
import { OwnerLocationOrmEntity } from "../neighbourhood/infrastructure/typeorm/owner-location.orm-entity";
import { PetLocationOrmEntity } from "../neighbourhood/infrastructure/typeorm/pet-location.orm-entity";
import { PetFriendshipOrmEntity } from "../neighbourhood/infrastructure/typeorm/pet-friendship.orm-entity";
import { configEnvs } from "./configEnvs";

export const ormConfig: DataSourceOptions = {
  url: configEnvs.DATABASE_URL,
  type: "postgres",
  entities: [
    UserOrmEntity,
    AuthChallengeOrmEntity,
    SpeciesOrmEntity,
    BreedOrmEntity,
    PetOrmEntity,
    PreventiveCareRuleOrmEntity,
    LifestyleRuleOrmEntity,
    PetHealthLogOrmEntity,
    PreventiveCarePetItemOrmEntity,
    PetAiReportOrmEntity,
    GoogleCalendarTokenOrmEntity,
    GoogleCalendarSyncOrmEntity,
    AuditLogOrmEntity,
    OwnerLocationOrmEntity,
    PetLocationOrmEntity,
    PetFriendshipOrmEntity
  ],
  synchronize: true
};

