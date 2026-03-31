# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy client and source files
COPY client ./client
COPY db ./db
COPY server.js .

# Build frontend
RUN npm run build:client

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm install --production

# Copy built frontend from builder
COPY --from=builder /app/dist ./dist

# Copy database files
COPY db ./db

# Copy server
COPY server.js .

EXPOSE 3001

CMD ["node", "server.js"]
