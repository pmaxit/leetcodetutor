# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
# Build arguments for client-side environment variables
ARG VITE_TLDRAW_LICENSE_KEY
ENV VITE_TLDRAW_LICENSE_KEY=$VITE_TLDRAW_LICENSE_KEY
RUN npm run build

# Stage 2: Run the server
FROM node:20-alpine
WORKDIR /app

# Copy root package.json and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy server code
COPY server/ ./server/

# Copy system design solutions
COPY hellointerview-system-design/ ./hellointerview-system-design/

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/client/dist ./client/dist

# Set environment to production
ENV NODE_ENV=production
# Default port for Cloud Run
ENV PORT=8080
# Disable tool calling by default (prevents OpenRouter errors on non-tool models)
ENV LLM_ENABLE_TOOLS=false

# Expose the port (informative for local use)
EXPOSE 8080

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the server
CMD ["node", "server/index.js"]
