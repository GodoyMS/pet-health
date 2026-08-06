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
| `API_PUBLIC_URL`    | `https://<this-service>.up.railway.app` | Absolute base URL the species seed uses to build image URLs (`/static/species/*.svg`); without it, seeded `imageUrl`s point at `localhost` |

Leaving `DB_MIGRATIONS_RUN` unset is still safe — it defaults to `true` in
production, and the second run simply finds nothing pending. Set it to `false`
once you run more than one replica.

`PORT` is injected by Railway; do not set it. `DB_SSL` is not needed for
Railway's Postgres proxy — set it to `true` on Neon, Supabase, or RDS.

Everything else is optional and gates a single feature. The API logs a warning at
boot for each unset one and starts anyway — see "Optional integrations" below.

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

Species images are SVGs in `apps/api/public/species/`, served at
`/static/species/<file>.svg` (wired via `useStaticAssets` in `main.ts`). The
seed writes each species' `imageUrl` as `API_PUBLIC_URL + /static/species/<file>.svg`
(falling back to `http://localhost:<PORT>` when `API_PUBLIC_URL` is unset), so
set `API_PUBLIC_URL` **before** the first production seed run — re-seeding
after changing it updates existing rows too, since the seed is an upsert.

| Context             | Command                                             |
| ------------------- | --------------------------------------------------- |
| Deployed (on boot)  | `SEED_ON_BOOT=true`                                  |
| Deployed (manual)   | `pnpm run seed:prod` — runs `dist/`, no `tsx` needed |
| Local development   | `pnpm run seed`                                      |
| One area only       | `pnpm run seed:species` / `seed:preventive-care-rules` / `seed:lifestyle-rules` |

All seeds upsert by natural key, so re-running never duplicates rows.

### Is `SEED_ON_BOOT=true` safe on every deploy?

For user data, yes — unconditionally. The seed only ever writes to `species`,
`breeds`, `preventive_care_rules` and `lifestyle_rules`. It never touches users,
pets, health logs, friendships, or AI reports, and the only row it deletes is a
legacy preventive-care rule with a `NULL` breedId.

The caveat is the admin backoffice, which has full CRUD on both rule tables
(`/admin/preventive-care-rules`, `/admin/lifestyle-rules`). Against a rule whose
title appears in the generated files, the boot seed is authoritative:

| Admin action on a generated rule | Result on next boot                      |
| -------------------------------- | ---------------------------------------- |
| Edits type / age range / interval | Reverted to the generated value          |
| Deletes it                        | Re-created                               |
| Renames the title                 | Original re-inserted; the rename remains |
| Creates a rule with a new title   | Left alone — the seed never sees it      |

So: leave `SEED_ON_BOOT=true` if the generated rules are managed content and the
admin panel is only used to *add* rules. Set it to `false` after the first
deploy if admins are meant to curate the generated ones, and run
`pnpm run seed:prod` by hand when you want to reapply them.

**Demo neighbours are deliberately excluded from all of the above.** They create
fake user accounts, and stay opt-in for local use only:

```bash
pnpm run seed:neighbours -- --lat 28.6139 --lng 77.209 --radius 1500 --count 12
pnpm run seed:neighbours:clear
```

---

## Optional integrations

Each one is off until its variables are set. `<API>` below is the deployed API
origin, e.g. `https://pet-health-api.up.railway.app`.

### DeepSeek — AI wellness reports

| Variable           | Value        |
| ------------------ | ------------ |
| `DEEPSEEK_API_KEY` | your API key |

Nothing else to configure. **Do not set `DEEPSEEK_INSECURE_TLS` in production** —
it disables TLS certificate verification and exists only as a workaround for
corporate networks in local development.

### Google OAuth — sign in with Google

| Variable               | Value                          |
| ---------------------- | ------------------------------ |
| `GOOGLE_CLIENT_ID`     | from Google Cloud Console      |
| `GOOGLE_CLIENT_SECRET` | from Google Cloud Console      |
| `GOOGLE_CALLBACK_URL`  | `<API>/auth/google/callback`   |

In Google Cloud Console → APIs & Services → Credentials → your OAuth client, add
that exact URL under **Authorized redirect URIs**. Keep the localhost entry
alongside it so local development keeps working. A mismatch produces
`Error 400: redirect_uri_mismatch`.

### Google Calendar — sync preventive care to a calendar

| Variable                       | Value                              |
| ------------------------------ | ---------------------------------- |
| `GOOGLE_CALENDAR_CALLBACK_URL` | `<API>/google-calendar/callback`   |

Reuses the OAuth client above, so add this URL to the **same** client's
authorized redirect URIs, and enable the **Google Calendar API** in the project.

### Google Places — Nearby Care map

| Variable              | Value                    |
| --------------------- | ------------------------ |
| `GOOGLE_MAPS_API_KEY` | server-side key          |

Enable **Places API (New)** on the key's project. Restrict it by *API* rather
than by IP — Railway's egress addresses are not stable, so an IP allow-list will
break the feature.

The browser map uses a **separate** key, `VITE_GOOGLE_MAPS_API_KEY`, set on
`apps/web` and restricted by HTTP referrer to the web app's domain. Never reuse
the server key there: a referrer-restricted key is exposed to the browser by
design, and the server key must not be.

### AWS SES — verification and password-reset codes

| Variable                | Value                                |
| ----------------------- | ------------------------------------ |
| `AWS_REGION`            | e.g. `us-east-1`                     |
| `AWS_ACCESS_KEY_ID`     | IAM key with `ses:SendEmail`         |
| `AWS_SECRET_ACCESS_KEY` | matching secret                      |
| `SES_FROM_EMAIL`        | a **verified** SES identity          |
| `SES_CONFIGURATION_SET` | optional, for open/bounce tracking   |

> **Request SES production access before real users register.** In production
> there is no console fallback: when SES rejects a send, the API responds `502`
> and registration fails. While the account is in the SES sandbox, SES rejects
> every recipient that is not itself a verified identity — so sign-ups would work
> only for inboxes you verified by hand. Outside production the code is logged
> and returned as `previewCode` instead, which is why this does not show up
> locally.
>
> The failure is at least clean: the code is emailed *before* the challenge row
> is written, so a rejected send leaves no half-finished state and the user can
> simply retry.

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
