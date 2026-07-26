import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";

import { PetOrmEntity } from "../../../pets/infrastructure/typeorm/pet.orm-entity";
import { AuthProvider, UserRole } from "../../domain/user.entity";

@Entity("users")
export class UserOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", unique: true })
  email!: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar", nullable: true })
  passwordHash!: string | null;

  @Column({ type: "varchar", default: "email" })
  provider!: AuthProvider;

  @Column({ type: "varchar", nullable: true, unique: true })
  googleId!: string | null;

  /** Backoffice access level; regular product users are always "user". */
  @Column({ type: "varchar", default: "user" })
  role!: UserRole;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @OneToMany(() => PetOrmEntity, (pet) => pet.owner)
  pets!: PetOrmEntity[];
}
