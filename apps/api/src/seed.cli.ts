import "reflect-metadata";

/**
 * Seed CLI must not statically import Nest/SeedModule: those imports run before `main()`
 * and can block for a long time (module graph + DB) with zero console output.
 * Only `reflect-metadata` stays at top level.
 */

const COMMANDS = ["all", "species", "preventive-care-rules"] as const;
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

async function main(): Promise<void> {
  say(`args: ${process.argv.slice(2).join(" ") || "(none)"}`);
  const cmd = parseCommand(process.argv[2]);
  say(`command: ${cmd}`);

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

  try {
    if (cmd === "all" || cmd === "species") {
      say("running species + breeds seed…");
      await app.get(SpeciesSeedService).seed();
      say("species + breeds: finished.");
    }
    if (cmd === "all" || cmd === "preventive-care-rules") {
      say("running preventive care rules seed…");
      await app.get(PreventiveCareRulesSeedService).seed();
      say("preventive care rules: finished.");
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
