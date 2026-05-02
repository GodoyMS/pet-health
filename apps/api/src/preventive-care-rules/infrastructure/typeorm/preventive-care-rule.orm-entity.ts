import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

import { SpeciesOrmEntity } from "../../../species/infrastructure/typeorm/species.orm-entity";
import { PreventiveCareRuleType } from "../../domain/preventive-care-rule-type.enum";

@Entity("preventive_care_rules")
export class PreventiveCareRuleOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @ManyToOne(() => SpeciesOrmEntity, (species) => species.preventiveCareRules, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "speciesId" })
  species!: SpeciesOrmEntity;

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
