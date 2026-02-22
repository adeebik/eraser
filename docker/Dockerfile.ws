FROM node:22-alpine

WORKDIR /app

RUN npm i -g pnpm@10.29.3 turbo@2.7.6

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/ws-server ./apps/ws-server

RUN pnpm install

RUN pnpm turbo run build --filter=server...

EXPOSE 8080

CMD [ "pnpm", "--filter", "server", "start" ]

# ai generated dockerfile which is more optimized. 
# FROM node:22-alpine AS base

# FROM base AS builder
# RUN apk update && apk add --no-cache libc6-compat
# WORKDIR /app
# RUN npm install -g pnpm@10.29.3 turbo@2.7.6
# COPY . .
# RUN turbo prune server --docker

# FROM base AS installer
# RUN apk update && apk add --no-cache libc6-compat
# WORKDIR /app
# RUN npm install -g pnpm@10.29.3

# # First install the dependencies (as they change less often)
# COPY .gitignore .gitignore
# COPY --from=builder /app/out/json/ .
# COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
# COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
# RUN pnpm install

# # Build the project
# COPY --from=builder /app/out/full/ .
# COPY turbo.json turbo.json
# RUN pnpm turbo run build --filter=server...

# FROM base AS runner
# WORKDIR /app

# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 expressjs
# USER expressjs

# COPY --from=installer --chown=expressjs:nodejs /app .

# CMD ["node", "apps/ws-server/dist/index.js"]