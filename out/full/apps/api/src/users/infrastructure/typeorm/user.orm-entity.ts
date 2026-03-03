import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { PetOrmEntity } from "../../../pets/infrastructure/typeorm/pet.orm-entity";

@Entity("users")
export class UserOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column()
  passwordHash!: string;

  @OneToMany(() => PetOrmEntity, (pet) => pet.owner)
  pets!: PetOrmEntity[];
}

