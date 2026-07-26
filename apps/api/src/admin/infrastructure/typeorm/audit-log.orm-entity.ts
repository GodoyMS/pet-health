import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

/**
 * Immutable trail of every mutating action performed through the backoffice.
 * Actor fields are denormalized so entries survive the actor's deletion.
 */
@Entity("admin_audit_logs")
@Index(["createdAt"])
export class AuditLogOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", nullable: true })
  actorUserId!: string | null;

  @Column({ type: "varchar" })
  actorEmail!: string;

  /** e.g. "user.role_updated", "pet.deleted", "preventive_care_rule.created" */
  @Column({ type: "varchar", length: 100 })
  action!: string;

  @Column({ type: "varchar", length: 50 })
  targetType!: string;

  @Column({ type: "varchar", nullable: true })
  targetId!: string | null;

  @Column({ type: "jsonb", nullable: true })
  details!: Record<string, unknown> | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
