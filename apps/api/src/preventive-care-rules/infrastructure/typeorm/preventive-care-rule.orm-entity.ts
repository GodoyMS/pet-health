import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

import { BreedOrmEntity } from "../../../species/infrastructure/typeorm/breed.orm-entity";
import { SpeciesOrmEntity } from "../../../species/infrastructure/typeorm/species.orm-entity";
import { PreventiveCareRuleType } from "../../domain/preventive-care-rule-type.enum";

@Entity("preventive_care_rules")
export class PreventiveCareRuleOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 200 })
  title!: string;

  @ManyToOne(() => SpeciesOrmEntity, (species) => species.preventiveCareRules, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "speciesId" })
  species!: SpeciesOrmEntity;

  /** Every rule is scoped to a specific breed within its species. */
  @ManyToOne(() => BreedOrmEntity, (breed) => breed.preventiveCareRules, {
    onDelete: "CASCADE",
    nullable: false
  })
  @JoinColumn({ name: "breedId" })
  breed!: BreedOrmEntity;

  @Column({
    type: "enum",
    enum: PreventiveCareRuleType,
    enumName: "preventive_care_rule_type_enum"
  })
  type!: PreventiveCareRuleType;

  @Column({ type: "int", nullable: true })
  applicableMinAgeDays!: number | null;

  @Column({ type: "int", nullable: true })
  applicableMaxAgeDays!: number | null;

  @Column({ type: "int", nullable: true })
  intervalDays!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
