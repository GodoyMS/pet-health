## Pet Health Monorepo

Monorepo for the Pet Health platform using Turborepo, with a React/Vite web app and a NestJS API, plus shared configuration packages for ESLint, Tailwind, and TypeScript.

### Structure

- `apps/web` - React + Vite web application
- `apps/api` - NestJS API server with TypeORM and cookie-based auth
- `packages/config-eslint` - Shared ESLint configuration
- `packages/tailwind-config` - Shared Tailwind and global CSS (shadcn-style)
- `packages/typescript-config` - Shared TypeScript configurations
- `packages/ui` - Shared UI Components

Use `pnpm` as the package manager.

Common scripts:

- `pnpm dev:ui` - Run Storybook for UI Elements
- `pnpm dev:web` - Starts frontend application on dev mode
- `pnpm dev:api` - Starts backend application on dev mode

