# Doodlezz Web / Landing

This application (`apps/web`) acts as a secondary standalone frontend or landing page within the Turborepo workspace.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI library**: React
- **Internal Packages**: `@repo/ui`

## Development

To run this specific web application locally:

```sh
cd apps/web
pnpm run dev
```

Navigate to `http://localhost:3000` to view the application.

## Build

To compile the application for production:

```sh
pnpm run build
```
