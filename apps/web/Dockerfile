# Build context is the REPO ROOT, not apps/web — the pnpm workspace needs the
# root lockfile and every workspace manifest to install with --frozen-lockfile.
#
#   docker build -f apps/web/Dockerfile -t pet-health-web .
#
# Railway: leave Root Directory empty and set the service's config-as-code path
# to railway.web.json.

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

# These MUST be build args, not runtime env: `vite build` inlines the values
# into the JS bundle, so a runtime variable would never be seen. Railway passes
# service variables to the build as --build-arg automatically.
ARG VITE_API_URL
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_GOOGLE_MAPS_MAP_ID
ARG VITE_GOOGLE_MAPS_NEIGHBOURHOOD_MAP_ID
ENV VITE_API_URL=$VITE_API_URL \
    VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY \
    VITE_GOOGLE_MAPS_MAP_ID=$VITE_GOOGLE_MAPS_MAP_ID \
    VITE_GOOGLE_MAPS_NEIGHBOURHOOD_MAP_ID=$VITE_GOOGLE_MAPS_NEIGHBOURHOOD_MAP_ID

# --ignore-scripts: the root "prepare" script runs `turbo prune`, which is not
# wanted (and not installable) inside the image.
RUN pnpm install --frozen-lockfile --ignore-scripts --filter web...

# @repo/ui is consumed as TypeScript source and @repo/tailwind-config as CSS,
# so both are compiled by Vite here rather than pre-built. scripts/ holds the
# shared Vite plugins that apps/web/vite.config.ts imports.
COPY packages/typescript-config packages/typescript-config
COPY packages/tailwind-config packages/tailwind-config
COPY packages/ui packages/ui
COPY scripts scripts
COPY apps/web apps/web
RUN pnpm --filter web build

# Precompress for `gzip_static`: nginx then serves these instead of gzipping
# each response at its default level 1. Better ratio, no per-request CPU.
# woff2 is excluded — it is already brotli-compressed internally.
# `gzip -c` rather than `gzip -k`: alpine ships busybox gzip, whose -k flag has
# not always been compiled in.
RUN find apps/web/dist -type f \
      \( -name '*.js' -o -name '*.css' -o -name '*.html' -o -name '*.svg' -o -name '*.json' \) \
      -exec sh -c 'gzip -9 -c "$1" > "$1.gz"' _ {} \;

# --- runtime: static files only, no Node ------------------------------------
FROM nginx:alpine AS runtime
ENV PORT=8080
COPY apps/web/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 8080
