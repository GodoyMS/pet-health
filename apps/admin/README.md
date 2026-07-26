# Admin Backoffice (`apps/admin`)

Internal dark-themed backoffice for the Pet Health platform. It talks to the
same API as `apps/web` but every route is gated behind the `admin` role.

## What's inside

- **Overview** — platform-wide totals, signups (30d), health logs (14d),
  species/breed/provider distributions, care-item compliance.
- **Users** — search, pagination, detail view with owned pets, promote/revoke
  admin role, delete account (full cascade + Google Calendar cleanup).
- **Pets** — all pets across owners, detail with health logs, care items and
  AI reports, delete.
- **Health logs / AI reports** — read-only inspection of user-generated data,
  including raw AI report content.
- **Preventive care & lifestyle rules** — full CRUD over the rule engine.
- **Species & breeds** — reference catalog (managed by the seed pipeline).
- **System & logs** — DB connectivity/latency, uptime, memory, integration
  feature flags, table sizes, and the admin audit trail (every mutating
  backoffice action is recorded in `admin_audit_logs`).

## Running locally

```bash
cp apps/admin/.env.example apps/admin/.env   # points at the API (default :5000)
pnpm run dev:admin                           # http://localhost:5174
```

## Getting admin access

Accounts are regular platform users with `role = "admin"`. Two ways to grant it:

```bash
# one-off (direct DB update):
cd apps/api && pnpm run admin:promote you@example.com     # demote: ... you@example.com user

# or declaratively — promoted on every API boot:
# apps/api/.env → ADMIN_EMAILS=you@example.com,other@example.com
```

The API must allow this app's origin via `ADMIN_ORIGIN`
(defaults to `http://localhost:5174`).
