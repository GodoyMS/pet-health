# Build context is the REPO ROOT, not apps/admin — the pnpm workspace needs the
# root lockfile and every workspace manifest to install with --frozen-lockfile.
#
#   docker build -f apps/admin/Dockerfile -t pet-health-admin .
#
# Railway: leave Root Directory empty and set the service's config-as-code path
# to railway.admin.json.

FROM node:22-alpine AS base
# npm rather than corepack: `corepack prepare` fails on some bundled corepack
# versions with "Cannot find matching keyid".
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

# --- build: Vite bakes VITE_* into the bundle at build time ------------------
FROM manifests AS build

# Must be a build arg, not runtime env: `vite build` inlines the value into the
# JS bundle, so a runtime variable would never be seen. Railway passes service
# variables to the build as --build-arg automatically.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# --ignore-scripts: the root "prepare" script runs `turbo prune`, which is not
# wanted (and not installable) inside the image.
RUN pnpm install --frozen-lockfile --ignore-scripts --filter admin...

# @repo/ui is consumed as TypeScript source and @repo/tailwind-config as CSS,
# so both are compiled by Vite here rather than pre-built.
COPY packages/typescript-config packages/typescript-config
COPY packages/tailwind-config packages/tailwind-config
COPY packages/ui packages/ui
COPY apps/admin apps/admin
RUN pnpm --filter admin build

# --- runtime: static files only, no Node ------------------------------------
FROM nginx:alpine AS runtime
ENV PORT=8080
COPY apps/admin/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/apps/admin/dist /usr/share/nginx/html
EXPOSE 8080
