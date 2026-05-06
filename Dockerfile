# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Run the server
FROM node:20-alpine
WORKDIR /app

# Copy root package.json and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy server code
COPY server/ ./server/

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/client/dist ./client/dist

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3005

# Expose the port the app runs on
EXPOSE 3005

# Start the server
CMD ["npm", "start"]
