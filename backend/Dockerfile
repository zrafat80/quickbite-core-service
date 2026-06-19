# ==========================================
# STAGE 1: THE KITCHEN (Builder)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# 1. Install pnpm globally inside the builder container
RUN npm install -g pnpm

# 2. Copy package.json and your true pnpm lock-file blueprint
COPY package.json pnpm-lock.yaml ./

# 3. Clean install ALL dependencies using pnpm's equivalent of "npm ci"
RUN pnpm install --frozen-lockfile

# 4. Copy the TypeScript source code
COPY . .

# 5. Compile the code to pure JavaScript (creates the /dist folder)
RUN pnpm run build

# ==========================================
# STAGE 2: THE DINING ROOM (Production)
# ==========================================
FROM node:22-alpine

WORKDIR /app

# 1. Install pnpm globally inside the production container too
RUN npm install -g pnpm

# 2. Copy the lock-files to install production dependencies
COPY package.json pnpm-lock.yaml ./

# 3. Install ONLY production dependencies (ignores devDependencies)
RUN pnpm install --frozen-lockfile --prod

# 4. Copy the compiled production code from the Kitchen builder
COPY --from=builder /app/dist ./dist

# 5. The Speed Boost
ENV NODE_ENV=production

# 6. The Documentation (Corrected to 3000)
EXPOSE 3000

# 7. The Security Lockdown (Strip Admin rights)
USER node

# 8. Turn the key
CMD ["node", "dist/main.js"]