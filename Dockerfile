# Step 1: Build React app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all files and build
COPY . .
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy build from previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: add custom nginx config if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
