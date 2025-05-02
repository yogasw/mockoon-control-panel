# -------- Stage 1: Build Stage (Backend + Frontend) --------
FROM node:22.15.0-alpine3.21 AS builder

WORKDIR /app

# -------- Install System Tools --------
RUN apk update && apk add --no-cache openssl

# Copy backend and frontend source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Install all dependencies (dev + prod)
RUN npm install --prefix backend && npm install --prefix frontend

# Set environment
ENV VITE_API_BASE_URL "/mock/api"

# Setup Folder and Configurations
RUN npm run setup --prefix backend

# Build backend (TypeScript) and frontend (Vite)
RUN npm run build --prefix backend
RUN npm run build --prefix frontend

# Generate Prisma Client
RUN npm run db:generate --prefix backend


# -------- Stage 2: Production Stage --------
FROM node:22.15.0-alpine3.21

ARG TRAEFIK_VERSION=2.10.7

# Set architecture environment from container
RUN apk update
RUN apk add --no-cache curl tar gzip sqlite openssl git
RUN ARCH=$(uname -m | sed 's/x86_64/amd64/' | sed 's/aarch64/arm64/') \
  && echo "Detected architecture: $ARCH" \
  && curl -L "https://github.com/traefik/traefik/releases/download/v${TRAEFIK_VERSION}/traefik_v${TRAEFIK_VERSION}_linux_${ARCH}.tar.gz" \
  | tar -xz -C /usr/local/bin traefik \
  && chmod +x /usr/local/bin/traefik


WORKDIR /app

# Set environment for production
ENV NODE_ENV=production

# Initialize folders for backend and frontend
RUN mkdir -p backend frontend

# Copy Prisma schema
COPY --from=builder /app/backend/src/prisma/schema.prisma ./backend/src/prisma/schema.prisma

# Install only production dependencies
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/frontend/package*.json ./frontend/
RUN npm ci --prefix backend
RUN npm ci --prefix frontend

# Install mockoon CLI
RUN npm install -g @mockoon/cli

# Copy configuration files
COPY --from=builder /app/configs/ ./configs/

# Copy backend build
COPY --from=builder /app/backend/dist/ ./backend/dist/

# Copy frontend build
COPY --from=builder /app/frontend/build/ ./frontend/build/

# (Optional) Copy root package.json if needed
COPY package.json ./

# Expose Traefik default port
EXPOSE 80

# Start services
CMD traefik --configFile=/app/configs/traefik/traefik.yml & \
    npm run start --prefix backend & \
    npx serve -s frontend/build -l 3005
