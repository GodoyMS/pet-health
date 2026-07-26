import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { LifestyleRuleType } from "../../lifestyle-rules/domain/lifestyle-rule-type.enum";
import { LifestyleRuleOrmEntity } from "../../lifestyle-rules/infrastructure/typeorm/lifestyle-rule.orm-entity";
import { PetOrmEntity } from "../infrastructure/typeorm/pet.orm-entity";
import {
  formatLifestyleValidFor,
  formatPetAgeLabel,
  petAgeDays,
  ruleMatchesPetAge
} from "./lifestyle-age";

export interface LifestyleGuidanceItem {
  id: string;
  title: string;
  description: string;
  applicableMinAgeDays: number | null;
  applicableMaxAgeDays: number | null;
  validForLabel: string;
}

export type LifestyleCategory =
  | "exercise"
  | "feeding_awareness"
  | "food_safety";

export interface LifestyleTab {
  key: LifestyleCategory;
  title: string;
  icon: string;
  items: LifestyleGuidanceItem[];
}

export interface PetLifestyleGuidance {
  petId: string;
  speciesName: string;
  breedName: string | null;
  /** Whole days since birth; tips are filtered to match this age. */
  petAgeDays: number;
  /** e.g. "30 days old" — shown in the UI for context. */
  petAgeLabel: string;
  tabs: LifestyleTab[];
}

const TAB_META: Record<LifestyleCategory, { title: string; icon: string }> = {
  exercise: { title: "Exercise", icon: "directions_run" },
  feeding_awareness: { title: "Feeding Awareness", icon: "restaurant" },
  food_safety: { title: "Food Safety", icon: "health_and_safety" }
};

const TAB_ORDER: LifestyleCategory[] = [
  "exercise",
  "feeding_awareness",
  "food_safety"
];

function categoryForType(type: LifestyleRuleType): LifestyleCategory {
  if (type === LifestyleRuleType.Exercise) return "exercise";
  if (type === LifestyleRuleType.FeedingAwareness) return "feeding_awareness";
  return "food_safety";
}

@Injectable()
export class PetLifestyleGuidanceService {
  constructor(
    @InjectRepository(PetOrmEntity)
    private readonly petRepo: Repository<PetOrmEntity>,
    @InjectRepository(LifestyleRuleOrmEntity)
    private readonly ruleRepo: Repository<LifestyleRuleOrmEntity>
  ) {}

  async getGuidanceForUser(
    userId: string,
    petId: string
  ): Promise<PetLifestyleGuidance> {
    const pet = await this.petRepo.findOne({
      where: { id: petId, owner: { id: userId } },
      relations: ["species", "breed"]
    });
    if (!pet) {
      throw new NotFoundException("Pet not found");
    }

    const breedName = pet.breed?.name ?? null;
    const ageDays = petAgeDays(pet.birthDate);
    const petAgeLabel = formatPetAgeLabel(ageDays);
    const ageContext = { petAgeDays: ageDays, petAgeLabel };

    if (!pet.breed) {
      return {
        petId: pet.id,
        speciesName: pet.species.name,
        breedName: null,
        ...ageContext,
        tabs: TAB_ORDER.map((key) => ({
          key,
          title: TAB_META[key].title,
          icon: TAB_META[key].icon,
          items: []
        }))
      };
    }

    const rules = await this.ruleRepo.find({
      where: { breed: { id: pet.breed.id } },
      order: { title: "ASC" }
    });

    const itemsByCategory: Record<LifestyleCategory, LifestyleGuidanceItem[]> = {
      exercise: [],
      feeding_awareness: [],
      food_safety: []
    };

    for (const rule of rules) {
      if (!ruleMatchesPetAge(rule, ageDays)) continue;
      const key = categoryForType(rule.type);
      itemsByCategory[key].push({
        id: rule.id,
        title: rule.title,
        description: rule.description,
        applicableMinAgeDays: rule.applicableMinAgeDays,
        applicableMaxAgeDays: rule.applicableMaxAgeDays,
        validForLabel: formatLifestyleValidFor(
          rule.applicableMinAgeDays,
          rule.applicableMaxAgeDays
        )
      });
    }

    const tabs: LifestyleTab[] = TAB_ORDER.map((key) => ({
      key,
      title: TAB_META[key].title,
      icon: TAB_META[key].icon,
      items: itemsByCategory[key]
    }));

    return {
      petId: pet.id,
      speciesName: pet.species.name,
      breedName,
      ...ageContext,
      tabs
    };
  }
}
