const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { Pool } = require('pg');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${port}`,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('user:online', async (userId) => {
      try {
        socket.data.userId = userId;
        socket.join(`user:${userId}`);

        await pool.query(
          `INSERT INTO user_activity (user_id, is_online, updated_at)
           VALUES ($1, TRUE, NOW())
           ON CONFLICT (user_id)
           DO UPDATE SET is_online = TRUE, updated_at = NOW()`,
          [userId]
        );

        const friendsResult = await pool.query(
          `SELECT friend_id FROM friendships
           WHERE user_id = $1 AND status = 'accepted'`,
          [userId]
        );

        friendsResult.rows.forEach((friend) => {
          io.to(`user:${friend.friend_id}`).emit('friend:online', {
            userId,
            timestamp: new Date(),
          });
        });

        socket.emit('user:connected', { userId });
      } catch (error) {
        console.error('Error setting user online:', error);
      }
    });

    socket.on('disconnect', async () => {
      const userId = socket.data.userId;
      if (!userId) return;

      try {
        await pool.query(
          `UPDATE user_activity
           SET is_online = FALSE, updated_at = NOW()
           WHERE user_id = $1`,
          [userId]
        );

        const friendsResult = await pool.query(
          `SELECT friend_id FROM friendships
           WHERE user_id = $1 AND status = 'accepted'`,
          [userId]
        );

        friendsResult.rows.forEach((friend) => {
          io.to(`user:${friend.friend_id}`).emit('friend:offline', {
            userId,
            timestamp: new Date(),
          });
        });
      } catch (error) {
        console.error('Error setting user offline:', error);
      }
    });

    socket.on('music:play', async (data) => {
      try {
        const { userId, songId, position } = data;

        await pool.query(
          `UPDATE user_activity
           SET current_song_id = $1, is_playing = TRUE, playback_position = $2, updated_at = NOW()
           WHERE user_id = $3`,
          [songId, position, userId]
        );

        const friendsResult = await pool.query(
          `SELECT friend_id FROM friendships
           WHERE user_id = $1 AND status = 'accepted'`,
          [userId]
        );

        friendsResult.rows.forEach((friend) => {
          io.to(`user:${friend.friend_id}`).emit('friend:now_playing', {
            userId,
            songId,
            position,
            isPlaying: true,
            timestamp: new Date(),
          });
        });
      } catch (error) {
        console.error('Error broadcasting music play:', error);
      }
    });

    socket.on('music:pause', async (data) => {
      try {
        const { userId, position } = data;

        await pool.query(
          `UPDATE user_activity
           SET is_playing = FALSE, playback_position = $1, updated_at = NOW()
           WHERE user_id = $2`,
          [position, userId]
        );

        const friendsResult = await pool.query(
          `SELECT friend_id FROM friendships
           WHERE user_id = $1 AND status = 'accepted'`,
          [userId]
        );

        friendsResult.rows.forEach((friend) => {
          io.to(`user:${friend.friend_id}`).emit('friend:paused', {
            userId,
            position,
            isPlaying: false,
            timestamp: new Date(),
          });
        });
      } catch (error) {
        console.error('Error broadcasting music pause:', error);
      }
    });

    socket.on('message:send', async (data) => {
      try {
        const { senderId, receiverId, content, songId } = data;

        const result = await pool.query(
          `INSERT INTO messages (sender_id, receiver_id, content, song_id, created_at)
           VALUES ($1, $2, $3, $4, NOW())
           RETURNING *`,
          [senderId, receiverId, content, songId || null]
        );

        const message = result.rows[0];

        io.to(`user:${receiverId}`).emit('message:received', {
          ...message,
          timestamp: new Date(),
        });

        socket.emit('message:sent', {
          ...message,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message:error', { error: 'Failed to send message' });
      }
    });

    socket.on('message:read', async (data) => {
      try {
        const { messageIds } = data;
        await pool.query(
          `UPDATE messages SET is_read = TRUE WHERE id = ANY($1::uuid[])`,
          [messageIds]
        );
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('typing:start', (data) => {
      io.to(`user:${data.receiverId}`).emit('friend:typing', {
        userId: data.userId,
        isTyping: true,
      });
    });

    socket.on('typing:stop', (data) => {
      io.to(`user:${data.receiverId}`).emit('friend:typing', {
        userId: data.userId,
        isTyping: false,
      });
    });

    socket.on('friend:request', async (data) => {
      try {
        await pool.query(
          `INSERT INTO friendships (user_id, friend_id, status, created_at)
           VALUES ($1, $2, 'pending', NOW())`,
          [data.senderId, data.receiverId]
        );

        io.to(`user:${data.receiverId}`).emit('friend:request_received', {
          senderId: data.senderId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error sending friend request:', error);
      }
    });

    socket.on('friend:accept', async (data) => {
      try {
        await pool.query(
          `UPDATE friendships
           SET status = 'accepted'
           WHERE user_id = $1 AND friend_id = $2`,
          [data.friendId, data.userId]
        );

        await pool.query(
          `INSERT INTO friendships (user_id, friend_id, status, created_at)
           VALUES ($1, $2, 'accepted', NOW())
           ON CONFLICT (user_id, friend_id) DO NOTHING`,
          [data.userId, data.friendId]
        );

        io.to(`user:${data.friendId}`).emit('friend:accepted', {
          userId: data.userId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error accepting friend request:', error);
      }
    });
  });

  server.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
