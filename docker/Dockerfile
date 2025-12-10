# Stage 1: Build the frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the frontend
RUN npm run build

# Stage 2: Runtime with Java and Node.js
FROM eclipse-temurin:21-jre

# Install Node.js in the runtime image
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy backend JAR
COPY api-server/target/uberjar/beat-link-api-standalone.jar ./api-server/

# Copy Node.js server files
COPY server.js ./
COPY package*.json ./

# Install only production dependencies for Node.js server
RUN npm ci --only=production

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Expose the frontend port
EXPOSE 8080

# Use entrypoint script to start both services
ENTRYPOINT ["./docker-entrypoint.sh"]

