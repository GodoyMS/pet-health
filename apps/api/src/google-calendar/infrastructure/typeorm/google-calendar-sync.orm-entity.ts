import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique
} from "typeorm";

import { UserOrmEntity } from "../../../users/infrastructure/typeorm/user.orm-entity";
import { PreventiveCarePetItemOrmEntity } from "../../../pets/infrastructure/typeorm/preventive-care-pet-item.orm-entity";

@Entity("google_calendar_syncs")
@Unique(["user", "preventiveCareItem"])
export class GoogleCalendarSyncOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => UserOrmEntity, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "userId" })
  user!: UserOrmEntity;

  @ManyToOne(() => PreventiveCarePetItemOrmEntity, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "preventiveCareItemId" })
  preventiveCareItem!: PreventiveCarePetItemOrmEntity;

  @Column({ type: "uuid" })
  petId!: string;

  @Column({ type: "text" })
  googleEventId!: string;

  @CreateDateColumn({ type: "timestamptz" })
  syncedAt!: Date;
}
