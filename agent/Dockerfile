FROM node:22-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code and configs
COPY src ./src
COPY drizzle ./drizzle
COPY drizzle.config.ts ./
COPY migrate.ts ./
COPY test-apis.ts ./
COPY run-kayak.ts ./

# Build TypeScript
RUN npm run build

# Expose port (not actually needed for this agent, but kept for compatibility)
EXPOSE 3141

# Start the agent (runs migrations then starts)
CMD ["sh", "-c", "npm run db:migrate && npm run dev"]
