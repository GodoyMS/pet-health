# Build context is the REPO ROOT, not apps/api — the pnpm workspace needs the
# root lockfile and every workspace manifest to install with --frozen-lockfile.
#
#   docker build -f apps/api/Dockerfile -t pet-health-api .
#
# Railway: set "Dockerfile Path" to apps/api/Dockerfile and leave the root
# directory at the repo root (see railway.json).

FROM node:22-alpine AS base
# Installed with npm rather than corepack: `corepack prepare` fails on some
# bundled corepack versions with "Cannot find matching keyid".
RUN npm install --global pnpm@9.15.0
WORKDIR /app

# --- manifests only, so dependency layers cache across source changes --------
# Every workspace manifest must be present: --frozen-lockfile validates the
# lockfile against the whole workspace, not just the filtered package.
FROM base AS manifests
# The root .npmrc is deliberately NOT copied: it sets
# `node-options=--use-system-ca`, a local corporate-CA workaround that breaks
# Node in this image (no system CA store on Alpine).
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/admin/package.json apps/admin/
COPY packages/config-eslint/package.json packages/config-eslint/
COPY packages/tailwind-config/package.json packages/tailwind-config/
COPY packages/typescript-config/package.json packages/typescript-config/
COPY packages/ui/package.json packages/ui/

# --- build: full deps for the api and the configs it compiles against --------
FROM manifests AS build
# --ignore-scripts: the root "prepare" script runs `turbo prune`, which is not
# wanted (and not installable) inside the image.
RUN pnpm install --frozen-lockfile --ignore-scripts --filter api...
COPY packages/typescript-config packages/typescript-config
COPY apps/api apps/api
RUN pnpm --filter api build

# --- runtime: production dependencies + compiled output ----------------------
FROM manifests AS runtime
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile --ignore-scripts --prod --filter api...
COPY --from=build /app/apps/api/dist apps/api/dist

WORKDIR /app/apps/api
EXPOSE 5000
CMD ["node", "dist/main.js"]
