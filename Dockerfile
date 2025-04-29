# -------- Stage 1: Backend Build --------
FROM node:20 AS backend-builder

WORKDIR /app/backend

# Set environment to production
ENV NODE_ENV=production

# Copy backend package files and install dependencies
COPY backend/package.json backend/package-lock.json ./
RUN npm install --only=production

# Copy backend source code
COPY backend/ ./

# Build backend TypeScript
RUN npm run build

# Generate Prisma Client
RUN npm run prisma:generate


# -------- Stage 2: Frontend Build --------
FROM node:20 AS frontend-builder

WORKDIR /app/frontend

# Set environment to production
ENV NODE_ENV=production

# Copy frontend package files and install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --only=production

# Copy frontend source code
COPY frontend/ ./

# Build frontend (Svelte / Vite)
RUN npm run build


# -------- Stage 3: Production Runner --------
FROM node:20

# Install system tools needed
RUN apt update && apt install -y traefik sqlite3

WORKDIR /app

# Set environment for production at runtime
ENV NODE_ENV=production

# Copy backend build and necessary files
COPY --from=backend-builder /app/backend/dist/ ./backend/dist/
COPY --from=backend-builder /app/backend/package.json ./backend/package.json
COPY --from=backend-builder /app/backend/node_modules/ ./backend/node_modules/
COPY --from=backend-builder /app/backend/prisma/ ./backend/prisma/

# Copy frontend build
COPY --from=frontend-builder /app/frontend/build/ ./frontend/build/
COPY --from=frontend-builder /app/frontend/package.json ./frontend/package.json
COPY --from=frontend-builder /app/frontend/node_modules/ ./frontend/node_modules/

# (Optional) Copy root package.json if you use global scripts
COPY package.json ./

# Expose Traefik default port
EXPOSE 80

# Start services
CMD traefik & \
    node backend/dist/server.js & \
    npx serve -s frontend/build -l 3005
