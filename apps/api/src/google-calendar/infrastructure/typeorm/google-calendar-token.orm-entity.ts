import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

import { UserOrmEntity } from "../../../users/infrastructure/typeorm/user.orm-entity";

@Entity("google_calendar_tokens")
export class GoogleCalendarTokenOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @OneToOne(() => UserOrmEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: UserOrmEntity;

  @Column({ type: "text" })
  accessToken!: string;

  @Column({ type: "text", nullable: true })
  refreshToken!: string | null;

  @Column({ type: "timestamptz", nullable: true })
  tokenExpiry!: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
