import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

import { AuthChallengePurpose } from "../../domain/otp-policy";

@Entity("auth_challenges")
export class AuthChallengeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "varchar" })
  email!: string;

  @Column({ type: "varchar" })
  purpose!: AuthChallengePurpose;

  @Column({ type: "varchar" })
  codeHash!: string;

  @Column({ type: "timestamptz" })
  expiresAt!: Date;

  @Column({ type: "int", default: 0 })
  attempts!: number;

  @Column({ type: "timestamptz", nullable: true })
  consumedAt!: Date | null;

  @Column({ type: "timestamptz" })
  lastSentAt!: Date;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
