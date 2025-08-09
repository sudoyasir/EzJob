# Deployment Guide

This guide covers deploying EzJob to various platforms including Netlify, Vercel, and other hosting providers.

## 🚀 Quick Deployment Options

### Option 1: Netlify (Recommended)

EzJob is pre-configured for Netlify deployment with included `netlify.toml` configuration.

#### One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/ezjob)

#### Manual Deployment

1. **Build the project:**
```bash
npm run build
```

2. **Deploy via Netlify CLI:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

3. **Environment Variables:**
   - Go to Site Settings → Environment Variables
   - Add the following variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Option 2: Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
# Login to Vercel
vercel login

# Deploy project
vercel --prod
```

3. **Configure environment variables:**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Option 3: GitHub Pages

1. **Create deployment workflow:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build project
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

2. **Configure repository secrets:**
   - Go to Settings → Secrets and Variables → Actions
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## 🔧 Pre-Deployment Configuration

### 1. Environment Setup

Create production environment file:

```bash
# .env.production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_APP_URL=https://your-domain.com
VITE_ENVIRONMENT=production
```

### 2. Build Configuration

Update `vite.config.ts` for production:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable in production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['recharts'],
          auth: ['@supabase/supabase-js']
        }
      }
    }
  },
  preview: {
    port: 4173,
    host: true
  }
});
```

### 3. Netlify Configuration

The included `netlify.toml` provides:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## 🗄️ Database Deployment

### Supabase Setup

1. **Create Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Run migrations:**
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

3. **Configure authentication:**
   - Enable email authentication
   - Configure OAuth providers (Google, GitHub)
   - Set up email templates
   - Configure redirect URLs

4. **Set up storage:**
   - Create `documents` bucket
   - Configure storage policies
   - Set up file upload limits

### Database Configuration

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Set up Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Configure storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);
```

## 🌐 Domain & SSL Configuration

### Custom Domain Setup

#### Netlify
1. Go to Domain Settings
2. Add custom domain
3. Configure DNS records:
```
Type: CNAME
Name: www
Value: your-site.netlify.app

Type: A
Name: @
Value: 75.2.60.5
```

#### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.61
```

### SSL Certificate

Most platforms provide automatic SSL certificates:
- **Netlify**: Automatic Let's Encrypt certificates
- **Vercel**: Automatic SSL for all domains
- **Cloudflare**: Additional SSL/CDN layer

## 🔒 Security Hardening

### 1. Environment Security

```bash
# Use secrets management for sensitive data
# Never commit .env files to version control

# .gitignore
.env
.env.local
.env.production
.env.staging
```

### 2. Content Security Policy

```typescript
// Update security headers in deployment
const securityHeaders = {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self' https://${process.env.VITE_SUPABASE_URL?.replace('https://', '')} wss://${process.env.VITE_SUPABASE_URL?.replace('https://', '')};
    frame-ancestors 'none';
  `.replace(/\s+/g, ' ').trim(),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

### 3. Auth Configuration

```typescript
// Supabase auth settings for production
const authConfig = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  flowType: 'pkce', // More secure than implicit flow
  storage: window.localStorage, // Consider secure storage alternatives
  storageKey: 'ezjob-auth-token',
  debug: false // Disable in production
};
```

## 📊 Monitoring & Analytics

### 1. Error Tracking

```typescript
// Integrate error tracking service
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new Sentry.BrowserTracing(),
    ],
    tracesSampleRate: 1.0,
    environment: import.meta.env.VITE_ENVIRONMENT,
  });
}
```

### 2. Performance Monitoring

```typescript
// Web Vitals tracking
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

const sendToAnalytics = (metric: any) => {
  // Send to your analytics service
  console.log(metric);
};

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onFCP(sendToAnalytics);
onLCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

### 3. Analytics Setup

```typescript
// Google Analytics 4
declare global {
  interface Window {
    gtag: any;
  }
}

export const initAnalytics = () => {
  if (import.meta.env.PROD && import.meta.env.VITE_GA_MEASUREMENT_ID) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.gtag = function() {
      // eslint-disable-next-line prefer-rest-params
      (window as any).dataLayer?.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID);
  }
};
```

## 🚨 Health Checks & Monitoring

### 1. Health Check Endpoint

```typescript
// src/utils/healthCheck.ts
export const healthCheck = async (): Promise<HealthStatus> => {
  const checks = {
    database: false,
    storage: false,
    auth: false
  };

  try {
    // Test database connection
    const { error: dbError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    checks.database = !dbError;

    // Test storage access
    const { error: storageError } = await supabase.storage
      .from('documents')
      .list('', { limit: 1 });
    checks.storage = !storageError;

    // Test auth service
    const { error: authError } = await supabase.auth.getSession();
    checks.auth = !authError;

  } catch (error) {
    console.error('Health check failed:', error);
  }

  return {
    status: Object.values(checks).every(Boolean) ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  };
};
```

### 2. Uptime Monitoring

Set up monitoring services:
- **UptimeRobot**: Free uptime monitoring
- **Pingdom**: Comprehensive monitoring
- **StatusPage**: Public status page

## 📦 Deployment Checklist

Before deploying to production:

### Pre-deployment
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] Build process completes without errors
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Storage buckets configured
- [ ] Auth providers set up

### Security
- [ ] Security headers configured
- [ ] SSL certificate active
- [ ] Environment secrets secured
- [ ] CORS settings configured
- [ ] Rate limiting enabled
- [ ] Content Security Policy set

### Performance
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Caching headers set
- [ ] CDN configured (if applicable)
- [ ] Lazy loading implemented
- [ ] Code splitting configured

### Monitoring
- [ ] Error tracking configured
- [ ] Analytics set up
- [ ] Health checks implemented
- [ ] Uptime monitoring active
- [ ] Performance monitoring enabled

### Post-deployment
- [ ] Functionality testing
- [ ] Performance testing
- [ ] Security testing
- [ ] Mobile testing
- [ ] Cross-browser testing
- [ ] Backup strategy verified

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linting
      run: npm run lint
    
    - name: Type check
      run: npm run type-check

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build project
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
    
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v2
      with:
        publish-dir: './dist'
        production-branch: main
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: 'Deploy from GitHub Actions'
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

This deployment guide ensures your EzJob application is properly configured, secure, and monitored in production environments.
