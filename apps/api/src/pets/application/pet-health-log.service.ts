import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import type { HealthRating } from "../domain/pet-health-log.entity";
import { PetHealthLogOrmEntity } from "../infrastructure/typeorm/pet-health-log.orm-entity";
import { PetOrmEntity } from "../infrastructure/typeorm/pet.orm-entity";

export interface HealthLogItem {
  id: string;
  date: string;
  weightKg: number;
  appetite: HealthRating;
  energy: HealthRating;
  mood: HealthRating;
  notes: string;
}

export interface HealthLogKpis {
  appetite: number | null;
  energy: number | null;
  mood: number | null;
  logCount: number;
}

export interface PaginatedHealthLogs {
  petId: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  kpis: HealthLogKpis;
  items: HealthLogItem[];
}

export interface ListHealthLogsQuery {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface CreateHealthLogInput {
  date: string;
  weightKg: number;
  appetite: HealthRating;
  energy: HealthRating;
  mood: HealthRating;
  notes?: string;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function toHealthRating(value: number): HealthRating {
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new BadRequestException("Ratings must be integers between 1 and 5");
  }
  return value as HealthRating;
}

function toHealthLogItem(entity: PetHealthLogOrmEntity): HealthLogItem {
  return {
    id: entity.id,
    date: entity.logDate,
    weightKg: entity.weightKg,
    appetite: toHealthRating(entity.appetite),
    energy: toHealthRating(entity.energy),
    mood: toHealthRating(entity.mood),
    notes: entity.notes ?? ""
  };
}

@Injectable()
export class PetHealthLogService {
  constructor(
    @InjectRepository(PetHealthLogOrmEntity)
    private readonly logsRepo: Repository<PetHealthLogOrmEntity>,
    @InjectRepository(PetOrmEntity)
    private readonly petsRepo: Repository<PetOrmEntity>
  ) {}

  private async assertPetOwnedByUser(
    userId: string,
    petId: string
  ): Promise<PetOrmEntity> {
    const pet = await this.petsRepo.findOne({
      where: { id: petId, owner: { id: userId } }
    });
    if (!pet) {
      throw new NotFoundException("Pet not found");
    }
    return pet;
  }

  private buildFilteredQuery(
    petId: string,
    startDate?: string,
    endDate?: string
  ) {
    const qb = this.logsRepo
      .createQueryBuilder("log")
      .innerJoin("log.pet", "pet")
      .where("pet.id = :petId", { petId });

    if (startDate) {
      qb.andWhere("log.logDate >= :startDate", { startDate });
    }
    if (endDate) {
      qb.andWhere("log.logDate <= :endDate", { endDate });
    }

    return qb;
  }

  async listForUser(
    userId: string,
    petId: string,
    query: ListHealthLogsQuery = {}
  ): Promise<PaginatedHealthLogs> {
    await this.assertPetOwnedByUser(userId, petId);

    const page = Math.max(query.page ?? DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(query.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
    const { startDate, endDate } = query;

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException("startDate must be on or before endDate");
    }

    const filteredQb = this.buildFilteredQuery(petId, startDate, endDate);

    const total = await filteredQb.clone().getCount();

    const pageRows = await filteredQb
      .clone()
      .orderBy("log.logDate", "DESC")
      .addOrderBy("log.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const kpiResult = await this.buildFilteredQuery(petId, startDate, endDate)
      .select("AVG(log.appetite)", "appetite")
      .addSelect("AVG(log.energy)", "energy")
      .addSelect("AVG(log.mood)", "mood")
      .addSelect("COUNT(log.id)", "logCount")
      .getRawOne<{
        appetite: string | null;
        energy: string | null;
        mood: string | null;
        logCount: string;
      }>();

    const logCount = Number(kpiResult?.logCount ?? 0);

    const roundAvg = (value: string | null | undefined): number | null => {
      if (value === null || value === undefined) return null;
      const n = Number(value);
      if (Number.isNaN(n)) return null;
      return Math.round(n * 10) / 10;
    };

    return {
      petId,
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      kpis: {
        appetite: logCount > 0 ? roundAvg(kpiResult?.appetite) : null,
        energy: logCount > 0 ? roundAvg(kpiResult?.energy) : null,
        mood: logCount > 0 ? roundAvg(kpiResult?.mood) : null,
        logCount
      },
      items: pageRows.map(toHealthLogItem)
    };
  }

  async createForUser(
    userId: string,
    petId: string,
    input: CreateHealthLogInput
  ): Promise<HealthLogItem> {
    const pet = await this.assertPetOwnedByUser(userId, petId);

    const entity = this.logsRepo.create({
      pet,
      logDate: input.date,
      weightKg: input.weightKg,
      appetite: input.appetite,
      energy: input.energy,
      mood: input.mood,
      notes: input.notes?.trim() || null
    });

    const saved = await this.logsRepo.save(entity);
    return toHealthLogItem(saved);
  }
}
