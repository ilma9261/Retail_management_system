FROM node:20-alpine

WORKDIR /app

# Copy package manifests
COPY package*.json ./
RUN npm ci --only=production

# Copy source code and database assets
COPY src/ ./src/
COPY database/ ./database/
COPY .env ./

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "src/server.js"]
