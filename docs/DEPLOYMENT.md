# Deploying the API (Railway)

The API ships as a Docker image built from the repo root, with the database
schema owned by TypeORM migrations and reference data loaded by an idempotent
seed.

- Build: [`apps/api/Dockerfile`](../apps/api/Dockerfile)
- Platform config: [`railway.json`](../railway.json)
- Migrations: [`apps/api/src/migrations/`](../apps/api/src/migrations/)

---

## 1. One-time: baseline the existing database

**Skip this for a brand-new, empty database** — go straight to step 2.

The current Railway database was built by TypeORM's `synchronize`, before
migrations existed. Its tables are already there, so running the initial
migration would fail with `relation "users" already exists`.

Record the initial migration as applied without executing it:

```bash
cd apps/api
pnpm run db:baseline
```

The command refuses to run against an empty database, and refuses to run twice.
Afterwards, `pnpm run migration:show` lists `InitialSchema` as applied, and every
later migration runs normally.

---

## 2. Railway service setup

Create (or point) a service at this repo. `railway.json` supplies the builder,
start command, pre-deploy migration step, and healthcheck, so the only manual
work is environment variables.

### Required variables

| Variable       | Value                                                         |
| -------------- | ------------------------------------------------------------- |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` — reference your Postgres service |
| `JWT_SECRET`   | A long random string                                           |
| `WEB_ORIGIN`   | Deployed web app origin, e.g. `https://pet-health.up.railway.app` |
| `NODE_ENV`     | `production`                                                  |

The API throws on boot if any of these are missing, naming the ones it needs.

### Recommended variables

| Variable            | Value   | Why                                                                        |
| ------------------- | ------- | -------------------------------------------------------------------------- |
| `SEED_ON_BOOT`      | `true`  | Loads species, breeds, and both rule sets on every boot (idempotent upserts) |
| `DB_MIGRATIONS_RUN` | `false` | `railway.json`'s pre-deploy hook already runs them; avoids replicas racing   |
| `ADMIN_ORIGIN`      | origin  | Adds the admin app to the CORS allow-list                                   |

Leaving `DB_MIGRATIONS_RUN` unset is still safe — it defaults to `true` in
production, and the second run simply finds nothing pending. Set it to `false`
once you run more than one replica.

`PORT` is injected by Railway; do not set it. `DB_SSL` is not needed for
Railway's Postgres proxy — set it to `true` on Neon, Supabase, or RDS.

Everything else (`DEEPSEEK_API_KEY`, `GOOGLE_*`, `AWS_*`/`SES_*`) is optional and
gates a single feature. The API logs a warning at boot for each unset one and
starts anyway.

---

## 3. Deploy

Push to the branch Railway watches. Each deploy:

1. Builds the image (`pnpm install --frozen-lockfile` → `nest build`).
2. Runs `migration:run` as the pre-deploy step. **A failed migration aborts the
   deploy** and the previous version keeps serving.
3. Starts `node dist/main.js`.
4. Seeds reference data on boot when `SEED_ON_BOOT=true`.
5. Waits for `GET /health` to return 200 before routing traffic.

---

## Seeding

Reference data (8 species, 84 breeds, preventive-care and lifestyle rules) lives
in version control — `species.seed.ts` plus two `*.generated.json` files, which
`nest build` copies into `dist/`. No API keys are needed to seed; `DEEPSEEK_API_KEY`
only matters if you want to *regenerate* the rule files.

| Context             | Command                                             |
| ------------------- | --------------------------------------------------- |
| Deployed (on boot)  | `SEED_ON_BOOT=true`                                  |
| Deployed (manual)   | `pnpm run seed:prod` — runs `dist/`, no `tsx` needed |
| Local development   | `pnpm run seed`                                      |
| One area only       | `pnpm run seed:species` / `seed:preventive-care-rules` / `seed:lifestyle-rules` |

All seeds upsert by natural key, so re-running never duplicates rows.

**Demo neighbours are deliberately excluded from all of the above.** They create
fake user accounts, and stay opt-in for local use only:

```bash
pnpm run seed:neighbours -- --lat 28.6139 --lng 77.209 --radius 1500 --count 12
pnpm run seed:neighbours:clear
```

---

## Changing the schema

`synchronize` is forced off in production. After editing an entity:

```bash
cd apps/api
pnpm run migration:generate src/migrations/DescribeTheChange
pnpm run migration:show      # confirm what is pending
pnpm run migration:run       # apply locally
```

Commit the generated file. The next deploy applies it in the pre-deploy step.

`migration:generate` diffs entities against **the database it connects to**, so
run it against a database whose schema is already up to date with `main`.
`pnpm run migration:revert` undoes the last applied migration.

---

## Local development

Local behaviour is unchanged: `DB_SYNCHRONIZE` defaults to `true` outside
production, so `pnpm dev:api` still auto-syncs the schema. To rehearse the
production path locally, point `DATABASE_URL` at a scratch database and run:

```bash
cd apps/api
NODE_ENV=production pnpm run build
NODE_ENV=production pnpm run migration:run
NODE_ENV=production pnpm run seed:prod
```

---

## Notes

- `pnpm-lock.yaml` is committed. It must stay that way — the Docker build uses
  `--frozen-lockfile` and fails without it.
- The Dockerfile installs with `--ignore-scripts` because the root `prepare`
  script (`turbo prune`) is neither wanted nor installable inside the image.
- The build context is the **repo root**, not `apps/api` — the pnpm workspace
  needs the root lockfile and every workspace manifest.
