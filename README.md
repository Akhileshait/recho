# 🎵 Recho - Social Music Recommendation Platform

A cutting-edge music streaming platform that combines intelligent recommendations with real-time social features. Connect with friends, discover new music through an advanced graph-based algorithm, and enjoy synchronized listening experiences.

![Recho Banner](https://via.placeholder.com/1200x400/6366f1/ffffff?text=Recho+-+Music+Connected)

## ✨ Features

### 🎯 Intelligent Music Recommendations
- **Graph-Based DSA Algorithm**: Advanced recommendation engine using BFS traversal
- **Multi-Factor Scoring**: Considers play time, genre preferences, artist preferences, likes, and friend activity
- **Social Influence**: Recommendations based on what your friends are listening to
- **Personalized**: Adapts to your listening habits over time

### 👥 Social Features
- **Real-time Friend Status**: See who's online and what they're listening to
- **Live Chat**: Instant messaging with typing indicators
- **Music Sharing**: Share songs directly in chat conversations
- **Friend Requests**: Easy friend management system
- **Activity Feed**: Track your friends' music activity in real-time

### 🎶 Music Streaming
- **Multi-Source Import**: Import playlists from Spotify and YouTube
- **Real-time Playback Sync**: See what friends are playing in real-time
- **Queue Management**: Build and manage your listening queue
- **Play History Tracking**: Automatic tracking of listening duration
- **Like System**: Like and save your favorite tracks

### 🔄 Real-time Capabilities
- **Socket.io Integration**: Low-latency real-time updates
- **Online/Offline Status**: Instant presence updates
- **Typing Indicators**: See when friends are typing
- **Music Broadcasting**: Broadcast your current playback to friends
- **Live Notifications**: Get notified of friend activity instantly

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Google Cloud account (OAuth + YouTube API)
- Spotify Developer account (optional)

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
copy .env.example .env.local
# Edit .env.local with your credentials

# Setup database
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

Visit `http://localhost:3000` and start exploring!


## 🏗️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TailwindCSS 4** - Utility-first CSS
- **Zustand** - State management
- **Socket.io Client** - Real-time communication
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - RESTful API
- **Custom Socket.io Server** - Real-time events
- **NextAuth.js** - Authentication
- **PostgreSQL** - Primary database
- **Node.js** - Runtime environment

### External Services
- **Spotify API** - Music metadata and playlist import
- **YouTube Data API** - Video/music import
- **Google OAuth** - User authentication
- **Cloudinary** - Media storage and CDN

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and well-described

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Socket.io](https://socket.io/) - Real-time engine
- [Spotify Web API](https://developer.spotify.com/) - Music data
- [YouTube Data API](https://developers.google.com/youtube) - Video data
- [Neon](https://neon.tech/) - Serverless PostgreSQL

## 📞 Support

- **Documentation**: [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
- **Quick Start**: [QUICKSTART.md](QUICKSTART.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/recho/issues)
- **Discord**: Join our community (link TBD)

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

