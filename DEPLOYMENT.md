# Deployment Guide

## Overview
This document provides comprehensive instructions for deploying the Roger Lee Cormier Portfolio application to various environments.

## 🚀 Quick Deployment

### **Prerequisites**
- Node.js 18+ installed
- Git repository access
- Cloudflare account (for production)
- Environment variables configured

### **One-Command Deployment**
```bash
# Build and deploy everything
npm run deploy
```

## 🌐 Production Deployment (Cloudflare Pages)

### **1. Build the Application**
```bash
# Build frontend
npm run build

# Build backend (if needed)
npm run build:backend
```

### **2. Configure Cloudflare Pages**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **Create a project**
3. Connect your GitHub repository
4. Configure build settings:

```bash
# Build command
npm run build

# Build output directory
dist

# Root directory
/
```

### **3. Environment Variables**
Set these in Cloudflare Pages dashboard:

```bash
# Production environment
NODE_ENV=production
JWT_SECRET=your-production-secret-key
CORS_ORIGINS=https://yourdomain.com
```

### **4. Deploy**
- Push to main branch triggers automatic deployment
- Monitor deployment in Cloudflare dashboard
- Verify site is accessible at your custom domain

## 🏠 Local Development Deployment

### **1. Development Environment**
```bash
# Install dependencies
npm install

# Start development servers
npm run dev              # Both frontend and backend
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only
```

### **2. Environment Configuration**
Create `.env` file:
```bash
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### **3. Access URLs**
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **API**: http://localhost:3001/api

## 🐳 Docker Deployment

### **1. Create Dockerfile**
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### **2. Docker Compose**
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
  
  backend:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
```

### **3. Deploy with Docker**
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 Build Configuration

### **Frontend Build**
```bash
# Development build
npm run build:dev

# Production build
npm run build

# Preview build
npm run preview
```

### **Backend Build**
```bash
# Development
npm run dev:backend

# Production
npm run build:backend
npm start
```

### **Build Scripts**
```json
{
  "scripts": {
    "build": "tsc -b && vite build",
    "build:dev": "vite build --mode development",
    "build:backend": "cd server && npm run build",
    "deploy": "npm run build && npm run build:backend"
  }
}
```

## 🌍 Environment Configuration

### **Development**
```bash
NODE_ENV=development
PORT=3001
JWT_SECRET=dev-secret-key
CORS_ORIGINS=http://localhost:5173
```

### **Staging**
```bash
NODE_ENV=staging
PORT=3001
JWT_SECRET=staging-secret-key
CORS_ORIGINS=https://staging.yourdomain.com
```

### **Production**
```bash
NODE_ENV=production
PORT=3001
JWT_SECRET=production-secret-key
CORS_ORIGINS=https://yourdomain.com
```

## 🔒 Security Configuration

### **JWT Configuration**
```javascript
// server/middleware/auth.js
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '24h',
  algorithm: 'HS256'
};
```

### **CORS Configuration**
```javascript
// server/index.js
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### **Rate Limiting**
```javascript
// server/middleware/rateLimit.js
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
};
```

## 📊 Monitoring & Logging

### **Application Logs**
```javascript
// server/index.js
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  ]
});
```

### **Health Checks**
```javascript
// server/routes/health.js
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

## 🚨 Troubleshooting

### **Common Issues**

#### **Build Failures**
```bash
# Clear build cache
rm -rf dist/ node_modules/.vite

# Reinstall dependencies
npm install

# Check TypeScript errors
npm run type-check
```

#### **Deployment Issues**
```bash
# Check build output
ls -la dist/

# Verify environment variables
echo $NODE_ENV
echo $JWT_SECRET

# Check server logs
npm run dev:backend
```

#### **Performance Issues**
```bash
# Analyze bundle size
npm run build:analyze

# Check Lighthouse scores
# Use browser DevTools Performance tab
```

### **Debug Commands**
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check environment
echo $NODE_ENV

# Test API endpoints
curl http://localhost:3001/health
```

## 📈 Performance Optimization

### **Frontend Optimization**
- **Code splitting**: Route-based and component-based
- **Tree shaking**: Remove unused code
- **Image optimization**: WebP format, responsive images
- **Caching**: Service worker, browser caching

### **Backend Optimization**
- **Compression**: Gzip/Brotli compression
- **Caching**: Redis, in-memory caching
- **Database**: Connection pooling, query optimization
- **Load balancing**: Multiple server instances

### **CDN Configuration**
```javascript
// Cloudflare Pages settings
{
  "cache": {
    "static": "1 year",
    "api": "no-cache"
  },
  "compression": "brotli",
  "minify": {
    "html": true,
    "css": true,
    "js": true
  }
}
```

## 🔄 CI/CD Pipeline

### **GitHub Actions**
```yaml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: your-project-name
          directory: dist
```

### **Automated Testing**
```yaml
- name: Run tests
  run: |
    npm run lint
    npm run type-check
    npm run test
```

## 📚 Additional Resources

### **Documentation**
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions](https://docs.github.com/en/actions)

### **Tools**
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Next Review**: March 2025
