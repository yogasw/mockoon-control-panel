# -------- Stage 1: Build Stage (Backend + Frontend) --------
FROM node:20 AS builder

WORKDIR /app

# Copy backend and frontend package files
COPY backend/package.json backend/package-lock.json ./backend/
COPY frontend/package.json frontend/package-lock.json ./frontend/

# Install all dependencies (dev + prod)
RUN npm install --prefix backend && npm install --prefix frontend

# Copy backend and frontend source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build backend (TypeScript) and frontend (Vite)
RUN npm run build --prefix backend
RUN npm run build --prefix frontend

# Generate Prisma Client
RUN npm run prisma:generate --prefix backend


# -------- Stage 2: Production Stage --------
FROM node:20

# Install system tools needed
RUN apt update && apt install -y traefik sqlite3

WORKDIR /app

# Set environment for production
ENV NODE_ENV=production

# Install only production dependencies
COPY backend/package.json backend/package-lock.json ./backend/
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm install --prefix backend --only=production && npm install --prefix frontend --only=production

# Copy backend build and Prisma schema
COPY --from=builder /app/backend/dist/ ./backend/dist/
COPY --from=builder /app/backend/prisma/ ./backend/prisma/

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
