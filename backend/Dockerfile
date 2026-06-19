# ==========================================
# STAGE 1: THE KITCHEN (Builder)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# 1. Install pnpm globally inside the builder container
RUN npm install -g pnpm

# 2. Copy package.json and your true pnpm lock-file blueprint
COPY package.json pnpm-lock.yaml ./

# 3. THE FIX: Tell pnpm it is safe to run installation scripts for bcrypt/puppeteer
RUN pnpm config set ignore-scripts false

# 4. Clean install ALL dependencies using pnpm's equivalent of "npm ci"
RUN pnpm install --frozen-lockfile

# 5. Copy the TypeScript source code
COPY . .

# 6. Compile the code to pure JavaScript (creates the /dist folder)
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

# 3. THE FIX: Tell pnpm it is safe to run scripts here too
RUN pnpm config set ignore-scripts false

# 4. Install ONLY production dependencies (ignores devDependencies)
RUN pnpm install --frozen-lockfile --prod

# 5. Copy the compiled production code from the Kitchen builder
COPY --from=builder /app/dist ./dist

# 6. The Speed Boost
ENV NODE_ENV=production

# 7. The Documentation
EXPOSE 3000

# 8. The Security Lockdown (Strip Admin rights)
USER node

# 9. Turn the key
CMD ["node", "dist/main.js"]