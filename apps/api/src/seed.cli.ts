import "reflect-metadata";

/**
 * Seed CLI must not statically import Nest/SeedModule: those imports run before `main()`
 * and can block for a long time (module graph + DB) with zero console output.
 * Only `reflect-metadata` stays at top level.
 */

const COMMANDS = [
  "all",
  "species",
  "preventive-care-rules",
  "lifestyle-rules"
] as const;
type SeedCommand = (typeof COMMANDS)[number];

function parseCommand(arg: string | undefined): SeedCommand {
  if (arg == null || arg === "" || arg === "all") {
    return "all";
  }
  if ((COMMANDS as readonly string[]).includes(arg)) {
    return arg as SeedCommand;
  }
  throw new Error(
    `Unknown seed command "${arg}". Use: ${COMMANDS.join(" | ")}`
  );
}

/** Use stderr so output is not line-buffered / lost with pnpm on some Windows shells. */
function say(message: string): void {
  console.error(`[seed] ${message}`);
}

/** Removes legacy species-scoped rows so TypeORM can enforce NOT NULL on breedId. */
async function cleanupLegacyPreventiveCareRules(): Promise<void> {
  const dotenv = await import("dotenv");
  dotenv.config({});
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    return;
  }
  const { Client } = require("pg") as {
    Client: new (config: { connectionString: string }) => {
      connect(): Promise<void>;
      query(sql: string): Promise<{ rowCount: number | null }>;
      end(): Promise<void>;
    };
  };
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    const res = await client.query(
      'DELETE FROM preventive_care_rules WHERE "breedId" IS NULL'
    );
    if (res.rowCount && res.rowCount > 0) {
      say(`removed ${res.rowCount} legacy preventive care rule(s) without breedId.`);
    }
  } finally {
    await client.end();
  }
}

async function main(): Promise<void> {
  say(`args: ${process.argv.slice(2).join(" ") || "(none)"}`);
  const cmd = parseCommand(process.argv[2]);
  say(`command: ${cmd}`);

  if (cmd === "all" || cmd === "preventive-care-rules") {
    say("checking for legacy preventive care rules (pre-migration cleanup)…");
    await cleanupLegacyPreventiveCareRules();
  }

  say("loading Nest (this can take a few seconds)…");
  const { NestFactory } = await import("@nestjs/core");
  const { SeedModule } = await import("./seed/seed.module");

  say("connecting to database and bootstrapping context…");
  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: ["error", "warn", "log"]
  });

  const { SpeciesSeedService } = await import(
    "./species/application/species-seed.service"
  );
  const { PreventiveCareRulesSeedService } = await import(
    "./preventive-care-rules/application/preventive-care-rules-seed.service"
  );
  const { LifestyleRulesSeedService } = await import(
    "./lifestyle-rules/application/lifestyle-rules-seed.service"
  );

  try {
    if (cmd === "all" || cmd === "species") {
      say("running species + breeds seed…");
      await app.get(SpeciesSeedService).seed();
      say("species + breeds: finished.");
    }
    if (cmd === "all" || cmd === "preventive-care-rules") {
      say("running preventive care rules seed (from preventive-care-rules.generated.json)…");
      await app.get(PreventiveCareRulesSeedService).seed();
      say("preventive care rules: finished.");
    }
    if (cmd === "all" || cmd === "lifestyle-rules") {
      say("running lifestyle rules seed (from lifestyle-rules.generated.json)…");
      await app.get(LifestyleRulesSeedService).seed();
      say("lifestyle rules: finished.");
    }
    say("done.");
  } finally {
    await app.close();
  }
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.stack ?? err.message : String(err);
  console.error("[seed] failed.");
  console.error(msg);
  process.exit(1);
});
