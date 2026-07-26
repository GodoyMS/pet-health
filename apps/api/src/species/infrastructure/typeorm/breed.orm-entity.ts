import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";

import { LifestyleRuleOrmEntity } from "../../../lifestyle-rules/infrastructure/typeorm/lifestyle-rule.orm-entity";
import { PreventiveCareRuleOrmEntity } from "../../../preventive-care-rules/infrastructure/typeorm/preventive-care-rule.orm-entity";
import { SpeciesOrmEntity } from "./species.orm-entity";

@Entity("breeds")
@Index(["species", "name"], { unique: true })
export class BreedOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  name!: string;

  /** Typical lifespan in whole years (reference / educational midpoint); nullable for generic breeds. */
  @Column({ type: "int", nullable: true })
  expectedLifespanYears!: number | null;

  @ManyToOne(() => SpeciesOrmEntity, (species) => species.breeds, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "speciesId" })
  species!: SpeciesOrmEntity;

  @OneToMany(
    () => PreventiveCareRuleOrmEntity,
    (rule) => rule.breed
  )
  preventiveCareRules!: PreventiveCareRuleOrmEntity[];

  @OneToMany(() => LifestyleRuleOrmEntity, (rule) => rule.breed)
  lifestyleRules!: LifestyleRuleOrmEntity[];
}
