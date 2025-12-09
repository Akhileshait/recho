"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";
import { useSocketStore } from "@/store/useSocketStore";
import { useChatStore } from "@/store/useChatStore";
import { useFriendsStore } from "@/store/useFriendsStore";
import { usePlayerStore } from "@/store/usePlayerStore";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { socket, setSocket, setConnected } = useSocketStore();
  const { addMessage, incrementUnread, setTyping } = useChatStore();
  const { updateFriendStatus, updateFriendActivity, addFriendRequest } = useFriendsStore();

  useEffect(() => {
    if (!session?.user?.id) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      transports: ["websocket"],
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected");
      setConnected(true);
      socketInstance.emit("user:online", session.user.id);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    // Friend status updates
    socketInstance.on("friend:online", ({ userId }) => {
      updateFriendStatus(userId, true);
    });

    socketInstance.on("friend:offline", ({ userId }) => {
      updateFriendStatus(userId, false);
    });

    // Music activity updates
    socketInstance.on("friend:now_playing", ({ userId, songId, isPlaying }) => {
      updateFriendActivity(userId, { current_song_id: songId, is_playing: isPlaying });
    });

    socketInstance.on("friend:paused", ({ userId, isPlaying }) => {
      updateFriendActivity(userId, { is_playing: isPlaying });
    });

    // Chat messages
    socketInstance.on("message:received", (message) => {
      addMessage(message.sender_id, message);
      incrementUnread(message.sender_id);
    });

    // Typing indicators
    socketInstance.on("friend:typing", ({ userId, isTyping }) => {
      setTyping(userId, isTyping);
    });

    // Friend requests
    socketInstance.on("friend:request_received", ({ senderId }) => {
      // Fetch sender details and add to requests
      fetch(`/api/users/${senderId}`)
        .then(res => res.json())
        .then(user => {
          addFriendRequest({
            id: senderId,
            sender_id: senderId,
            sender_name: user.name,
            sender_image: user.image,
            created_at: new Date(),
          });
        });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session?.user?.id]);

  return <>{children}</>;
}
