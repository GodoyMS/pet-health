import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { PreventiveCareRuleOrmEntity } from "../../../preventive-care-rules/infrastructure/typeorm/preventive-care-rule.orm-entity";
import { PetOrmEntity } from "../../../pets/infrastructure/typeorm/pet.orm-entity";
import { BreedOrmEntity } from "./breed.orm-entity";

@Entity("species")
export class SpeciesOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ type: "varchar", unique: true, nullable: true })
  slug!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", nullable: true })
  imageUrl!: string | null;

  @Column({ type: "int", nullable: true })
  order!: number | null;

  @OneToMany(() => BreedOrmEntity, (breed) => breed.species)
  breeds!: BreedOrmEntity[];

  @OneToMany(() => PetOrmEntity, (pet) => pet.species)
  pets!: PetOrmEntity[];

  @OneToMany(
    () => PreventiveCareRuleOrmEntity,
    (rule) => rule.species
  )
  preventiveCareRules!: PreventiveCareRuleOrmEntity[];
}
