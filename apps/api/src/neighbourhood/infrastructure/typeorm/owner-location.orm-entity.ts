import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn
} from "typeorm";

import { UserOrmEntity } from "../../../users/infrastructure/typeorm/user.orm-entity";

/**
 * The owner's own position on the neighbourhood map. Acts as the anchor that
 * every `inherited` pet location follows.
 */
@Entity("owner_locations")
export class OwnerLocationOrmEntity {
  @PrimaryColumn({ type: "uuid" })
  userId!: string;

  @OneToOne(() => UserOrmEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: UserOrmEntity;

  @Column({ type: "double precision" })
  lat!: number;

  @Column({ type: "double precision" })
  lng!: number;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
