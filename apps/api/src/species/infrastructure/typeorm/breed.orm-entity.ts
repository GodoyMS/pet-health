import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";

import { SpeciesOrmEntity } from "./species.orm-entity";

@Entity("breeds")
@Index(["species", "name"], { unique: true })
export class BreedOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  name!: string;

  @ManyToOne(() => SpeciesOrmEntity, (species) => species.breeds, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "speciesId" })
  species!: SpeciesOrmEntity;
}
