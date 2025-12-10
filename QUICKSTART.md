# Recho - Quick Start Guide

Get your social music platform up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or Neon/Supabase account)
- Google Cloud account (for OAuth & YouTube)
- Spotify Developer account (optional)
- Cloudinary account (optional)

## Quick Setup (5 minutes)

### 1. Clone and Install

```bash
cd "d:\New folder\recho"
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
copy .env.example .env.local
```

### 3. Setup Database

Update `DATABASE_URL` in `.env.local` with your PostgreSQL connection string.

Run migrations:

```bash
npm run db:migrate
npm run db:seed
```

### 4. Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable APIs:
   - Google+ API
   - YouTube Data API v3
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret to `.env.local`:

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

### 5. Generate NextAuth Secret

```bash
# Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add to `.env.local`:

```env
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### 6. Start the Application

```bash
npm run dev
```

Visit `http://localhost:3000` and sign in with Google!

## Optional Integrations

### Spotify (for playlist import)

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create an app
3. Add redirect URI: `http://localhost:3000/api/spotify/callback`
4. Add credentials to `.env.local`:

```env
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
```

### YouTube API Key

1. In Google Cloud Console, go to "Credentials"
2. Create API Key
3. Add to `.env.local`:

```env
YOUTUBE_API_KEY=your-youtube-api-key
```

### Cloudinary (for image uploads)

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Get credentials from dashboard
3. Add to `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Testing the Application

### 1. Sign In
- Visit `http://localhost:3000`
- Click "Continue with Google"
- Authorize the application

### 2. Test Recommendations
- The home page shows personalized recommendations
- Click on any song to play it
- Your listening history is automatically tracked

### 3. Add Friends
- Click the friends icon in the sidebar
- Search for users by email
- Send friend requests

### 4. Real-time Chat
- Accept friend requests
- See friends online/offline status
- Click on a friend to open chat
- Send messages in real-time

### 5. Import Playlists (Optional)
- Go to Settings
- Connect Spotify or YouTube
- Click "Import Playlists"
- Your playlists will sync automatically

## Features Overview

### ✅ Completed Features

1. **Authentication**
   - Google OAuth login
   - Protected routes
   - Session management

2. **Music Recommendations**
   - Graph-based algorithm
   - Genre/Artist preferences
   - Friend influence
   - Play history analysis

3. **Real-time Social**
   - Online/offline status
   - Friend management
   - Live chat with typing indicators
   - Music activity broadcasting

4. **Database**
   - PostgreSQL schema
   - User activity tracking
   - Song likes
   - Play history with duration

5. **External Integrations**
   - Spotify API (playlist import)
   - YouTube API (playlist import)
   - Cloudinary (media storage)

6. **State Management**
   - Zustand stores for chat, friends, player
   - Socket.io integration
   - Real-time updates

### 🚧 Features to Complete

1. **Service Workers** (Offline support)
2. **WebRTC** (P2P streaming)
3. **Search** (Song/Artist/Playlist search)
4. **Playlist Management UI**
5. **Friend Activity Feed**
6. **Enhanced Music Player** (Waveform, lyrics)
7. **API Routes** (Full REST API)

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  ┌─────────────────────────────────────────┐   │
│  │  Next.js 16 + React 19 + TailwindCSS    │   │
│  │  - Server Components                     │   │
│  │  - Client Components with Zustand        │   │
│  │  - Socket.io Client                      │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                       ↕
┌─────────────────────────────────────────────────┐
│                  Backend                         │
│  ┌─────────────────────────────────────────┐   │
│  │  Next.js API Routes                      │   │
│  │  Custom Socket.io Server (server.js)     │   │
│  │  NextAuth Authentication                 │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                       ↕
┌─────────────────────────────────────────────────┐
│                 Database                         │
│  ┌─────────────────────────────────────────┐   │
│  │  PostgreSQL (Neon)                       │   │
│  │  - Users, Songs, Playlists               │   │
│  │  - History, Likes, Messages              │   │
│  │  - Friendships, User Activity            │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                       ↕
┌─────────────────────────────────────────────────┐
│              External Services                   │
│  - Spotify API (Music Import)                   │
│  - YouTube API (Video Import)                   │
│  - Cloudinary (Media Storage)                   │
└─────────────────────────────────────────────────┘
```

## Development Tips

### Running Development Server

```bash
# Full stack with Socket.io
npm run dev

# Next.js only (no real-time features)
npm run dev:next
```

### Database Operations

```bash
# Reset database (WARNING: Deletes all data)
npm run db:migrate

# Add sample data
npm run db:seed
```

### Debugging Socket.io

1. Open browser DevTools
2. Go to Network tab
3. Filter by "WS" (WebSocket)
4. Check Socket.io connection status
5. Monitor events in Console

### Debugging Recommendations

The recommendation algorithm is in [src/lib/recommendation.js](src/lib/recommendation.js:1-222):

```javascript
// Add logging to see scoring
console.log('Recommendation scores:', recommendations);
```

## Common Issues

### "Module not found" errors
```bash
npm install
```

### Socket.io not connecting
- Ensure `server.js` is running (use `npm run dev`)
- Check `NEXT_PUBLIC_SOCKET_URL` in `.env.local`

### Database errors
- Verify `DATABASE_URL` is correct
- Run `npm run db:migrate`

### OAuth redirect errors
- Check redirect URIs in Google Console match exactly
- Ensure `NEXTAUTH_URL` is set correctly

## Next Steps

1. **Complete the UI**
   - Create search page
   - Build playlist management
   - Add friend activity feed

2. **Implement API Routes**
   - See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for full API list

3. **Add Service Workers**
   - Create `public/sw.js`
   - Enable offline playback

4. **Setup WebRTC**
   - Implement peer connections
   - Synchronous listening sessions

5. **Enhance Player**
   - HTML5 Audio integration
   - Waveform visualization
   - Lyrics display

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.io Documentation](https://socket.io/docs/)
- [NextAuth Documentation](https://next-auth.js.org/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [YouTube Data API](https://developers.google.com/youtube/v3)

## Support

Need help? Check:
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Full documentation
- GitHub Issues - Report bugs
- Community Discord - Get help from others

## License

MIT License - See LICENSE file
