# ==========================================
# STAGE 1: THE KITCHEN (Builder)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

# THE NUCLEAR FIX: Dynamically inject the pnpm security approvals into package.json inside the container
RUN node -e "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')); pkg.pnpm = pkg.pnpm || {}; pkg.pnpm.onlyBuiltDependencies = ['@nestjs/core', '@scarf/scarf', 'bcrypt', 'puppeteer']; fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));"

RUN pnpm install

COPY . .

RUN pnpm run build

# ==========================================
# STAGE 2: THE DINING ROOM (Production)
# ==========================================
FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

# THE NUCLEAR FIX: Inject the exact same approvals into the production container
RUN node -e "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')); pkg.pnpm = pkg.pnpm || {}; pkg.pnpm.onlyBuiltDependencies = ['@nestjs/core', '@scarf/scarf', 'bcrypt', 'puppeteer']; fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));"

RUN pnpm install --prod

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 3000
USER node
CMD ["node", "dist/main.js"]