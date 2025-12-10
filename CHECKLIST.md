# Recho Setup Checklist

Use this checklist to ensure your platform is properly configured and running.

## ✅ Initial Setup

### 1. Environment Configuration
- [ ] Copied `.env.example` to `.env.local`
- [ ] Set `DATABASE_URL` (PostgreSQL connection string)
- [ ] Generated `NEXTAUTH_SECRET` (run: `openssl rand -base64 32`)
- [ ] Set `NEXTAUTH_URL` (http://localhost:3000)
- [ ] Created Google Cloud project
- [ ] Enabled Google+ API and YouTube Data API v3
- [ ] Created OAuth 2.0 credentials
- [ ] Set `GOOGLE_CLIENT_ID`
- [ ] Set `GOOGLE_CLIENT_SECRET`
- [ ] Added redirect URI: `http://localhost:3000/api/auth/callback/google`

### 2. Optional Services
- [ ] Created Spotify app (for playlist import)
- [ ] Set `SPOTIFY_CLIENT_ID`
- [ ] Set `SPOTIFY_CLIENT_SECRET`
- [ ] Set `SPOTIFY_REDIRECT_URI`
- [ ] Created YouTube API key
- [ ] Set `YOUTUBE_API_KEY`
- [ ] Created Cloudinary account (for images)
- [ ] Set `CLOUDINARY_CLOUD_NAME`
- [ ] Set `CLOUDINARY_API_KEY`
- [ ] Set `CLOUDINARY_API_SECRET`

### 3. Dependencies
- [ ] Ran `npm install`
- [ ] All packages installed successfully
- [ ] No vulnerability warnings (or acceptable)

### 4. Database
- [ ] PostgreSQL database created
- [ ] Database accessible from local machine
- [ ] Ran `npm run db:migrate`
- [ ] All tables created successfully
- [ ] Ran `npm run db:seed` (optional)
- [ ] Sample data loaded

### 5. First Run
- [ ] Ran `npm run dev`
- [ ] Server started on port 3000
- [ ] Socket.io connected
- [ ] Visited `http://localhost:3000`
- [ ] Redirected to signin page
- [ ] Clicked "Continue with Google"
- [ ] Successfully authenticated
- [ ] User profile created in database

## ✅ Testing Features

### Authentication
- [ ] Can sign in with Google
- [ ] Profile picture displayed
- [ ] Session persists on refresh
- [ ] Can sign out

### Recommendations
- [ ] Home page shows recommendations
- [ ] Recommendations update after listening
- [ ] "Recently Played" section works

### Friends
- [ ] Can search for users
- [ ] Can send friend request
- [ ] Can accept friend request
- [ ] Online status shows correctly
- [ ] Offline status shows correctly

### Chat
- [ ] Can open chat with friend
- [ ] Can send message
- [ ] Messages received in real-time
- [ ] Typing indicator works
- [ ] Unread count updates

### Music Player
- [ ] Player UI displays at bottom
- [ ] Can see current song info
- [ ] Play/pause button works
- [ ] Next/previous buttons work
- [ ] Volume slider visible

### Spotify Import (Optional)
- [ ] Can connect Spotify account
- [ ] Playlists imported successfully
- [ ] Songs added to database
- [ ] Duplicate songs handled

### YouTube Import (Optional)
- [ ] Can import YouTube playlists
- [ ] Videos imported as songs
- [ ] Thumbnails displayed

## ✅ Development Checklist

### Code Quality
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] No network errors in DevTools
- [ ] Socket.io connected (check Network → WS tab)

### Performance
- [ ] Home page loads < 2s
- [ ] Recommendations generate < 500ms
- [ ] Chat messages send < 100ms
- [ ] No memory leaks

### Security
- [ ] Environment variables not committed
- [ ] API keys not exposed to client
- [ ] Protected routes work
- [ ] Unauthorized access blocked

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] All features tested
- [ ] No critical bugs
- [ ] Production environment variables set
- [ ] Database migrations run on production DB
- [ ] SSL certificates configured
- [ ] Domain configured

### Build & Deploy
- [ ] `npm run build` succeeds
- [ ] No build errors
- [ ] Static pages generated
- [ ] API routes work
- [ ] Socket.io connects

### Post-Deployment
- [ ] Production site accessible
- [ ] Google OAuth works (update redirect URI)
- [ ] Database connection works
- [ ] Socket.io connects
- [ ] All features work in production

## 🐛 Troubleshooting

### Database Issues
**Problem**: "Connection refused" or "Database not found"
- [ ] Check `DATABASE_URL` is correct
- [ ] Check database is running
- [ ] Check network connectivity
- [ ] Check firewall rules

### Authentication Issues
**Problem**: "Callback URL mismatch"
- [ ] Check Google Console redirect URIs
- [ ] Check `NEXTAUTH_URL` matches
- [ ] Check protocol (http vs https)

### Socket.io Issues
**Problem**: "Socket not connecting"
- [ ] Check `server.js` is running (not just `next dev`)
- [ ] Check port 3000 is not blocked
- [ ] Check browser DevTools Network → WS tab
- [ ] Check `NEXT_PUBLIC_SOCKET_URL` is set

### Build Issues
**Problem**: Build fails
- [ ] Delete `.next` folder
- [ ] Run `npm install` again
- [ ] Check for TypeScript errors
- [ ] Check for missing dependencies

## 📊 Health Check Commands

```bash
# Check if database is accessible
psql $DATABASE_URL -c "SELECT 1"

# Check if server is running
curl http://localhost:3000

# Check if Socket.io is running
curl http://localhost:3000/socket.io/

# Check Node.js version
node --version  # Should be 18+

# Check npm version
npm --version
```

## 🔍 Monitoring

### Key Metrics to Watch
- [ ] Response time < 200ms (average)
- [ ] Database query time < 50ms (average)
- [ ] Socket.io latency < 100ms
- [ ] Memory usage stable (no leaks)
- [ ] CPU usage < 50% (average)

### Logs to Monitor
- [ ] Application logs (console)
- [ ] Database logs (query errors)
- [ ] Socket.io logs (connections/disconnections)
- [ ] Error logs (exceptions)

## 🚀 Performance Optimization

### Database
- [ ] Indexes created on all foreign keys
- [ ] Indexes on frequently queried columns
- [ ] Query plan analyzed for slow queries
- [ ] Connection pooling configured

### Frontend
- [ ] Images optimized (WebP format)
- [ ] Code splitting enabled
- [ ] Lazy loading for heavy components
- [ ] Caching strategies implemented

### Backend
- [ ] Response caching where applicable
- [ ] Database query optimization
- [ ] Rate limiting on API routes
- [ ] Compression enabled

## 📝 Documentation Status

- [x] README.md - Project overview
- [x] QUICKSTART.md - Quick setup guide
- [x] IMPLEMENTATION_GUIDE.md - Technical documentation
- [x] SUMMARY.md - Implementation summary
- [x] CHECKLIST.md - This file
- [ ] API.md - API documentation (to create)
- [ ] CONTRIBUTING.md - Contribution guidelines (to create)
- [ ] CHANGELOG.md - Version history (to create)

## 🎯 Feature Completion Status

### Core Features (Must Have)
- [x] Authentication (Google OAuth)
- [x] User profiles
- [x] Friend system
- [x] Real-time chat
- [x] Music recommendations
- [x] Play history tracking
- [x] Online/offline status

### Important Features (Should Have)
- [ ] Search functionality
- [ ] Playlist management UI
- [ ] Song playback (actual audio)
- [ ] API documentation
- [ ] Error handling UI
- [ ] Loading states

### Nice to Have (Could Have)
- [ ] Service workers (offline)
- [ ] WebRTC (P2P streaming)
- [ ] Waveform visualization
- [ ] Lyrics display
- [ ] Dark/light mode toggle
- [ ] Mobile app

## 🎨 UI/UX Improvements Needed

### High Priority
- [ ] Responsive design (mobile/tablet)
- [ ] Loading skeletons
- [ ] Error messages
- [ ] Empty states
- [ ] Success notifications

### Medium Priority
- [ ] Smooth animations
- [ ] Better typography
- [ ] Consistent spacing
- [ ] Color scheme refinement
- [ ] Icon consistency

### Low Priority
- [ ] Advanced animations
- [ ] Micro-interactions
- [ ] Custom illustrations
- [ ] Brand identity
- [ ] Marketing pages

## 📱 Browser Compatibility

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile
- [ ] iOS Safari
- [ ] Chrome Mobile
- [ ] Firefox Mobile
- [ ] Samsung Internet

## 🔐 Security Checklist

- [x] Environment variables not exposed
- [x] SQL injection prevention (parameterized queries)
- [x] XSS prevention (React escaping)
- [x] CSRF protection (NextAuth)
- [ ] Rate limiting
- [ ] Input validation
- [ ] Output sanitization
- [ ] HTTPS in production
- [ ] Security headers

## 🎓 Learning Resources

- [x] Read README.md
- [x] Read QUICKSTART.md
- [ ] Read IMPLEMENTATION_GUIDE.md
- [ ] Study recommendation algorithm
- [ ] Understand Socket.io events
- [ ] Review Zustand stores
- [ ] Explore database schema

## ✨ Final Steps

- [ ] Test all features end-to-end
- [ ] Fix any bugs found
- [ ] Deploy to staging environment
- [ ] Test on staging
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Celebrate! 🎉

---

**Note**: Check off items as you complete them. This is your roadmap to a fully functional Recho platform!
