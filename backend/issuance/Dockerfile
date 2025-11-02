FROM node:22-alpine AS builder

# Install yarn globally if not already included
RUN corepack enable && corepack prepare yarn@stable --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json .yarnrc.yml tsconfig*.json ./

# Install dependencies using yarn
RUN yarn install

# Copy the rest of the application files
COPY .env* ./
COPY src ./src
COPY tsconfig*.json ./
COPY vitest.config.ts ./

# Build the application
RUN yarn build

# Production stage
FROM node:22-alpine AS production

# Set working directory
WORKDIR /app

# Copy build output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/vitest.config.ts ./vitest.config.ts
COPY --from=builder /app/dist ./dist

# Create data directory for SQLite
RUN mkdir -p /app/data

# Expose the port the app runs on
EXPOSE 3001

# Start the application
CMD ["node", "dist/server.js"]
