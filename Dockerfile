# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose the port your app will run on
EXPOSE 5000

# Optional: set default environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["node", "server.js"]
