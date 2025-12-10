# Recho Deployment Guide

## Quick Deploy to Vercel (Recommended)

Vercel is the best platform for Next.js apps with zero configuration needed.

### 1. Prerequisites

- GitHub/GitLab/Bitbucket account
- Vercel account (free tier available)
- PostgreSQL database (Neon, Supabase, or Railway)

### 2. Prepare Your Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - ready for deployment"

# Create a new repository on GitHub and push
git remote add origin https://github.com/yourusername/recho.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel

**Option A: Using Vercel CLI (Fastest)**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: recho
# - Directory: ./
# - Override settings? No

# Set environment variables (interactive)
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
# ... add all other env variables

# Deploy to production
vercel --prod
```

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js
5. Add environment variables (see below)
6. Click "Deploy"

### 4. Environment Variables for Production

Add these in Vercel Dashboard → Project Settings → Environment Variables:

```env
# Database (Use production database URL)
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<generate-new-secret-for-production>

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Spotify (optional)
SPOTIFY_CLIENT_ID=<your-spotify-client-id>
SPOTIFY_CLIENT_SECRET=<your-spotify-client-secret>
SPOTIFY_REDIRECT_URI=https://your-app.vercel.app/api/spotify/callback

# YouTube (optional)
YOUTUBE_API_KEY=<your-youtube-api-key>

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# Socket.io
NEXT_PUBLIC_SOCKET_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 5. Update OAuth Redirect URIs

**Google Cloud Console:**
- Add: `https://your-app.vercel.app/api/auth/callback/google`

**Spotify Dashboard:**
- Add: `https://your-app.vercel.app/api/spotify/callback`

### 6. Database Setup

Run migrations on your production database:

```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://..."

# Run migrations
npm run db:migrate

# Optional: Seed with initial data
npm run db:seed
```

### 7. Deploy!

```bash
git add .
git commit -m "Configure for production"
git push origin main

# Vercel will auto-deploy on push
```

Your app will be live at: `https://your-app.vercel.app`

---

## Alternative: Deploy to Railway

Railway is great for full-stack apps with built-in PostgreSQL.

### 1. Setup

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to a new project
railway link
```

### 2. Add PostgreSQL Database

```bash
# Add PostgreSQL plugin
railway add

# Select PostgreSQL
# Railway will automatically set DATABASE_URL
```

### 3. Deploy

```bash
# Deploy
railway up

# Set environment variables
railway variables set NEXTAUTH_SECRET=<your-secret>
railway variables set GOOGLE_CLIENT_ID=<your-id>
# ... set all other variables

# Open in browser
railway open
```

---

## Alternative: Deploy to Render

Render is another good option with free tier.

### 1. Create render.yaml

```yaml
services:
  - type: web
    name: recho
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: NEXTAUTH_SECRET
        sync: false
      - key: NEXTAUTH_URL
        value: https://recho.onrender.com
      - key: NODE_VERSION
        value: 18
```

### 2. Deploy

1. Push to GitHub
2. Go to [render.com](https://render.com)
3. "New Web Service"
4. Connect repository
5. Add environment variables
6. Deploy

---

## Socket.io Deployment Notes

⚠️ **Important**: Socket.io requires persistent connections, which have limitations on serverless platforms.

### Options:

**1. Use Vercel with External WebSocket Server**

Deploy Socket.io server separately on Railway/Render and point `NEXT_PUBLIC_SOCKET_URL` to it.

**2. Use Pusher/Ably (Managed Solution)**

Replace Socket.io with a managed WebSocket service:
- [Pusher Channels](https://pusher.com/channels)
- [Ably](https://ably.com)

**3. Use Railway/Render (Persistent Connections)**

Deploy the entire app on Railway/Render which supports WebSockets natively.

---

## Database Options

### Neon (Recommended)

Free serverless PostgreSQL with excellent Vercel integration.

1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Add to Vercel environment variables

### Supabase

Free PostgreSQL with built-in auth and storage.

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string (connection pooling)
5. Add to Vercel environment variables

### Railway PostgreSQL

Included with Railway deployment.

```bash
railway add
# Select PostgreSQL
# DATABASE_URL is automatically set
```

---

## Post-Deployment Checklist

- [ ] App loads successfully
- [ ] Google OAuth works
- [ ] Database connection works
- [ ] Environment variables are set
- [ ] OAuth redirect URIs are updated
- [ ] Socket.io connects (or alternative configured)
- [ ] Database migrations run
- [ ] SSL/HTTPS is enabled
- [ ] Custom domain configured (optional)

---

## Vercel Configuration (vercel.json)

Create `vercel.json` in root:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SOCKET_URL": "@socket_url",
    "NEXT_PUBLIC_APP_URL": "@app_url"
  }
}
```

---

## Monitoring & Debugging

### Vercel Logs

```bash
vercel logs <deployment-url>
```

### Check Build Logs

Go to Vercel Dashboard → Deployments → Click on deployment → View logs

### Common Issues

**1. "Module not found" errors**
```bash
# Ensure all dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

**2. Database connection fails**
```bash
# Check DATABASE_URL format
# Ensure ?sslmode=require for cloud databases
# Verify IP whitelist (Neon/Supabase)
```

**3. OAuth redirect errors**
```bash
# Verify NEXTAUTH_URL matches your domain
# Update OAuth redirect URIs in provider consoles
# Ensure HTTPS is used (not HTTP)
```

---

## Performance Optimization

### 1. Enable Edge Runtime (Optional)

```typescript
// src/app/layout.tsx
export const runtime = 'edge';
```

### 2. Add Caching Headers

```typescript
// next.config.ts
export default {
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=120' }
      ]
    }
  ]
};
```

### 3. Enable Compression

Already enabled by default in Vercel.

---

## Custom Domain

### Vercel

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. SSL is automatic

### Update Environment Variables

```bash
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com
```

---

## Rollback

### Vercel

```bash
# List deployments
vercel ls

# Promote a specific deployment to production
vercel promote <deployment-url>
```

### Railway

```bash
railway status
railway rollback
```

---

## Cost Estimates

### Free Tier Options:

- **Vercel**: Free (Hobby plan)
  - 100GB bandwidth/month
  - Unlimited deployments
  - No custom domain limit

- **Neon**: Free
  - 0.5GB storage
  - 1 project
  - Serverless PostgreSQL

- **Railway**: $5/month credit
  - Can run small apps for free

### Recommended Setup (Free):

- Vercel (hosting)
- Neon (database)
- Cloudinary (images, free tier)
- Pusher (WebSockets, free tier)

**Total: $0/month** ✨

---

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Neon Documentation](https://neon.tech/docs)
- [Socket.io with Serverless](https://socket.io/docs/v4/serverless/)

---

**You're ready to deploy! 🚀**

Choose your platform and follow the steps above.
