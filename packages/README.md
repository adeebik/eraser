# Shared Packages

This directory (`packages/`) contains internal, shared libraries and configurations used across the **Doodlezz** monorepo applications.

By extracting common code and schemas into shared packages, we ensure zero duplication, consistency, and a clear separation of concerns among the different micro-apps.

## Packages Included

### `@repo/ui`

A shared React component library utilizing Tailwind CSS. Used consistently by `apps/doodlezz` and `apps/web`.

### `@repo/db`

The centralized Prisma Object Relational Mapping (ORM) setup. Contains the Prisma client and schema connecting to the PostgreSQL database. Exported and used by both the `http-server` and `ws-server`.

### `@repo/common`

Shared validation schemas, specifically Zod configurations, defining the exact structure required for data inputs (e.g. signup shapes, drawing points). Standardizes endpoints.

### Config Packages

These packages enforce consistent rules across the TypeScript and ESLint toolchains globally:

- `@repo/eslint-config`: Shared ESLint configurations (includes `eslint-config-next` and `eslint-config-prettier`).
- `@repo/typescript-config`: Base `tsconfig.json` files inherited throughout the monorepo.
- `@repo/backend-config`: Configuration defaults aimed at Node.js (Express, WebSocket) server environments.

## Internal Usage

You can use these packages inside individual applications by declaring them as workspace dependencies in their `package.json` file.
Example from an app using the database client:

```json
"dependencies": {
  "@repo/db": "workspace:*"
}
```
