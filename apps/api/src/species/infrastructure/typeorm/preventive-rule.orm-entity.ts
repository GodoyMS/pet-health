import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SpeciesOrmEntity } from './species.orm-entity';

@Entity('preventive_rules')
export class PreventiveRuleOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column()
  type!: string;

  @Column({ type: 'int', nullable: true })
  applicableMinAge!: number | null;

  @Column({ type: 'int', nullable: true })
  applicableMaxAge!: number | null;

  @ManyToOne(
    () => SpeciesOrmEntity,
    (species) => species.preventiveRules,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'species_id' })
  species!: SpeciesOrmEntity;

  @Column({ name: 'species_id' })
  speciesId!: string;
}