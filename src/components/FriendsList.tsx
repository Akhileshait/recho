"use client";

import { useEffect } from "react";
import { useFriendsStore } from "@/store/useFriendsStore";
import { useSocketStore } from "@/store/useSocketStore";
import { useChatStore } from "@/store/useChatStore";
import { Users, Circle, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FriendsList() {
  const { friends, friendRequests } = useFriendsStore();
  const { setActiveChat } = useChatStore();
  const { socket } = useSocketStore();

  const onlineFriends = friends.filter((f) => f.is_online);
  const offlineFriends = friends.filter((f) => !f.is_online);

  const handleAcceptRequest = (requestId: string) => {
    if (!socket) return;
    socket.emit("friend:accept", {
      userId: socket.id,
      friendId: requestId,
    });
  };

  return (
    <div className="space-y-4">
      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Friend Requests ({friendRequests.length})
          </h3>
          <div className="space-y-2">
            {friendRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 bg-card rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={request.sender_image || "/default-avatar.png"}
                    alt={request.sender_name}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="font-medium">{request.sender_name}</span>
                </div>
                <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                  Accept
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Online Friends */}
      {onlineFriends.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 text-green-500">
            Online ({onlineFriends.length})
          </h3>
          <div className="space-y-1">
            {onlineFriends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => setActiveChat(friend.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 rounded-lg transition-colors"
              >
                <div className="relative">
                  <img
                    src={friend.image || "/default-avatar.png"}
                    alt={friend.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{friend.name}</div>
                  {friend.is_playing && friend.current_song_id && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Music className="w-3 h-3" />
                      <span>Listening to music</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Offline Friends */}
      {offlineFriends.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
            Offline ({offlineFriends.length})
          </h3>
          <div className="space-y-1">
            {offlineFriends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => setActiveChat(friend.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 rounded-lg transition-colors opacity-60"
              >
                <img
                  src={friend.image || "/default-avatar.png"}
                  alt={friend.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 text-left">
                  <div className="font-medium">{friend.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Last seen {new Date(friend.last_seen).toLocaleString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {friends.length === 0 && friendRequests.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No friends yet</p>
          <p className="text-sm">Search for users to add friends!</p>
        </div>
      )}
    </div>
  );
}
