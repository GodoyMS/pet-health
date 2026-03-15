import { DataSourceOptions } from "typeorm";

import { UserOrmEntity } from "../users/infrastructure/typeorm/user.orm-entity";
import { PetOrmEntity } from "../pets/infrastructure/typeorm/pet.orm-entity";
import { SpeciesOrmEntity } from "../species/infrastructure/typeorm/species.orm-entity";
import { configEnvs } from "./configEnvs";

export const ormConfig: DataSourceOptions = {
  url: configEnvs.DATABASE_URL,
  type: "postgres",
  entities: [UserOrmEntity, SpeciesOrmEntity, PetOrmEntity],
  synchronize: true
};

