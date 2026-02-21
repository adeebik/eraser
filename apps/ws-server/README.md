# WebSocket Server

This application (`apps/ws-server`) manages the real-time, low-latency WebSocket connections necessary for the **Doodlezz** collaborative drawing environment.

## Tech Stack

- **Protocol**: `ws` (Node.js WebSocket library)
- **Authentication**: JWT
- **Database Integration**: Prisma (`@repo/db`)

## Features

- **Real-Time Sync**: Broadcasts shape creation, movement, rotation, and deletion events to all users actively connected to a specific room.
- **Room Subscriptions**: Users can join and subscribe to specific canvas sessions.
- **Persistence**: Periodically saves the fast-paced real-time state back to the database to ensure drawing persistence.
- **Authentication**: Validates incoming WebSocket connections using JWT tokens obtained from the `http-server`.

## Development

The WebSocket server is essential when running the frontend `doodlezz` app so users can draw together.

### Setup

Ensure you are in the ws-server directory:

```sh
cd apps/ws-server
```

### Running Locally

To run the server in development mode (watches for TypeScript changes):

```sh
pnpm run dev
```

The WebSocket server typically links with the Next.js frontend by listening on a specific port (e.g., `8080`).

To build and compile:

```sh
pnpm run build
```

To start the compiled server:

```sh
pnpm run start
```
