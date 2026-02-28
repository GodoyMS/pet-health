## Pet Health Monorepo

Monorepo for the Pet Health platform using Turborepo, with a React/Vite web app and a NestJS API, plus shared configuration packages for ESLint, Tailwind, and TypeScript.

### Structure

- `apps/web` - React + Vite web application
- `apps/api` - NestJS API server with TypeORM and cookie-based auth
- `packages/config-eslint` - Shared ESLint configuration
- `packages/tailwind-config` - Shared Tailwind and global CSS (shadcn-style)
- `packages/typescript-config` - Shared TypeScript configurations

Use `pnpm` as the package manager.

Common scripts:

- `pnpm dev` - Run all apps in dev mode
- `pnpm build` - Build all apps
- `pnpm lint` - Lint all packages and apps
- `pnpm test` - Run tests where available

