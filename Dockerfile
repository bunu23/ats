FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Copy application source code
COPY . .

# Disable telemetry during the build
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create the data directory and set permissions for the non-root user
RUN mkdir -p /app/data && chown -R node:node /app/data

# Copy built application and necessary runtime files from the builder stage
COPY --from=builder --chown=node:node /app/package.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/src ./src
COPY --from=builder --chown=node:node /app/worker.js ./worker.js

# Switch to non-root user
USER node

# Expose the listening port
EXPOSE 3000

# Next.js sets PORT to 3000 by default
ENV PORT=3000

# The command will be overridden by docker-compose for the worker service
CMD ["npm", "start"]
