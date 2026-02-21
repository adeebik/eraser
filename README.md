# Doodlezz

Doodlezz is a collaborative, real-time drawing and whiteboard application built on a modern, high-performance monorepo architecture.

## Overview

This project is structured as a [Turborepo](https://turbo.build/) monorepo to seamlessly manage multiple applications and shared packages. It leverages the power of Next.js for the frontend, Express for RESTful APIs, WebSockets for near-instant real-time canvas synchronization, and Prisma with PostgreSQL for robust data persistence.

## Architecture

The Turborepo consists of the following structure:

### Apps

- **`apps/doodlezz`**: The primary collaborative drawing frontend, built with Next.js 16 and Tailwind CSS v4. It manages the interactive canvas, tools, and UI.
- **`apps/web`**: A secondary/landing Next.js application.
- **`apps/http-server`**: The core REST API backend built with Express.js. Handles user authentication (JWT), room creation, and data retrieval (Prisma).
- **`apps/ws-server`**: A dedicated Node.js WebSocket server responsible for broadcasting real-time drawing events globally to connected clients in a specific room.

### Shared Packages (in `packages/`)

- **`@repo/ui`**: A shared React component library for uniform UI elements.
- **`@repo/db`**: The centralized Prisma ORM client and database schema.
- **`@repo/common`**: Shared Zod validation schemas for API inputs.
- Configs: `@repo/eslint-config`, `@repo/typescript-config`, and `@repo/backend-config`.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (v18+)
- [pnpm](https://pnpm.io/) (v10.x recommended)
- PostgreSQL database (running locally or via a cloud provider)

### Installation

1. Clone the repository and navigate to the project directory:

   ```sh
   git clone <repository-url>
   cd eraser
   ```

2. Install all dependencies:

   ```sh
   pnpm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root based on `.env.example`.
   - Ensure the `DATABASE_URL` is pointing to your Postgres instance.
   - Configure JWT secrets in the backend config.

4. Initialize the Database:
   Sync the Prisma schema with your database and generate the client.
   ```sh
   pnpm db:push
   # OR
   pnpm db:migrate:dev
   ```

### Running the Application

To start the entire stack (frontends, HTTP server, and WebSocket server) in development mode, simply run:

```sh
pnpm dev
```

Turborepo will effortlessly orchestrate starting all applications simultaneously inside the monorepo.

To build the application for production:

```sh
pnpm run build
```

## Useful Commands

- `pnpm format`: Formats code using Prettier.
- `pnpm lint`: Runs ESLint across all apps and packages.
- `pnpm check-types`: Runs TypeScript type checking.

## Built With

- [Turborepo](https://turbo.build/repo/docs)
- [Next.js](https://nextjs.org/)
- [Express.js](https://expressjs.com/)
- [ws (WebSockets)](https://github.com/websockets/ws)
- [Prisma ORM](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
