/**
 * Offline fallback: writes lifestyle-rules.generated.json from species-aware templates.
 * Prefer `pnpm run ai:generate-lifestyle-rules` when DeepSeek is available.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { SPECIES_SEED_DATA } from "species/infrastructure/species.seed";

import {
  generatedLifestyleRulesFileSchema,
  type ExpectedBreedRef,
  validateGeneratorProfessionalCoverageForBreeds
} from "./lifestyle-rules.schema";

type RuleDef = {
  title: string;
  description: string;
  type: "exercise" | "feeding_awareness" | "food_safety";
  applicableMinAgeDays?: number | null;
  applicableMaxAgeDays?: number | null;
};

function rulesForMammalCompanion(breedName: string, speciesLabel: string): RuleDef[] {
  return [
    {
      title: `${breedName} young animal meal rhythm`,
      description: `For ${breedName} ${speciesLabel}s under about 4 months, offer a complete life-stage formula in 3–4 small meals daily rather than one large bowl. Weigh weekly and adjust portions with your veterinarian so growth stays steady without excess weight.`,
      type: "feeding_awareness",
      applicableMinAgeDays: 0,
      applicableMaxAgeDays: 120
    },
    {
      title: `${breedName} weaning and transition`,
      description: `When transitioning ${breedName} ${speciesLabel}s from mother's milk or a breeder diet to a commercial formula, change food gradually over 7–10 days while monitoring stool quality. Sudden switches commonly cause digestive upset in young animals.`,
      type: "feeding_awareness",
      applicableMinAgeDays: 21,
      applicableMaxAgeDays: 90
    },
    {
      title: `${breedName} body condition at home`,
      description: `For ${breedName} ${speciesLabel}s, you should feel ribs with light pressure and see a visible waist when viewed from above. Log weight monthly and discuss trends with your vet—breed size and coat can hide early weight gain.`,
      type: "feeding_awareness",
      applicableMinAgeDays: 60,
      applicableMaxAgeDays: null
    },
    {
      title: `${breedName} puppy or kitten play sessions`,
      description: `Short, frequent play (5–10 minutes, several times daily) supports socialization for young ${breedName} ${speciesLabel}s without overloading growing joints. Avoid forced running on hard surfaces until your vet confirms growth plates are mature.`,
      type: "exercise",
      applicableMinAgeDays: 42,
      applicableMaxAgeDays: 365
    },
    {
      title: `${breedName} daily movement (adult)`,
      description: `Most adult ${breedName} ${speciesLabel}s benefit from consistent daily activity matched to temperament and build—often 30–60 minutes split into two sessions. Increase gradually after rest days and reduce intensity in heat or on icy ground.`,
      type: "exercise",
      applicableMinAgeDays: 365,
      applicableMaxAgeDays: 2555
    },
    {
      title: `${breedName} senior-friendly activity`,
      description: `Older ${breedName} ${speciesLabel}s do best with gentler, shorter sessions, soft footing, and extra warm-up time. Swimming or sniff walks can maintain fitness when high-impact exercise is no longer comfortable.`,
      type: "exercise",
      applicableMinAgeDays: 2555,
      applicableMaxAgeDays: null
    },
    {
      title: `Safe foods and treats for ${breedName}`,
      description: `Many human foods are toxic to ${speciesLabel}s (chocolate, grapes, onions, xylitol sweeteners, and others). Keep trash secured and teach household members not to share table scraps—treats should stay under about 10% of daily calories.`,
      type: "food_safety",
      applicableMinAgeDays: 0,
      applicableMaxAgeDays: null
    },
    {
      title: `${breedName} hydration and bowls`,
      description: `Provide fresh water at all times for ${breedName} ${speciesLabel}s, especially after play and in warm weather. Wash food and water bowls daily to limit bacterial buildup that can contribute to mild digestive upset.`,
      type: "food_safety",
      applicableMinAgeDays: 0,
      applicableMaxAgeDays: null
    }
  ];
}

function rulesForSpecies(
  speciesSlug: string,
  speciesName: string,
  breedName: string
): RuleDef[] {
  const label = speciesName.toLowerCase();

  if (speciesSlug === "dog" || speciesSlug === "cat") {
    const rules = rulesForMammalCompanion(breedName, label);
    if (speciesSlug === "dog" && breedName === "Golden Retriever") {
      rules.unshift({
        title: "Golden Retriever puppy growth diet",
        description:
          "Golden Retriever puppies grow quickly and are prone to developmental orthopedic issues if overfed. Use a large-breed puppy formula until your veterinarian recommends adult food—often around 12–18 months—and feed measured meals rather than free choice.",
        type: "feeding_awareness",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: 540
      });
    }
    return rules;
  }

  if (speciesSlug === "bird") {
    return [
      {
        title: `${breedName} daily foraging activity`,
        description: `Encourage natural foraging for ${breedName} birds with puzzle feeders, scattered pellets, and safe chew toys. Mental work reduces feather-plucking stress common when birds are under-stimulated.`,
        type: "exercise",
        applicableMinAgeDays: 90,
        applicableMaxAgeDays: null
      },
      {
        title: `${breedName} flight and perch time`,
        description: `Supervised out-of-cage time in a bird-safe room helps ${breedName} birds maintain muscle tone. Ensure windows are covered and ceiling fans are off before flight sessions.`,
        type: "exercise",
        applicableMinAgeDays: 120,
        applicableMaxAgeDays: null
      },
      {
        title: `${breedName} pellet and fresh food balance`,
        description: `A quality pellet base plus measured fresh vegetables supports stable nutrition for ${breedName} birds. Introduce new produce slowly and remove uneaten fresh food within a few hours.`,
        type: "feeding_awareness",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: null
      },
      {
        title: `${breedName} calcium and grit awareness`,
        description: `Do not offer loose grit or high-fat seed mixes as the main diet for ${breedName} birds unless your avian veterinarian advises otherwise. Obesity and fatty liver disease are common when seed is overfed.`,
        type: "feeding_awareness",
        applicableMinAgeDays: 180,
        applicableMaxAgeDays: null
      },
      {
        title: `Toxic fumes and cookware near ${breedName}`,
        description: `Non-stick cookware, scented candles, aerosols, and tobacco smoke can be lethal to birds within minutes. Keep ${breedName} birds in well-ventilated areas away from kitchens when pans are heating.`,
        type: "food_safety",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: null
      },
      {
        title: `Safe plants and metals for ${breedName}`,
        description: `Many houseplants and zinc-coated hardware are toxic to birds. Use stainless or ceramic bowls and confirm any wood or rope toys are bird-safe before placing them in the cage.`,
        type: "food_safety",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: null
      }
    ];
  }

  if (speciesSlug === "rabbit") {
    return [
      {
        title: `${breedName} daily hop time`,
        description: `${breedName} rabbits need several hours of supervised exercise daily in a rabbit-proofed area. Lack of movement contributes to sore hocks and gastrointestinal slowdown.`,
        type: "exercise",
        applicableMinAgeDays: 60,
        applicableMaxAgeDays: null
      },
      {
        title: `${breedName} unlimited timothy hay`,
        description: `Hay should make up most of the diet for ${breedName} rabbits to support dental wear and gut motility. Introduce measured pellets and greens gradually after weaning.`,
        type: "feeding_awareness",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: null
      },
      {
        title: `${breedName} gradual vegetable introduction`,
        description: `Offer one new leafy green at a time to ${breedName} rabbits and watch for soft stool. Iceberg lettuce is not appropriate; favor romaine, cilantro, and parsley in small amounts.`,
        type: "feeding_awareness",
        applicableMinAgeDays: 90,
        applicableMaxAgeDays: null
      },
      {
        title: `Avoid muesli-style mixes for ${breedName}`,
        description: `Selective eating from colorful mixes can leave ${breedName} rabbits deficient in fiber. Prefer uniform hay-based pellets recommended by your exotics veterinarian.`,
        type: "food_safety",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: null
      },
      {
        title: `${breedName} toxic plants and wires`,
        description: `Rabbits chew constantly—protect electrical cords and remove toxic houseplants. Human foods high in starch or sugar are not safe for ${breedName} rabbits.`,
        type: "food_safety",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: null
      },
      {
        title: `${breedName} gentle handling for juniors`,
        description: `Young ${breedName} rabbits benefit from calm handling on the floor rather than high surfaces. Support hindquarters fully to reduce spine injury risk.`,
        type: "exercise",
        applicableMinAgeDays: 42,
        applicableMaxAgeDays: 180
      }
    ];
  }

  if (speciesSlug === "fish") {
    return [
      {
        title: `${breedName} tank swimming space`,
        description: `Provide adequate swimming room and gentle filtration for ${breedName} fish; cramped tanks increase stress and disease. Research adult size before stocking.`,
        type: "exercise",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: null
      },
      {
        title: `${breedName} feeding small portions`,
        description: `Feed ${breedName} fish only what they finish in 1–2 minutes, once or twice daily. Overfeeding clouds water and causes fatty liver disease in many species.`,
        type: "feeding_awareness",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: null
      },
      {
        title: `${breedName} fasting day for adults`,
        description: `Many adult ${breedName} fish benefit from one weekly fasting day if your aquatic veterinarian agrees—this can reduce constipation in goldfish-type species.`,
        type: "feeding_awareness",
        applicableMinAgeDays: 365,
        applicableMaxAgeDays: null
      },
      {
        title: `Water quality for ${breedName}`,
        description: `Test ammonia, nitrite, and nitrate regularly for ${breedName} fish. Partial water changes on a schedule matter more than frequent full tank breakdowns.`,
        type: "food_safety",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: null
      },
      {
        title: `Copper and medication safety (${breedName})`,
        description: `Some medications and tap water conditioners are toxic to invertebrates or scaleless fish. Read labels carefully when treating ${breedName} tanks.`,
        type: "food_safety",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: null
      },
      {
        title: `${breedName} species-appropriate diet type`,
        description: `Confirm whether ${breedName} fish are omnivores, herbivores, or carnivores before choosing flakes or pellets—long-term malnutrition is common with generic foods.`,
        type: "feeding_awareness",
        applicableMinAgeDays: 30,
        applicableMaxAgeDays: null
      }
    ];
  }

  if (speciesSlug === "hamster") {
    return [
      {
        title: `${breedName} wheel and burrowing`,
        description: `A solid-surface wheel sized for ${breedName} hamsters plus deep bedding supports natural running and digging. Wire wheels can cause foot injuries.`,
        type: "exercise",
        applicableMinAgeDays: 28,
        applicableMaxAgeDays: null
      },
      {
        title: `${breedName} measured daily pellets`,
        description: `Feed a measured tablespoon of species-appropriate pellets plus a small protein treat a few times weekly for ${breedName} hamsters. Excess sunflower seeds lead to obesity.`,
        type: "feeding_awareness",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: null
      },
      {
        title: `${breedName} fresh produce in moderation`,
        description: `Offer pea-sized portions of safe vegetables to ${breedName} hamsters occasionally. Remove uneaten fresh food within 12 hours to prevent mold.`,
        type: "feeding_awareness",
        applicableMinAgeDays: 42,
        applicableMaxAgeDays: null
      },
      {
        title: `Avoid sudden diet changes (${breedName})`,
        description: `Hamsters hoard food; when switching ${breedName} diets, mix old and new over a week and remove spoiled caches during cage cleaning.`,
        type: "food_safety",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: null
      },
      {
        title: `${breedName} toxic foods to skip`,
        description: `Onion-family vegetables, citrus, and sticky sweets are inappropriate for ${breedName} hamsters. Provide chew-safe wood blocks instead of human snacks.`,
        type: "food_safety",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: null
      },
      {
        title: `${breedName} gentle handling windows`,
        description: `Interact with ${breedName} hamsters during evening wake periods using calm scoop-up handling. Disturbing deep daytime sleep increases stress and nipping.`,
        type: "exercise",
        applicableMinAgeDays: 35,
        applicableMaxAgeDays: null
      }
    ];
  }

  if (speciesSlug === "turtle") {
    return [
      {
        title: `${breedName} basking and swimming`,
        description: `${breedName} turtles need both dry basking with UVB lighting and ample water for swimming. Inactivity often signals incorrect temperatures.`,
        type: "exercise",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: null
      },
      {
        title: `${breedName} portion-controlled feeding`,
        description: `Offer ${breedName} turtles a portion about the size of their head 3–4 times weekly for many adults—juveniles may need daily feeding per species guidelines.`,
        type: "feeding_awareness",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: 365
      },
      {
        title: `${breedName} calcium and UVB synergy`,
        description: `Without UVB and dietary calcium, ${breedName} turtles develop metabolic bone disease. Use reptile-specific supplements only as directed by your herp veterinarian.`,
        type: "feeding_awareness",
        applicableMinAgeDays: 60,
        applicableMaxAgeDays: null
      },
      {
        title: `Separate feeding tank for ${breedName}`,
        description: `Feeding ${breedName} turtles in a separate container reduces water fouling and helps monitor appetite—important early sign of illness.`,
        type: "food_safety",
        applicableMinAgeDays: 30,
        applicableMaxAgeDays: null
      },
      {
        title: `${breedName} salmonella hygiene`,
        description: `Always wash hands after handling ${breedName} turtles or habitat water. Do not allow turtles in kitchen sinks or near food prep areas.`,
        type: "food_safety",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: null
      },
      {
        title: `Avoid bread and processed snacks (${breedName})`,
        description: `Bread and lunch meat are not appropriate for ${breedName} turtles. Stick to species-appropriate pellets, greens, or prey items your veterinarian recommends.`,
        type: "food_safety",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: null
      }
    ];
  }

  if (speciesSlug === "guinea-pig") {
    return [
      {
        title: `${breedName} floor time daily`,
        description: `${breedName} guinea pigs need daily supervised floor time in a pig-proofed room. Static cage life alone often leads to boredom and weight gain.`,
        type: "exercise",
        applicableMinAgeDays: 30,
        applicableMaxAgeDays: null
      },
      {
        title: `${breedName} vitamin C every day`,
        description: `Guinea pigs cannot synthesize vitamin C. Provide ${breedName} guinea pigs with fresh bell pepper or guinea-pig pellets with stabilized vitamin C—do not rely on multivitamins in water.`,
        type: "feeding_awareness",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: null
      },
      {
        title: `${breedName} unlimited grass hay`,
        description: `Timothy or orchard hay should always be available for ${breedName} guinea pigs to support teeth and digestion. Limit high-calcium alfalfa in adults unless your vet advises it.`,
        type: "feeding_awareness",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: null
      },
      {
        title: `Introduce greens slowly to ${breedName}`,
        description: `New vegetables should be introduced one at a time to ${breedName} guinea pigs to avoid diarrhea. Small daily portions are safer than large weekend salads.`,
        type: "feeding_awareness",
        applicableMinAgeDays: 21,
        applicableMaxAgeDays: null
      },
      {
        title: `${breedName} avoid rabbit pellets`,
        description: `Rabbit feeds may lack vitamin C and can contain additives harmful to guinea pigs. Choose guinea-pig-specific pellets for ${breedName} animals.`,
        type: "food_safety",
        applicableMinAgeDays: 0,
        applicableMaxAgeDays: null
      },
      {
        title: `${breedName} companion and calm handling`,
        description: `Guinea pigs are social; a compatible companion and gentle two-hand lifting reduce stress for ${breedName} pets. Never grab by the shoulders alone.`,
        type: "exercise",
        applicableMinAgeDays: 45,
        applicableMaxAgeDays: null
      }
    ];
  }

  return rulesForMammalCompanion(breedName, label);
}

function main(): void {
  const merged: Record<string, Record<string, RuleDef[]>> = {};
  const expected: ExpectedBreedRef[] = [];

  for (const species of SPECIES_SEED_DATA) {
    merged[species.slug] = {};
    for (const breed of species.breeds) {
      merged[species.slug][breed.name] = rulesForSpecies(
        species.slug,
        species.name,
        breed.name
      );
      expected.push({
        speciesSlug: species.slug,
        speciesName: species.name,
        breedName: breed.name
      });
    }
  }

  const coverageError = validateGeneratorProfessionalCoverageForBreeds(
    expected,
    merged
  );
  if (coverageError) {
    console.error("[bootstrap-lifestyle-rules] Coverage failed:\n", coverageError);
    process.exit(1);
  }

  const outPath = join(
    process.cwd(),
    "src/lifestyle-rules/infrastructure/lifestyle-rules.generated.json"
  );

  const envelope = generatedLifestyleRulesFileSchema.parse({
    generatedAt: new Date().toISOString(),
    model: "bootstrap-templates",
    rulesBySpeciesAndBreed: merged
  });

  writeFileSync(outPath, `${JSON.stringify(envelope, null, 2)}\n`, "utf-8");
  console.error(`[bootstrap-lifestyle-rules] Wrote ${outPath}`);
}

main();
