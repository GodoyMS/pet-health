import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";

import { UserOrmEntity } from "../../../users/infrastructure/typeorm/user.orm-entity";
import { BreedOrmEntity } from "../../../species/infrastructure/typeorm/breed.orm-entity";
import { SpeciesOrmEntity } from "../../../species/infrastructure/typeorm/species.orm-entity";
import { PreventiveCarePetItemOrmEntity } from "./preventive-care-pet-item.orm-entity";
import { PetAiReportOrmEntity } from "./pet-ai-report.orm-entity";

@Entity("pets")
export class PetOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
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

  /** Body mass in kilograms */
  @Column({ type: "double precision", nullable: true })
  weightKg!: number | null;

  @Column({ type: "int", nullable: true })
  expectedLifeSpanYears!: number | null;

  /** Latest AI wellness awareness score (0–100), updated when a report is generated. */
  @Column({ type: "smallint", nullable: true })
  awarenessScore!: number | null;

  @OneToMany(() => PreventiveCarePetItemOrmEntity, (item) => item.pet)
  preventiveCareItems!: PreventiveCarePetItemOrmEntity[];

  @OneToMany(() => PetAiReportOrmEntity, (report) => report.pet)
  aiReports!: PetAiReportOrmEntity[];
}
