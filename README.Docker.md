# Docker Setup Guide - Dock Management System

## 🚀 Quick Start

### 1. Build và chạy Production

```bash
# Build image
docker-compose build

# Chạy container
docker-compose up -d

# Xem logs
docker-compose logs -f

# Truy cập ứng dụng
# http://localhost:3000
```

### 2. Development Mode (Optional)

Uncomment phần `dock-management-dev` trong `docker-compose.yml` và chạy:

```bash
docker-compose up dock-management-dev
```

## 📦 Docker Commands

### Build & Deploy

```bash
# Build image mới
docker-compose build --no-cache

# Chạy container
docker-compose up -d

# Stop containers
docker-compose down

# Stop và xóa volumes
docker-compose down -v

# Restart containers
docker-compose restart
```

### Monitoring

```bash
# Xem logs
docker-compose logs -f dock-management-frontend

# Xem resource usage
docker stats dock-management-app

# Health check
docker inspect --format='{{.State.Health.Status}}' dock-management-app
```

### Debugging

```bash
# Vào container
docker exec -it dock-management-app sh

# Xem nginx config
docker exec dock-management-app cat /etc/nginx/conf.d/default.conf

# Test nginx config
docker exec dock-management-app nginx -t
```

## 🔧 Environment Variables

Tạo file `.env` để cấu hình:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api

# App Configuration
VITE_APP_TITLE=Dock Management System
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
```

## 🌐 Nginx Configuration

File `nginx.conf` được tối ưu cho:
- ✅ React Router (SPA routing)
- ✅ Gzip compression
- ✅ Static asset caching
- ✅ Security headers
- ✅ Health check endpoint

## 📊 Container Info

- **Image Size**: ~50MB (Alpine-based)
- **Port**: 3000:80
- **Health Check**: Every 30s
- **Restart Policy**: unless-stopped

## 🔐 Security Best Practices

1. Không commit `.env` files
2. Sử dụng secrets cho production
3. Regular update base images
4. Scan images cho vulnerabilities:

```bash
docker scan dock-management-app
```

## 🚢 Production Deployment

### Docker Hub

```bash
# Tag image
docker tag dock-management-app your-dockerhub/dock-management:latest

# Push to Docker Hub
docker push your-dockerhub/dock-management:latest
```

### Docker Registry (Private)

```bash
# Tag cho private registry
docker tag dock-management-app registry.yourdomain.com/dock-management:1.0.0

# Push
docker push registry.yourdomain.com/dock-management:1.0.0
```

## 🐛 Troubleshooting

### Container không start

```bash
# Check logs
docker logs dock-management-app

# Check ports
netstat -ano | findstr :3000
```

### Build failed

```bash
# Clean build cache
docker builder prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Performance issues

```bash
# Increase memory limit
docker-compose up -d --memory="2g"
```

## 📝 Notes

- Multi-stage build để giảm image size
- Alpine Linux base image (lightweight)
- Nginx serving static files (fast & efficient)
- Health checks enabled
- Production-ready configuration
