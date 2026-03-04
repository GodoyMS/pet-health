import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { PetOrmEntity } from "../../../pets/infrastructure/typeorm/pet.orm-entity";

@Entity("species")
export class SpeciesOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ type: "varchar", nullable: true })
  imageUrl!: string | null;

  @OneToMany(() => PetOrmEntity, (pet) => pet.species)
  pets!: PetOrmEntity[];
}
