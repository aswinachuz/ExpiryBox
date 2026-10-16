# -------------------------------------------------------------
# ExpiryBox Multi-Stage Production Dockerfile
# Builds the Vite React PWA and packages the Node.js Express API
# -------------------------------------------------------------

# Step 1: Build the React PWA Client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Step 2: Production Server Runner
FROM node:20-alpine
WORKDIR /app

# Install production dependencies for server
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --omit=dev

# Copy server application code
COPY server/ ./

# Copy compiled client assets into client/dist
COPY --from=client-builder /app/client/dist /app/client/dist

# Create persistent uploads directory
RUN mkdir -p /app/server/uploads

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.js"]
