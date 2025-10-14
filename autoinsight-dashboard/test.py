import os

# Root path (replace with your repo root if needed)
root_dir = "databridge-one-ai-analytics-dashboard"  # change this to your repo path

# Dockerfile content
dockerfile_content = """\
# Step 1: Build React app
FROM node:20-alpine AS builder
WORKDIR /app
COPY autoinsight-dashboard/package.json autoinsight-dashboard/package-lock.json ./
RUN npm install
COPY autoinsight-dashboard/ ./
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
"""

# docker-compose.yml content
docker_compose_content = """\
version: '3.8'
services:
  autoinsight-dashboard:
    build: .
    ports:
      - "80:80"
"""

# nginx.conf content (SPA routing)
nginx_conf_content = """\
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri /index.html;
    }
}
"""

# Files to create
files_to_create = {
    "Dockerfile": dockerfile_content,
    "docker-compose.yml": docker_compose_content,
    "nginx.conf": nginx_conf_content,
}

# Create files
for filename, content in files_to_create.items():
    path = os.path.join(root_dir, filename)
    with open(path, "w") as f:
        f.write(content)
    print(f"Created: {path}")

print("\n✅ Docker files created in the root directory!")
