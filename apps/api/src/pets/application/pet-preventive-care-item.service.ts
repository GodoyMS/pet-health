import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";

import { PreventiveCareRuleType } from "../../preventive-care-rules/domain/preventive-care-rule-type.enum";
import { PreventiveCareRuleOrmEntity } from "../../preventive-care-rules/infrastructure/typeorm/preventive-care-rule.orm-entity";
import { PreventiveCarePetItemOrmEntity } from "../infrastructure/typeorm/preventive-care-pet-item.orm-entity";
import { PetOrmEntity } from "../infrastructure/typeorm/pet.orm-entity";
import { computeDueDatesInYear, yearBounds } from "./preventive-care-due-dates";

export type PreventiveCareGroupKey =
  | "vaccination"
  | "deworming"
  | "checklist";

export interface PreventiveCareScheduleItem {
  id: string;
  ruleId: string;
  title: string;
  dueDate: string;
  type: PreventiveCareRuleType;
  completedAt: string | null;
}

export interface PreventiveCareScheduleGroup {
  key: PreventiveCareGroupKey;
  title: string;
  subtitle: string;
  icon: string;
  items: PreventiveCareScheduleItem[];
}

export interface PetPreventiveCareSchedule {
  petId: string;
  speciesName: string;
  breedName: string | null;
  year: number;
  groups: PreventiveCareScheduleGroup[];
}

const GROUP_META: Record<
  PreventiveCareGroupKey,
  { title: string; subtitle: string; icon: string }
> = {
  vaccination: {
    title: "Vaccination schedule",
    subtitle: "Tap to mark as completed or not completed.",
    icon: "vaccines"
  },
  deworming: {
    title: "Deworming schedule",
    subtitle: "Tap to mark as completed or not completed.",
    icon: "medication"
  },
  checklist: {
    title: "Preventive checklist",
    subtitle: "Tap items to mark as completed or not completed.",
    icon: "assignment"
  }
};

function groupKeyForType(type: PreventiveCareRuleType): PreventiveCareGroupKey {
  if (type === PreventiveCareRuleType.Vaccination) return "vaccination";
  if (type === PreventiveCareRuleType.Deworming) return "deworming";
  return "checklist";
}

function currentCalendarYear(): number {
  return new Date().getFullYear();
}

function toIsoDateTime(date: Date): string {
  return date.toISOString();
}

@Injectable()
export class PetPreventiveCareItemService {
  constructor(
    @InjectRepository(PetOrmEntity)
    private readonly petRepo: Repository<PetOrmEntity>,
    @InjectRepository(PreventiveCareRuleOrmEntity)
    private readonly ruleRepo: Repository<PreventiveCareRuleOrmEntity>,
    @InjectRepository(PreventiveCarePetItemOrmEntity)
    private readonly itemRepo: Repository<PreventiveCarePetItemOrmEntity>
  ) {}

  /** Generates all due items for a calendar year from breed rules and birth date. */
  async generateItemsForPetYear(
    petId: string,
    year = currentCalendarYear()
  ): Promise<number> {
    const pet = await this.petRepo.findOne({
      where: { id: petId },
      relations: ["breed"]
    });
    if (!pet?.breed) {
      return 0;
    }

    const rules = await this.ruleRepo.find({
      where: { breed: { id: pet.breed.id } }
    });

    const { start, end } = yearBounds(year);
    const yearStart = start.toISOString().slice(0, 10);
    const yearEnd = end.toISOString().slice(0, 10);

    await this.itemRepo.delete({
      pet: { id: petId },
      dueDate: Between(yearStart, yearEnd)
    });

    const rows: PreventiveCarePetItemOrmEntity[] = [];
    for (const rule of rules) {
      const dueDates = computeDueDatesInYear(pet.birthDate, rule, year);
      for (const dueDate of dueDates) {
        rows.push(
          this.itemRepo.create({
            pet,
            preventiveCareRule: rule,
            dueDate,
            completedAt: null
          })
        );
      }
    }

    if (rows.length === 0) {
      return 0;
    }

    await this.itemRepo.save(rows);
    return rows.length;
  }

  async ensureItemsForYear(
    petId: string,
    year = currentCalendarYear()
  ): Promise<void> {
    const { start, end } = yearBounds(year);
    const count = await this.itemRepo.count({
      where: {
        pet: { id: petId },
        dueDate: Between(
          start.toISOString().slice(0, 10),
          end.toISOString().slice(0, 10)
        )
      }
    });
    if (count === 0) {
      await this.generateItemsForPetYear(petId, year);
    }
  }

  async getScheduleForUser(
    userId: string,
    petId: string,
    year = currentCalendarYear()
  ): Promise<PetPreventiveCareSchedule> {
    const pet = await this.petRepo.findOne({
      where: { id: petId, owner: { id: userId } },
      relations: ["species", "breed"]
    });
    if (!pet) {
      throw new NotFoundException("Pet not found");
    }

    if (!pet.breed) {
      return {
        petId: pet.id,
        speciesName: pet.species.name,
        breedName: null,
        year,
        groups: []
      };
    }

    await this.ensureItemsForYear(petId, year);

    const { start, end } = yearBounds(year);
    const items = await this.itemRepo.find({
      where: {
        pet: { id: petId },
        dueDate: Between(
          start.toISOString().slice(0, 10),
          end.toISOString().slice(0, 10)
        )
      },
      relations: ["preventiveCareRule"],
      order: { dueDate: "ASC" }
    });

    const itemsByGroup: Record<PreventiveCareGroupKey, PreventiveCareScheduleItem[]> = {
      vaccination: [],
      deworming: [],
      checklist: []
    };

    for (const item of items) {
      const rule = item.preventiveCareRule;
      const groupKey = groupKeyForType(rule.type);
      itemsByGroup[groupKey].push({
        id: item.id,
        ruleId: rule.id,
        title: rule.title,
        dueDate: item.dueDate,
        type: rule.type,
        completedAt: item.completedAt ? toIsoDateTime(item.completedAt) : null
      });
    }

    const groups: PreventiveCareScheduleGroup[] = (
      ["vaccination", "deworming", "checklist"] as const
    )
      .map((key) => {
        const groupItems = itemsByGroup[key].sort((a, b) =>
          a.dueDate.localeCompare(b.dueDate)
        );
        const meta = GROUP_META[key];
        return {
          key,
          title: meta.title,
          subtitle: meta.subtitle,
          icon: meta.icon,
          items: groupItems
        };
      })
      .filter((g) => g.items.length > 0);

    return {
      petId: pet.id,
      speciesName: pet.species.name,
      breedName: pet.breed.name,
      year,
      groups
    };
  }

  async getAllItemsForUserCalendar(
    userId: string,
    year = currentCalendarYear()
  ): Promise<Array<PreventiveCareScheduleItem & { petId: string; petName: string }>> {
    const pets = await this.petRepo.find({
      where: { owner: { id: userId } },
      relations: ["species", "breed"]
    });

    const { start, end } = yearBounds(year);
    const yearStart = start.toISOString().slice(0, 10);
    const yearEnd = end.toISOString().slice(0, 10);

    for (const pet of pets) {
      if (pet.breed) {
        await this.ensureItemsForYear(pet.id, year);
      }
    }

    const petIds = pets.map((p) => p.id);
    if (petIds.length === 0) return [];

    const items = await this.itemRepo
      .createQueryBuilder("item")
      .leftJoinAndSelect("item.preventiveCareRule", "rule")
      .leftJoinAndSelect("item.pet", "pet")
      .where("pet.id IN (:...petIds)", { petIds })
      .andWhere("item.dueDate >= :start", { start: yearStart })
      .andWhere("item.dueDate <= :end", { end: yearEnd })
      .orderBy("item.dueDate", "ASC")
      .getMany();

    const petMap = new Map(pets.map((p) => [p.id, p]));

    return items.map((item) => {
      const rule = item.preventiveCareRule;
      const petEntity = (item as any).pet;
      const pet = petMap.get(petEntity.id);
      return {
        id: item.id,
        ruleId: rule.id,
        title: rule.title,
        dueDate: item.dueDate,
        type: rule.type,
        completedAt: item.completedAt ? toIsoDateTime(item.completedAt) : null,
        petId: petEntity.id,
        petName: pet?.name ?? ""
      };
    });
  }

  async toggleItemCompletion(
    userId: string,
    petId: string,
    itemId: string
  ): Promise<PreventiveCareScheduleItem> {
    const item = await this.itemRepo.findOne({
      where: {
        id: itemId,
        pet: { id: petId, owner: { id: userId } }
      },
      relations: ["preventiveCareRule"]
    });
    if (!item) {
      throw new NotFoundException("Preventive care item not found");
    }

    item.completedAt = item.completedAt ? null : new Date();
    await this.itemRepo.save(item);

    const rule = item.preventiveCareRule;
    return {
      id: item.id,
      ruleId: rule.id,
      title: rule.title,
      dueDate: item.dueDate,
      type: rule.type,
      completedAt: item.completedAt ? toIsoDateTime(item.completedAt) : null
    };
  }
}
