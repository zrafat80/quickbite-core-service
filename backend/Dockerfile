# ==========================================
# STAGE 1: THE KITCHEN (Builder)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# 1. Back to latest pnpm
RUN npm install -g pnpm

# 2. Copy package.json and your lockfile
COPY package.json pnpm-lock.yaml ./

# 3. THE FIX: Remove --frozen-lockfile so pnpm can auto-fix the security block
RUN pnpm install

# 4. Copy the TypeScript source code
COPY . .

# 5. Compile the code to pure JavaScript (creates the /dist folder)
RUN pnpm run build

# ==========================================
# STAGE 2: THE DINING ROOM (Production)
# ==========================================
FROM node:22-alpine

WORKDIR /app

# 1. Back to latest pnpm
RUN npm install -g pnpm

# 2. Copy the lock-files
COPY package.json pnpm-lock.yaml ./

# 3. THE FIX: Remove --frozen-lockfile here too
RUN pnpm install --prod

# 4. Copy the compiled production code from the Kitchen builder
COPY --from=builder /app/dist ./dist

# 5. The Speed Boost
ENV NODE_ENV=production

# 6. The Documentation
EXPOSE 3000

# 7. The Security Lockdown
USER node

# 8. Turn the key
CMD ["node", "dist/main.js"]