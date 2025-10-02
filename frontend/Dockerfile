# Frontend Dockerfile
FROM node:20-slim

# Install curl for health checks
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Update npm to latest version
RUN npm install -g npm@latest

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies with legacy peer deps to avoid conflicts
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Create non-root user and set up directories with proper permissions
RUN useradd -m -u 1001 appuser && \
    mkdir -p /app/.npm/_logs && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Set Vite host and port environment variables
ENV VITE_HOST=0.0.0.0
ENV VITE_PORT=5173

EXPOSE 5173

# Start Vite with host flag to allow external connections
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]