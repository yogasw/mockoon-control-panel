# -------- Stage 1: Build Stage (Backend + Frontend) --------
FROM node:20 AS builder

WORKDIR /app

# Copy backend and frontend source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Install all dependencies (dev + prod)
RUN npm install --prefix backend && npm install --prefix frontend

# Build backend (TypeScript) and frontend (Vite)
RUN npm run build --prefix backend
RUN npm run build --prefix frontend

# Generate Prisma Client
RUN npm run prisma:generate --prefix backend


# -------- Stage 2: Production Stage --------
FROM node:20

# -------- Install System Tools & Traefik Binary --------
# Build arguments
ARG TRAEFIK_VERSION=2.10.7

# Set architecture environment from container
RUN apt update && apt install -y curl tar gzip sqlite3 \
  && export ARCH=$(dpkg --print-architecture) \
  && echo "Detected architecture: $ARCH" \
  && curl -L "https://github.com/traefik/traefik/releases/download/v${TRAEFIK_VERSION}/traefik_v${TRAEFIK_VERSION}_linux_${ARCH}.tar.gz" \
  | tar -xz -C /usr/local/bin traefik \
  && chmod +x /usr/local/bin/traefik


WORKDIR /app

# Set environment for production
ENV NODE_ENV=production

# Copy Prisma schema
COPY --from=builder /app/backend/src/prisma/schema.prisma ./backend/src/prisma/schema.prisma

# Install only production dependencies
COPY backend/package.json backend/package-lock.json ./backend/
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm install --prefix backend --only=production && npm install --prefix frontend --only=production

# Copy backend build
COPY --from=builder /app/backend/dist/ ./backend/dist/

# Copy frontend build
COPY --from=builder /app/frontend/build/ ./frontend/build/

# (Optional) Copy root package.json if needed
COPY package.json ./

# Expose Traefik default port
EXPOSE 80

# Start services
CMD traefik & \
    node backend/dist/server.js & \
    npx serve -s frontend/build -l 3005
