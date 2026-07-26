import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";

import type { AiReportContent } from "../../domain/pet-ai-report.entity";
import { PetOrmEntity } from "./pet.orm-entity";

@Entity("pet_ai_reports")
@Index(["pet", "generatedAt"])
export class PetAiReportOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => PetOrmEntity, (pet) => pet.aiReports, {
    onDelete: "CASCADE"
  })
  pet!: PetOrmEntity;

  @Column({ type: "smallint" })
  awarenessScore!: number;

  @Column({ type: "varchar", length: 300 })
  headline!: string;

  @Column({ type: "jsonb" })
  content!: AiReportContent;

  @Column({ type: "varchar", nullable: true })
  model!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  generatedAt!: Date;
}
