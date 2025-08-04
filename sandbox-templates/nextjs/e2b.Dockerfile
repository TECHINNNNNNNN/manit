# You can use most Debian-based base images
FROM python:3.11-slim

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy the startup script
COPY compile_page.sh /compile_page.sh
RUN chmod +x /compile_page.sh

# Create the working directory
WORKDIR /home/user

# Create a simple index.html as a placeholder (will be replaced by AI)
RUN echo '<!DOCTYPE html><html><body><h1>Linktree Generator Ready</h1></body></html>' > index.html
