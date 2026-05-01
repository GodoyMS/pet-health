import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";

import { UserOrmEntity } from "../../../users/infrastructure/typeorm/user.orm-entity";
import { BreedOrmEntity } from "../../../species/infrastructure/typeorm/breed.orm-entity";
import { SpeciesOrmEntity } from "../../../species/infrastructure/typeorm/species.orm-entity";

@Entity("pets")
export class PetOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @ManyToOne(() => UserOrmEntity, (user) => user.pets, { onDelete: "CASCADE" })
  owner!: UserOrmEntity;

  @ManyToOne(() => SpeciesOrmEntity, (species) => species.pets, {
    onDelete: "RESTRICT"
  })
  species!: SpeciesOrmEntity;

  @ManyToOne(() => BreedOrmEntity, {
    onDelete: "RESTRICT",
    nullable: true
  })
  breed!: BreedOrmEntity;

  @Column({ type: "date" })
  birthDate!: string;

  @Column({ type: "int", nullable: true })
  expectedLifeSpanYears!: number | null;
}
