import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn
} from "typeorm";

import { PetOrmEntity } from "../../../pets/infrastructure/typeorm/pet.orm-entity";
import type { LocationSource } from "../../domain/pet-location.entity";

/**
 * One row per pet that has ever been placed on the map. The composite
 * `(lat, lng)` index backs the bounding-box prefilter used by nearby search.
 */
@Entity("pet_locations")
@Index("idx_pet_locations_lat_lng", ["lat", "lng"])
export class PetLocationOrmEntity {
  @PrimaryColumn({ type: "uuid" })
  petId!: string;

  @OneToOne(() => PetOrmEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "petId" })
  pet!: PetOrmEntity;

  @Column({ type: "double precision" })
  lat!: number;

  @Column({ type: "double precision" })
  lng!: number;

  @Column({ type: "varchar", default: "inherited" })
  source!: LocationSource;

  /** Opt-out switch: false hides this pet from other owners' neighbourhoods. */
  @Column({ type: "boolean", default: true })
  isDiscoverable!: boolean;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
