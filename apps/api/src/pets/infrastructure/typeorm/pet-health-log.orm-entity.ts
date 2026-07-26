import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";

import { PetOrmEntity } from "./pet.orm-entity";

@Entity("pet_health_logs")
@Index(["pet", "logDate"])
export class PetHealthLogOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => PetOrmEntity, { onDelete: "CASCADE" })
  pet!: PetOrmEntity;

  @Column({ type: "date" })
  logDate!: string;

  @Column({ type: "double precision" })
  weightKg!: number;

  @Column({ type: "smallint" })
  appetite!: number;

  @Column({ type: "smallint" })
  energy!: number;

  @Column({ type: "smallint" })
  mood!: number;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
