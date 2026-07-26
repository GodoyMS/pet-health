import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique
} from "typeorm";

import { PetOrmEntity } from "../../../pets/infrastructure/typeorm/pet.orm-entity";
import type { FriendshipStatus } from "../../domain/friendship-policy";

/**
 * One row per pet pair, doubling as the request and the friendship.
 *
 * `pairKey` is the sorted pair of pet ids with a unique constraint, so a pair
 * can never have two rows regardless of who asked whom or how many concurrent
 * requests arrive.
 */
@Entity("pet_friendships")
@Unique("uq_pet_friendships_pair", ["pairKey"])
@Index("idx_pet_friendships_addressee", ["addresseePetId", "status"])
@Index("idx_pet_friendships_requester", ["requesterPetId", "status"])
export class PetFriendshipOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  requesterPetId!: string;

  @ManyToOne(() => PetOrmEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "requesterPetId" })
  requesterPet!: PetOrmEntity;

  @Column({ type: "uuid" })
  addresseePetId!: string;

  @ManyToOne(() => PetOrmEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "addresseePetId" })
  addresseePet!: PetOrmEntity;

  /** sorted(`${petIdA}:${petIdB}`) — direction-independent pair identity. */
  @Column({ type: "varchar" })
  pairKey!: string;

  @Column({ type: "varchar", default: "pending" })
  status!: FriendshipStatus;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @Column({ type: "timestamptz", nullable: true })
  respondedAt!: Date | null;
}
