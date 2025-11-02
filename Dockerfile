FROM node:22-alpine AS builder

# Install yarn globally if not already included
RUN corepack enable && corepack prepare yarn@stable --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies using yarn
RUN yarn install

# Copy the rest of the application files
COPY .env* ./
COPY index.html ./
COPY src ./src
COPY public ./public
COPY eslint.config.js ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY vitest.config.ts ./
COPY vitest.setup.ts ./

# Build the application
RUN yarn build

# Production stage
FROM nginx:alpine AS production

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose the port the app runs on
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]