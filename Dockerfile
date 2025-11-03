# Production image
FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies and rebuild bcrypt
RUN pnpm install --frozen-lockfile && pnpm rebuild bcrypt

# Copy application files
COPY . .

# Set build-time environment variables
ENV MONGODB_URI=mongodb://mongo:27017/product_manager
ENV JWT_SECRET=change_me_super_secret
ENV NEXT_TELEMETRY_DISABLED=1

# Build application
RUN pnpm run build

EXPOSE 3000
CMD ["pnpm", "start"]
