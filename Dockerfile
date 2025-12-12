# Stage 1: Build ứng dụng React
FROM node:20-alpine AS builder

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci --silent

# Copy source code
COPY . .

# Build ứng dụng cho production
RUN npm run build

# Stage 2: Serve ứng dụng với Nginx
FROM nginx:alpine

# Copy file build từ stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration (nếu cần custom)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
