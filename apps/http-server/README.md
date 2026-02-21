# HTTP REST Server

This application (`apps/http-server`) provides the primary REST backend for the **Doodlezz** monorepo workspace.

## Tech Stack

- **Framework**: [Express.js](https://expressjs.com/)
- **Database ORM**: Prisma (`@repo/db`)
- **Authentication**: JWT & bcrypt
- **Validation**: Zod (`@repo/common`)

## Features

- **Authentication**: Secure user sign up, sign in, and JWT-based session management.
- **Room Management**: Features to create, join, share, and delete collaborative rooms (canvas sessions).
- **Dashboard Data**: Endpoints to retrieve a user's joined rooms and historical activity.
- **Content Retrieval**: Retrieves historical chat and drawing shapes to reconstruct canvas states for new users joining a room.

## Development

The HTTP Server acts as the source of truth for user states. It relies on a PostgreSQL database setup via Prisma.

### Setup

Ensure you are in the HTTP Server directory:

```sh
cd apps/http-server
```

Create a `.env` file (if not using the workspace root one) with your JWT Secret:

```env
JWT_SECRET=your_super_secret_key
```

### Running Locally

To run the server in development mode (watches for TypeScript changes):

```sh
pnpm run dev
```

To build and compile TypeScript to JavaScript:

```sh
pnpm run build
```

To start the compiled server:

```sh
pnpm run start
```

## Useful Links

- Project root README for overall workspace instructions.
