# ==========================================
# STAGE 1: THE KITCHEN (Builder)
# ==========================================
FROM node:24-alpine AS builder

WORKDIR /app

RUN npm install --global pnpm@11.8.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# The Nuke is gone. Strict security is back.
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

# ==========================================
# STAGE 2: THE DINING ROOM (Production)
# ==========================================
FROM node:24-alpine

WORKDIR /app

RUN npm install --global pnpm@11.8.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Strict security here too.
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 3000
USER node
CMD ["node", "dist/main.js"]
