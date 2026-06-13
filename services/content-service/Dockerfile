FROM node:20-alpine

# Install OpenSSL (Required for Prisma Client on Alpine Linux)
RUN apk add --no-cache openssl

WORKDIR /app

# Install package managers and TS runner
RUN npm install -g pnpm tsx

# Copy the entire monorepo context
COPY . .

# Install workspace dependencies
RUN pnpm install

# Generate Prisma Client bindings inside the container
RUN cd database && npx prisma generate

# Set the working directory to the specific microservice
WORKDIR /app/services/content-service

# Boot the service with hot-reloading
CMD ["npx", "tsx", "watch", "src/index.ts"]