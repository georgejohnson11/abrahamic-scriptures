# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json* ./

# Install dependencies
RUN npm install

# Copy source files
COPY src ./src
COPY index.html .
COPY vite.config.js .
COPY db ./db
COPY server.js .

# Build frontend
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package.json* ./

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
