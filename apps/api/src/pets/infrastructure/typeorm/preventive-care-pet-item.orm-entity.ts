import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";

import { PreventiveCareRuleOrmEntity } from "../../../preventive-care-rules/infrastructure/typeorm/preventive-care-rule.orm-entity";
import { PetOrmEntity } from "./pet.orm-entity";

@Entity("preventive_care_pet_items")
@Index(["pet", "preventiveCareRule", "dueDate"], { unique: true })
export class PreventiveCarePetItemOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => PetOrmEntity, (pet) => pet.preventiveCareItems, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "petId" })
  pet!: PetOrmEntity;

  @ManyToOne(() => PreventiveCareRuleOrmEntity, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "preventiveCareRuleId" })
  preventiveCareRule!: PreventiveCareRuleOrmEntity;

  @Column({ type: "date" })
  dueDate!: string;

  @Column({ type: "timestamptz", nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
