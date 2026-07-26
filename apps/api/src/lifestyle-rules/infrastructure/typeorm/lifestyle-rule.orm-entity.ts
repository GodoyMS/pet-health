import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

import { BreedOrmEntity } from "../../../species/infrastructure/typeorm/breed.orm-entity";
import { SpeciesOrmEntity } from "../../../species/infrastructure/typeorm/species.orm-entity";
import { LifestyleRuleType } from "../../domain/lifestyle-rule-type.enum";

@Entity("lifestyle_rules")
export class LifestyleRuleOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 200 })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @ManyToOne(() => SpeciesOrmEntity, (species) => species.lifestyleRules, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "speciesId" })
  species!: SpeciesOrmEntity;

  @ManyToOne(() => BreedOrmEntity, (breed) => breed.lifestyleRules, {
    onDelete: "CASCADE",
    nullable: false
  })
  @JoinColumn({ name: "breedId" })
  breed!: BreedOrmEntity;

  @Column({
    type: "enum",
    enum: LifestyleRuleType,
    enumName: "lifestyle_rule_type_enum"
  })
  type!: LifestyleRuleType;

  @Column({ type: "int", nullable: true })
  applicableMinAgeDays!: number | null;

  @Column({ type: "int", nullable: true })
  applicableMaxAgeDays!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
