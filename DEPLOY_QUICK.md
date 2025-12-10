# Quick Deploy to Vercel

## 1. Install Vercel CLI

```bash
npm install -g vercel
```

## 2. Login to Vercel

```bash
vercel login
```

## 3. Deploy

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N**
- What's your project's name? **recho**
- In which directory is your code located? **./**
- Want to modify settings? **N**

## 4. Set Environment Variables

**Important**: The `vercel env add` command is interactive. Run each command one at a time, and paste the value when prompted.

### Required Variables

```bash
# 1. Database URL
vercel env add DATABASE_URL production
# When prompted, paste your PostgreSQL URL (e.g., from Neon)
# Example format: postgresql://user:pass@host.neon.tech/db?sslmode=require

# 2. NextAuth Secret (generate one first: openssl rand -base64 32)
vercel env add NEXTAUTH_SECRET production
# When prompted, paste the generated secret

# 3. NextAuth URL
vercel env add NEXTAUTH_URL production
# When prompted, paste your deployment URL: https://recho-lake.vercel.app

# 4. Google OAuth Client ID
vercel env add GOOGLE_CLIENT_ID production
# When prompted, paste your Client ID from Google Cloud Console

# 5. Google OAuth Client Secret
vercel env add GOOGLE_CLIENT_SECRET production
# When prompted, paste your Client Secret from Google Cloud Console
```

### Optional Variables (for full features)

```bash
# Spotify Integration
vercel env add SPOTIFY_CLIENT_ID production
vercel env add SPOTIFY_CLIENT_SECRET production
vercel env add SPOTIFY_REDIRECT_URI production
# For redirect URI, use: https://your-app.vercel.app/api/spotify/callback

# YouTube Integration
vercel env add YOUTUBE_API_KEY production

# Cloudinary (Image/Media hosting)
vercel env add CLOUDINARY_CLOUD_NAME production
vercel env add CLOUDINARY_API_KEY production
vercel env add CLOUDINARY_API_SECRET production

# Public URLs for Socket.io
vercel env add NEXT_PUBLIC_SOCKET_URL production
# Use: https://your-app.vercel.app

vercel env add NEXT_PUBLIC_APP_URL production
# Use: https://your-app.vercel.app
```

**Alternative: Use Vercel Dashboard**

If you prefer a visual interface:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all variables at once

## 5. Update OAuth Redirect URIs

### Google Cloud Console
1. Go to https://console.cloud.google.com
2. Select your project
3. Go to APIs & Services → Credentials
4. Edit OAuth 2.0 Client ID
5. Add Authorized redirect URI:
   ```
   https://your-deployment.vercel.app/api/auth/callback/google
   ```

### Spotify Dashboard (if using)
1. Go to https://developer.spotify.com/dashboard
2. Edit your app
3. Add Redirect URI:
   ```
   https://your-deployment.vercel.app/api/spotify/callback
   ```

## 6. Run Database Migrations

```bash
# Connect to your production database
export DATABASE_URL="your-production-db-url"

# Run migrations
npm run db:migrate

# Optional: Add seed data
npm run db:seed
```

## 7. Deploy to Production

```bash
vercel --prod
```

## 8. Done! 🎉

Your app is now live at: `https://your-deployment.vercel.app`

## Troubleshooting

### Check Deployment Logs
```bash
vercel logs
```

### Redeploy
```bash
vercel --prod --force
```

### Check Environment Variables
```bash
vercel env ls
```

## Next Steps

- [ ] Test the deployed app
- [ ] Test Google OAuth login
- [ ] Verify database connection
- [ ] Add custom domain (optional)
- [ ] Set up monitoring

## Free Database Options

### Neon (Recommended)
1. Go to https://neon.tech
2. Create free project
3. Copy connection string
4. Use as DATABASE_URL

### Supabase
1. Go to https://supabase.com
2. Create free project
3. Get connection string from Settings → Database
4. Use as DATABASE_URL

Both offer free PostgreSQL hosting!
