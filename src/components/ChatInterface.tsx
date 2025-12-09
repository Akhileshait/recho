"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useChatStore } from "@/store/useChatStore";
import { useSocketStore } from "@/store/useSocketStore";
import { useFriendsStore } from "@/store/useFriendsStore";
import { Send, Music, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChatInterface() {
  const { data: session } = useSession();
  const { activeChat, messages, isTyping, addMessage, markAsRead } = useChatStore();
  const { socket } = useSocketStore();
  const { friends } = useFriendsStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeFriend = friends.find((f) => f.id === activeChat);
  const chatMessages = activeChat ? messages[activeChat] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (activeChat) {
      markAsRead(activeChat);
      // Fetch chat history
      fetch(`/api/messages/${activeChat}`)
        .then((res) => res.json())
        .then((data) => {
          // Set messages in store
        });
    }
  }, [activeChat]);

  const handleSend = () => {
    if (!input.trim() || !socket || !activeChat || !session?.user?.id) return;

    socket.emit("message:send", {
      senderId: session.user.id,
      receiverId: activeChat,
      content: input.trim(),
    });

    addMessage(activeChat, {
      id: Date.now().toString(),
      sender_id: session.user.id,
      receiver_id: activeChat,
      content: input.trim(),
      is_read: false,
      created_at: new Date(),
    });

    setInput("");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit("typing:stop", {
      userId: session.user.id,
      receiverId: activeChat,
    });
  };

  const handleTyping = (value: string) => {
    setInput(value);

    if (!socket || !activeChat || !session?.user?.id) return;

    socket.emit("typing:start", {
      userId: session.user.id,
      receiverId: activeChat,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", {
        userId: session.user.id,
        receiverId: activeChat,
      });
    }, 1000);
  };

  if (!activeChat) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Select a friend to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={activeFriend?.image || "/default-avatar.png"}
            alt={activeFriend?.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold">{activeFriend?.name}</h3>
            {isTyping[activeChat] && (
              <p className="text-xs text-primary">typing...</p>
            )}
            {!isTyping[activeChat] && activeFriend?.is_online && (
              <p className="text-xs text-green-500">online</p>
            )}
          </div>
        </div>
        {activeFriend?.current_song_id && activeFriend.is_playing && (
          <Button variant="outline" size="sm">
            <Music className="w-4 h-4 mr-2" />
            See what they're playing
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((message) => {
          const isMine = message.sender_id === session?.user?.id;
          return (
            <div
              key={message.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  isMine
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                }`}
              >
                <p>{message.content}</p>
                {message.song_id && (
                  <div className="mt-2 p-2 bg-black/20 rounded flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    <span className="text-sm">Shared a song</span>
                  </div>
                )}
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
