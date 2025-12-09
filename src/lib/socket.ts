import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { query } from "./db";

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HTTPServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User authentication and online status
    socket.on("user:online", async (userId: string) => {
      try {
        socket.data.userId = userId;
        socket.join(`user:${userId}`);

        // Update user status in database
        await query(
          `INSERT INTO user_activity (user_id, is_online, updated_at)
           VALUES ($1, TRUE, NOW())
           ON CONFLICT (user_id)
           DO UPDATE SET is_online = TRUE, updated_at = NOW()`,
          [userId]
        );

        // Get user's friends
        const friendsResult = await query(
          `SELECT friend_id FROM friendships
           WHERE user_id = $1 AND status = 'accepted'`,
          [userId]
        );

        // Notify friends that user is online
        friendsResult.rows.forEach((friend: any) => {
          io?.to(`user:${friend.friend_id}`).emit("friend:online", {
            userId,
            timestamp: new Date(),
          });
        });

        socket.emit("user:connected", { userId });
      } catch (error) {
        console.error("Error setting user online:", error);
      }
    });

    // Handle user going offline
    socket.on("disconnect", async () => {
      const userId = socket.data.userId;
      if (!userId) return;

      try {
        await query(
          `UPDATE user_activity
           SET is_online = FALSE, updated_at = NOW()
           WHERE user_id = $1`,
          [userId]
        );

        // Get user's friends
        const friendsResult = await query(
          `SELECT friend_id FROM friendships
           WHERE user_id = $1 AND status = 'accepted'`,
          [userId]
        );

        // Notify friends that user is offline
        friendsResult.rows.forEach((friend: any) => {
          io?.to(`user:${friend.friend_id}`).emit("friend:offline", {
            userId,
            timestamp: new Date(),
          });
        });
      } catch (error) {
        console.error("Error setting user offline:", error);
      }
    });

    // Music playback sync
    socket.on("music:play", async (data: { userId: string; songId: string; position: number }) => {
      try {
        const { userId, songId, position } = data;

        await query(
          `UPDATE user_activity
           SET current_song_id = $1, is_playing = TRUE, playback_position = $2, updated_at = NOW()
           WHERE user_id = $3`,
          [songId, position, userId]
        );

        // Get user's friends
        const friendsResult = await query(
          `SELECT friend_id FROM friendships
           WHERE user_id = $1 AND status = 'accepted'`,
          [userId]
        );

        // Broadcast to friends
        friendsResult.rows.forEach((friend: any) => {
          io?.to(`user:${friend.friend_id}`).emit("friend:now_playing", {
            userId,
            songId,
            position,
            isPlaying: true,
            timestamp: new Date(),
          });
        });
      } catch (error) {
        console.error("Error broadcasting music play:", error);
      }
    });

    socket.on("music:pause", async (data: { userId: string; position: number }) => {
      try {
        const { userId, position } = data;

        await query(
          `UPDATE user_activity
           SET is_playing = FALSE, playback_position = $1, updated_at = NOW()
           WHERE user_id = $2`,
          [position, userId]
        );

        const friendsResult = await query(
          `SELECT friend_id FROM friendships
           WHERE user_id = $1 AND status = 'accepted'`,
          [userId]
        );

        friendsResult.rows.forEach((friend: any) => {
          io?.to(`user:${friend.friend_id}`).emit("friend:paused", {
            userId,
            position,
            isPlaying: false,
            timestamp: new Date(),
          });
        });
      } catch (error) {
        console.error("Error broadcasting music pause:", error);
      }
    });

    // Chat messages
    socket.on("message:send", async (data: { senderId: string; receiverId: string; content: string; songId?: string }) => {
      try {
        const { senderId, receiverId, content, songId } = data;

        const result = await query(
          `INSERT INTO messages (sender_id, receiver_id, content, song_id, created_at)
           VALUES ($1, $2, $3, $4, NOW())
           RETURNING *`,
          [senderId, receiverId, content, songId || null]
        );

        const message = result.rows[0];

        // Send to receiver
        io?.to(`user:${receiverId}`).emit("message:received", {
          ...message,
          timestamp: new Date(),
        });

        // Confirm to sender
        socket.emit("message:sent", {
          ...message,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("message:error", { error: "Failed to send message" });
      }
    });

    // Mark messages as read
    socket.on("message:read", async (data: { messageIds: string[] }) => {
      try {
        const { messageIds } = data;
        await query(
          `UPDATE messages SET is_read = TRUE WHERE id = ANY($1::uuid[])`,
          [messageIds]
        );
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // Typing indicator
    socket.on("typing:start", (data: { userId: string; receiverId: string }) => {
      io?.to(`user:${data.receiverId}`).emit("friend:typing", {
        userId: data.userId,
        isTyping: true,
      });
    });

    socket.on("typing:stop", (data: { userId: string; receiverId: string }) => {
      io?.to(`user:${data.receiverId}`).emit("friend:typing", {
        userId: data.userId,
        isTyping: false,
      });
    });

    // Friend request events
    socket.on("friend:request", async (data: { senderId: string; receiverId: string }) => {
      try {
        await query(
          `INSERT INTO friendships (user_id, friend_id, status, created_at)
           VALUES ($1, $2, 'pending', NOW())`,
          [data.senderId, data.receiverId]
        );

        io?.to(`user:${data.receiverId}`).emit("friend:request_received", {
          senderId: data.senderId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error sending friend request:", error);
      }
    });

    socket.on("friend:accept", async (data: { userId: string; friendId: string }) => {
      try {
        await query(
          `UPDATE friendships
           SET status = 'accepted'
           WHERE user_id = $1 AND friend_id = $2`,
          [data.friendId, data.userId]
        );

        // Create reciprocal friendship
        await query(
          `INSERT INTO friendships (user_id, friend_id, status, created_at)
           VALUES ($1, $2, 'accepted', NOW())
           ON CONFLICT (user_id, friend_id) DO NOTHING`,
          [data.userId, data.friendId]
        );

        io?.to(`user:${data.friendId}`).emit("friend:accepted", {
          userId: data.userId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error accepting friend request:", error);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
